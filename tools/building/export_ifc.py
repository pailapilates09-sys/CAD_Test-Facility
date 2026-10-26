"""Create an IFC4 source-review model. Unknown fabrication inputs stay unset."""
import argparse
import gzip
import hashlib
import json
import math
import pathlib
import uuid

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.guid
import ifcopenshell.validate
import ifcopenshell.util.shape

parser = argparse.ArgumentParser()
parser.add_argument('payload')
parser.add_argument('output')
args = parser.parse_args()
payload = json.loads(pathlib.Path(args.payload).read_text())
out = pathlib.Path(args.output)
out.mkdir(parents=True, exist_ok=True)
model = ifcopenshell.file(schema='IFC4')
namespace = uuid.uuid5(uuid.NAMESPACE_URL, payload['source_sha256'])
guid = lambda key: ifcopenshell.guid.compress(uuid.uuid5(namespace, key).hex)
entity_map = {}

def point(values):
    return model.create_entity('IfcCartesianPoint', Coordinates=tuple(float(v) for v in values))

def identity():
    return model.create_entity('IfcAxis2Placement3D', Location=point((0, 0, 0)))

def placement():
    return model.create_entity('IfcLocalPlacement', RelativePlacement=identity())

def root(kind, key, name, **kwargs):
    return model.create_entity(kind, GlobalId=guid(key), Name=name, **kwargs)

def aggregate(key, parent, children):
    if children:
        root('IfcRelAggregates', key, 'Spatial / assembly hierarchy', RelatingObject=parent, RelatedObjects=children)

def properties(product, key, values):
    props = []
    for name, value in values.items():
        typed = None if value is None else model.create_entity('IfcBoolean' if isinstance(value, bool) else 'IfcInteger' if isinstance(value, int) else 'IfcReal' if isinstance(value, float) else 'IfcText', value)
        props.append(model.create_entity('IfcPropertySingleValue', Name=name, Description='Unknown / not released' if value is None else None, NominalValue=typed))
    pset = root('IfcPropertySet', 'pset-'+key, 'Paila_SourceEvidence', HasProperties=props)
    root('IfcRelDefinesByProperties', 'props-'+key, 'Source evidence and uncertainty', RelatedObjects=[product], RelatingPropertyDefinition=pset)

context = model.create_entity('IfcGeometricRepresentationContext', ContextIdentifier='Model', ContextType='Model', CoordinateSpaceDimension=3, Precision=1e-6, WorldCoordinateSystem=identity())
units = model.create_entity('IfcUnitAssignment', Units=[model.create_entity('IfcSIUnit', UnitType='LENGTHUNIT', Name='METRE'), model.create_entity('IfcSIUnit', UnitType='AREAUNIT', Name='SQUARE_METRE'), model.create_entity('IfcSIUnit', UnitType='VOLUMEUNIT', Name='CUBIC_METRE')])
project = root('IfcProject', 'project', payload['title'], Description='PDF-derived source review. Not for fabrication or construction release.', RepresentationContexts=[context], UnitsInContext=units)
site = root('IfcSite', 'site', 'Pokhara-14 · source project site', ObjectPlacement=placement(), CompositionType='ELEMENT')
building = root('IfcBuilding', 'building', payload['title'], ObjectPlacement=placement(), CompositionType='ELEMENT')
aggregate('project-site', project, [site])
aggregate('site-building', site, [building])
storeys = {}
for level in payload['levels']:
    storey = root('IfcBuildingStorey', 'storey-'+level['id'], level['label'], ObjectPlacement=placement(), CompositionType='ELEMENT', Elevation=float(level['elevation_m']))
    properties(storey, 'storey-'+level['id'], {'SourceFloorRole': 'ROOF_DATUM_NOT_AN_OCCUPIED_STOREY' if level['id']=='roof' else 'STATED_OCCUPIED_STOREY', 'SourceArea_m2': level['stated_area_m2'], 'SourcePage': level['plan_page']})
    storeys[level['id']] = storey
aggregate('building-storeys', building, list(storeys.values()))
properties(project, 'project', {'SourceSHA256': payload['source_sha256'], 'SourcePages': 21, 'StatedStoreys': 3, 'ReleaseStatus': 'SOURCE_REVIEW_NOT_FOR_FABRICATION', 'ConcreteGrade': None, 'SteelGrade': None, 'ConfirmedCover_mm': None})

def representation(meshes, curves):
    representations = []
    items = []
    for mesh in meshes:
        coords = model.create_entity('IfcCartesianPointList3D', CoordList=tuple(tuple(float(v) for v in p) for p in mesh['vertices']))
        items.append(model.create_entity('IfcTriangulatedFaceSet', Coordinates=coords, Closed=True, CoordIndex=tuple(tuple(int(i)+1 for i in face) for face in mesh['triangles'])))
    if items:
        representations.append(model.create_entity('IfcShapeRepresentation', ContextOfItems=context, RepresentationIdentifier='Body', RepresentationType='Tessellation', Items=items))
    if curves:
        lines = [model.create_entity('IfcPolyline', Points=[point(p) for p in path]) for path in curves]
        geometric_set = model.create_entity('IfcGeometricCurveSet', Elements=lines)
        representations.append(model.create_entity('IfcShapeRepresentation', ContextOfItems=context, RepresentationIdentifier='Body', RepresentationType='GeometricCurveSet', Items=[geometric_set]))
    return model.create_entity('IfcProductDefinitionShape', Representations=representations) if representations else None

classes = {'wall':'IfcWall', 'column':'IfcColumn', 'beam':'IfcBeam', 'tie beam':'IfcBeam', 'strap beam':'IfcBeam', 'slab':'IfcSlab', 'door':'IfcDoor', 'sliding door':'IfcDoor', 'window':'IfcWindow', 'vent':'IfcWindow', 'footing':'IfcFooting', 'stair':'IfcStair', 'railing':'IfcRailing', 'sill band':'IfcAnnotation', 'lintel band':'IfcAnnotation'}
contained = {level: [] for level in storeys}
products = {}
for c in payload['components']:
    if c['kind'] == 'rebar':
        continue
    extra = {}
    if classes[c['kind']] in ['IfcWindow', 'IfcDoor']:
        extra = {'OverallWidth': float(c['geometry']['width']), 'OverallHeight': float(c['geometry']['height'])}
    product = root(classes[c['kind']], c['id'], c['label'], ObjectPlacement=placement(), Representation=representation(c['mesh_export']['meshes'], c['mesh_export']['curves']), Description=c['note'], **extra)
    products[c['id']] = product
    entity_map[c['id']] = product.GlobalId
    contained[c['level'] if c['level'] in contained else 'ground'].append(product)
    properties(product, c['id'], {'ModelElementId': c['id'], 'ModelScope': c['level'], 'SourcePages': ','.join(str(n) for n in c['source'].get('pages', [c['source']['page']])), 'GeometryBasis': c['status'], 'GeometryNote': c['note'], 'SourceSHA256': payload['source_sha256'], 'UnconfirmedBandZone': c['kind'] in ['sill band','lintel band'], 'FootingThickness_m': c['geometry'].get('height') if c['kind']=='footing' else None})

bar_count = 0
samples = {}
for c in payload['components']:
    if c['kind'] != 'rebar':
        continue
    assembly = root('IfcElementAssembly', c['id'], c['label'], ObjectPlacement=placement(), ObjectType='SOURCE_REVIEW_REINFORCEMENT', PredefinedType='REINFORCEMENT_UNIT')
    entity_map[c['id']] = assembly.GlobalId
    contained[c['level'] if c['level'] in contained else 'ground'].append(assembly)
    properties(assembly, c['id'], {'ModelElementId': c['id'], 'HostElementId': c['host_id'], 'SourcePages': ','.join(str(n) for n in c['source']['pages']), 'SourceRecipe': c['recipe'], 'ReleaseStatus': c['release_status'], 'FinalCutLength_mm': None, 'ProcurementQuantity': None, 'GeometryNote': c['note'], 'SourceSHA256': payload['source_sha256']})
    parent = products.get(c['host_id'])
    if parent:
        root('IfcRelAssignsToProduct', 'host-'+c['id'], 'Reinforcement study host', RelatedObjects=[assembly], RelatingProduct=parent)
    children = []
    for bar in c['geometry']['bars']:
        # The PDF does not specify the bending radii. Export the very same
        # straight display segments used in Three.js, rather than invent fillets.
        # A closed sharp polyline is also not a valid pipe sweep in all IFC tools.
        vertices = [point(p) for p in bar['points']]
        swept = [model.create_entity('IfcSweptDiskSolid', Directrix=model.create_entity('IfcPolyline', Points=[a,b]), Radius=bar['diameter_mm']/2000) for a,b in zip(vertices, vertices[1:])]
        rep = model.create_entity('IfcShapeRepresentation', ContextOfItems=context, RepresentationIdentifier='Body', RepresentationType='AdvancedSweptSolid', Items=swept)
        product = root('IfcReinforcingBar', bar['id'], 'Ø'+str(bar['diameter_mm'])+' · '+bar['role'], ObjectPlacement=placement(), Representation=model.create_entity('IfcProductDefinitionShape', Representations=[rep]), ObjectType='SCHEMATIC_SOURCE_STUDY', NominalDiameter=bar['diameter_mm']/1000, CrossSectionArea=math.pi*(bar['diameter_mm']/2000)**2, BarLength=None, PredefinedType='NOTDEFINED')
        properties(product, bar['id'], {'ModelElementId': c['id'], 'BarPathId': bar['id'], 'HostElementId': c['host_id'], 'SourcePages': ','.join(str(n) for n in c['source']['pages']), 'NominalDiameter_mm': bar['diameter_mm'], 'FinalCutLength_mm': None, 'ConfirmedCover_mm': None, 'SteelGrade': None, 'ReleaseStatus': 'NOT_RELEASED', 'GeometryIsSchematic': True, 'BendGeometry':'Straight display segments only; bend radii not supplied.'})
        children.append(product)
        entity_map[bar['id']] = product.GlobalId
        samples.setdefault((bar['role'], bar['diameter_mm']), product)
        bar_count += 1
    aggregate('bars-'+c['id'], assembly, children)

for scope, children in contained.items():
    if children:
        root('IfcRelContainedInSpatialStructure', 'contained-'+scope, 'Model floor / scope', RelatingStructure=storeys[scope], RelatedElements=children)

model.header.file_name.name = 'basanti-review.ifc'
model.header.file_name.time_stamp = '2026-10-25T00:00:00'
model.header.file_name.author = ('Paila CAD Test Facility',)
model.header.file_name.organization = ('Paila CAD Test Facility',)
model.header.file_name.preprocessor_version = 'IfcOpenShell '+ifcopenshell.version
model.header.file_name.originating_system = 'Paila source-linked construction review'
model.header.file_name.authorization = 'SOURCE REVIEW — NOT FOR FABRICATION'
data = model.to_string().encode()
(out/'basanti-review.ifc').write_bytes(data)
(out/'basanti-review.ifc.gz').write_bytes(gzip.compress(data, mtime=0))
readback = ifcopenshell.open(str(out/'basanti-review.ifc'))
logger = ifcopenshell.validate.json_logger()
ifcopenshell.validate.validate(readback, logger)
errors = [s for s in logger.statements if s.get('level')=='error']
if errors:
    raise ValueError('IFC schema validation: '+json.dumps(errors[:4], default=str))
assert len(readback.by_type('IfcReinforcingBar')) == bar_count
assert all(b.BarLength is None for b in readback.by_type('IfcReinforcingBar'))
assert len({p.GlobalId for p in readback.by_type('IfcRoot')}) == len(readback.by_type('IfcRoot'))
settings = ifcopenshell.geom.settings()
settings.set('dimensionality', ifcopenshell.ifcopenshell_wrapper.CURVES_SURFACES_AND_SOLIDS)
checked = []
for product in products.values():
    if product.Representation and product.is_a() not in samples:
        samples[product.is_a()] = product
for key, product in samples.items():
    shape = ifcopenshell.geom.create_shape(settings, readback.by_guid(product.GlobalId))
    vertices = tuple(shape.geometry.verts)
    assert vertices and all(math.isfinite(n) for n in vertices), str(key)
    checked.append({'class':product.is_a(), 'name':product.Name, 'guid':product.GlobalId, 'vertices':len(vertices)//3})
# Inspect all non-rebar source/study products, not only a class sample.
# This is GROSS displayed geometry, never the net contractual takeoff.
unit_names = {u.UnitType:u.Name for u in readback.by_type('IfcSIUnit')}
assert unit_names.get('LENGTHUNIT') == 'METRE'
assert unit_names.get('AREAUNIT') == 'SQUARE_METRE'
assert unit_names.get('VOLUMEUNIT') == 'CUBIC_METRE'
assert all(u.Prefix is None for u in readback.by_type('IfcSIUnit'))
solid_checks = []
for component in payload['components']:
    if component['kind'] == 'rebar':
        continue
    expected = component.get('gross_geometry_check')
    if not expected or expected['volume_m3'] is None:
        solid_checks.append({'model_id':component['id'],'volume_m3':None,'reason':expected.get('reason') if expected else 'No gross geometry check'})
        continue
    product = readback.by_guid(entity_map[component['id']])
    shape = ifcopenshell.geom.create_shape(settings, product)
    measured = float(ifcopenshell.util.shape.get_volume(shape.geometry))
    tolerance = max(1e-7, expected['volume_m3'] * 1e-5)
    assert math.isfinite(measured) and abs(measured-expected['volume_m3']) <= tolerance, component['id']+' IFC volume differs'
    verts = tuple(shape.geometry.verts)
    actual_bounds = {'min':[min(verts[i::3]) for i in range(3)],'max':[max(verts[i::3]) for i in range(3)]}
    assert all(abs(actual_bounds[face][i]-expected['bounds_m'][face][i]) < 1e-5 for face in ['min','max'] for i in range(3)), component['id']+' IFC bounds differ'
    solid_checks.append({'model_id':component['id'],'gross_volume_m3':measured,'expected_mesh_volume_m3':expected['volume_m3'],'absolute_difference_m3':abs(measured-expected['volume_m3']),'bounds_match':True,'note':'Gross displayed geometry only; not net takeoff or procurement quantity.'})

report = {'schema':'IFC4','tool':'IfcOpenShell '+ifcopenshell.version,'source_sha256':payload['source_sha256'],'ifc_sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'schema_errors':0,'source_model_elements':payload['base_count'],'study_band_annotations':sum(c['kind'] in ['sill band','lintel band'] for c in payload['components']),'reinforcement_studies':len(payload['reinforcement_sets']),'rebar_paths':bar_count,'all_final_bar_lengths_unset':True,'representative_geometry_checks':checked,'si_units_verified':True,'gross_geometry_checks':solid_checks,'gross_volume_checks_passed':sum('gross_volume_m3' in c for c in solid_checks),'gross_volume_checks_failed':0,'fabrication_release':False,'note':'Source-linked review IFC. Geometry is schematic where the PDF is incomplete. Sampled shape checks do not constitute construction approval or a Revit import test.'}
(out/'ifc-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(out/'ifc-element-map.json').write_text(json.dumps(entity_map,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['schema','bytes','schema_errors','source_model_elements','study_band_annotations','rebar_paths','all_final_bar_lengths_unset']}))

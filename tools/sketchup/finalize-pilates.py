"""Validate and package the Pilates native extraction; choose an explicit preview partition.
Usage: python finalize-pilates.py OUTPUT_DIRECTORY [PREVIEW_DEFINITION_ID]
The default source partition ID 136690 applies only to the supplied PILATES.skp.
"""
from pathlib import Path
from collections import Counter
import csv,gzip,hashlib,importlib.util,json,shutil,sqlite3,sys,time
import numpy as np
import mapbox_earcut
from openskp._face_groups import reconstruct_loop_vertices

root=Path(__file__).resolve().parent;out=Path(sys.argv[1])
spec=importlib.util.spec_from_file_location('stream',root/'extract-vff-stream.py')
stream=importlib.util.module_from_spec(spec);spec.loader.exec_module(stream)
r=json.loads((out/'inspection.json').read_text());h=json.loads((out/'hierarchy.json').read_text());defs={x['id']:x for x in h['definitions']}
con=sqlite3.connect(out/'geometry.sqlite')
print('Correcting derived transform scalars and checking relational references',flush=True)
for rowid,raw in con.execute('SELECT rowid,record_json FROM instances').fetchall():
    item=json.loads(raw);item['matrix_m']=stream.matrix_m(item['matrix'])
    con.execute('UPDATE instances SET record_json=? WHERE rowid=?',(stream.dumps(item),rowid))
for d in h['definitions']:con.execute('UPDATE definitions SET record_json=? WHERE id=?',(stream.dumps(d),d['id']))
missing_vertices=con.execute('SELECT COUNT(*) FROM edges e LEFT JOIN vertices a ON a.definition_id=e.definition_id AND a.id=e.v1_id LEFT JOIN vertices b ON b.definition_id=e.definition_id AND b.id=e.v2_id WHERE a.id IS NULL OR b.id IS NULL').fetchone()[0]
print('Edges with missing vertex references:',missing_vertices,flush=True)
missing_edges=con.execute("SELECT COUNT(*) FROM faces f, json_each(f.record_json,'$.loops') l, json_each(l.value) ce LEFT JOIN edges e ON e.definition_id=f.definition_id AND e.id=json_extract(ce.value,'$[0]') WHERE e.id IS NULL").fetchone()[0]
r['reference_validation']={'edges_with_missing_vertices':missing_vertices,'face_coedges_with_missing_edges':missing_edges,'missing_definition_ids':r['missing_definition_ids']}
if missing_vertices or missing_edges:raise ValueError('Geometry references need investigation before release')
actual={table:con.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0] for table in ('vertices','edges','faces','instances')}
assert actual==r['decoded_counts'],(actual,r['decoded_counts'])
r['sqlite_quick_check']=con.execute('PRAGMA quick_check').fetchone()[0]
assert r['sqlite_quick_check']=='ok'
print('Relational checks passed',flush=True)

# An explicit, small source partition for the existing browser viewer.
# No dense furniture definitions or loose model geometry are silently included.
chosen=sys.argv[2] if len(sys.argv)>2 else '136690';selected=set()
def collect(did):
    if did in selected:return
    selected.add(did)
    for child in defs[did]['children']:collect(child['definition_id'])
collect(chosen)
materials={x['name']:x for x in json.loads((out/'materials.json').read_text())['materials']}
layer_hidden={str(x['id']):x['hidden'] for x in h['layers']}
preview_defs=[];faces_total=0;triangles_total=0
for did in sorted(selected):
    d=defs[did]
    vertices={row[0]:row[1:] for row in con.execute('SELECT id,x_m,y_m,z_m FROM vertices WHERE definition_id=?',(did,))}
    edges={row[0]:row[1:] for row in con.execute('SELECT id,v1_id,v2_id FROM edges WHERE definition_id=?',(did,))}
    faces=[]
    for fid,raw in con.execute('SELECT id,record_json FROM faces WHERE definition_id=?',(did,)):
        face=json.loads(raw);loops=[reconstruct_loop_vertices(loop,edges) for loop in face['loops']]
        if not loops or any(len(loop)<3 for loop in loops):raise ValueError(f'Invalid preview face boundary {did}:{fid}')
        ids=[v for loop in loops for v in loop];points=[vertices[v] for v in ids]
        axis=max(range(3),key=lambda i:abs(face['normal'][i]));axes=[i for i in range(3) if i!=axis]
        xy=np.asarray([[p[i] for i in axes] for p in points],dtype=np.float64)
        ends=np.asarray(np.cumsum([len(loop) for loop in loops]),dtype=np.uint32)
        tris=mapbox_earcut.triangulate_float64(xy,ends).reshape(-1,3).tolist()
        if not tris:raise ValueError(f'Empty preview triangulation {did}:{fid}')
        # Preserve the source polygon's area, including holes, through triangulation.
        def area2(poly):return abs(sum(poly[i][0]*poly[(i+1)%len(poly)][1]-poly[(i+1)%len(poly)][0]*poly[i][1] for i in range(len(poly))))/2
        polygon_area=0;start=0
        for n,loop in enumerate(loops):
            a=area2(xy[start:start+len(loop)]);polygon_area+=a if n==0 else -a;start+=len(loop)
        triangle_area=sum(area2(xy[tri]) for tri in tris)
        if not np.isclose(polygon_area,triangle_area,rtol=1e-7,atol=1e-9):raise ValueError(f'Preview area mismatch {did}:{fid}')
        material=materials.get(h['material_ids'].get(str(face.get('material_id')),''),{})
        rgb=[int(material.get('color'+suffix,default)) for suffix,default in [('Red',180),('Green',195),('Blue',190)]]
        faces.append({'id':str(fid),'source_face_id':fid,'positions':points,'polygons':tris,'rgb':rgb,
                      'visible':not face.get('hidden',False) and not layer_hidden.get(str(face.get('layer')),False)})
        faces_total+=1;triangles_total+=len(tris)
    kids=[{'id':str(x['id'])+'-'+str(i),'name':x.get('name') or defs[x['definition_id']]['name'],
           'definition_id':x['definition_id'],'matrix_m':x['matrix_m'],
           'visible':not x.get('hidden',False) and not layer_hidden.get(str(x.get('layer_id')),False)} for i,x in enumerate(d['children'])]
    preview_defs.append({'id':did,'name':d['name'],'faces':faces,'children':kids})
root_child=next(x for x in defs['ROOT']['children'] if x['definition_id']==chosen)
preview={'schema_version':'paila-scene-1.0','units':'m','axes':'SketchUp XYZ, Z up',
         'source':{'name':'PILATES.skp · Group#2 partition','saved_source_sha256':json.loads((out/'source-intake.json').read_text())['source_sha256'],
                   'scope':'Selected source Group#2 and its nested definitions; not the complete studio model.','native_file_parsed':True},
         'materials':[],'scenes':[],'tags':h['layers'],'definitions':preview_defs,
         'root':{'id':'root','name':'Selected architectural base','faces':[],
                 'children':[{'id':root_child['id'],'definition_id':chosen,'matrix_m':root_child['matrix_m'],'visible':not root_child.get('hidden',False)}]},
         'warnings':['Selected source partition only. Full supported geometry remains in the archive. This projection is not an approved floor plan or quantity take-off.']}
(out/'architectural-base.scene.json').write_text(json.dumps(preview,separators=(',',':'),ensure_ascii=False)+'\n')
r['browser_preview']={'source_definition_id':chosen,'source_definition_name':'Group#2','definition_count':len(selected),
                      'face_count':faces_total,'triangle_count':triangles_total,'complete_model':False,
                      'triangulation_check':'All selected polygon areas including holes match their emitted triangle areas within tolerance.'}
con.execute('UPDATE metadata SET value_json=? WHERE key=?',(stream.dumps(r),'inspection'));con.commit()
(out/'inspection.json').write_text(json.dumps(r,indent=2,ensure_ascii=False)+'\n')
print('Browser preview:',r['browser_preview'],flush=True)
print('Updating JSONL derived transforms; validating gzip and record counts',flush=True)
counts=Counter()
temp=out/'geometry.normalized.jsonl.gz'
with gzip.open(out/'geometry.jsonl.gz','rt',encoding='utf-8') as src,gzip.open(temp,'wt',encoding='utf-8',compresslevel=6) as dst:
    for line in src:
        kind=line.split('"',4)[3];counts[kind]+=1
        if kind=='instances':
            item=json.loads(line);item['matrix_m']=stream.matrix_m(item['matrix']);line=stream.dumps(item)+'\n'
        dst.write(line)
assert {k:counts[k] for k in actual}==actual,(counts,actual)
temp.replace(out/'geometry.jsonl.gz')
print('Writing final compressed SQL + SQLite',flush=True)
with gzip.open(out/'geometry.sql.gz','wt',encoding='utf-8',compresslevel=6) as fp:
    for line in con.iterdump():fp.write(line+'\n')
con.close()
with (out/'geometry.sqlite').open('rb') as src,gzip.open(out/'geometry.sqlite.gz','wb',compresslevel=6) as dst:shutil.copyfileobj(src,dst,1024*1024)
print('Final geometry packages ready',flush=True)
for name in ('geometry.jsonl.gz','geometry.sql.gz','geometry.sqlite.gz'):
    f=out/name;print(name,f.stat().st_size,hashlib.file_digest(f.open('rb'),'sha256').hexdigest(),flush=True)

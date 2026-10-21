"""Build a display-only room projection from the preserved native JSONL archive.
Dependencies: numpy, mapbox-earcut==2.0.0, fast-simplification==0.1.13.
Usage: python build-room-preview.py geometry.jsonl.gz MODEL_DIRECTORY OUTPUT.json
Original archives are read only. Source IDs/transforms remain attached to every item.
"""
import collections,gzip,hashlib,itertools,json,re,sys,time
from pathlib import Path
import numpy as np
import mapbox_earcut,fast_simplification

def multiply(a,b):return (np.asarray(a).reshape(4,4).T@np.asarray(b).reshape(4,4).T).T.reshape(-1).tolist()
def loop_vertices(loop,edges):
    out=[]
    for eid,orientation in loop:
        a,b=edges[eid];v=a if orientation==1 else b
        if not out or out[-1]!=v:out.append(v)
    if len(out)>1 and out[0]==out[-1]:out.pop()
    return out

def optimize_scene(scene):
    """Bound display complexity with per-definition budgets; keep archives untouched."""
    preserve={'ROOT','136690','137855','138154','138883','138934','loose-room'}
    total=0
    for d in scene['definitions']:
        count=sum(len(m['indices'])//3 for m in d['meshes'])
        for mesh in d['meshes']:
            original=len(mesh['indices'])//3
            target=original if d['id'] in preserve or count<=900 else max(12,int(900*original/count))
            if original>target:
                points=np.asarray(mesh['positions'],dtype=np.float64).reshape(-1,3)
                faces=np.asarray(mesh['indices'],dtype=np.int32).reshape(-1,3)
                span=float(np.ptp(points,axis=0).max());origin=points.min(axis=0)
                for resolution in [400,240,144,86,52,31,19,11]:
                    if len(faces)<=target*1.2:break
                    cell=span/resolution
                    if cell<=0:break
                    keys=np.floor((points-origin)/cell).astype(np.int64)
                    _,inverse=np.unique(keys,axis=0,return_inverse=True)
                    n=int(inverse.max())+1
                    clustered=np.zeros((n,3));np.add.at(clustered,inverse,points)
                    clustered/=np.bincount(inverse)[:,None]
                    tri=inverse[faces];tri=tri[(tri[:,0]!=tri[:,1])&(tri[:,1]!=tri[:,2])&(tri[:,2]!=tri[:,0])]
                    if not len(tri):break
                    _,unique=np.unique(np.sort(tri,axis=1),axis=0,return_index=True);tri=tri[np.sort(unique)]
                    if len(tri)>target:clustered,tri=fast_simplification.simplify(clustered,tri,target_count=target,agg=10)
                    if not len(tri):break
                    points,faces=clustered,tri
                mesh['positions']=np.round(points,6).reshape(-1).tolist();mesh['indices']=faces.reshape(-1).tolist()
                mesh['display_optimized']=True
            total+=len(mesh['indices'])//3
    scene['source']['definition_triangles']=total
    scene['source']['display_method']='Per-material quadric reduction and bounded vertex clustering; display geometry only'
    return scene

def main():
    archive,model_dir,out=Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]);start=time.monotonic()
    register=json.loads((model_dir/'archive-register.json').read_text())
    expected=next(a['sha256'] for a in register['formats'] if a['path']=='geometry.jsonl.gz')
    assert hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()==expected,'Archive hash mismatch'
    h=json.loads((model_dir/'hierarchy.json').read_text());defs={d['id']:d for d in h['definitions']}
    root=defs['ROOT'];layers={str(x['id']):x['hidden'] for x in h['layers']}
    mats={m['name']:m for m in json.loads((model_dir/'materials.json').read_text())['materials']}
    # Reviewable scope: main room placements. Preserve the source and all omitted copies.
    exclude={'50398':'Imported DWG reference','2039196':'Distant alternate placement','892791':'Extreme source tea-table transform'}
    children=[c for c in root['children'] if c['id'] not in exclude and not c.get('hidden') and not layers.get(str(c.get('layer_id')),False)]
    wanted={'ROOT'}
    def collect(did):
        if did in wanted:return
        wanted.add(did)
        for c in defs[did]['children']:collect(c['definition_id'])
    for c in children:collect(c['definition_id'])
    print(f'Room scope: {len(children)} root placements, {len(wanted)} definitions',flush=True)
    output={};seen=set();current=None;vertices={};edges={};faces=[];counts=collections.Counter();skipped=collections.Counter();source_triangles=0;shown_triangles=0
    def finish():
        nonlocal vertices,edges,faces,source_triangles,shown_triangles
        if current not in wanted:return
        d=defs[current];batches=collections.defaultdict(list);material_ids=collections.Counter()
        for face in faces:
            if face.get('hidden') or layers.get(str(face.get('layer')),False):continue
            loops=[loop_vertices(l,edges) for l in face['loops']]
            if not loops or any(len(l)<3 for l in loops):skipped['degenerate_source_faces']+=1;continue
            pts=np.asarray([vertices[i] for l in loops for i in l],dtype=np.float64)
            normal=face['normal'];axis=max(range(3),key=lambda i:abs(normal[i]));axes=[i for i in range(3) if i!=axis]
            ends=np.cumsum([len(l) for l in loops],dtype=np.uint32)
            tri=mapbox_earcut.triangulate_float64(np.ascontiguousarray(pts[:,axes]),ends).reshape(-1,3)
            if not len(tri):skipped['empty_source_faces']+=1;continue
            # Projected polygon area verifies each triangulation, including holes.
            def area(p):return abs(np.sum(p[:,0]*np.roll(p[:,1],-1)-np.roll(p[:,0],-1)*p[:,1]))/2
            polygon=0;offset=0
            for i,l in enumerate(loops):
                a=area(pts[offset:offset+len(l),:][:,axes]);polygon+=a if i==0 else -a;offset+=len(l)
            t=pts[tri][:,:,axes];areas=np.abs((t[:,1,0]-t[:,0,0])*(t[:,2,1]-t[:,0,1])-(t[:,2,0]-t[:,0,0])*(t[:,1,1]-t[:,0,1]))/2
            if not np.isclose(polygon,float(areas.sum()),rtol=1e-5,atol=1e-8):skipped['nonplanar_or_invalid_source_faces']+=1;continue
            mid=str(face.get('material_id'));material_ids[mid]+=len(tri)
            batches[mid].append(pts[tri]);source_triangles+=len(tri)
        meshes=[]
        for mid,chunks in batches.items():
            triangles=np.concatenate(chunks);points,index=np.unique(triangles.reshape(-1,3),axis=0,return_inverse=True);tri=index.reshape(-1,3)
            # Keep architectural polygons; simplify dense display assets per material.
            target=1800 if current not in {'ROOT','136690','137855','138154','138883','138934'} else len(tri)
            original=len(tri)
            if len(tri)>target:
                points,tri=fast_simplification.simplify(points,tri,target_count=target,agg=7)
            name=h['material_ids'].get(mid,'');mat=mats.get(name,{})
            color=[max(0,min(255,int(mat.get('color'+s,default)))) for s,default in [('Red',194),('Green',200),('Blue',188)]]
            meshes.append({'positions':np.round(points,6).reshape(-1).tolist(),'indices':tri.reshape(-1).tolist(),
                           'rgb':color,'material':name,'material_id':mid,'source_triangles':original})
            shown_triangles+=len(tri)
        output[current]={'id':current,'name':d['name'],'meshes':meshes,
            'children':[{'id':str(c['id'])+'-'+str(i),'definition_id':c['definition_id'],'matrix_m':c['matrix_m'],
                         'visible':not c.get('hidden',False) and not layers.get(str(c.get('layer_id')),False),'material_id':str(c.get('material_id'))} for i,c in enumerate(d['children'])],
            'source_bounds_m':d.get('local_geometry_bounds_m')}
        if len(output)%50==0:print(f'Built {len(output)} definitions; {shown_triangles:,} display triangles',flush=True)
        vertices={};edges={};faces=[]
    pattern=re.compile(rb'"definition_id":"([^"]+)"')
    with gzip.open(archive,'rb') as src:
        for line in src:
            match=pattern.search(line)
            if not match:continue
            did=match.group(1).decode()
            if did!=current:
                if current is not None:finish();seen.add(current)
                if did in seen:raise ValueError('Non-contiguous source definition '+did)
                current=did;vertices={};edges={};faces=[]
            if did not in wanted:continue
            row=json.loads(line);kind=row['record_type'];counts[kind]+=1
            if kind=='vertices':vertices[row['id']]=[v*.0254 for v in row['position_in']]
            elif kind=='edges':edges[row['id']]=(row['v1_id'],row['v2_id'])
            elif kind=='faces':faces.append(row)
    finish()
    for did in wanted:
        if did not in output:output[did]={'id':did,'name':defs[did]['name'],'meshes':[],
          'children':[{'id':str(c['id'])+'-'+str(i),'definition_id':c['definition_id'],'matrix_m':c['matrix_m'],'visible':not c.get('hidden',False),'material_id':str(c.get('material_id'))} for i,c in enumerate(defs[did]['children'])]}
    root_mesh=output['ROOT'];identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
    scene={'schema_version':'paila-room-1.0','units':'m','axes':'SketchUp XYZ, Z up',
      'source':{'name':'PILATES.skp','sha256':register['source_sha256'],'archive_sha256':expected,
        'scope':'Main room placements with simplified display meshes. The distant layout, DWG reference and extreme tea-table transform are retained in the source archives.',
        'omitted_root_placements':[{'id':k,'reason':v} for k,v in exclude.items()],
        'root_placements':len(children),'source_triangles':source_triangles,'definition_triangles':shown_triangles,
        'skipped_display_faces':dict(skipped),'complete_skp':False},
      'materials':{mid:{'name':name,'rgb':[int(mats.get(name,{}).get('color'+s,default)) for s,default in [('Red',194),('Green',200),('Blue',188)]]} for mid,name in h['material_ids'].items()},
      'definitions':[output[k] for k in sorted(output)],
      'root':{'id':'room','children':[{'id':str(c['id']),'definition_id':c['definition_id'],'matrix_m':c['matrix_m'],'visible':True,'material_id':str(c.get('material_id'))} for c in children]}}
    # Loose room faces remain one selectable item; references to ROOT's children are not duplicated.
    if root_mesh['meshes']:
        scene['definitions'].append({'id':'loose-room','name':'Loose room geometry','meshes':root_mesh['meshes'],'children':[]})
        scene['root']['children'].append({'id':'loose-room','definition_id':'loose-room','matrix_m':identity,'visible':True})
    for d in scene['definitions']:
        if d['id']=='ROOT':d['meshes']=[];d['children']=[]
    optimize_scene(scene)
    out.write_text(json.dumps(scene,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n')
    print(json.dumps({'output':str(out),'bytes':out.stat().st_size,'root_placements':len(children),'definitions':len(output),'source_triangles':source_triangles,'display_triangles':scene['source']['definition_triangles'],'skipped_faces':dict(skipped),'elapsed_seconds':round(time.monotonic()-start,1)}),flush=True)
if __name__=='__main__':
    if sys.argv[1]=='--optimize-only':
        p=Path(sys.argv[2]);scene=optimize_scene(json.loads(p.read_text()));p.write_text(json.dumps(scene,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n');print(json.dumps({'bytes':p.stat().st_size,'definition_triangles':scene['source']['definition_triangles']}),flush=True)
    else:main()

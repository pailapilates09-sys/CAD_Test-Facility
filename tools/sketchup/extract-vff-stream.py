"""Incremental SketchUp VFF extraction using pinned OpenSKP 1.3.0 decoders.

Reads one geometry entity at a time, preserves the unchanged SKP separately,
and writes source-coordinate JSONL plus metre-coordinate SQLite tables.
This is a community-decoder derivative, not a lossless replacement for SKP.
Usage: PYTHONPATH=READER_ENV python extract-vff-stream.py INPUT.skp OUTPUT_DIR
The original model.dat member is CRC-checked and mapped from a private temp file.
An already extracted, unchanged model.dat is also accepted.
"""
from pathlib import Path
from collections import Counter, defaultdict
import csv, gzip, hashlib, itertools, json, math, mmap, shutil, sqlite3, struct, sys, tempfile, time, zipfile
from openskp import _core as core

SCALE=0.0254
IDENTITY=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
GEOMETRY={'C409':'vertices','B80B':'edges','AC0D':'faces','6419':'instances'}

def dumps(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':'),allow_nan=False)

def headers(data,start,end):
    pos=start
    while pos+6<=end:
        size=struct.unpack_from('<I',data,pos+2)[0]
        if pos+6+size>end:raise ValueError(f'TLV record exceeds parent at {pos}')
        yield data[pos:pos+2].hex().upper(),pos,size
        pos+=6+size
    if pos!=end:raise ValueError(f'TLV trailing bytes at {pos}..{end}')

def payload(data,row):return data[row[1]+6:row[1]+6+row[2]]

def entity_id(data,rows):
    nodes=[{'tag':t,'children':[],'payload':payload(data,(t,o,s))}
           for t,o,s in rows if t in {'DC05','DE05'}]
    found=core.extract_entity_id({'children':nodes})
    if found is not None:return found
    for t,o,s in rows:
        if t in {'8813','D007','D430','D530'}:
            found=entity_id(data,list(headers(data,o+6,o+6+s)))
            if found is not None:return found
    return None

def matrix_m(a):
    if len(a)!=13:raise ValueError(f'Unexpected SketchUp matrix length {len(a)}')
    # SketchUp stores reciprocal uniform scale in the homogeneous scalar.
    # Normalize it rather than dropping it (SketchUp TransformationHelper).
    w=a[12]
    if not math.isfinite(w) or w==0:raise ValueError('Invalid homogeneous transform scalar')
    return [a[0]/w,a[3]/w,a[6]/w,0,a[1]/w,a[4]/w,a[7]/w,0,a[2]/w,a[5]/w,a[8]/w,0,
            a[9]*SCALE/w,a[10]*SCALE/w,a[11]*SCALE/w,1]

def mul(a,b):
    return [sum(a[k*4+r]*b[col*4+k] for k in range(4)) for col in range(4) for r in range(4)]

def transform(p,m):
    return [sum(m[c*4+r]*p[c] for c in range(3))+m[12+r] for r in range(3)]

def merge_box(target,box):
    if box is None:return target
    if target is None:return [list(box[0]),list(box[1])]
    return [[min(target[0][i],box[0][i]) for i in range(3)],
            [max(target[1][i],box[1][i]) for i in range(3)]]

def transformed_box(box,m):
    if box is None:return None
    result=None
    for p in itertools.product(*zip(box[0],box[1])):
        v=transform(p,m);result=merge_box(result,[v,v])
    return result

def run(model_dat,out):
    out.mkdir(parents=True,exist_ok=True)
    if (out/'geometry.sqlite').exists() and '--index-only' not in sys.argv:raise FileExistsError('Choose a fresh output directory')
    start=time.monotonic();defs={'ROOT':{'id':'ROOT','name':'ROOT_MODEL','guid':'ROOT','source_offset':None}}
    counts=defaultdict(Counter);boxes={};children=defaultdict(list);layers={};material_ids={};pages=[]
    tag_counts=Counter();node_counts=0
    def walk(data,begin,end,did=None):
        for tag,offset,size in headers(data,begin,end):
            if tag=='7C15':
                rows=list(headers(data,offset+6,offset+6+size))
                rid=entity_id(data,rows)
                if rid is None:raise ValueError(f'Definition has no decoded ID at {offset}')
                key=str(rid);meta={t:payload(data,(t,o,s)) for t,o,s in rows if t in {'7E15','7D15'}}
                if key not in defs:defs[key]={'id':key,'name':meta.get('7E15',b'').decode('utf-8',errors='replace'),
                    'guid':meta.get('7D15',b'').hex().upper(),'source_offset':offset,'source_bytes':size+6}
                yield from walk(data,offset+6,offset+6+size,key)
            elif tag in GEOMETRY and did is not None:
                yield tag,offset,size,did
            elif tag in core.CONTAINER_TAGS and tag!='8D3C' and (did is not None or tag in {'F401','F901','7017','7117','F601'}):
                yield from walk(data,offset+6,offset+6+size,'ROOT' if tag=='F601' and did is None else did)
            elif did is None and tag=='0702':
                yield tag,offset,size,None
            elif did is None and tag=='8E3C':
                pass

    if model_dat.suffix.lower()=='.skp':
        f=tempfile.TemporaryFile()
        with zipfile.ZipFile(model_dat) as source,source.open('model.dat') as raw:
            expected_size=source.getinfo('model.dat').file_size
            shutil.copyfileobj(raw,f,8*1024*1024)
        if f.tell()!=expected_size:raise ValueError('Incomplete native model.dat transfer')
        f.seek(0)
    else:f=model_dat.open('rb')
    with f,mmap.mmap(f.fileno(),0,access=mmap.ACCESS_READ) as data:
        print('Pass 1: hierarchy, entity counts and local bounds',flush=True)
        # The metadata managers are small; decode independently of geometry.
        def managers(begin,end):
            for tag,o,s in headers(data,begin,end):
                if tag in {'7C15','F601'}:continue
                if tag in {'8C3C','C832'}:
                    rows=list(headers(data,o+6,o+6+s));rid=entity_id(data,rows)
                    values={t:payload(data,(t,p,n)) for t,p,n in rows if t in {'8D3C','8E3C','CC32'}}
                    if tag=='8C3C' and rid is not None:
                        layers[str(rid)]={'id':rid,'name':values.get('8D3C',b'').decode('utf-8',errors='replace'),
                                         'hidden':values.get('8E3C',b'\0')[:1]==b'\1'}
                    elif rid is not None:material_ids[str(rid)]=values.get('CC32',b'').decode('utf-8',errors='replace')
                elif tag=='0702':pages.extend(core._parse_pages({'payload':payload(data,(tag,o,s))}))
                elif tag in core.CONTAINER_TAGS:managers(o+6,o+6+s)
        managers(0,len(data))
        for tag,o,s,did in walk(data,0,len(data)):
            if did is None:continue
            counts[did][GEOMETRY[tag]]+=1;tag_counts[tag]+=1
            if tag=='C409':
                rows=list(headers(data,o+6,o+6+s))
                point=next((struct.unpack_from('<3d',data,p+6) for t,p,n in rows if t=='C509' and n>=24),None)
                if point is None:raise ValueError(f'Vertex position missing at {o}')
                if not all(math.isfinite(v) for v in point):raise ValueError('Nonfinite source vertex')
                xyz=[v*SCALE for v in point];boxes[did]=merge_box(boxes.get(did),[xyz,xyz])
            elif tag=='6419':
                node=core.parse_tlv_recursive(data,o,o+6+s,core.CONTAINER_TAGS)[0]
                b=core._GeometryBuilder();core._extract_geometry_from_nodes([node],b)
                if len(b.instances)!=1:raise ValueError(f'Instance decoder count at {o}')
                r={k:v for k,v in b.instances[0].items() if k!='children'}
                r.update({'id':str(core.extract_entity_id(node) or f'offset-{o}'),
                          'definition_id':str(r['ref_idx']),'matrix_m':matrix_m(r['matrix']),'source_offset':o})
                children[did].append(r)
            node_counts+=1
            if node_counts%250000==0:print(f'Indexed {node_counts:,} geometry records; {len(defs)} definitions',flush=True)
        missing=sorted({i['definition_id'] for row in children.values() for i in row if i['definition_id'] not in defs})
        warnings=[]
        cache={}
        def local_box(did,active=()):
            if did in cache:return cache[did]
            if did in active:
                warnings.append('Definition cycle: '+did);return None
            box=boxes.get(did)
            for child in children[did]:box=merge_box(box,transformed_box(local_box(child['definition_id'],(*active,did)),child['matrix_m']))
            cache[did]=box;return box
        occurrences=[];coincident=defaultdict(list);repeats=defaultdict(list)
        def placed(did,parent,world,active=(),visible=True):
            for n,child in enumerate(children[did]):
                ref=child['definition_id'];matrix=mul(world,child['matrix_m']);path=f'{parent}/{child["id"]}-{n}'
                layer=layers.get(str(child.get('layer_id')),{});shown=visible and not child.get('hidden',False) and not layer.get('hidden',False)
                row={'path':path,'parent_path':parent,'definition_id':ref,'name':child.get('name') or defs.get(ref,{}).get('name',''),
                     'matrix_m':matrix,'visible_by_model_flags':shown,'bounds_envelope_m':transformed_box(local_box(ref),matrix)}
                occurrences.append(row);repeats[ref].append(path)
                key=(ref,tuple(round(v,6 if k in (12,13,14) else 9) for k,v in enumerate(matrix)))
                coincident[key].append(path)
                if ref in active:warnings.append('Placed cycle not expanded: '+path)
                elif ref in defs:placed(ref,path,matrix,(*active,ref),shown)
        placed('ROOT','root',IDENTITY)
        report={'schema_version':'paila-vff-inspection-1.0','source_model_documents':1,'definition_count':len(defs)-1,
                'indexed_geometry_records':node_counts,'entity_counts':dict(sum(counts.values(),Counter())),
                'top_level_instances':len(children['ROOT']),'placed_instance_occurrences':len(occurrences),
                'used_definitions':len(repeats),'unplaced_definition_count':sum(k not in repeats for k in defs if k!='ROOT'),
                'coincident_instance_candidates':[{'definition_id':k[0],'paths':v} for k,v in coincident.items() if len(v)>1],
                'repeated_definition_count':sum(len(v)>1 for v in repeats.values()),'missing_definition_ids':missing,
                'saved_camera_count':len(pages),'layer_count':len(layers),'bounds_envelope_m':local_box('ROOT'),
                'warnings':warnings,'interpretation':'One SKP document can contain several layouts. Repeated definitions are reusable components, not automatically duplicate buildings. Coincident same-definition placements are review candidates; different-definition geometric equivalence is not checked. Nothing deleted.',
                'nonunit_homogeneous_transform_records':sum(i['matrix'][12]!=1 for items in children.values() for i in items),
                'transform_convention':'Source 13-value matrices retained. SI affine matrices normalize the reciprocal uniform-scale scalar (w); translations use inch_to_m=0.0254.',
                'bounds_note':'Conservative transformed component bounding-box envelopes, not measured room dimensions, floor areas or quantities.',
                'decoder':'OpenSKP 1.3.0 entity helpers with an incremental VFF header walker','index_elapsed_seconds':round(time.monotonic()-start,2)}
        hierarchy={'schema_version':'paila-hierarchy-1.0','units':'m','axes':'SketchUp XYZ, Z up','root_definition_id':'ROOT',
                   'definitions':[{**r,'entity_counts':dict(counts[k]),'local_geometry_bounds_m':boxes.get(k),'children':children[k]} for k,r in defs.items()],
                   'layers':list(layers.values()),'material_ids':material_ids,'saved_cameras':pages}
        for name,value in [('inspection.json',report),('hierarchy.json',hierarchy),('instance-occurrences.json',occurrences)]:
            (out/name).write_text(json.dumps(value,indent=2,ensure_ascii=False,allow_nan=False)+'\n')
        with (out/'definitions.csv').open('w',newline='') as fp:
            w=csv.writer(fp);w.writerow(['definition_id','name','vertices','edges','faces','local_instances','placed_occurrences'])
            for k,r in defs.items():w.writerow([k,r['name'],counts[k]['vertices'],counts[k]['edges'],counts[k]['faces'],counts[k]['instances'],len(repeats[k])])
        with (out/'instances.csv').open('w',newline='') as fp:
            w=csv.writer(fp);w.writerow(['path','parent_path','definition_id','name','visible','x_m','y_m','z_m'])
            for row in occurrences:w.writerow([row['path'],row['parent_path'],row['definition_id'],row['name'],row['visible_by_model_flags'],*row['matrix_m'][12:15]])
        print(dumps({k:v for k,v in report.items() if k not in {'coincident_instance_candidates','warnings'}}),flush=True)
        if '--index-only' in sys.argv:return
        print('Pass 2: full vertex, edge, face and instance records to JSONL + SQLite',flush=True)
        con=sqlite3.connect(out/'geometry.sqlite.partial')
        con.executescript('PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF; PRAGMA cache_size=-16384; CREATE TABLE metadata(key TEXT PRIMARY KEY,value_json TEXT); CREATE TABLE definitions(id TEXT PRIMARY KEY,name TEXT,record_json TEXT); CREATE TABLE vertices(definition_id TEXT,id INTEGER,x_m REAL,y_m REAL,z_m REAL,source_offset INTEGER,PRIMARY KEY(definition_id,id)); CREATE TABLE edges(definition_id TEXT,id INTEGER,v1_id INTEGER,v2_id INTEGER,flags INTEGER,layer_id INTEGER,curve_id INTEGER,source_offset INTEGER,PRIMARY KEY(definition_id,id)); CREATE TABLE faces(definition_id TEXT,id INTEGER,record_json TEXT,source_offset INTEGER,PRIMARY KEY(definition_id,id)); CREATE TABLE instances(parent_definition_id TEXT,id TEXT,definition_id TEXT,name TEXT,record_json TEXT,source_offset INTEGER);')
        con.execute('INSERT INTO metadata VALUES(?,?)',('schema',dumps({'version':'paila-geometry-1.0','sqlite_coordinate_units':'m','jsonl_coordinate_units':'inches','inch_to_m':SCALE,'axes':'SketchUp XYZ, Z up','native_source_required':True})))
        for r in hierarchy['definitions']:con.execute('INSERT INTO definitions VALUES(?,?,?)',(r['id'],r['name'],dumps(r)))
        decoded=Counter();processed=0
        with gzip.open(out/'geometry.jsonl.gz.partial','wt',encoding='utf-8',compresslevel=3) as jsonl:
            jsonl.write(dumps({'record_type':'metadata','schema_version':'paila-geometry-1.0','coordinate_units':'inches','inch_to_m':SCALE})+'\n')
            for tag,o,s,did in walk(data,0,len(data)):
                if did is None:continue
                node=core.parse_tlv_recursive(data,o,o+6+s,core.CONTAINER_TAGS)[0]
                b=core._GeometryBuilder();core._extract_geometry_from_nodes([node],b)
                for rid,p in b.vertices.items():
                    r={'id':rid,'position_in':p};kind='vertices'
                    con.execute('INSERT INTO vertices VALUES(?,?,?,?,?,?)',(did,rid,*(v*SCALE for v in p),o))
                    jsonl.write(dumps({'record_type':kind,'definition_id':did,'source_offset':o,**r})+'\n');decoded[kind]+=1
                for rid,(a,z) in b.edges.items():
                    r={'id':rid,'v1_id':a,'v2_id':z,'flags':b.edge_flags.get(rid,0),'layer_id':b.edge_layers.get(rid),'curve_id':b.edge_curves.get(rid)};kind='edges'
                    con.execute('INSERT INTO edges VALUES(?,?,?,?,?,?,?,?)',(did,rid,a,z,r['flags'],r['layer_id'],r['curve_id'],o))
                    jsonl.write(dumps({'record_type':kind,'definition_id':did,'source_offset':o,**r})+'\n');decoded[kind]+=1
                for rid,r in b.faces.items():
                    con.execute('INSERT INTO faces VALUES(?,?,?,?)',(did,rid,dumps(r),o));kind='faces'
                    jsonl.write(dumps({'record_type':kind,'definition_id':did,'source_offset':o,'id':rid,**r})+'\n');decoded[kind]+=1
                for raw in b.instances:
                    r={k:v for k,v in raw.items() if k!='children'};rid=str(core.extract_entity_id(node) or f'offset-{o}');kind='instances'
                    r['matrix_m']=matrix_m(r['matrix'])
                    con.execute('INSERT INTO instances VALUES(?,?,?,?,?,?)',(did,rid,str(r['ref_idx']),r.get('name'),dumps(r),o))
                    jsonl.write(dumps({'record_type':kind,'definition_id':did,'source_offset':o,'id':rid,**r})+'\n');decoded[kind]+=1
                processed+=1
                if processed%100000==0:
                    con.commit();print(f'Decoded {processed:,}/{node_counts:,} records; {time.monotonic()-start:.0f}s',flush=True)
        expected=Counter(report['entity_counts'])
        if decoded!=expected:raise ValueError(f'Decoded counts differ from indexed counts: {decoded} vs {expected}')
        con.execute('INSERT INTO metadata VALUES(?,?)',('inspection',dumps(report)));con.commit()
        integrity=con.execute('PRAGMA quick_check').fetchone()[0]
        if integrity!='ok':raise ValueError('SQLite integrity check: '+integrity)
        print('Writing compressed SQL dump',flush=True)
        with gzip.open(out/'geometry.sql.gz.partial','wt',encoding='utf-8',compresslevel=3) as fp:
            for line in con.iterdump():fp.write(line+'\n')
        con.close()
        for name in ('geometry.sqlite','geometry.jsonl.gz','geometry.sql.gz'):(out/(name+'.partial')).rename(out/name)
        report.update({'geometry_decode_status':'complete_for_supported_indexed_entity_types','decoded_counts':dict(decoded),
                       'sqlite_quick_check':integrity,'elapsed_seconds':round(time.monotonic()-start,2),
                       'coverage_note':'Vertices, edges, faces, instance transforms, materials/UV metadata in face records, model tags and saved cameras decoded. Other native SKP features remain preserved in the original binary and embedded assets; no claim of full SketchUp fidelity.'})
        (out/'inspection.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
        print('Complete: '+dumps({'decoded_counts':dict(decoded),'seconds':report['elapsed_seconds']}),flush=True)

if __name__=='__main__':run(Path(sys.argv[1]),Path(sys.argv[2]))

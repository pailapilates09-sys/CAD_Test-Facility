"""Preserve an exported Paila scene in SQL/SQLite and inspect repeated instances.
Usage: python ingest-scene.py scene.json output_folder
Does not change the scene or the native SKP.
"""
from pathlib import Path
import sys,json,sqlite3,hashlib,collections

def multiply(a,b):
 return [sum(a[k*4+r]*b[c*4+k] for k in range(4)) for c in range(4) for r in range(4)]
IDENTITY=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
def inspect(scene):
 definitions={x['id']:x for x in scene['definitions']}; occurrences=[];warnings=[]
 def walk(container,parent,world,ancestors):
  for c in container['children']:
   did=c['definition_id'];m=multiply(world,c['matrix_m']);path=parent+'/'+c['id']
   occurrences.append({'path':path,'instance_id':c['id'],'definition_id':did,'name':c.get('name',''),'matrix_m':m,'parent':parent})
   if did in ancestors:warnings.append('Cycle not expanded: '+path);continue
   if did not in definitions:warnings.append('Missing definition: '+did);continue
   walk(definitions[did],path,m,ancestors+[did])
 walk(scene['root'],'root',IDENTITY,[])
 repeated=collections.defaultdict(list);overlaps=collections.defaultdict(list)
 for o in occurrences:
  repeated[o['definition_id']].append(o['path'])
  # 1 micrometre translation / 1e-9 matrix tolerance: review candidate only.
  key=(o['definition_id'],tuple(round(v,6 if i in (12,13,14) else 9) for i,v in enumerate(o['matrix_m'])))
  overlaps[key].append(o['path'])
 return {'status':'geometry_inspected','units':'m','definition_count':len(definitions),'placed_instance_occurrences':len(occurrences),'top_level_instances':len(scene['root']['children']),'repeated_definitions':[{'definition_id':k,'paths':v,'note':'Repeated use can be intentional.'} for k,v in repeated.items() if len(v)>1],'coincident_instance_candidates':[{'definition_id':k[0],'paths':v} for k,v in overlaps.items() if len(v)>1],'warnings':warnings,'interpretation':'Same definition at the same world transform is a possible overlapping duplicate, not proof that it should be deleted. Different definitions with equal geometry are not detected. Repeated furniture and alternative layouts require human review. No geometry removed.'},occurrences

def run(source,out):
 out.mkdir(parents=True,exist_ok=True);scene=json.loads(source.read_text());assert scene['schema_version']=='paila-scene-1.0' and scene['units']=='m'
 report,occurrences=inspect(scene);(out/'duplicate-report.json').write_text(json.dumps(report,indent=2)+'\n')
 (out/'instance-occurrences.jsonl').write_text(''.join(json.dumps(x)+'\n' for x in occurrences))
 db=out/'model.sqlite'
 if db.exists():raise FileExistsError('Choose a new output folder: '+str(db))
 con=sqlite3.connect(db);con.executescript('CREATE TABLE source(record_json TEXT); CREATE TABLE definitions(id TEXT PRIMARY KEY,name TEXT,record_json TEXT); CREATE TABLE occurrences(path TEXT PRIMARY KEY,definition_id TEXT,record_json TEXT);')
 con.execute('INSERT INTO source VALUES(?)',(json.dumps(scene['source']),))
 for d in [scene['root']]+scene['definitions']:con.execute('INSERT INTO definitions VALUES(?,?,?)',(d['id'],d.get('name',''),json.dumps(d)))
 for o in occurrences:con.execute('INSERT INTO occurrences VALUES(?,?,?)',(o['path'],o['definition_id'],json.dumps(o)))
 con.commit();(out/'model.sql').write_text('\n'.join(con.iterdump())+'\n');con.close()
 (out/'source-checksum.txt').write_text(hashlib.sha256(source.read_bytes()).hexdigest()+'  scene.json\n')
 return report
if __name__=='__main__':print(json.dumps(run(Path(sys.argv[1]),Path(sys.argv[2])),indent=2))

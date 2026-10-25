"""Rebuild the query database from immutable raw records plus the one model JSON."""
import argparse,gzip,json,pathlib,sqlite3
p=argparse.ArgumentParser();p.add_argument('project');p.add_argument('source_db');p.add_argument('output');a=p.parse_args()
project=json.loads(pathlib.Path(a.project).read_text());out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=True)
c=sqlite3.connect(':memory:');c.deserialize(gzip.decompress(pathlib.Path(a.source_db).read_bytes()))
c.executescript('''
 CREATE TABLE model_metadata(key TEXT PRIMARY KEY,value_json TEXT NOT NULL);
 CREATE TABLE model_levels(id TEXT PRIMARY KEY,label TEXT,elevation_m REAL,stated_area_m2 REAL,source_page INTEGER,record_json TEXT);
 CREATE TABLE model_components(id TEXT PRIMARY KEY,label TEXT,kind TEXT,level TEXT,status TEXT,source_page INTEGER,record_json TEXT);
 CREATE TABLE model_facts(id TEXT PRIMARY KEY,label TEXT,value_json TEXT,unit TEXT,status TEXT,source_page INTEGER,record_json TEXT);
 CREATE TABLE model_rooms(id TEXT PRIMARY KEY,label TEXT,level TEXT,width_m REAL,depth_m REAL,record_json TEXT);
 CREATE TABLE model_opening_types(id TEXT PRIMARY KEY,width_m REAL,height_m REAL,scheduled_count INTEGER,record_json TEXT);
 CREATE TABLE model_structural_schedules(id TEXT PRIMARY KEY,source_page INTEGER,record_json TEXT);
 CREATE TABLE model_column_schedule(id TEXT PRIMARY KEY,column_type TEXT,source_storey TEXT,record_json TEXT);
 CREATE TABLE model_issues(id TEXT PRIMARY KEY,title TEXT,status TEXT,record_json TEXT);
 ''')
dump=lambda r:json.dumps(r,ensure_ascii=False,separators=(',',':'))
for key in ['schema','id','title','source_sha256','units','axes','calibration','editing']:c.execute('INSERT INTO model_metadata VALUES(?,?)',(key,dump(project[key])))
for r in project['levels']:c.execute('INSERT INTO model_levels VALUES(?,?,?,?,?,?)',(r['id'],r['label'],r['elevation_m'],r['stated_area_m2'],r['plan_page'],dump(r)))
for r in project['components']:c.execute('INSERT INTO model_components VALUES(?,?,?,?,?,?,?)',(r['id'],r['label'],r['kind'],r['level'],r['status'],r['source']['page'],dump(r)))
for r in project['facts']:c.execute('INSERT INTO model_facts VALUES(?,?,?,?,?,?,?)',(r['id'],r['label'],dump(r['value']),r['unit'],r['status'],r['evidence']['page'],dump(r)))
for r in project['rooms']:c.execute('INSERT INTO model_rooms VALUES(?,?,?,?,?,?)',(r['id'],r['label'],r['level'],r['written_width_m'],r['written_depth_m'],dump(r)))
for r in project['opening_types']:c.execute('INSERT INTO model_opening_types VALUES(?,?,?,?,?)',(r['id'],r['width_m'],r['height_m'],r['scheduled_count'],dump(r)))
for r in project['structural_schedules']:c.execute('INSERT INTO model_structural_schedules VALUES(?,?,?)',(r['id'],r['page'],dump(r)))
for r in project['column_schedule']:c.execute('INSERT INTO model_column_schedule VALUES(?,?,?,?)',(r['id'],r['column_type'],r['source_storey'],dump(r)))
for r in project['issues']:c.execute('INSERT INTO model_issues VALUES(?,?,?,?)',(r['id'],r['title'],r['status'],dump(r)))
c.commit();assert c.execute('PRAGMA quick_check').fetchone()[0]=='ok'
(out/'building.sqlite.gz').write_bytes(gzip.compress(c.serialize(),mtime=0))
# Exclude FTS virtual/shadow tables so the SQL works without SQLite's FTS extension.
(out/'building.sql.gz').write_bytes(gzip.compress(('\n'.join(s for s in c.iterdump()if'text_search'not in s)+'\n').encode(),mtime=0))
print('Built raw + semantic SQLite/SQL exports; quick_check passed.')

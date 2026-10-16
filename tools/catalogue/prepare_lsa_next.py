"""Prepare one LSA physical-occurrence batch from verified Drive metadata."""
import json,hashlib,sys,zipfile
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
ROOT=Path(__file__).parent
def readj(p):return json.loads(p.read_text())
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def meta(p):return {'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
inp=readj(Path(sys.argv[1]));n=inp['batch'];batch=f'B{n:03}';base=ROOT/'lsa-current';out=ROOT/f'lsa-b{n:03}';out.mkdir(exist_ok=True)
oldbytes=(base/'manifest.jsonl').read_bytes();old=[json.loads(x) for x in oldbytes.splitlines()];oldids={x['drive_id'] for x in old};metas={x['id']:x for x in inp['metas']}
assert len(oldids)==len(old)
root=metas[inp['root']];parent=next(x for x in old if x['drive_id']==root['parent_ids'][0]);newrows=[]
def walk(m,path):
    assert m['id'] not in oldids
    folder=m['mime_type']=='application/vnd.google-apps.folder'
    newrows.append(dict(manifest_row_id=f'LSA-P1B-{batch}-{len(newrows)+1:04}',source_branch=parent['source_branch'],drive_id=m['id'],name=m['title'],relative_path=path,item_type='folder' if folder else 'file',mime_type=m['mime_type'],size_bytes=None if folder else int(m['size']),created_time=m['created_time'],modified_time=m['modified_time'],parent_drive_id=m['parent_ids'][0],scope='DESCENDANT',preservation_flag='PRESERVE',anomaly_flag='',manifest_state='VERIFIED_METADATA',provenance='LIVE_GOOGLE_DRIVE'))
    for ch in sorted([x for x in metas.values() if m['id'] in (x.get('parent_ids') or [])],key=lambda x:(x['title'].strip().casefold(),x['id'])):walk(ch,path+'/'+ch['title'])
walk(root,parent['relative_path']+'/'+root['title'] if parent['relative_path']!='.' else root['title'])
assert len(newrows)==len(metas)==len({x['drive_id'] for x in newrows})
new=old+newrows;files=[x for x in new if x['item_type']=='file'];folders=[x for x in new if x['item_type']=='folder']
stats=dict(rows=len(new),files=len(files),folders_including_roots=len(folders),file_bytes=sum(x['size_bytes'] or 0 for x in files));delta=dict(rows=len(newrows),files=sum(x['item_type']=='file' for x in newrows),folders=sum(x['item_type']=='folder' for x in newrows),bytes=sum(x['size_bytes'] or 0 for x in newrows))
desc=f"{parent['source_branch']}/{newrows[0]['relative_path']}: profiled complete physical metadata; added {delta['folders']} folders + {delta['files']} files / {delta['bytes']:,} represented bytes. Source bodies unread and unmodified; all prior rows preserved."
(out/'manifest.jsonl').write_bytes(oldbytes+''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in newrows).encode())
(out/'delta.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in newrows))
now=datetime.now(ZoneInfo('Asia/Kathmandu')).isoformat();progress=readj(base/'progress.json');progress.update(manifest_version=f'v0.{n:02}-b{n:03}',persisted=stats,remaining=dict(rows=1244-stats['rows'],files=1104-stats['files'],folders_including_roots=140-stats['folders_including_roots']),completion_fraction=round(stats['rows']/1244,4),timestamp_npt=now,next_action=inp['nextAction']);progress['batch_scope'][batch]=desc;dump(out/'progress-draft.json',progress)
with zipfile.ZipFile(out/'pre-archive.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in ['manifest.jsonl','progress.json','lock.json']:z.write(base/f,f)
    z.write(Path(sys.argv[1]),'source-evidence.json')
payload=dict(batch=batch,checkpoint=f'CP{n:02}',stats=stats,delta=delta,description=desc,nextAction=inp['nextAction'],nativeRows=[[str(r[k]) if r[k] is not None else '' for k in old[0]] for r in newrows],manifest=meta(out/'manifest.jsonl'),delta_file=meta(out/'delta.jsonl'),pre=meta(out/'pre-archive.zip'),created_at=now,localSequence=inp['localSequence'])
dump(out/'payload.json',payload);print(json.dumps(payload,ensure_ascii=False))

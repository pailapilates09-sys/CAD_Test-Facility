"""Prepare one deterministic catalogue checkpoint; never reads source bodies."""
import json, hashlib, sys, zipfile
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo

ROOT=Path(__file__).parent
def readj(p):return json.loads(p.read_text())
def rows(p):return [json.loads(x) for x in p.read_text().splitlines()]
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def jsonl(p,x):p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in x))
def meta(p):return {'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}

inp=readj(Path(sys.argv[1])); n=inp['batch']; batch=f'B{n:03}'; cp=f'MSCH-CORPUS-CP{n:02}'
base=ROOT/'msch-current'; out=ROOT/f'msch-b{n:03}';out.mkdir(exist_ok=True)
m=rows(base/'manifest.jsonl');q=rows(base/'queue.jsonl');state=readj(base/'state.json');rf=(base/'readfirst.md').read_text()
assert state['checkpoint']==f'MSCH-CORPUS-CP{n-1:02}'
assert len(m)==len({x['drive_id'] for x in m})==state['catalog_rows']
target=next(x for x in q if x['queue_status']=='PENDING')
assert target['folder_drive_id']==inp['target']['id']
folder=next(x for x in m if x['drive_id']==target['folder_drive_id'])
assert inp['target']['parent_ids']==[folder['parent_drive_id']]
def listing_key(xs):return sorted((x['id'],x['title'],x['mime_type'],x.get('size')) for x in xs)
assert listing_key(inp['list'])==listing_key(inp['confirmation'])
confirmation_route=inp.get('confirmation_route','FULL_FOLDER_FETCH')
assert confirmation_route in ['FULL_FOLDER_FETCH','SECOND_COMPLETE_DIRECT_LIST']
assert {x['id'] for x in inp['children']}=={x['id'] for x in inp['list']}
assert all(x['parent_ids']==[folder['drive_id']] for x in inp['children'])
assert not {x['id'] for x in inp['children']} & {x['drive_id'] for x in m}
children=sorted(inp['children'],key=lambda x:(x['title'].strip().casefold(),x['id']))
folders=sum(x['mime_type']=='application/vnd.google-apps.folder' for x in children)
files=len(children)-folders
known_bytes=sum(int(x['size']) for x in children if x.get('size') is not None and x['mime_type']!='application/vnd.google-apps.folder')
notes=f'{batch}: {folders} direct folders and {files} files; {known_bytes} metadata-reported bytes; complete list and {confirmation_route} agree; source mutation NONE.'
parent_path=folder['parent_path']+'/'+folder['name']; added=[]
for x in children:
    isfolder=x['mime_type']=='application/vnd.google-apps.folder'
    added.append(dict(drive_id=x['id'],name=x['title'],type='folder' if isfolder else 'file',mime_type=x['mime_type'],size_bytes=None if isfolder or x.get('size') is None else int(x['size']),parent_drive_id=folder['drive_id'],parent_path=parent_path,depth=folder['depth']+1,scan_status='PENDING_RECURSIVE_SCAN' if isfolder else 'CATALOGED',role_class='PHYSICAL_FOLDER' if isfolder else 'PHYSICAL_FILE',notes=notes))
    if isfolder:
        q.append(dict(folder_drive_id=x['id'],folder_name=x['title'],parent_drive_id=folder['drive_id'],parent_path=parent_path,depth=folder['depth']+1,queue_status='PENDING',planned_batch=f'B{n+1:03}+',last_scan='',notes=f'Discovered in {batch}; appended at FIFO tail.'))
folder['scan_status']='SCANNED';folder['notes']=notes;m.extend(added)
now=datetime.now(ZoneInfo('Asia/Kathmandu')).isoformat()
target.update(queue_status='SCANNED',planned_batch=batch,last_scan=now,notes=notes)
post=dict(catalog_rows=len(m),folders=sum(x['type']=='folder' for x in m),files=sum(x['type']=='file' for x in m),known_bytes=sum(x.get('size_bytes') or 0 for x in m if x['type']=='file'),pending_folders=sum(x['queue_status']=='PENDING' for x in q))
nxt=next((x for x in q if x['queue_status']=='PENDING'),None)
assert post['catalog_rows']==state['catalog_rows']+len(added)
assert post['pending_folders']==state['pending_folders']-1+folders
action=f"Re-read Local SyncState and finish any unresolved CP{n:02}/{batch} closeout before B{n+1:03} from FIFO {nxt['folder_drive_id']} ({nxt['folder_name']}). No source cleanup, content extraction or schedule changes." if nxt else 'Catalogue FIFO exhausted; reconcile exact source scope before any content extraction.'
state.update(checkpoint=cp,catalog_rows=post['catalog_rows'],folders_cataloged=post['folders'],files_cataloged=post['files'],known_file_bytes=post['known_bytes'],pending_folders=post['pending_folders'],next_action=action,last_verified_at=now,last_live_run=f'LIVE-MSCH-{batch}-20261016')
state['completed_batches'].append(batch)
state['hold'].update(active=False,durable_boundary=f'{cp} / {batch}',resume_action=action)
state['last_batch']=dict(batch=batch,queue_item_drive_id=folder['drive_id'],queue_item_name=folder['name'],new_rows=len(added),new_folders=folders,new_files=files,new_file_bytes=known_bytes,new_pending_folders=folders,source_mutations=0)
state['registration_boundary']=dict(checkpoint=cp,recorded_at=now,local_registration_at_checkpoint_creation='PENDING',expected_local_event=f"MSCH-LL-EVT-{inp['localSequence']:04}",authority='Live Local SyncState/event identity governs latest status; creation-time provenance.',next_action_if_unregistered=f'Register existing CP{n:02}/PRE once, native PRE/POST, own Main notice and progress. Do not replay {batch}.')
state['response_footer']=f"ACTIVE: {cp}/{batch}; {post['catalog_rows']} rows / {post['folders']} folders / {post['files']} files / {post['pending_folders']} pending. Live Local registration governs continuation; source mutation NONE."
head=f"# MScH Hydropower Research Corpus - CURRENT CP{n:02}\n\nStatus: ACTIVE - user-authorized minimum60-minute live continuation, 2026-10-16.\nProvider checkpoint: {cp} / {batch}.\nCurrent catalogue: {post['catalog_rows']} rows / {post['folders']} folders / {post['files']} files / {post['known_bytes']} known bytes; {post['pending_folders']} pending FIFO folders.\n{notes}\nNew child folders stay at the FIFO tail. Source bodies remain unextracted/unexecuted. Source/scheduler mutation NONE.\nTerminal Local registration pending at creation; live SyncState governs. Do not replay {batch}.\nNext FIFO after registration: B{n+1:03} {nxt['folder_name']} / {nxt['folder_drive_id']}.\n\n## Preserved historical CP{n-1:02} control text\nThe following is historical; current state above and CP{n:02} govern.\n\n"
jsonl(out/'manifest.jsonl',m);jsonl(out/'queue.jsonl',q);dump(out/'state.json',state);(out/'readfirst.md').write_text(head+rf)
with zipfile.ZipFile(out/'pre-archive.zip','w',zipfile.ZIP_DEFLATED) as z:
    for filename in ['manifest.jsonl','queue.jsonl','state.json','readfirst.md']:z.write(base/filename,filename)
    z.write(Path(sys.argv[1]),'source-evidence.json')
assert zipfile.ZipFile(out/'pre-archive.zip').testzip() is None
rec=dict(checkpoint=cp,batch=batch,run_id=f'LIVE-MSCH-{batch}-20261016',mode='LIVE_USER_MINIMUM_60_MINUTES',status='PROJECT_PROVIDER_READBACK_VERIFIED_LOCAL_PENDING',previous_checkpoint=dict(id=inp['previousCheckpoint'],checkpoint=f'MSCH-CORPUS-CP{n-1:02}'),target=dict(name=folder['name'],drive_id=folder['drive_id']),added=added,empty_folder_verified=not children,source_evidence=dict(direct_folder_list=len(children),confirmation_count=len(children),confirmation_route=confirmation_route,partial_folder_fetch_count=inp.get('partial_folder_fetch_count'),matching_ids_names_mimes_sizes=True,source_read_at=now,completeness_basis='COMPLETE_DIRECT_LIST_AND_'+confirmation_route+'_AGREE_WITH_EXACT_METADATA_PARENTS'),post=post,delta=dict(new_rows=len(added),new_folders=folders,new_files=files,new_file_bytes=known_bytes,pending_folders_change=folders-1),post_artifacts={k:meta(out/f) for k,f in [('manifest','manifest.jsonl'),('queue','queue.jsonl'),('state','state.json'),('readfirst','readfirst.md')]},pre=meta(out/'pre-archive.zip'),next=dict(batch=f'B{n+1:03}',name=nxt['folder_name'],drive_id=nxt['folder_drive_id'],parent_path=nxt['parent_path']),content_extraction=False,source_mutation='NONE',scheduler_mutation='NONE',local_registration_at_creation='PENDING',expected_local_sequence=inp['localSequence'],main_ack='PENDING_SEPARATE_MAIN_SYNC',created_at=now)
dump(out/'checkpoint-draft.json',rec)
print(json.dumps({k:v for k,v in rec.items() if k not in ['added']},ensure_ascii=False))

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateWorkspaceMilestone,changedWorkspaceManifests} from '../scripts/release-workspace-milestone.mjs';
const root=new URL('../',import.meta.url),path='public/milestones/workspace-m5-2026-10-21.json';
const m=JSON.parse(await readFile(new URL(path,root),'utf8'));

test('M5 separates the complete supported archive scope from the selected browser preview',()=>{
 assert.equal(validateWorkspaceMilestone(m).tag,'workspace-m5-2026-10-21');
 assert.equal(m.coverage.vertices+m.coverage.edges+m.coverage.faces+m.coverage.local_instance_records,m.coverage.indexed_geometry_records);
 assert.equal(m.coverage.full_geometry_in_browser,false);
 assert.equal(m.coverage.browser_preview.triangles,1414);
 assert.equal(m.source.source_size_bytes,295205462);
 assert.match(m.source.source_hash_scope,/user-uploaded PILATES.zip/);
 assert.match(m.source.source_hash_scope,/filename and size only/);
 assert.equal(m.verification.sqlite_quick_check,'ok');
 assert.equal(m.verification.supported_geometry_reference_errors,0);
 assert.match(m.verification.drive_archive_verification,/not all been downloaded again/);
 for(const hash of Object.values(m.storage.geometry_archive_sha256))assert.match(hash,/^[a-f0-9]{64}$/);
 assert.equal(m.version_control.branch_base,m.tag);
 assert.equal(m.version_control.pages_branch,'main');
 assert.equal(m.version_control.existing_tags_moved,false);
});

test('M5 release rejects changed lineage, full-browser claims and live Drive or branch misstatements',()=>{
 for(const patch of [
  {previous_milestone_tag:'workspace-m3-2026-10-19'},
  {coverage:{...m.coverage,full_geometry_in_browser:true}},
  {coverage:{...m.coverage,held_works:0}},
  {verification:{...m.verification,desktop_model_comparison:'passed'}},
  {verification:{...m.verification,milestone_record_automated_tests:undefined}},
  {storage:{...m.storage,live_drive_fetch:true}},
  {storage:{...m.storage,automatic_drive_sync:true}},
  {version_control:{...m.version_control,working_branch:'main'}}
 ])assert.throws(()=>validateWorkspaceMilestone({...m,...patch}));
 assert.deepEqual(changedWorkspaceManifests(path+'\nREADME.md\n'),[path]);
 assert.throws(()=>changedWorkspaceManifests('public/milestones/workspace-m6-unprepared.json'));
});

test('M5 preserves historical releases and links its storage and recovery record from the milestone page',async()=>{
 for(const path of ['public/construction/estimates/pilates-astra-2026-10-15/milestone.json',...['m2-2026-10-18','m3-2026-10-19','m4-2026-10-20'].flatMap(id=>['public/milestones/workspace-'+id+'.json','public/milestones/WORKSPACE-'+id.toUpperCase()+'.md'])]){
  const actual=createHash('sha256').update(await readFile(new URL(path,root))).digest('hex');
  assert.equal(actual,m.preservation_sha256[path]);
 }
 const page=await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/milestone.html',root),'utf8');
 assert.match(page,/id="workspace-m5"/);assert.ok(page.includes('releases/tag/'+m.tag));
 assert.doesNotMatch(page,/LATEST WORKSPACE MILESTONE \/ M4|SKP download remains blocked/);
 const notes=await readFile(new URL(m.release_notes_path,root),'utf8');
 assert.ok(notes.includes(m.base_commit));assert.ok(notes.includes(m.version_control.working_branch));
 assert.match(notes,/does not fetch the geometry from Drive/);assert.match(notes,/retaining the separately stored Drive archives/);
});

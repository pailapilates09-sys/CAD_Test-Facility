import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateWorkspaceMilestone,changedWorkspaceManifests} from '../scripts/release-workspace-milestone.mjs';
const root=new URL('../',import.meta.url),path='public/milestones/workspace-m6-2026-10-22.json';
const m=JSON.parse(await readFile(new URL(path,root),'utf8'));

test('M6 freezes the approved linked room baseline and its source lineage',()=>{
 assert.equal(validateWorkspaceMilestone(m).tag,'workspace-m6-2026-10-22');
 assert.equal(m.base_commit,'562ccefae4a74b435b2ced1d6e86512029d4c523');
 assert.equal(m.previous_milestone_tag,'workspace-m5-2026-10-21');
 assert.equal(m.coverage.linked_views,3);assert.equal(m.coverage.item_types,106);
 assert.deepEqual(changedWorkspaceManifests(path+'\nREADME.md'),[path]);
 assert.equal(m.version_control.next_working_branch,'work/studio-navigation-after-m6');
});

test('M6 rejects altered coverage, publication claims and storage claims',()=>{
 for(const patch of [
  {previous_milestone_tag:'workspace-m4-2026-10-20'},
  {coverage:{...m.coverage,item_types:107}},
  {verification:{...m.verification,rendered_3d_visual_qa:'passed'}},
  {storage:{...m.storage,live_drive_fetch:true}},
  {version_control:{...m.version_control,existing_tags_moved:true}}
 ])assert.throws(()=>validateWorkspaceMilestone({...m,...patch}));
});

test('M6 retains immutable archives, scene geometry and historical release records',async()=>{
 for(const path of ['public/construction/models/pilates-sketchup/studio-room.scene.json','public/construction/models/pilates-sketchup/hierarchy.json','public/construction/models/pilates-sketchup/archive-register.json','public/milestones/workspace-m5-2026-10-21.json']){
  assert.equal(createHash('sha256').update(await readFile(new URL(path,root))).digest('hex'),m.preservation_sha256[path]);
 }
 const page=await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/milestone.html',root),'utf8');
 assert.match(page,/id="workspace-m6"/);assert.ok(page.includes('releases/tag/'+m.tag));
 const notes=await readFile(new URL(m.release_notes_path,root),'utf8');assert.ok(notes.includes(m.base_commit));assert.match(notes,/135 automated tests/);assert.match(notes,/Rendered 3D visual QA remains unverified/);
});

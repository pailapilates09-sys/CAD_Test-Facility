import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateWorkspaceMilestone,changedWorkspaceManifests} from '../scripts/release-workspace-milestone.mjs';
const root=new URL('../',import.meta.url),path='public/milestones/workspace-m7-2026-10-22.json';
const m=JSON.parse(await readFile(new URL(path,root),'utf8'));
test('M7 freezes navigation before BOQ integration with the latest saved extraction boundary',()=>{
 assert.equal(validateWorkspaceMilestone(m).tag,'workspace-m7-2026-10-22');
 assert.equal(m.coverage.model_boq_links_included,false);assert.equal(m.coverage.progress_checkpoint,'CP316');assert.equal(m.coverage.progress_local_main,'307/307');
 assert.equal(m.version_control.next_working_branch,'work/model-boq-after-m7');
 assert.deepEqual(changedWorkspaceManifests(path+'\nREADME.md'),[path]);
});
test('M7 rejects invented material integration or visual verification claims',()=>{
 for(const patch of [{coverage:{...m.coverage,model_boq_links_included:true}},{coverage:{...m.coverage,source_viewpoints:15}},{verification:{...m.verification,rendered_3d_visual_qa:'passed'}},{storage:{...m.storage,live_drive_fetch:true}},{version_control:{...m.version_control,existing_tags_moved:true}}])assert.throws(()=>validateWorkspaceMilestone({...m,...patch}));
});
test('M7 preserves native geometry, estimate source and historical M6 release',async()=>{
 for(const path of ['public/construction/models/pilates-sketchup/studio-room.scene.json','public/construction/models/pilates-sketchup/hierarchy.json','public/construction/estimates/pilates-astra-2026-10-15/v9/register.json','public/milestones/workspace-m6-2026-10-22.json'])assert.equal(createHash('sha256').update(await readFile(new URL(path,root))).digest('hex'),m.preservation_sha256[path]);
 const page=await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/milestone.html',root),'utf8');assert.match(page,/id="workspace-m7"/);assert.ok(page.includes('releases/tag/'+m.tag));
 const notes=await readFile(new URL(m.release_notes_path,root),'utf8');assert.ok(notes.includes(m.base_commit));assert.match(notes,/144 automated tests/);assert.match(notes,/Rendered 3D visual QA remains unverified/);
});

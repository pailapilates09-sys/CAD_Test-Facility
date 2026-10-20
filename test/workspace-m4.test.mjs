import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateWorkspaceMilestone,changedWorkspaceManifests} from '../scripts/release-workspace-milestone.mjs';
const root=new URL('../',import.meta.url),path='public/milestones/workspace-m4-2026-10-20.json';
const manifest=JSON.parse(await readFile(new URL(path,root),'utf8'));

test('M4 validates v11 and Memory Poster coverage without promoting missing inputs or visual review',()=>{
 assert.equal(validateWorkspaceMilestone(manifest).tag,'workspace-m4-2026-10-20');
 for(const patch of [{tag:'workspace-m3-2026-10-19'},{previous_milestone_tag:'bad'},{coverage:{...manifest.coverage,material_rows:260}},{coverage:{...manifest.coverage,memory_posters:0}},{verification:{...manifest.verification,mobile_device_visual_qa:'passed'}},{verification:{...manifest.verification,live_files_verified:0}}])assert.throws(()=>validateWorkspaceMilestone({...manifest,...patch}));
 assert.deepEqual(changedWorkspaceManifests(path+'\n'),[path]);assert.equal(manifest.coverage.source_content_extraction_claimed,false);assert.equal(manifest.coverage.held_works,6);assert.equal(manifest.coverage.summary_allowances,2);
});

test('M4 preserves the earlier release records and the saved CP260 boundary',async()=>{
 const earlier=['public/construction/estimates/pilates-astra-2026-10-15/milestone.json','public/milestones/workspace-m2-2026-10-18.json','public/milestones/WORKSPACE-M2-2026-10-18.md','public/milestones/workspace-m3-2026-10-19.json','public/milestones/WORKSPACE-M3-2026-10-19.md'];
 for(const file of earlier)assert.equal(createHash('sha256').update(await readFile(new URL(file,root))).digest('hex'),manifest.preservation_sha256[file]);
 const record=JSON.parse(await readFile(new URL(manifest.coverage.progress_record_path,root),'utf8')),lane=record.lanes.find(lane=>lane.id==='MSCH');
 assert.equal(manifest.coverage.progress_checkpoint,lane.checkpoint);assert.equal(manifest.coverage.progress_local_main,lane.sync.local+'/'+lane.sync.mainConsumed);assert.equal(record.execution.sourceBodiesReadOrExecuted,false);
});

test('M4 is linked alongside its learning wall and records a deployment-gated release',async()=>{
 const prefix='public/construction/estimates/pilates-astra-2026-10-15/',page=await readFile(new URL(prefix+'milestone.html',root),'utf8'),notes=await readFile(new URL(manifest.release_notes_path,root),'utf8');
 assert.match(page,/id="workspace-m4"/);assert.ok(page.includes('releases/tag/'+manifest.tag));assert.match(page,/memory-posters/);assert.match(notes,/11 posters/);assert.match(notes,/104 automated tests/);assert.match(notes,/107 automated tests/);assert.ok(notes.includes(manifest.base_commit));assert.match(notes,/visual QA remain unverified/);
 const versions=JSON.parse(await readFile(new URL(prefix+'versions.json',root),'utf8'));assert.equal(versions.latest_version,'v11');assert.equal(versions.versions.length,12);assert.deepEqual(versions.workspace_navigation.primary_sections,['Construction','Versions + milestone','Progress','Memory Posters']);
});

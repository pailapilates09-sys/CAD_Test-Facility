import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateWorkspaceMilestone,changedWorkspaceManifests,verifyWorkspaceFiles} from '../scripts/release-workspace-milestone.mjs';

const root=new URL('../',import.meta.url);
const path='public/milestones/workspace-m3-2026-10-19.json';
const manifest=JSON.parse(await readFile(new URL(path,root),'utf8'));
const estimatePath='public/construction/estimates/pilates-astra-2026-10-15/';

test('M3 preserves both earlier milestones, all work scopes and the saved source-stage boundary',async()=>{
 assert.equal(validateWorkspaceMilestone(manifest).manifestPath,path);
 for(const patch of [{id:'M4'},{tag:'workspace-m2-2026-10-18'},{release_notes_path:'other.md'},{previous_milestone_tag:'bad'},{verification:{...manifest.verification,mobile_device_visual_qa:'passed'}},{coverage:{...manifest.coverage,held_works:0}}])assert.throws(()=>validateWorkspaceMilestone({...manifest,...patch}));
 for(const prior of [estimatePath+'milestone.json','public/milestones/workspace-m2-2026-10-18.json','public/milestones/WORKSPACE-M2-2026-10-18.md'])assert.equal(createHash('sha256').update(await readFile(new URL(prior,root))).digest('hex'),manifest.preservation_sha256[prior]);
 const source=JSON.parse(await readFile(new URL('construction/estimates/pilates-astra-2026-10-15/data/estimate.json',root),'utf8'));
 assert.equal(source.summary.grand_total,'6645762.90');
 const saved=JSON.parse(await readFile(new URL(manifest.coverage.progress_record_path,root),'utf8'));
 const lane=saved.lanes.find(l=>l.id==='MSCH');assert.equal(manifest.coverage.progress_checkpoint,lane.checkpoint);assert.equal(manifest.coverage.progress_local_main,lane.sync.local+'/'+lane.sync.mainConsumed);
 assert.equal(saved.execution.sourceBodiesReadOrExecuted,false);
});

test('latest milestone navigation includes M3, retains M2/M1 and distinguishes device QA from automated evidence',async()=>{
 const versions=JSON.parse(await readFile(new URL(estimatePath+'versions.json',root),'utf8'));
 assert.equal(versions.workspace_milestone_tag,manifest.tag);assert.equal(versions.milestone_tag,'pilates-estimates-m1-2026-10-17');assert.equal(versions.latest_version,'v8');
 const page=await readFile(new URL(estimatePath+'milestone.html',root),'utf8');
 for(const id of ['workspace-m3','workspace-m2'])assert.ok(page.includes('id="'+id+'"'));
 for(const tag of [manifest.tag,manifest.previous_milestone_tag,versions.milestone_tag])assert.ok(page.includes('releases/tag/'+tag));
 const notes=await readFile(new URL(manifest.release_notes_path,root),'utf8');assert.ok(notes.includes(manifest.base_commit));assert.match(notes,/81 automated tests/);assert.match(notes,/phone visual QA remain unverified/);
 assert.match(notes,/Source-content extraction has not started/);
});

test('release selection ignores ordinary changes and separates new milestone publication from frozen history',async()=>{
 assert.deepEqual(changedWorkspaceManifests(''),[]);
 assert.deepEqual(changedWorkspaceManifests('public/theme/mobile.js\npublic/milestones/WORKSPACE-M3-2026-10-19.md\n'),[]);
 assert.deepEqual(changedWorkspaceManifests(path+'\n'),[path]);
 assert.throws(()=>changedWorkspaceManifests('public/milestones/workspace-m4-unknown.json\n'),/Unexpected workspace milestone/);
 assert.doesNotThrow(()=>verifyWorkspaceFiles({preservation_sha256:Object.fromEntries(Object.entries(manifest.preservation_sha256).filter(([p])=>p.startsWith('public/milestones/')))},new URL('../',import.meta.url).pathname));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {validateWorkspaceMilestone,verifyWorkspaceFiles} from '../scripts/release-workspace-milestone.mjs';
const root=new URL('../',import.meta.url),path='public/milestones/workspace-m2-2026-10-18.json';
const manifest=JSON.parse(await readFile(new URL(path,root),'utf8'));

test('workspace M2 is additive to estimate M1 and records the verified theme/Pip scope and remaining limits',async()=>{
 assert.equal(validateWorkspaceMilestone(manifest).tag,'workspace-m2-2026-10-18');
 for(const patch of [{tag:'pilates-estimates-m1-2026-10-17'},{title:'title\ninjection'},{release_notes_path:'other.md'},{base_commit:'bad'},{remaining_debt:[]},{verification:{...manifest.verification,browser_animation_qa:'passed'}},{coverage:{...manifest.coverage,generated_pages:65}}])assert.throws(()=>validateWorkspaceMilestone({...manifest,...patch}));
 const m1Path='public/construction/estimates/pilates-astra-2026-10-15/milestone.json';
 assert.equal(createHash('sha256').update(await readFile(new URL(m1Path,root))).digest('hex'),manifest.preservation_sha256[m1Path]);
 const versions=JSON.parse(await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/versions.json',root),'utf8'));
 assert.equal(versions.milestone_tag,manifest.previous_milestone_tag);
 const page=await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/milestone.html',root),'utf8');assert.match(page,/id="workspace-m2"/);assert.ok(page.includes('releases/tag/'+manifest.tag));assert.ok(page.includes('releases/tag/'+manifest.previous_milestone_tag));
 const notes=await readFile(new URL(manifest.release_notes_path,root),'utf8');assert.ok(notes.includes(manifest.base_commit));assert.match(notes,/69 automated tests/);assert.match(notes,/Browser animation\/layout QA remains unverified/);
});

test('release-time snapshot verification rejects altered files and paths outside the repository',async()=>{
 const dir=await mkdtemp(resolve(tmpdir(),'cad-milestone-'));const file='public/theme/studio.css';
 try{
  await mkdir(resolve(dir,'public/theme'),{recursive:true});await writeFile(resolve(dir,file),'original');
  const m={preservation_sha256:{[file]:createHash('sha256').update('original').digest('hex')}};
  assert.doesNotThrow(()=>verifyWorkspaceFiles(m,dir));await writeFile(resolve(dir,file),'changed');assert.throws(()=>verifyWorkspaceFiles(m,dir),/hash differs/);
  assert.throws(()=>verifyWorkspaceFiles({preservation_sha256:{'../outside':'a'.repeat(64)}},dir),/Unexpected preservation path/);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('M2 uses the existing deployment-gated release job, verifies the tag and cannot relocate an existing milestone',async()=>{
 const entry=await readFile(new URL('scripts/release-estimate-milestone.mjs',root),'utf8');assert.match(entry,/runRelease\(\);runWorkspaceRelease\(\)/);
 const workflow=await readFile(new URL('.github/workflows/pages.yml',root),'utf8');assert.match(workflow,/release-estimate-milestone:[\s\S]*needs: deploy/);
 const script=await readFile(new URL('scripts/release-workspace-milestone.mjs',root),'utf8');assert.match(script,/verifyWorkspaceFiles\(manifest\)/);assert.match(script,/refusing to move it/);assert.match(script,/--verify-tag/);assert.match(script,/release\.body\.trim\(\)!==notes\.trim\(\)/);assert.doesNotMatch(script,/--force|--clobber/);
});

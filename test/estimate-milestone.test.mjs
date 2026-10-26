import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateMilestone} from '../scripts/release-estimate-milestone.mjs';
import {renderVersionRegister} from '../scripts/linked-estimate-views.mjs';
import {decoratePage} from '../scripts/site-experience.mjs';
import {fileURLToPath} from 'node:url';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url),json=async p=>JSON.parse(await readFile(new URL(p,base)));
const versions=await json('versions.json'),manifest=await json('milestone.json');
test('milestone register covers every maintained version and preserves the exact source registers',async()=>{
 assert.deepEqual(versions.versions.map(x=>x.id),['original','v2','v3','v4','v5','v5.1','v6','v7','v8','v9','v10','v11','v12','v13','v14']);assert.deepEqual(manifest.versions,['original','v2','v3','v4','v5','v5.1','v6','v7']);assert.equal(manifest.latest_version,'v7');assert.equal(versions.latest_version,'v14');assert.equal(versions.latest_full_estimate_version,'v11');assert.equal(manifest.coverage.accepted_original_component_splits,0);
 const original=JSON.parse(await readFile(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url)));assert.deepEqual(manifest.original_summary,original.summary);assert.equal(manifest.source_pdf_sha256,original.source.sha256);
 for(const [p,hash] of Object.entries(manifest.preservation_sha256))assert.equal(createHash('sha256').update(await readFile(new URL(p,base))).digest('hex'),hash);
 for(const v of versions.versions){const file=new URL(v.path+'index.html',base),html=decoratePage(await readFile(file,'utf8'),fileURLToPath(file),fileURLToPath(new URL('../public/',import.meta.url)));const nav=html.match(/<nav aria-label="Workspace">(.*?)<\/nav>/s)[1];assert.deepEqual([...nav.matchAll(/<a [^>]*>(.*?)<\/a>/g)].map(x=>x[1]),['Construction','Pilates SketchUp','Layout Designer','14 · Basanti Poudel Baral','Paila Pilates Interior','Progress','Memory Posters']);assert.match(html,/Paila Pilates Interior/);assert.ok(html.includes('data-version-register')||(v.id==='v8'&&html.includes('<!-- V8_CONTENT -->')));const register=renderVersionRegister(versions);assert.ok(register.includes('>'+v.label+'</a>'));assert.equal(v.reference_images,v.id==='v6');assert.equal(v.component_evidence,v.id==='v7')}
});
test('current comparison views use linked templates and restrict graph presentation to the graph view',async()=>{
 for(const v of manifest.synchronized_comparison_versions){const html=await readFile(new URL(v+'/index.html',base),'utf8');assert.match(html,/<!-- LINKED_VIEW -->/);assert.match(html,/Shared source:/);assert.equal(html.includes('shared/graphs.js'),v==='v5.1');assert.doesNotMatch(html,/id="assume-npr"|id="board-assume-npr"|data-range-toggle/);}
 for(const v of ['original','v2','v3','v4']){const html=await readFile(new URL((v==='original'?'':v+'/')+'index.html',base),'utf8');assert.ok(!html.includes('id="range-board"'))}
});
test('milestone release is guarded, includes remaining debt and only runs after successful Pages deployment',async()=>{
 assert.equal(validateMilestone(manifest).tag,manifest.tag);
 for(const patch of [{tag:'bad tag'},{title:'bad\ntitle'},{latest_version:'v8'},{remaining_debt:[]},{release_notes_path:'unrelated.md'},{coverage:{...manifest.coverage,accepted_original_component_splits:51}}])assert.throws(()=>validateMilestone({...manifest,...patch}));
 const workflow=await readFile(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');assert.match(workflow,/release-estimate-milestone:[\s\S]*needs: deploy/);assert.match(workflow,/release-estimate-milestone:[\s\S]*contents: write/);assert.match(workflow,/GH_TOKEN: \$\{\{ github.token \}\}/);assert.match(workflow,/node scripts\/release-estimate-milestone.mjs/);
 const script=await readFile(new URL('../scripts/release-estimate-milestone.mjs',import.meta.url),'utf8');assert.match(script,/refusing to move it/);assert.match(script,/--verify-tag/);assert.match(script,/Release manifest asset missing/);assert.doesNotMatch(script,/--force|--clobber/);
});

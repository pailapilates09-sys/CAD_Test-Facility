import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateMilestone} from '../scripts/release-estimate-milestone.mjs';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url),json=async p=>JSON.parse(await readFile(new URL(p,base)));
const versions=await json('versions.json'),manifest=await json('milestone.json');
test('milestone register covers every maintained version and preserves the exact source registers',async()=>{
 assert.deepEqual(versions.versions.map(x=>x.id),['original','v2','v3','v4','v5','v5.1','v6','v7']);assert.deepEqual(manifest.versions,versions.versions.map(x=>x.id));assert.equal(manifest.latest_version,'v7');assert.equal(manifest.coverage.accepted_original_component_splits,0);
 const original=JSON.parse(await readFile(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url)));assert.deepEqual(manifest.original_summary,original.summary);assert.equal(manifest.source_pdf_sha256,original.source.sha256);
 for(const [p,hash] of Object.entries(manifest.preservation_sha256))assert.equal(createHash('sha256').update(await readFile(new URL(p,base))).digest('hex'),hash);
 for(const v of versions.versions){const html=await readFile(new URL(v.path+'index.html',base),'utf8');for(const target of versions.versions)assert.ok(html.includes('>'+target.label+'</a>'),`${v.id} missing ${target.id} navigation`);assert.match(html,/Versions \+ milestone/);assert.match(html,/data-version-register/);assert.equal(v.reference_images,['v6','v7'].includes(v.id));assert.equal(v.component_evidence,v.id==='v7')}
});
test('all comparison versions use the permanent shared visuals while retaining version-specific source, image and component features',async()=>{
 for(const v of manifest.synchronized_comparison_versions){const html=await readFile(new URL(v+'/index.html',base),'utf8'),js=await readFile(new URL(v+'/'+v+'.js',base),'utf8');for(const id of ['range-board','position-overview','cost-treemap'])assert.ok(html.includes('id="'+id+'"'));assert.doesNotMatch(html,/id="assume-npr"|id="board-assume-npr"|data-range-toggle/);assert.match(js,/createRangeBoard\(comparison,\{permanentOriginal:true\}\)/);assert.match(js,/initComparison\([^;]+permanentOriginal:true/);assert.ok(html.indexOf('id="table-graphs"')>html.indexOf('id="items"'))}
 for(const v of ['original','v2','v3','v4']){const html=await readFile(new URL((v==='original'?'':v+'/')+'index.html',base),'utf8');assert.ok(!html.includes('id="range-board"'))}
});
test('milestone release is guarded, includes remaining debt and only runs after successful Pages deployment',async()=>{
 assert.equal(validateMilestone(manifest).tag,manifest.tag);
 for(const patch of [{tag:'bad tag'},{title:'bad\ntitle'},{latest_version:'v8'},{remaining_debt:[]},{release_notes_path:'unrelated.md'},{coverage:{...manifest.coverage,accepted_original_component_splits:51}}])assert.throws(()=>validateMilestone({...manifest,...patch}));
 const workflow=await readFile(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');assert.match(workflow,/release-estimate-milestone:[\s\S]*needs: deploy/);assert.match(workflow,/release-estimate-milestone:[\s\S]*contents: write/);assert.match(workflow,/GH_TOKEN: \$\{\{ github.token \}\}/);assert.match(workflow,/node scripts\/release-estimate-milestone.mjs/);
 const script=await readFile(new URL('../scripts/release-estimate-milestone.mjs',import.meta.url),'utf8');assert.match(script,/refusing to move it/);assert.match(script,/--verify-tag/);assert.match(script,/Release manifest asset missing/);assert.doesNotMatch(script,/--force|--clobber/);
});

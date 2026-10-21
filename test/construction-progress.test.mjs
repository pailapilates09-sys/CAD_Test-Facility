import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildConstructionStatus,renderConstructionStatus} from '../scripts/render-construction-progress.mjs';
import {drawingInfo} from '../src/drawings.mjs';
const root=new URL('../',import.meta.url),base='public/construction/estimates/pilates-astra-2026-10-15/';
const json=async p=>JSON.parse(await readFile(new URL(p,root)));
const inputs={original:await json('construction/estimates/pilates-astra-2026-10-15/data/estimate.json'),comparison:await json(base+'v5/comparison.json'),components:await json(base+'v7/component-rates.json'),images:await json(base+'v6/image-register.json'),versions:await json(base+'versions.json'),model:await json('public/construction/models/pilates-sketchup/source-register.json'),debt:await json(base+'v7/debt-review.json'),drawingCount:drawingInfo.length};
test('construction status derives evidence counts without inventing approvals, model counts or project completion',()=>{
 const before=JSON.stringify(inputs),d=buildConstructionStatus(inputs);
 assert.equal(d.estimate.detailed_items,51);assert.equal(d.estimate.detailed_areas,6);assert.equal(d.estimate.held_items.length,6);assert.equal(d.estimate.summary_allowances.length,2);assert.equal(d.estimate.same_unit_reference_items,36);assert.equal(d.estimate.different_unit_only_items,9);assert.equal(d.estimate.currency,null);
 assert.equal(d.components.both_reference_items,40);assert.equal(d.components.both_same_unit_reference_items,14);assert.equal(d.components.accepted_original_splits,0);assert.equal(d.images.mapped_items,51);assert.equal(d.images.reference_assets,29);assert.equal(d.images.project_photographs,0);assert.equal(d.cad.drawing_sheets,5);
 assert.equal(d.model.geometry_status,'decoded_supported_entities');assert.equal(d.model.model_count,1);assert.equal(d.model.geometry_count,2458434);assert.equal(d.model.duplicate_status,'candidates_identified_review_required');assert.equal(d.validation.browser_layout_review,'unavailable_in_current_runtime');assert.equal(JSON.stringify(inputs),before);
 const updated=structuredClone(inputs);updated.comparison.items[0].references=[];updated.components.items[0].accepted_split=true;assert.equal(buildConstructionStatus(updated).components.accepted_original_splits,1);assert.equal(buildConstructionStatus(updated).estimate.same_unit_reference_items,35);
});
test('legacy construction evidence remains inspectable while Progress contains only the four-lane projection',async()=>{
 const d=buildConstructionStatus(inputs),html=renderConstructionStatus(d),template=await readFile(new URL('public/progress/index.html',root),'utf8');
 assert.equal((html.match(/<th scope="row">/g)||[]).length,8);assert.match(html,/id="construction-status"/);assert.match(html,/0 accepted original-quote splits/);assert.match(html,/0 project photographs/);assert.match(html,/geometry.*decoded supported entities/i);assert.doesNotMatch(html,/\d+(?:\.\d+)?%|model count: 0|geometry count: 0/);
 assert.ok(template.includes('<!-- CURRENT_PROGRESS -->'));assert.doesNotMatch(template,/CONSTRUCTION_PROGRESS|#construction-status|Construction &amp; extraction|Construction & extraction/);assert.ok(template.indexOf('<!-- CURRENT_PROGRESS -->')<template.indexOf('15 October source session'));
 for(const href of [...html.matchAll(/href="([^"]+)"/g)].map(x=>x[1])){const path=href.split('#')[0];if(path==='./construction-status.json')continue;const target=new URL(path.endsWith('/')?path+'index.html':path,new URL('public/progress/',root));assert.ok((await readFile(target)).length)}
 const malicious=structuredClone(d);malicious.model.next_input='<script>alert(1)</script>';assert.doesNotMatch(renderConstructionStatus(malicious),/<script>/);
});

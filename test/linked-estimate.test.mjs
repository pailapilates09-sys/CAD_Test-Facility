import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveViews,validateRegister} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {renderAllData,renderComparisons,renderGraphs,renderImages,renderComponents,renderSource,recordTables,esc} from '../scripts/linked-estimate-views.mjs';
import {calculateRow} from '../public/construction/estimates/pilates-astra-2026-10-15/v8/calculations.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const r=JSON.parse(await readFile(new URL('v9/register.json',base),'utf8')),d=deriveViews(r);

test('one normalized v9 register retains every work, six holds, allowances and material quantity results',()=>{
 const before=JSON.stringify(r);assert.equal(validateRegister(r),r);
 assert.equal(d.original.line_items.length,51);assert.equal(d.materials.items.length,51);assert.equal(d.materials.coverage.material_rows,261);assert.equal(d.materials.coverage.quantity_rows,147);assert.equal(d.materials.coverage.priced_rows,63);assert.equal(d.comparison.coverage.held_items,6);assert.equal(d.original.summary.grand_total,'6645762.90');
 assert.deepEqual(d.components.allowances.map(a=>a.original_amount),['550000.00','280057.43']);
 for(const w of d.materials.items)if(w.held)for(const row of w.rows){assert.equal(row.quantity,null);assert.equal(row.rate_low,null);assert.equal(calculateRow(row).amount_low,null);}
 assert.equal(JSON.stringify(r),before);
});

test('changing a source work updates SI, comparisons, graph labels, images, material quantities and v10 together',()=>{
 const changed=structuredClone(r),w=changed.works[0];w.title='Updated shared cupboard';w.quantity='44.86';w.rate='2500.00';
 const next=deriveViews(changed),id=w.id,work=next.materials.items.find(x=>x.id===id);
 assert.equal(next.comparison.items.find(x=>x.id===id).title,w.title);assert.equal(next.images.items.find(x=>x.item_id===id).title,w.title);
 assert.equal(next.si.line_items.find(x=>x.id===id).quantity,'4.1676303744');assert.ok(work.rows.find(x=>x.material_id==='ply18').quantity>d.materials.items[0].rows.find(x=>x.material_id==='ply18').quantity);
 for(const html of [renderComparisons(next),renderGraphs(next),renderImages(next),renderComponents(next),renderAllData(changed,next)])assert.ok(html.includes(w.title));
 assert.equal(work.original.amount,r.works[0].amount,'printed source amount stays explicit rather than silently recomputed');
});

test('market aliases derive their prices and source metadata instead of maintaining carried-over copies',()=>{
 for(const x of r.components.observations.filter(x=>x.market_observation_id)){assert.equal(x.low,undefined);assert.equal(x.high,undefined);assert.equal(x.normalized,undefined);}
 const changed=structuredClone(r),o=changed.market.observations.find(x=>x.id==='R26');o.low='400';o.high='500';
 const next=deriveViews(changed),carried=next.components.observations.find(x=>x.id==='V4-R26');
 assert.equal(carried.low,'400');assert.equal(carried.normalized.low,(400/.09290304).toFixed(2));
 const market=next.research.observations.find(x=>x.id==='R26');assert.deepEqual(carried.normalized,market.normalized_si);
 assert.ok(next.comparison.items.some(x=>x.references.some(y=>y.id==='R26'&&y.low===carried.normalized.low)));
});

test('one material price and one planning default feed every matching quantity/amount table',()=>{
 const changed=structuredClone(r),material=changed.materials.materials.find(x=>x.id==='ply18');material.rate_low=3000;material.rate_high=3000;
 changed.model_parameters.find(x=>x.work_id==='reception-001'&&x.key==='depth_m').value=.9;
 const next=deriveViews(changed),row=next.materials.items[0].rows.find(x=>x.material_id==='ply18');assert.ok(row.quantity>d.materials.items[0].rows.find(x=>x.material_id==='ply18').quantity);
 for(const w of next.materials.items.filter(x=>!x.held))for(const x of w.rows.filter(x=>x.material_id==='ply18')){assert.equal(x.rate_low,3000);assert.equal(calculateRow(x).amount_low,x.quantity*3000);}
 const html=renderAllData(changed,next);assert.ok(html.includes(String(row.quantity*3000)));assert.ok(html.includes('0.9'));
});

test('v10 shows every source scalar without disclosure controls and never exceeds five columns',()=>{
 const html=renderAllData(r,d);assert.doesNotMatch(html,/<details|<dialog|<svg|<img|hidden[=> ]/);
 function visit(x){if(x===null||typeof x==='boolean')return;if(Array.isArray(x))return x.forEach(visit);if(typeof x==='object')return Object.values(x).forEach(visit);if(String(x))assert.ok(html.includes(esc(x)),'Missing visible source field: '+String(x).slice(0,100));}
 visit(r);
 for(const head of html.matchAll(/<thead>(.*?)<\/thead>/gs))assert.ok((head[1].match(/<th /g)||[]).length<=5);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
 for(const w of r.works)assert.ok(html.includes('id="work-'+w.id+'"'));
 assert.match(html,/value-missing/);assert.match(html,/value-money/);assert.match(html,/value-number/);
 const attack=recordTables('X',[{id:'<img onerror=bad>',description:'<script>bad</script>'}]);assert.doesNotMatch(attack,/<script>|<img onerror/);
});

test('focused views carry their own feature and link to related views without repeating whole sections',()=>{
 const compare=renderComparisons(d),graphs=renderGraphs(d),images=renderImages(d),components=renderComponents(d);
 assert.doesNotMatch(compare,/<svg|<img|id="component-title"/);assert.equal((graphs.match(/data-range-item=/g)||[]).length,51);assert.match(graphs,/data-estimate-marker=/);
 assert.equal((images.match(/<img /g)||[]).length,51);assert.doesNotMatch(images,/<svg|class="linked-table"/);
 assert.equal((components.match(/data-component-item=/g)||[]).length,51);assert.doesNotMatch(components,/<svg|<img/);
 assert.match(renderSource(r,d),/register.json/);
});

test('broken IDs and source aliases fail before a website can be published',()=>{
 for(const change of [x=>x.works.push(x.works[0]),x=>x.works[0].section_id='missing',x=>x.market.work_links[0].reference_ids.push('missing'),x=>x.components.observations[0].source_id='missing',x=>x.images.work_links[0].image_id='missing',x=>x.work_materials[0].material_id='missing']){const bad=structuredClone(r);change(bad);assert.throws(()=>deriveViews(bad));}
});

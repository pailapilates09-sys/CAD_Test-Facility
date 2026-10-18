import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildV8,renderIndex,renderWork} from '../scripts/material-v8.mjs';
import {calculateRow,subtotal,quantityFor,sheetsFromCutArea,M2_PER_FT2} from '../public/construction/estimates/pilates-astra-2026-10-15/v8/calculations.js';
import {deriveQuantities} from '../public/construction/estimates/pilates-astra-2026-10-15/v8/quantity-models.js';
const root=new URL('../',import.meta.url),base='public/construction/estimates/pilates-astra-2026-10-15/';
const json=async p=>JSON.parse(await readFile(new URL(p,root)));
const inputs={original:await json('construction/estimates/pilates-astra-2026-10-15/data/estimate.json'),components:await json(base+'v7/component-rates.json'),images:await json(base+'v6/image-register.json'),catalog:await json(base+'v8/material-catalog.json')};
const data=buildV8(inputs);
test('v8 retains every source value, six locked holds and both allowances without changing the inputs',()=>{
 const before=JSON.stringify(inputs);assert.equal(data.items.length,51);assert.equal(data.coverage.areas,6);assert.equal(data.coverage.held_items,6);assert.equal(data.coverage.complete_takeoffs,0);assert.equal(data.estimate_currency,null);assert.deepEqual(data.original_summary,inputs.original.summary);assert.deepEqual(data.allowances,inputs.components.allowances);
 for(const [i,item] of data.items.entries()){
  const source=inputs.original.line_items[i];assert.equal(item.original.quantity,source.quantity);assert.equal(item.original.rate,source.rate);assert.equal(item.original.amount,source.amount);assert.equal(item.original.unit,source.unit_raw);assert.ok(item.rows.length>=2);assert.equal(item.complete_material_takeoff,false);
  if(item.held){for(const row of item.rows){assert.equal(row.quantity,null);assert.equal(row.rate_low,null);assert.equal(row.rate_high,null);assert.equal(row.source_id,null);assert.equal(calculateRow(row,{quantity:10,rate_low:20,rate_high:20}).amount_low,null);}}
 }
 buildV8(inputs);assert.equal(JSON.stringify(inputs),before);
});
test('v8 quantity and price units derive correctly, retaining zero and unknown dimensions',()=>{
 const item=id=>data.items.find(x=>x.id===id),row=(id,mat)=>item(id).rows.find(x=>x.material_id===mat);
 assert.equal(row('reception-008','strip').quantity,22.553);assert.equal(row('reception-006','glass').quantity,0);assert.equal(row('reception-006','glass').rate_low,3767.37);
 assert.equal(row('reception-011','putty').quantity,1);assert.equal(row('reception-011','paint').quantity,6);assert.equal(calculateRow(row('reception-011','paint')).amount_low,2838);
 assert.equal(row('reception-001','ply18').quantity,3);assert.equal(row('studio-003','sheer').quantity,69);assert.equal(row('studio-008','cementboard').quantity,39.856);assert.equal(row('reception-014','gypsum').quantity,null);assert.ok(row('reception-015','sofa').quantity>0);assert.equal(row('reception-001','hardware').quantity,null);
 assert.equal(row('locker-space-005','putty').quantity,3);assert.ok(!item('locker-space-005').rows.some(x=>x.material_id==='paint'));assert.equal(row('coffee-lounge-008','ac1').quantity,1);assert.equal(row('studio-007','ac15').quantity,3);
 assert.ok(row('studio-008','aluminium'));assert.equal(sheetsFromCutArea(32*M2_PER_FT2,0),1);assert.equal(sheetsFromCutArea(32*M2_PER_FT2,10),2);assert.equal(sheetsFromCutArea('',10),null);
 assert.equal(quantityFor('count',{quantity:'2',no:'1',unit_code:null}),null);
});
test('v8 subtotals exclude unknown rows and reject reversed ranges, partial packs and unknown currency',()=>{
 const priced={id:'a',quantity:2,rate_low:100.25,rate_high:200,currency:'NPR',whole_units:true},unknown={id:'b',quantity:null,rate_low:5,rate_high:5,currency:'NPR'};
 assert.deepEqual(subtotal([priced,unknown]),{priced_rows:1,missing_rows:1,low:200.5,high:400});assert.equal(subtotal([unknown]).low,null);
 for(const patch of [{quantity:''},{quantity:-2},{quantity:'abc'},{quantity:1.5},{rate_low:300,rate_high:200},{rate_low:''}])assert.equal(calculateRow(priced,patch).amount_low,null);
 assert.equal(calculateRow({...priced,currency:null}).amount_low,null);assert.equal(calculateRow(priced,{quantity:0}).amount_low,0);assert.equal(calculateRow(priced,{quantity:3,rate_low:20,rate_high:20}).amount_low,60);
});
test('v8 every priced row cites material evidence and every default quantity states its derivation',()=>{
 const ids=new Set();for(const item of data.items)for(const row of item.rows){assert.ok(!ids.has(row.id));ids.add(row.id);assert.ok(row.quantity_basis);if(row.rate_low!==null){assert.ok(data.sources.some(s=>s.id===row.source_id));assert.ok(row.rate_high>=row.rate_low);}if(row.quantity_rule==='manual')assert.equal(row.quantity,null);}
 const primer=data.items.flatMap(x=>x.rows).find(x=>x.material_id==='primer');assert.equal(primer.rate_low,null);assert.match(primer.note,/unstated currency/);assert.equal(data.sources.find(x=>x.id==='S20').checked,'2026-10-16');assert.equal(data.sources.find(x=>x.id==='S19').checked,'2026-10-17');
 assert.equal(data.coverage.items_with_priced_rows,data.items.filter(i=>i.rows.some(r=>calculateRow(r).amount_low!==null)).length);assert.equal(data.coverage.items_with_priced_rows,33);assert.equal(data.coverage.material_rows,261);assert.equal(data.coverage.quantity_rows,147);assert.equal(data.coverage.modelled_quantity_rows,109);
});
test('v8 index links every static detail page and details show accessible tables, source provenance and a partial subtotal',()=>{
 const html=renderIndex(data);for(const item of data.items){assert.ok(html.includes('href="'+item.id+'.html"'));const page=renderWork(item,data);assert.ok(page.includes('data-work-id="'+item.id+'"'));assert.match(page,/<caption/);assert.match(page,/Priced material subtotal · partial/);assert.match(page,/Image source and scope/);assert.ok(page.includes(item.image.path));assert.ok(!page.includes('undefined'));assert.ok(!page.includes('NaN'));for(const row of item.rows)assert.ok(page.includes('data-material-id="'+row.id+'"'));if(item.held){assert.ok(!page.includes('id="download-draft"'));assert.match(page,/On hold · original values retained/);}else assert.match(page,/id="download-draft"/);}
 const attack=structuredClone(data.items[0]);attack.title='<script>alert(1)</script>';attack.rows[0].note='<img onerror=bad>';assert.doesNotMatch(renderWork(attack,data),/<script>|<img onerror/);
});
test('quantity models use geometry, retain source quantities and reject undefined dimensions instead of inventing them',()=>{
 const item=id=>data.items.find(x=>x.id===id),model=item('reception-001').quantity_model,before=JSON.stringify(model),result=deriveQuantities(model);
 const A=22.43*M2_PER_FT2,H=.9,D=.45,W=A/H,n=Math.ceil(W/.6),cut=2*H*D+3*W*D+(n-1)*H*D+A;
 assert.equal(result.quantities.ply18.quantity,Math.ceil(cut*1.1/(32*M2_PER_FT2)));assert.equal(result.quantities.hinge.quantity,n*2);assert.equal(result.quantities.ply12.quantity,1);
 const deeper=deriveQuantities(model,{depth_m:.9});assert.ok(deeper.quantities.ply18.quantity>result.quantities.ply18.quantity);assert.ok(deeper.quantities.glue.quantity>=result.quantities.glue.quantity);assert.equal(JSON.stringify(model),before);
 assert.equal(deriveQuantities(model,{height_m:0}).valid,false);assert.equal(deriveQuantities(model,{shelves:1.5}).valid,false);assert.equal(deriveQuantities(model,{depth_m:''}).valid,false);
 const curtain=deriveQuantities(item('studio-003').quantity_model);assert.equal(curtain.quantities.sheer.quantity,69);assert.equal(deriveQuantities(item('studio-003').quantity_model,{fullness:1}).quantities.sheer.quantity,36);
 const partition=item('studio-008').quantity_model;assert.equal(deriveQuantities(partition,{faces:1}).quantities.cementboard.quantity*2,deriveQuantities(partition).quantities.cementboard.quantity);
 const points=item('reception-014').quantity_model;assert.equal(deriveQuantities(points).valid,false);assert.equal(deriveQuantities(points,{area_m2:10}).quantities.gypsum.quantity,11);
 assert.equal(deriveQuantities(item('reception-008').quantity_model,{driver_load_percent:101}).valid,false);
 for(const i of data.items){if(i.held){assert.equal(i.quantity_model,null);continue;}for(const row of i.rows){assert.ok(row.quantity===null||Number.isFinite(row.quantity));if(row.quantity_rule==='planning_model'){assert.equal(row.quantity_classification,'planning_model');assert.ok(i.quantity_model);assert.match(renderWork(i,data),/Dimensions, routes and usage factors are planning assumptions/);}}}
});
test('formatting bounds every column, wraps header notes and keeps captions accessible without showing the long title',async()=>{
 const template=await readFile(new URL(base+'v8/index.html',root),'utf8'),css=await readFile(new URL(base+'v8/layout.css',root),'utf8'),js=await readFile(new URL(base+'v8/v8.js',root),'utf8');
 assert.match(template,/class="v8-page"/);assert.match(template,/layout.css\?revision=quantity-2/);assert.match(css,/table-layout:fixed/);assert.match(css,/white-space:normal;overflow-wrap:anywhere/);assert.match(css,/\.v8-page \.sr-only\{position:absolute!important;width:1px!important;height:1px!important/);assert.match(css,/@media\(max-width:400px\)/);
 for(const i of data.items){const html=renderWork(i,data);assert.match(html,/<colgroup>/);assert.equal((html.match(/<col class="material-/g)||[]).length,6);if(i.quantity_model){assert.match(html,/id="quantity-model-form"/);assert.match(html,/Recalculate material quantities/);}}
 assert.match(js,/model_overrides:modelOverrides/);assert.match(js,/rate edits retained/);assert.match(js,/data-quantity-basis/);
 for(const row of data.items.flatMap(i=>i.rows)){if(row.quantity!==null)assert.equal(Number(row.quantity.toFixed(3)),row.quantity);if(row.rate_low!==null)assert.equal(Number(row.rate_low.toFixed(2)),row.rate_low);}
});

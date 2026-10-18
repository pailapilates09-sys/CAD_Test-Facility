import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildV8,renderIndex,renderWork} from '../scripts/material-v8.mjs';
import {calculateRow,subtotal,quantityFor,sheetsFromCutArea,M2_PER_FT2} from '../public/construction/estimates/pilates-astra-2026-10-15/v8/calculations.js';
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
 assert.equal(row('reception-008','strip').quantity,73.99*.3048);assert.equal(row('reception-006','glass').quantity,0);assert.equal(row('reception-006','glass').rate_low,350/M2_PER_FT2);
 assert.equal(row('reception-011','putty').quantity,1);assert.equal(row('reception-011','paint').quantity,6);assert.equal(calculateRow(row('reception-011','paint')).amount_low,2838);
 assert.equal(row('reception-001','ply18').quantity,null);assert.equal(row('studio-003','sheer').quantity,null);assert.equal(row('studio-008','cementboard').quantity,null);assert.equal(row('reception-014','gypsum').quantity,null);assert.equal(row('reception-015','sofa').quantity,null);
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
 assert.equal(data.coverage.items_with_priced_rows,data.items.filter(i=>i.rows.some(r=>calculateRow(r).amount_low!==null)).length);assert.equal(data.coverage.items_with_priced_rows,20);assert.equal(data.coverage.material_rows,257);
});
test('v8 index links every static detail page and details show accessible tables, source provenance and a partial subtotal',()=>{
 const html=renderIndex(data);for(const item of data.items){assert.ok(html.includes('href="'+item.id+'.html"'));const page=renderWork(item,data);assert.ok(page.includes('data-work-id="'+item.id+'"'));assert.match(page,/<caption/);assert.match(page,/Priced material subtotal · partial/);assert.match(page,/Image source and scope/);assert.ok(page.includes(item.image.path));assert.ok(!page.includes('undefined'));assert.ok(!page.includes('NaN'));for(const row of item.rows)assert.ok(page.includes('data-material-id="'+row.id+'"'));if(item.held){assert.ok(!page.includes('id="download-draft"'));assert.match(page,/On hold · original values retained/);}else assert.match(page,/id="download-draft"/);}
 const attack=structuredClone(data.items[0]);attack.title='<script>alert(1)</script>';attack.rows[0].note='<img onerror=bad>';assert.doesNotMatch(renderWork(attack,data),/<script>|<img onerror/);
});

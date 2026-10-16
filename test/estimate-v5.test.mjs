import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildComparison,chartRows} from '../public/construction/estimates/pilates-astra-2026-10-15/v5/comparison-model.js';
import {svgChart} from '../public/construction/estimates/pilates-astra-2026-10-15/v5/comparison-ui.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const original=JSON.parse(await readFile(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url)));
const si=JSON.parse(await readFile(new URL('v3/estimate-si.json',base))),r=JSON.parse(await readFile(new URL('v4/market-rates.json',base))),d=JSON.parse(await readFile(new URL('v5/comparison.json',base)));
test('v5 retains every original value and explicitly holds exactly the six requested items',()=>{
 assert.deepEqual(d,buildComparison(original,si,r));assert.deepEqual(d.summary,original.summary);
 const held=d.items.filter(x=>x.status==='on_hold_original_retained');
 assert.deepEqual(held.map(x=>x.id),['reception-005','reception-016','coffee-lounge-004','coffee-lounge-010','locker-space-010','washroom-002']);
 assert.equal(d.coverage.held_original_amount_minor,88165350);
 for(const x of d.items){const o=original.line_items.find(o=>o.id===x.id);assert.equal(x.working_amount,o.amount);assert.equal(x.working_amount_minor,o.amount_minor);assert.equal(x.original.rate,o.rate);assert.equal(x.replacement_rate,null);if(x.status==='on_hold_original_retained')assert.equal(x.references.length,0)}
 assert.equal(d.coverage.reference_items,45);assert.equal(d.coverage.unit_compatible_items,36);
});
test('v5 never places unknown currency or mismatched measurement units on a common axis implicitly',()=>{
 for(const item of d.items){
  for(const row of chartRows(item)){assert.equal(row.estimate_rate,null);assert.equal(row.estimate_currency_assumed,false)}
  for(const row of chartRows(item,true)){assert.equal(row.estimate_rate,row.unit_matches_estimate?item.si.rate:null);assert.equal(row.scope_verified,false)}
 }
 const curtain=d.items.find(x=>x.id==='studio-003');assert.equal(chartRows(curtain,true)[0].estimate_rate,null);
 assert.match(svgChart(curtain,chartRows(curtain,true),true),/linear metre of fabric/);
 const gypsum=d.items.find(x=>x.id==='reception-012');assert.match(svgChart(gypsum,chartRows(gypsum),false),/not on the NPR axis/);assert.match(svgChart(gypsum,chartRows(gypsum,true),true),/unconfirmed NPR assumption/);
});
test('v5 preserves starting prices, open bounds and absence of public prices without inventing an interval',()=>{
 const glass=d.items.find(x=>x.id==='reception-006');assert.equal(glass.references[0].high,null);assert.match(svgChart(glass,chartRows(glass),false),/From/);
 const curved=d.items.find(x=>x.id==='locker-space-007');assert.equal(curved.references[0].qualifier,'open_upper_bound');assert.match(svgChart(curved,chartRows(curved),false),/4,305.56\+/);
 const held=d.items.find(x=>x.id==='reception-005');assert.match(svgChart(held,[],false),/On hold/);assert.doesNotMatch(svgChart(held,[],false),/<svg/);
});

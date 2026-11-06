import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyseSelectedWorks,renderSelectedWorks} from '../scripts/buildera-selected-works.mjs';
import {BUILDERA_SELECTED_PATH,BUILDERA_MARKET_PATH,classifyPage,pageKind} from '../public/organization/site-model.js';
import {formatMills,selectedWorksCsv} from '../public/construction/estimates/pilates-buildera-2-selected-works/selected-works-model.js';

const source=JSON.parse(await readFile(new URL('../public/'+BUILDERA_SELECTED_PATH+'selection.json',import.meta.url),'utf8'));
const model=analyseSelectedWorks(source);

test('selected works reconcile to the supplied extract without rounding the original lines',()=>{
 assert.equal(model.items.length,12);
 assert.deepEqual(model.areas.map(a=>[a.count,a.mills]),[[1,517461000],[4,165679445],[2,493578750],[3,97312500],[2,139620000]]);
 assert.equal(model.total,1413651695);
 assert.equal(formatMills(model.total),'14,13,651.70');
 assert.equal(formatMills(model.total,true),'14,13,651.695');
 assert.equal(model.items.find(i=>i.id===4).amount,'20718.945');
 assert.equal(model.items.find(i=>i.id===2).rate,'2150.00');
 const invalid=structuredClone(source);
 invalid.items[0].amount='517460.99';
 assert.throws(()=>analyseSelectedWorks(invalid),/does not match quantity/);
});

test('the page renders every work and its exact values and evidence without relying on JavaScript',()=>{
 const html=renderSelectedWorks(model,'test');
 const rows=[...html.matchAll(/<tr role="row" id="selected-work-(\d+)"/g)].map(m=>Number(m[1]));
 assert.deepEqual(rows,source.items.map(i=>i.id));
 assert.equal((html.match(/data-swx-description/g)??[]).length,12);
 assert.match(html,/14,13,651\.70/);
 assert.match(html,/14,13,651\.695/);
 assert.match(html,/20,718\.945/);
 assert.match(html,/Pilates Estimate Final_Buildera_2\.pdf/);
 assert.match(html,/62\.253 <span class="swx-unit">sq ft/);
 assert.doesNotMatch(html,/<iframe/i);
});

test('CSV preserves source precision and exports only the selected rows passed to it',()=>{
 const csv=selectedWorksCsv(model.items.filter(i=>i.area==='Reception Area'));
 assert.equal(csv.trim().split('\r\n').length,5);
 assert.match(csv,/"318\.753","65\.00","20718\.945","3"/);
 assert.doesNotMatch(csv,/517461/);
});

test('the new cost extract and the original BuildEra rate comparison remain distinct pages',()=>{
 assert.equal(pageKind(BUILDERA_SELECTED_PATH+'index.html'),'cost-extract');
 assert.equal(pageKind(BUILDERA_MARKET_PATH+'index.html'),'rate-comparison');
 assert.equal(classifyPage(BUILDERA_SELECTED_PATH+'index.html').project,'paila');
});

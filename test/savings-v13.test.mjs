import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {deriveSavings,renderSavings} from '../scripts/savings-v13.mjs';
import {parseMinor,formatMinor,compareBudget,scenarioKey,readScenario} from '../public/construction/estimates/pilates-astra-2026-10-15/v13/savings-model.js';
import {updateComparison,startSavings} from '../public/construction/estimates/pilates-astra-2026-10-15/v13/v13.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const register=JSON.parse(await readFile(new URL('v9/register.json',base),'utf8')),rules=JSON.parse(await readFile(new URL('v12/procurement.json',base),'utf8'));
const data=deriveSavings(register,rules,deriveViews(register));
const browserData=()=>({...structuredClone(data),derivation:{source_revision:'test-source',responsibility_revision:'test-rules',view_revision:'V13_REVISION'}});

test('v13 joins every v12 work exactly once and reconciles the original quote without treating owner spending as savings',()=>{
 const [owner,professional]=data.groups;
 assert.equal(owner.work_count,14);assert.equal(professional.work_count,37);
 assert.equal(owner.original_minor,'151285040');assert.equal(professional.original_minor,'353829828');
 assert.equal(owner.held_minor,'10385350');assert.equal(owner.active_minor,'140899690');assert.equal(owner.active_count,10);
 assert.equal(professional.held_minor,'77780000');assert.equal(professional.active_count,34);assert.equal(professional.zero_count,1);
 assert.equal(new Set(data.groups.flatMap(group=>group.rows.map(row=>row.id))).size,51);
 assert.equal(data.works_minor,'505114868');assert.equal(data.allowances_minor,'83005743');assert.equal(data.pre_vat_minor,'588120611');
 assert.equal(data.quoted_vat_minor,'76455679');assert.equal(data.quoted_grand_total_minor,'664576290');
 assert.equal(data.quote_currency,null);assert.equal(data.comparison_currency_assumption,'NPR');
 assert.equal(compareBudget(data).saving_minor,null);assert.equal(compareBudget(data).pre_vat_proposed_minor,null);
 assert.equal(compareBudget(data).professional_proposed_minor,professional.original_minor);
});

test('complete alternative costs give exact savings, break-even or overruns while held/professional/allowance budgets remain included',()=>{
 const comparison=compareBudget(data,'12,00,000.00');
 assert.equal(comparison.owner_proposed_minor,'130385350');assert.equal(comparison.works_proposed_minor,'484215178');
 assert.equal(comparison.saving_minor,'20899690');assert.equal(comparison.pre_vat_proposed_minor,'567220921');
 assert.equal(compareBudget(data,'14,08,996.90').saving_minor,'0');
 assert.equal(compareBudget(data,'1500000').saving_minor,'-9100310');
 assert.equal(compareBudget(data,'0').saving_minor,'140899690');
 assert.equal(compareBudget(data,'-1').saving_minor,null);assert.equal(compareBudget(data,'1.001').invalid,true);
 assert.equal(compareBudget(data,'999999999999999999.99').owner_proposed_minor,'100000000000010385349');
});

test('money parsing accepts properly grouped Indian/international values, preserves cents and keeps unknown separate from explicit zero',()=>{
 for(const value of ['1200000.5','12,00,000.50','1,200,000.50'])assert.equal(parseMinor(value).minor,120000050n);
 for(const value of ['','  ',null,undefined])assert.deepEqual(parseMinor(value),{minor:null,invalid:false});
 for(const value of ['-1','NaN','1e6','1,23,45','12.001','+4','Infinity','1 000','0x20'])assert.equal(parseMinor(value).invalid,true,value);
 assert.equal(parseMinor('0').minor,0n);assert.equal(parseMinor('0.01').minor,1n);
 assert.equal(formatMinor('151285040'),'15,12,850.40');assert.equal(formatMinor('-1'),'−0.01');assert.equal(formatMinor(null),'Not established');
});

test('source price edits and responsibility changes propagate into v13 without copied assignments or partial-material savings',()=>{
 const next=structuredClone(register),work=next.works.find(work=>work.id==='reception-004');
 work.title='Revised shared rack';work.rate='2700.00';work.amount='38691.00';work.amount_minor=3869100;
 next.project.summary.subtotal='5881922.61';
 const derived=deriveSavings(next,rules,deriveViews(next));assert.equal(derived.groups[0].original_minor,'151356690');
 assert.equal(derived.groups[0].rows.find(row=>row.id===work.id).rate,'2700.00');assert.match(renderSavings(derived,rules),/Revised shared rack/);
 const reassigned=structuredClone(rules);reassigned.work_decisions.find(decision=>decision.work_id===work.id).profile_id='joinery';
 const moved=deriveSavings(register,reassigned,deriveViews(register));assert.equal(moved.groups[0].work_count,13);assert.equal(moved.groups[1].work_count,38);
 assert.equal(moved.works_minor,data.works_minor);assert.match(renderSavings(moved,reassigned),/13 owner-managed works/);
 assert.equal(compareBudget(derived).saving_minor,null);assert.equal(compareBudget(moved).saving_minor,null);
 const inconsistent=structuredClone(next);inconsistent.works[0].amount_minor+=1;assert.throws(()=>deriveSavings(inconsistent,rules,deriveViews(inconsistent)),/Source amount and minor units differ/);
 const unreconciled=structuredClone(register);unreconciled.project.summary.subtotal='1';assert.throws(()=>deriveSavings(unreconciled,rules,deriveViews(unreconciled)),/do not reconcile/);
});

test('v13 renders two original item tables plus one comparison with four columns, all holds and no material-copy or fake savings',()=>{
 const html=renderSavings(data,rules);
 assert.equal((html.match(/<table\b/g)??[]).length,3);assert.equal((html.match(/data-savings-work=/g)??[]).length,51);
 assert.equal((html.match(/ON HOLD · original budget retained/g)??[]).length,6);
 for(const head of html.matchAll(/<thead>(.*?)<\/thead>/gs))assert.equal((head[1].match(/<th /g)??[]).length,4);
 assert.match(html,/Original currency is unspecified/);assert.match(html,/Savings are not established yet/);assert.match(html,/14,08,996.90/);
 assert.doesNotMatch(html,/data-inline-material=|data-order-row=|<svg|<iframe|<dialog|<details/);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);assert.equal(ids.length,new Set(ids).size);
 const attack=structuredClone(data);attack.groups[0].rows[0].title='<script>attack()</script>';assert.doesNotMatch(renderSavings(attack,rules),/<script>attack/);
});

test('scenario drafts are isolated by both source revisions and survive storage failures without inventing costs',()=>{
 const fixture=browserData(),storage=new Map(),adapter={getItem:key=>storage.get(key)};
 assert.equal(readScenario(adapter,fixture),'');
 storage.set(scenarioKey(fixture),JSON.stringify({...fixture.derivation,owner_active_cost:'12,00,000.00'}));assert.equal(readScenario(adapter,fixture),'12,00,000.00');
 const changed=structuredClone(fixture);changed.derivation.responsibility_revision='changed';assert.equal(readScenario(adapter,changed),'');
 assert.equal(readScenario({getItem(){throw Error('blocked')}},fixture),'');
 storage.set(scenarioKey(fixture),JSON.stringify({...fixture.derivation,owner_active_cost:1200000}));assert.equal(readScenario(adapter,fixture),'');
});

function fakeDocument(){
 const elements=new Map(),cell=key=>({dataset:{proposed:key,saving:key},classList:{toggle(){}},textContent:''});
 for(const id of ['owner-active-cost','owner-cost-error','savings-result','savings-draft-status','savings-clear','savings-print','savings-form'])elements.set(id,{value:'',disabled:true,hidden:false,events:{},attrs:{},setAttribute(key,value){this.attrs[key]=value;},addEventListener(key,handler){this.events[key]=handler;},focus(){}});
 const proposed=['owner','professional','works','project'].map(cell),saving=['owner','professional','works','project'].map(cell);
 return {elements,proposed,saving,getElementById:id=>elements.get(id),querySelector:()=>({content:'test-source'}),querySelectorAll:selector=>selector==='[data-proposed]'?proposed:saving};
}
test('comparison updates distinguish unknown, invalid, saving and overrun in the visible tables and accessible status',()=>{
 const doc=fakeDocument(),input=doc.elements.get('owner-active-cost');
 updateComparison(doc,data);assert.equal(doc.proposed[0].textContent,'Not established');assert.equal(doc.saving[1].textContent,'0.00');
 input.value='1200000';updateComparison(doc,data);assert.equal(doc.saving[0].textContent,'2,08,996.90');assert.match(doc.elements.get('savings-result').textContent,/Scenario saving before VAT/);
 input.value='1500000';updateComparison(doc,data);assert.match(doc.elements.get('savings-result').textContent,/Scenario overrun before VAT: NPR 91,003.10/);
 input.value='14,08,996.90';updateComparison(doc,data);assert.match(doc.elements.get('savings-result').textContent,/breaks even/);
 input.value='invalid';updateComparison(doc,data);assert.equal(input.attrs['aria-invalid'],'true');assert.equal(doc.elements.get('owner-cost-error').hidden,false);assert.equal(doc.saving[0].textContent,'Not established');
});

test('runtime rejects stale data, restores and saves a browser-only quote and clears it back to unknown',async()=>{
 const doc=fakeDocument(),fixture=browserData(),values=new Map(),listeners={},win={localStorage:{getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)},addEventListener:(key,handler)=>listeners[key]=handler,print(){}};
 const stale=structuredClone(fixture);stale.derivation.source_revision='old';
 assert.equal(await startSavings(doc,async()=>({ok:true,json:async()=>stale}),win),null);assert.equal(doc.elements.get('owner-active-cost').disabled,true);
 assert.ok(await startSavings(doc,async()=>({ok:true,json:async()=>fixture}),win));
 const input=doc.elements.get('owner-active-cost');assert.equal(input.disabled,false);input.value='1200000';input.events.input();assert.equal(readScenario(win.localStorage,fixture),'1200000');
 const tab=fakeDocument();await startSavings(tab,async()=>({ok:true,json:async()=>fixture}),win);assert.equal(tab.elements.get('owner-active-cost').value,'1200000');
 doc.elements.get('savings-clear').events.click();assert.equal(readScenario(win.localStorage,fixture),'');assert.equal(doc.saving[0].textContent,'Not established');
});

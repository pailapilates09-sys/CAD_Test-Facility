import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveGraphs,areaChart,itemChart,evidenceChart} from '../public/construction/estimates/pilates-astra-2026-10-15/v5.1/graphs.js';
import {init as initV5} from '../public/construction/estimates/pilates-astra-2026-10-15/v5/v5.js';
import {init as initV51} from '../public/construction/estimates/pilates-astra-2026-10-15/v5.1/v5.1.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const json=async url=>JSON.parse(await readFile(url));
const original=await json(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url));
const comparison=await json(new URL('v5/comparison.json',base));
const hierarchy=await json(new URL('v2/hierarchy.json',base));
const si=await json(new URL('v3/estimate-si.json',base));
const research=await json(new URL('v4/market-rates.json',base));
test('v5.1 graph totals reconcile with all table rows and the three evidence categories partition every item',()=>{
 const before=JSON.stringify(original),d=deriveGraphs(original.line_items,original.sections,comparison.items);
 assert.equal(d.count,51);assert.equal(d.total_minor,505114868);assert.equal(d.held_count,6);assert.equal(d.areas.length,6);
 assert.equal(d.areas.reduce((n,x)=>n+x.amount_minor,0),d.total_minor);
 for(const s of d.areas){assert.equal(s.amount_minor,original.sections.find(x=>x.id===s.id).summary_amount_minor);assert.equal(s.count,Object.values(s.counts).reduce((n,x)=>n+x,0))}
 for(const [category,expected]of Object.entries({compatible:36,different:9,held:6}))assert.equal(d.areas.reduce((n,x)=>n+x.counts[category],0),expected);
 assert.equal(d.ranked.filter(x=>x.category==='held').reduce((n,x)=>n+x.amount_minor,0),88165350);
 assert.equal(JSON.stringify(original),before);
 const svg=areaChart(d);assert.match(svg,/zero baseline/);assert.match(svg,/currency unspecified/);assert.match(svg,/19,64,709.40/);
 assert.equal((itemChart(d).match(/data-item=/g)||[]).length,10);assert.equal((itemChart(d,true).match(/data-item=/g)||[]).length,51);
 assert.match(evidenceChart(d),/Each item counted once/);
});
test('v5.1 graphs respect filtered populations, retain holds and handle empty results',()=>{
 const held=original.line_items.filter(x=>comparison.items.find(c=>c.id===x.id).status==='on_hold_original_retained');
 const d=deriveGraphs(held,original.sections,comparison.items);
 assert.equal(d.count,6);assert.equal(d.total_minor,88165350);assert.equal(d.held_count,6);
 assert.equal(d.areas.reduce((n,s)=>n+s.counts.compatible+s.counts.different,0),0);
 const empty=deriveGraphs([],original.sections,comparison.items);
 assert.deepEqual(empty.areas,[]);assert.equal(empty.total_minor,0);
 for(const fn of [areaChart,itemChart,evidenceChart]){assert.doesNotMatch(fn(empty),/<svg|NaN|Infinity/);assert.match(fn(empty),/No matching/)}
 assert.throws(()=>deriveGraphs([{id:'unknown'}],[],comparison.items),/Missing comparison record/);
});
async function harness(init){
 const elements=new Map();
 const element=id=>{
  if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',hidden:false,value:id==='sort'?'source':id==='comparison-state'?'all':'',checked:false,dataset:{},events:{},attributes:{},addEventListener(t,fn){(this.events[t]??=[]).push(fn)},setAttribute(k,v){this.attributes[k]=v},showModal(){this.open=true},close(){this.open=false}});
  return elements.get(id);
 };
 const previous={document:globalThis.document,fetch:globalThis.fetch,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.document={getElementById:element,addEventListener(){},querySelectorAll(){return []}};
 globalThis.fetch=async path=>{
  const d=path.endsWith('/data/estimate.json')?original:path.endsWith('hierarchy.json')?hierarchy:path.endsWith('estimate-si.json')?si:path.endsWith('market-rates.json')?research:path.endsWith('comparison.json')?comparison:null;
  assert.ok(d,`Unexpected fetch ${path}`);return {ok:true,json:async()=>structuredClone(d)};
 };
 globalThis.ResizeObserver=class{observe(){}};globalThis.requestAnimationFrame=()=>{};
 try{await init();return {elements,element,cleanup(){Object.assign(globalThis,previous)}}}catch(e){Object.assign(globalThis,previous);throw e}
}
test('revised v5.1 preserves v5 tables while all-item range comparisons follow their filters',async()=>{
 const filters=[{}, {area:'studio'}, {'evidence-filter':'quote-needed'}, {search:'gypsum'}, {search:'no such scope xyz'}];
 async function snapshots(init){
  const h=await harness(init);try{return filters.map(f=>{
   for(const id of ['area','search','evidence-filter'])h.element(id).value=f[id]??'';
   h.element('search').events.input.forEach(fn=>fn());
   return {tables:h.element('items').innerHTML,count:h.element('count').textContent,graphs:h.element('range-board-summary').textContent,svg:h.element('range-board').innerHTML};
  })}finally{h.cleanup()}
 }
 const old=await snapshots(initV5),current=await snapshots(initV51);
 for(let i=0;i<filters.length;i++){assert.equal(current[i].tables,old[i].tables);assert.equal(current[i].count,old[i].count)}
 assert.equal((current[0].tables.match(/<table>/g)||[]).length,6);assert.equal((current[0].tables.match(/class="market-cell"/g)||[]).length,51);
 assert.match(current[0].graphs,/51 matching items.*36 with same-unit references/);assert.match(current[1].graphs,/8 matching items/);
 assert.match(current[2].graphs,/6 matching items.*6 on hold/);assert.match(current[4].graphs,/0 matching items/);
 assert.doesNotMatch(current[4].svg,/<svg/);
 assert.equal((current[0].svg.match(/data-range-item=/g)||[]).length,51);assert.equal((current[2].svg.match(/data-range-item=/g)||[]).length,6);
 const html=await readFile(new URL('v5.1/index.html',base),'utf8');
 assert.match(html,/<!-- LINKED_VIEW -->/);assert.match(html,/shared\/graphs.js/);assert.doesNotMatch(html,/id="items"|<summary>Conversion notes|id="graph-area"|id="graph-items"|id="graph-evidence"/);
});

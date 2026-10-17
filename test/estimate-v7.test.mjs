import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {init as initV6} from '../public/construction/estimates/pilates-astra-2026-10-15/v6/v6.js';
import {init as initV7} from '../public/construction/estimates/pilates-astra-2026-10-15/v7/v7.js';
import {calculateDraft,componentChart} from '../public/construction/estimates/pilates-astra-2026-10-15/v7/components.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url),json=async p=>JSON.parse(await readFile(new URL(p,base)));
const original=JSON.parse(await readFile(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url))),comparison=await json('v5/comparison.json'),hierarchy=await json('v2/hierarchy.json'),si=await json('v3/estimate-si.json'),research=await json('v4/market-rates.json'),images=await json('v6/image-register.json'),components=await json('v7/component-rates.json'),debt=await json('v7/debt-review.json');
const item=id=>components.items.find(x=>x.item_id===id),ob=id=>components.observations.find(x=>x.id===id);
test('v7 preserves every original item, six holds, two allowances and all original totals',async()=>{
 assert.deepEqual(components.summary,original.summary);assert.equal(components.items.length,51);assert.equal(components.coverage.both_component_reference_items,40);assert.equal(components.coverage.accepted_original_splits,0);
 for(const x of components.items){const prior=comparison.items.find(p=>p.id===x.item_id);assert.deepEqual(x.original,prior.original);assert.deepEqual(x.si,prior.si);assert.equal(x.original_labour_rate,null);assert.equal(x.original_material_rate,null);assert.equal(x.accepted_split,false);assert.equal(x.original_unallocated_rate,x.si.rate);
  if(prior.status==='on_hold_original_retained'){assert.equal(x.status,prior.status);assert.deepEqual(x.labour_reference_ids,[]);assert.deepEqual(x.material_reference_ids,[]);assert.deepEqual(x.combined_reference_ids,[])}
  for(const kind of ['labour','material','combined'])for(const id of x[kind+'_reference_ids'])assert.equal(ob(id).component,kind);
 }
 assert.equal(components.items.filter(x=>x.status==='on_hold_original_retained').length,6);assert.deepEqual(components.allowances.map(x=>x.original_amount),['550000.00','280057.43']);for(const a of components.allowances){assert.equal(a.labour_amount,null);assert.equal(a.material_amount,null);assert.equal(a.unit_rate,null)}
 assert.deepEqual((await readFile(new URL('v7/component-items.jsonl',base),'utf8')).trim().split('\n').map(JSON.parse),components.items);
});
test('v7 normalizes known measurement units and keeps combined, historical, unknown-currency and wage bases explicit',()=>{
 assert.equal(ob('C03').normalized.low,'721.18');assert.equal(ob('C03').normalized.high,'1011.81');assert.equal(ob('C03').vat_status,'excludes_VAT');assert.equal(ob('C01').normalized.unit,'day');assert.equal(ob('C15').normalized.low,'44.85');assert.equal(ob('C15').normalized.high,'215.28');assert.equal(ob('C15').formula.wastage_assumed,null);
 assert.equal(ob('C06').component,'combined');assert.equal(ob('C08').component,'combined');assert.equal(ob('C18').currency,null);assert.equal(ob('V4-R10').availability,'out_of_stock');assert.equal(ob('V4-R11').price_qualifier,'historical_listed_price');
 const chart=componentChart(item('reception-011'),components);assert.ok(!chart.includes('C18'));assert.equal((chart.match(/<svg /g)||[]).length,3);assert.match(chart,/NPR \/ worker-day/);assert.match(chart,/NPR \/ m²/);assert.match(chart,/NPR \/ litre/);
 const official=components.sources.find(x=>x.id==='N01');assert.equal(official.source_sha256,debt.resolved[0].sha256);assert.equal(official.source_bytes,15344169);assert.match(official.preserved_copy_url,/drive.google.com/);
});
test('component drafts require all known rates, retain decimal precision and block held or unmeasured items',()=>{
 const ac=item('coffee-lounge-008');for(const values of [['','',''],['1','2'],['1','2','-1'],['1e3','2','3'],['1.001','2','3']])assert.equal(calculateDraft(ac,values).ok,false);
 assert.equal(calculateDraft(item('reception-005'),['1','2','3']).ok,false);assert.equal(calculateDraft(item('reception-015'),['1','2','3']).ok,false);
 const draft=calculateDraft(ac,['0.10','0.20','0']);assert.equal(draft.ok,true);assert.equal(draft.rate_minor,30);assert.equal(draft.line_amount_minor,30);assert.equal(draft.accepted_split,false);assert.equal(calculateDraft(item('reception-006'),['1','2','0']).line_amount_minor,0);
 const fractional=calculateDraft({...ac,si:{...ac.si,quantity:'1.5'}},['0.01','0','0']);assert.equal(fractional.line_amount_minor,2);
});
async function harness(init){
 const elements=new Map(),documentEvents=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',hidden:false,value:id==='sort'?'source':id==='comparison-state'?'all':'',checked:false,dataset:{},events:{},attributes:{},addEventListener(t,fn){(this.events[t]??=[]).push(fn)},setAttribute(k,v){this.attributes[k]=v},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
 const previous={document:globalThis.document,fetch:globalThis.fetch,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame};globalThis.document={getElementById:element,addEventListener(t,fn){(documentEvents.get(t)??documentEvents.set(t,[]).get(t)).push(fn)},querySelectorAll(){return []}};
 globalThis.fetch=async p=>{const d=p.endsWith('/data/estimate.json')?original:p.endsWith('hierarchy.json')?hierarchy:p.endsWith('estimate-si.json')?si:p.endsWith('market-rates.json')?research:p.endsWith('comparison.json')?comparison:p.endsWith('image-register.json')?images:p.endsWith('component-rates.json')?components:p.endsWith('debt-review.json')?debt:null;assert.ok(d,`Unexpected fetch ${p}`);return {ok:true,json:async()=>structuredClone(d)}};globalThis.ResizeObserver=class{observe(){}};globalThis.requestAnimationFrame=()=>{};
 try{await init();return {element,documentEvents,cleanup(){Object.assign(globalThis,previous)}}}catch(e){Object.assign(globalThis,previous);throw e}
}
test('v7 keeps the v6 tables, images, held values and graphs while component tables follow filters',async()=>{
 const filters=[{}, {area:'studio',sort:'desc'}, {'evidence-filter':'quote-needed',sort:'asc'}, {search:'gypsum'}, {search:'no such scope xyz'}];
 async function snapshots(init){const h=await harness(init);try{return filters.map(f=>{for(const id of ['area','search','evidence-filter','sort'])h.element(id).value=f[id]??(id==='sort'?'source':'');h.element('search').events.input.forEach(fn=>fn());return {tables:h.element('items').innerHTML.replaceAll('../v6/images/','./images/'),count:h.element('count').textContent,graphs:['graph-summary','graph-area','graph-items','graph-evidence'].map(id=>h.element(id).innerHTML||h.element(id).textContent),held:h.element('held-items').innerHTML,components:h.element('component-tables').innerHTML}})}finally{h.cleanup()}}
 const before=await snapshots(initV6),after=await snapshots(initV7);for(let i=0;i<filters.length;i++){for(const key of ['tables','count','graphs','held'])assert.deepEqual(after[i][key],before[i][key]);assert.equal((after[i].components.match(/data-component-item=/g)||[]).length,(after[i].tables.match(/data-image-item=/g)||[]).length)}
 const html=await readFile(new URL('v7/index.html',base),'utf8');assert.ok(html.indexOf('id="table-graphs"')>html.indexOf('id="component-tables"'));assert.match(html,/src="\.\/v7.js"/);
});
test('v7 exposes components and source scope for all 51 image detail buttons and calculates only a temporary draft',async()=>{
 const h=await harness(initV7);try{
  for(const x of images.items){for(const fn of h.documentEvents.get('click'))fn({target:{closest:()=>({dataset:{detail:x.item_id}})}});const body=h.element('detail-body').innerHTML;assert.equal(h.element('detail').open,true);assert.match(body,/V7 labour and material evidence/);assert.match(body,/Complete source description/);assert.match(body,/Original unit rate/);assert.ok(body.includes('../v6/images/'))}
  h.element('draft-labour').value='4972';h.element('draft-material').value='75050';h.element('draft-other').value='0';h.element('calculate-components').events.click[0]();assert.match(h.element('draft-result').textContent,/80,022.00/);assert.match(h.element('draft-result').textContent,/Not saved or applied/);
  h.element('component-item').value='reception-005';h.element('component-item').events.change[0]();assert.equal(h.element('calculate-components').disabled,true);assert.equal(h.element('draft-labour').value,'');assert.match(h.element('draft-result').textContent,/On hold/);
  assert.equal((h.element('component-allowances').innerHTML.match(/<tr>/g)||[]).length,3);assert.equal(h.element('content').hidden,false);
 }finally{h.cleanup()}
});

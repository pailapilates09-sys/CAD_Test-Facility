import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {rangePosition,rangePlot,itemRangeCard,boardMarkup,createRangeBoard} from '../public/construction/estimates/pilates-astra-2026-10-15/v5.1/range-board.js';
const data=JSON.parse(await readFile(new URL('../public/construction/estimates/pilates-astra-2026-10-15/v5/comparison.json',import.meta.url)));
const x={id:'test-item',title:'Test item',si:{unit:'m2',unit_label:'m²',rate:'150'},status:'reference_comparison'};
const ref={id:'R-test',currency:'NPR',unit:'m2',unit_label:'m²',unit_matches_estimate:true,low:'100',high:'200',qualifier:'range'};
test('range positions describe exact numeric bound distances only under the explicit NPR scenario',()=>{
 assert.equal(rangePosition(x,ref).state,'hidden');assert.equal(rangePosition(x,ref).position,undefined);
 const within=rangePosition(x,ref,true);assert.equal(within.state,'within');assert.equal(within.position,50);assert.equal(within.fromLow,50);assert.equal(within.fromHigh,-50);
 const below=rangePosition({...x,si:{...x.si,rate:'70'}},ref,true);assert.equal(below.state,'below');assert.equal(below.fromLow,-30);assert.match(below.text,/30.00 below/);
 const above=rangePosition({...x,si:{...x.si,rate:'250'}},ref,true);assert.equal(above.state,'above');assert.equal(above.fromHigh,50);assert.match(above.text,/50.00 above/);
 for(const rate of ['100','200'])assert.equal(rangePosition({...x,si:{...x.si,rate}},ref,true).state,'within');
 const rounded=rangePosition({...x,si:{...x.si,rate:'100.004'}},ref,true);assert.equal(rounded.fromLow,0);assert.equal(rounded.position,0);
 const missing=rangePosition(x,{...ref,low:null,high:null},true);assert.equal(missing.state,'unknown');
 for(const r of [{...ref,unit_matches_estimate:false,unit:'each',unit_label:'each'},{...ref,currency:'USD'}]){assert.equal(rangePosition(x,r,true).state,'different');assert.doesNotMatch(rangePlot(x,r,true),/data-estimate-marker=/)}
 assert.doesNotMatch(rangePlot(x,ref,false),/data-estimate-marker=/);assert.match(rangePlot(x,ref,true),/data-estimate-marker="test-item"/);
});
test('single prices and open bounds never become invented closed ranges or percentage positions',()=>{
 const point=rangePosition(x,{...ref,high:'100'},true);assert.equal(point.state,'point');assert.equal(point.position,null);assert.match(point.text,/listed price/);
 for(const r of [{...ref,high:null,qualifier:'starting_from'},{...ref,qualifier:'open_upper_bound'}]){const p=rangePosition(x,r,true);assert.equal(p.state,'open');assert.equal(p.position,null);assert.match(p.text,/maximum unknown/);assert.doesNotMatch(p.distance,/from high/)}
});
test('all 51 items and every public reference appear once, preserving held items and unique accessible chart IDs',()=>{
 const before=JSON.stringify(data),html=boardMarkup(data.items,data.sections,true);
 assert.equal((html.match(/data-range-item=/g)||[]).length,51);assert.equal((html.match(/class="range-area"/g)||[]).length,6);
 assert.equal((html.match(/data-range-ref=/g)||[]).length,data.items.reduce((n,x)=>n+x.references.length,0));
 const titles=[...html.matchAll(/<title id="([^"]+)"/g)].map(x=>x[1]);assert.equal(titles.length,new Set(titles).size);
 for(const item of data.items){const card=itemRangeCard(item,true);assert.ok(card.includes('data-detail="'+item.id+'"'));assert.ok(card.includes('Scope, date + source details')||item.status==='on_hold_original_retained');if(item.status==='on_hold_original_retained'){assert.doesNotMatch(card,/<svg|data-estimate-marker=/);assert.match(card,/disabled/)}for(const r of item.references){assert.ok(card.includes(r.id));if(!r.unit_matches_estimate)assert.match(card,/No original overlay/)}}
 assert.equal(JSON.stringify(data),before);assert.doesNotMatch(boardMarkup([],data.sections),/<svg/);
});
test('board markers toggle per item, global assumption synchronizes with the top chart, and filtering retains item overrides',()=>{
 const els=new Map(),el=id=>{if(!els.has(id))els.set(id,{innerHTML:'',textContent:'',checked:false,events:{},addEventListener(k,fn){(this.events[k]??=[]).push(fn)},dispatchEvent(e){for(const fn of this.events[e.type]??[])fn(e)}});return els.get(id)},previous=globalThis.document;
 globalThis.document={getElementById:el};try{
  const render=createRangeBoard(data),rows=data.items.map(x=>({id:x.id}));render(rows);assert.doesNotMatch(el('range-board').innerHTML,/data-estimate-marker=/);
  const toggle=id=>el('range-board').events.click[0]({target:{closest:()=>({dataset:{rangeToggle:id},disabled:false})}});
  toggle('reception-012');assert.equal((el('range-board').innerHTML.match(/data-estimate-marker=/g)||[]).length,1);assert.match(el('range-board').innerHTML,/66.7% along the published range/);
  render(rows.filter(x=>x.id==='studio-001'));assert.doesNotMatch(el('range-board').innerHTML,/data-estimate-marker=/);render(rows);assert.equal((el('range-board').innerHTML.match(/data-estimate-marker=/g)||[]).length,1);
  el('board-assume-npr').checked=true;el('board-assume-npr').dispatchEvent(new Event('change'));assert.equal(el('assume-npr').checked,true);assert.ok((el('range-board').innerHTML.match(/data-estimate-marker=/g)||[]).length>=36);
  el('assume-npr').checked=false;el('assume-npr').dispatchEvent(new Event('change'));assert.equal(el('board-assume-npr').checked,false);assert.doesNotMatch(el('range-board').innerHTML,/data-estimate-marker=/);
  assert.throws(()=>render([{id:'missing'}]),/Missing comparison record/);
 }finally{globalThis.document=previous}
});

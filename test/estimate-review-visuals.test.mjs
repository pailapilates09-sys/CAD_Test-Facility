import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {positionRows,positionOverview,costLayout,costTreemap,createReviewVisuals} from '../public/construction/estimates/pilates-astra-2026-10-15/v6/review-visuals.js';
import {createRangeBoard} from '../public/construction/estimates/pilates-astra-2026-10-15/v5.1/range-board.js';
import {initComparison} from '../public/construction/estimates/pilates-astra-2026-10-15/v5/comparison-ui.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url),data=JSON.parse(await readFile(new URL('v5/comparison.json',base)));
test('range overview preserves separate source rows, bounds and exact positions while explicitly representing off-window values',()=>{
 const rows=positionRows(data.items);assert.equal(rows.length,31);assert.equal(new Set(rows.map(r=>r.id)).size,31);
 for(const row of rows){assert.equal(row.reference.unit_matches_estimate,true);assert.equal(row.reference.currency,'NPR');assert.ok(row.high>row.low);assert.notEqual(row.reference.qualifier,'open_upper_bound');assert.equal(row.position,(row.value-row.low)/(row.high-row.low)*100)}
 const svg=positionOverview(rows);assert.equal((svg.match(/data-position-id=/g)||[]).length,31);assert.equal((svg.match(/class="position-overflow"/g)||[]).length,rows.filter(x=>x.position>200||x.position< -50).length);assert.match(svg,/4,645.2%/);assert.match(svg,/minus 50% to 200%/);assert.doesNotMatch(positionOverview([]),/<svg|NaN/);
 for(const row of positionRows(data.items.filter(x=>x.section_id==='studio')))assert.equal(row.item.section_id,'studio');
});
test('treemap rectangle areas reconcile to original item costs without overlap, dropped positive costs or duplicated holds',()=>{
 const before=JSON.stringify(data),layout=costLayout(data.items,data.sections),canvas=1100*650;
 assert.equal(layout.total,505114868);assert.equal(layout.cells.length,50);assert.equal(layout.zero.length,1);assert.equal(layout.zero[0].id,'reception-006');assert.equal(layout.areas.length,6);
 assert.equal(layout.cells.reduce((n,c)=>n+c.weight,0),layout.total);assert.equal(layout.cells.filter(c=>c.item.status==='on_hold_original_retained').reduce((n,c)=>n+c.weight,0),88165350);
 assert.equal(new Set(layout.cells.map(c=>c.id)).size,50);
 for(const c of layout.cells){assert.equal(c.id,c.item.id);assert.equal(c.weight,c.item.original.amount_minor);assert.ok(Math.abs(c.w*c.h/canvas-c.weight/layout.total)<1e-10);assert.ok(c.x>=-1e-9&&c.y>=-1e-9&&c.x+c.w<=1100+1e-9&&c.y+c.h<=650+1e-9)}
 for(let i=0;i<layout.cells.length;i++)for(let j=i+1;j<layout.cells.length;j++){const a=layout.cells[i],b=layout.cells[j],overlapX=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),overlapY=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));assert.ok(overlapX*overlapY<1e-7)}
 const svg=costTreemap(layout);assert.equal((svg.match(/data-treemap-item=/g)||[]).length,50);assert.equal((svg.match(/fill="url\(#held-hatch\)"/g)||[]).length,6);assert.match(svg,/currency unspecified/);assert.equal(JSON.stringify(data),before);
 const held=data.items.filter(x=>x.status==='on_hold_original_retained');assert.equal(costLayout(held,data.sections).total,88165350);assert.equal(costLayout([],data.sections).total,0);assert.doesNotMatch(costTreemap(costLayout([],data.sections)),/<svg|NaN/);assert.doesNotMatch(costTreemap(costLayout(layout.zero,data.sections)),/<svg|NaN/);
 assert.throws(()=>costLayout([{id:'bad',original:{amount_minor:-1}}],[]),/Invalid original amount/);
});
function harness(){const els=new Map(),el=id=>{assert.ok(!['assume-npr','board-assume-npr'].includes(id),'Permanent charts must not access a marker checkbox');if(!els.has(id))els.set(id,{innerHTML:'',textContent:'',value:id==='comparison-state'?'all':'',dataset:{},events:{},addEventListener(k,fn){(this.events[k]??=[]).push(fn)}});return els.get(id)};const prev={document:globalThis.document,fetch:globalThis.fetch};globalThis.document={getElementById:el};return {el,cleanup(){Object.assign(globalThis,prev)}}}
test('permanent boards and top comparison show original markers immediately, with no toggle interaction or checkbox dependency',async()=>{
 const h=harness();try{
  const render=createRangeBoard(data,{permanentOriginal:true});render(data.items);const html=h.el('range-board').innerHTML;
  const expected=data.items.flatMap(x=>x.references).filter(r=>r.unit_matches_estimate&&r.currency==='NPR').length;assert.equal((html.match(/data-estimate-marker=/g)||[]).length,expected);assert.doesNotMatch(html,/data-range-toggle|Show original marker|Hide original marker/);assert.equal((html.match(/data-range-item=/g)||[]).length,51);assert.match(html,/Original shown · NPR assumed/);
  globalThis.fetch=async()=>({ok:true,json:async()=>structuredClone(data)});await initComparison('test',{permanentOriginal:true});assert.match(h.el('comparison-chart').innerHTML,/Original estimate overlaid/);assert.match(h.el('comparison-note').textContent,/Scenario only/);
 }finally{h.cleanup()}
 const graphModule=await readFile(new URL('shared/graphs.js',base),'utf8');assert.match(graphModule,/permanentOriginal:true/);
 for(const version of ['v6','v7']){const html=await readFile(new URL(version+'/index.html',base),'utf8');assert.doesNotMatch(html,/id="assume-npr"|id="board-assume-npr"|id="graph-area"|id="graph-items"|id="graph-evidence"|shared\/graphs.js/);assert.match(html,/<!-- LINKED_VIEW -->/);}
});
test('treemap and position inspection work by pointer, keyboard focus and selection, and recompute for filtered and empty populations',()=>{
 const h=harness();try{
  const render=createReviewVisuals(data);render(data.items);assert.match(h.el('treemap-total').textContent,/50,51,148.68/);assert.match(h.el('treemap-zero').innerHTML,/Glass Door And Fittings/);assert.equal((h.el('treemap-item').innerHTML.match(/<option /g)||[]).length,51);
  h.el('cost-treemap').events.focusin[0]({target:{closest:()=>({dataset:{treemapItem:'reception-001'}})}});assert.equal(h.el('treemap-item').value,'reception-001');assert.match(h.el('treemap-inspect').innerHTML,/Full scope \+ image/);
  h.el('treemap-item').value='reception-005';h.el('treemap-item').events.change[0]();assert.match(h.el('treemap-inspect').innerHTML,/ON HOLD/);
  h.el('position-overview').events.focusin[0]({target:{closest:()=>({dataset:{positionId:'reception-012__R03'}})}});assert.match(h.el('position-inspect').innerHTML,/66.7%/);assert.match(h.el('position-inspect').innerHTML,/R03/);
  render(data.items.filter(x=>x.section_id==='studio'));assert.match(h.el('treemap-total').textContent,/19,64,709.40/);assert.equal((h.el('treemap-item').innerHTML.match(/<option /g)||[]).length,8);
  render([]);assert.doesNotMatch(h.el('cost-treemap').innerHTML,/<svg/);assert.doesNotMatch(h.el('position-overview').innerHTML,/<svg/);assert.equal(h.el('treemap-inspect').textContent,'No matching items.');assert.throws(()=>render([{id:'missing'}]),/Missing comparison record/);
 }finally{h.cleanup()}
});

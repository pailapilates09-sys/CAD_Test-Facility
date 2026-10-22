import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {contractorData} from '../scripts/contractor-v10.mjs';
import {materialLine} from '../public/construction/estimates/pilates-astra-2026-10-15/v10/contractor-model.js';
import {buildRoomModel} from '../public/construction/models/pilates-sketchup/room-model.js';
import {roomSlice} from '../public/construction/models/pilates-sketchup/room-navigation.js';
import {buildBoqBridge,filterBoqBridge,materialDisplay} from '../public/construction/models/pilates-sketchup/boq-model.js';
import {renderModelBoq} from '../scripts/render-model-boq.mjs';
const root=new URL('../',import.meta.url),base=new URL('public/construction/models/pilates-sketchup/',root);
const json=async url=>JSON.parse(await readFile(url,'utf8'));
const [scene,nav,links,registry]=await Promise.all(['studio-room.scene.json','room-navigation.json','model-boq-links.json'].map(path=>json(new URL(path,base))).concat(json(new URL('public/construction/estimates/pilates-astra-2026-10-15/v9/register.json',root))));
const model=buildRoomModel(scene,nav),data=contractorData(deriveViews(registry)),bridge=buildBoqBridge(model,data,links);

test('the second table joins model identities to each v11 material row exactly once',async()=>{
 assert.equal(bridge.records.length,51);assert.equal(bridge.materialIds.size,261);assert.equal(bridge.records.filter(r=>r.link.model_ids.length).length,36);assert.equal(bridge.records.filter(r=>!r.link.model_ids.length).length,15);
 for(const record of bridge.records){assert.equal(record.work,data.items.find(w=>w.id===record.work.id));for(const row of record.work.rows)assert.deepEqual(materialDisplay(row).cost,materialLine(row));}
 assert.equal(bridge.records.reduce((n,r)=>n+r.work.rows.filter(row=>materialLine(row).amount_low!==null).length,0),63);
 const html=renderModelBoq(model,data,links);assert.equal((html.match(/data-boq-material-id=/g)||[]).length,261);assert.equal((html.match(/data-boq-work-id=/g)||[]).length,51);assert.equal((html.match(/<th scope="col">/g)||[]).length,5);
 const page=await readFile(new URL('index.html',base),'utf8');assert.ok(page.indexOf('id="model-boq"')>page.indexOf('id="item-rows"'));assert.match(page,/Source: extracted SketchUp model/);
 assert.ok(html.includes('v11/#work-locker-space-001'));assert.ok(html.includes('Proposed link'));assert.ok(html.includes('No BOQ link recorded'));
});

test('v11 source changes propagate while model counts do not replace material quantities',()=>{
 const updated=structuredClone(registry);updated.works.find(w=>w.id==='reception-001').title='Updated cupboard title';
 const ply=updated.materials.materials.find(m=>m.id==='ply18');ply.rate_low=3000;ply.rate_high=3200;
 const fresh=buildBoqBridge(model,contractorData(deriveViews(updated)),links),work=fresh.records.find(r=>r.work.id==='reception-001').work,row=work.rows.find(r=>r.material_id==='ply18');
 assert.equal(work.title,'Updated cupboard title');assert.equal(row.quantity,3);assert.equal(materialDisplay(row).amount,'9,000.00 – 9,600.00');
 const alteredModel={...model,items:model.items.map(i=>({...i,quantity:i.quantity*100}))};
 const unchanged=buildBoqBridge(alteredModel,data,links).records.find(r=>r.work.id==='reception-001').work.rows[0];assert.equal(unchanged.quantity,3);assert.equal(materialDisplay(unchanged).amount,'8,160.00');
});

test('held rows, missing inputs and zero source quantities retain v11 calculation semantics',()=>{
 const held=bridge.records.filter(r=>r.work.held);assert.equal(held.length,6);
 for(const {work}of held)for(const row of work.rows){const display=materialDisplay(row,{quantity:100,price:999});assert.equal(display.quantity,'On hold');assert.equal(display.cost.amount_low,null);}
 const glass=data.items.find(w=>w.id==='reception-006').rows.find(r=>r.material_id==='glass');assert.equal(glass.quantity,0);assert.equal(materialDisplay(glass).cost.amount_low,0);
 const missing=data.items.flatMap(w=>w.rows).find(r=>!r.held&&r.quantity===null);assert.equal(materialDisplay(missing).cost.amount_low,null);
 const original=data.items[0].rows[0],input={quantity:'4',price:'3100',selection:'Supplier-selected plywood'};assert.deepEqual(materialDisplay(original,input).cost,materialLine(original,input));assert.equal(materialDisplay(original,input).amount,'12,400.00');assert.equal(materialDisplay(original,input).selection,input.selection);
 assert.equal(materialDisplay(original,{quantity:'invalid'}).amount,'Check input');
});

test('room-scoped repeated fixtures cannot leak another room’s BOQ material lines',()=>{
 const rec=bridge.records.find(r=>r.work.id==='reception-009'),lounge=bridge.records.find(r=>r.work.id==='coffee-lounge-006');
 assert.equal(rec.modelItems[0].quantity,8);assert.equal(lounge.modelItems[0].quantity,19);assert.equal(rec.modelItems[0].globalQuantity,27);
 const slice=roomSlice(model,'reception'),result=filterBoqBridge(bridge,{zoneId:'reception',selectedId:'10719818',visibleItemIds:new Set(slice.items.map(i=>i.id)),visibleOccurrenceIds:slice.occurrenceIds});
 assert.deepEqual(result.records.map(r=>r.work.id),['reception-009']);assert.equal(result.unlinkedModelItems.length,0);
 const lockers=filterBoqBridge(bridge,{selectedId:'1878458'});assert.deepEqual(lockers.records.map(r=>r.work.id),['locker-space-001']);
 const equipment=filterBoqBridge(bridge,{selectedId:'2039197'});assert.equal(equipment.records.length,0);assert.deepEqual(equipment.unlinkedModelItems.map(i=>i.id),['2039197']);
 assert.equal(filterBoqBridge(bridge,{mode:'boq-only'}).records.length,15);assert.equal(filterBoqBridge(bridge,{mode:'model-only'}).records.length,0);
});

test('new v11 rows and works appear automatically without copying prices into the mapping',()=>{
 const fresh=structuredClone(data),work=structuredClone(fresh.items[0]);work.id='new-work';work.rows=[{...work.rows[0],id:'new-work-m01'}];fresh.items.push(work);
 const result=buildBoqBridge(model,fresh,links);assert.equal(result.records.length,52);assert.equal(result.materialIds.size,262);assert.equal(result.records.at(-1).link.kind,'unidentified');
 const noRecord=structuredClone(links);delete noRecord.work_links['reception-001'];assert.equal(buildBoqBridge(model,data,noRecord).records.length,51);
 for(const link of Object.values(links.work_links))assert.deepEqual(Object.keys(link).sort(),['kind','model_ids','note']);
});

test('the join rejects wrong source files, unknown IDs and duplicated material rows',()=>{
 assert.throws(()=>buildBoqBridge(model,data,{...links,source_sha256:'bad'}));assert.throws(()=>buildBoqBridge(model,data,{...links,boq_view:'elsewhere/'}));
 const bad=structuredClone(links);bad.work_links['reception-001'].model_ids=['unknown'];assert.throws(()=>buildBoqBridge(model,data,bad));
 const priced=structuredClone(links);priced.work_links['reception-001'].quantity=99;assert.throws(()=>buildBoqBridge(model,data,priced));
 const duplicate=structuredClone(data);duplicate.items[0].rows.push(duplicate.items[0].rows[0]);assert.throws(()=>buildBoqBridge(model,duplicate,links));
});

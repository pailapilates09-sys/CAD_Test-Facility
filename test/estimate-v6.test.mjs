import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {photoThumbnail,photoDetail} from '../public/construction/estimates/pilates-astra-2026-10-15/v6/images.js';
import {init as initV51} from '../public/construction/estimates/pilates-astra-2026-10-15/v5.1/v5.1.js';
import {init as initV6} from '../public/construction/estimates/pilates-astra-2026-10-15/v6/v6.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url),json=async url=>JSON.parse(await readFile(url));
const original=await json(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url));
const comparison=await json(new URL('v5/comparison.json',base)),hierarchy=await json(new URL('v2/hierarchy.json',base)),si=await json(new URL('v3/estimate-si.json',base)),research=await json(new URL('v4/market-rates.json',base)),images=await json(new URL('v6/image-register.json',base));
test('v6 maps all 51 exact item IDs to real local image bytes with source and license provenance',async()=>{
 assert.equal(images.based_on,'v5.1');assert.equal(images.items.length,51);assert.equal(new Set(images.items.map(x=>x.item_id)).size,51);
 assert.deepEqual(images.items.map(x=>x.item_id),original.line_items.map(x=>x.id));
 const assets=new Map(images.assets.map(x=>[x.id,x]));
 for(const item of images.items){
  assert.ok(assets.has(item.image_id));assert.ok(item.scope_note.length>50);assert.equal(item.project_photo,false);assert.equal(item.exact_scope_verified,false);assert.equal(item.original_values_retained,true);
  assert.equal(item.original_status,comparison.items.find(x=>x.id===item.item_id).status);
  assert.match(photoThumbnail(item,assets),/loading="lazy"/);assert.match(photoDetail(item,assets),/illustrative example, not a project photograph/);
 }
 const raw=await json(new URL('v6/image-source-metadata.json',base));
 for(const asset of images.assets){
  assert.match(asset.local_path,/^\.\/images\/[a-z-]+\.webp$/);assert.match(asset.source_page,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  assert.ok(asset.author);assert.ok(asset.license);assert.ok(asset.license_url.startsWith('http'));assert.ok(asset.width>200&&asset.height>200);
  const bytes=await readFile(new URL('v6/'+asset.local_path,base));
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.equal(bytes.length,asset.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.ok(raw.pages.some(p=>p.pageid===asset.source_page_id));
 }
 const jsonl=(await readFile(new URL('v6/image-items.jsonl',base),'utf8')).trim().split('\n').map(x=>JSON.parse(x));assert.deepEqual(jsonl,images.items);
 assert.equal(images.items.filter(x=>x.original_status==='on_hold_original_retained').length,6);
});
async function harness(init){
 const elements=new Map(),documentEvents=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',hidden:false,value:id==='sort'?'source':id==='comparison-state'?'all':'',checked:false,dataset:{},events:{},attributes:{},addEventListener(t,fn){(this.events[t]??=[]).push(fn)},setAttribute(k,v){this.attributes[k]=v},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
 const previous={document:globalThis.document,fetch:globalThis.fetch,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.document={getElementById:element,addEventListener(t,fn){(documentEvents.get(t)??documentEvents.set(t,[]).get(t)).push(fn)},querySelectorAll(){return []}};
 globalThis.fetch=async path=>{const data=path.endsWith('/data/estimate.json')?original:path.endsWith('hierarchy.json')?hierarchy:path.endsWith('estimate-si.json')?si:path.endsWith('market-rates.json')?research:path.endsWith('comparison.json')?comparison:path.endsWith('image-register.json')?images:null;assert.ok(data,`Unexpected fetch ${path}`);return {ok:true,json:async()=>structuredClone(data)}};
 globalThis.ResizeObserver=class{observe(){}};globalThis.requestAnimationFrame=()=>{};
 try{await init();return {element,documentEvents,cleanup(){Object.assign(globalThis,previous)}}}catch(e){Object.assign(globalThis,previous);throw e}
}
test('v6 keeps revised v5.1 table cells and filtered totals, while retaining its own original graphs',async()=>{
 const filters=[{}, {area:'studio',sort:'desc'}, {'evidence-filter':'quote-needed',sort:'asc'}, {search:'gypsum'}, {search:'no such scope xyz'}];
 async function snapshots(init){const h=await harness(init);try{return filters.map(f=>{
  for(const id of ['area','search','evidence-filter','sort'])h.element(id).value=f[id]??(id==='sort'?'source':'');h.element('search').events.input.forEach(fn=>fn());
  return {tables:h.element('items').innerHTML,count:h.element('count').textContent,graphs:['graph-summary','graph-area','graph-items','graph-evidence'].map(id=>h.element(id).innerHTML||h.element(id).textContent),held:h.element('held-items').innerHTML};
 })}finally{h.cleanup()}}
 const before=await snapshots(initV51),after=await snapshots(initV6);
 for(let i=0;i<filters.length;i++){
  assert.equal(after[i].tables.replace(/<figure class="scope-photo"[\s\S]*?<\/figure>/g,''),before[i].tables);assert.equal(after[i].count,before[i].count);assert.ok(after[i].graphs[0].includes(before[i].count.split(' of ')[0]+' matching items'));if(i===4)assert.ok(after[i].graphs.slice(1).every(x=>!x.includes('<svg')));else assert.ok(after[i].graphs.slice(1).every(x=>x.includes('<svg')));assert.equal(after[i].held,before[i].held);
 }
 assert.equal((after[0].tables.match(/data-image-item=/g)||[]).length,51);assert.equal((after[2].tables.match(/data-image-item=/g)||[]).length,6);assert.equal((after[4].tables.match(/data-image-item=/g)||[]).length,0);
 const html=await readFile(new URL('v6/index.html',base),'utf8');assert.ok(html.indexOf('id="table-graphs"')>html.indexOf('id="items"'));assert.match(html,/src="\.\/v6.js"/);
});
test('v6 photo buttons open the matching full scope, original facts, photo credits and supplier evidence',async()=>{
 const h=await harness(initV6);try{
  for(const item of images.items){
   const button={dataset:{detail:item.item_id}};
   for(const fn of h.documentEvents.get('click'))fn({target:{closest:()=>button}});
   assert.equal(h.element('detail').open,true);assert.equal(h.element('detail-title').textContent,item.title);
   assert.ok(h.element('detail-body').innerHTML.includes(assetsPath(item.image_id)));
   assert.match(h.element('detail-body').innerHTML,/Complete source description/);assert.match(h.element('detail-body').innerHTML,/Original unit rate/);assert.match(h.element('detail-body').innerHTML,/Kathmandu public rate evidence/);
  }
  assert.match(h.element('image-summary').textContent,/51 detailed work items/);assert.equal((h.element('image-credits').innerHTML.match(/<li /g)||[]).length,images.assets.length);
 }finally{h.cleanup()}
});
function assetsPath(id){return images.assets.find(x=>x.id===id).local_path}

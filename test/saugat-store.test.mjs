import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildStore,floorItems} from '../public/construction/models/saugat-paneru-virtual-store/store-model.js';
import {storeScene,showcaseScene} from '../public/construction/models/saugat-paneru-virtual-store/store-geometry.js';
import {renderPlan,renderShelfLevels,storeFaces} from '../public/construction/models/saugat-paneru-virtual-store/store-view.js';
import {pointInTriangle} from '../public/construction/models/layout-designer/design-view3d.js';
const base=new URL('../public/construction/models/saugat-paneru-virtual-store/',import.meta.url);
const raw=JSON.parse(await readFile(new URL('data/project.json',base),'utf8'));
const store=buildStore(raw);

test('the two store floors share eight pillar centres at twelve-foot spacing and three bays',()=>{
 assert.deepEqual(store.levels.map(l=>[l.id,l.rooms.length]),[['ground',3],['first',3]]);
 assert.deepEqual(store.pillars.map(({x,y})=>[x,y]),[[0,0],[12,0],[24,0],[36,0],[0,12],[12,12],[24,12],[36,12]]);
 for(const floor of store.levels){
  assert.deepEqual(floor.rooms.map(r=>r.x),[0,12,24]);
  assert.ok(floor.rooms.every(r=>r.shelves.length===3));
  const svg=renderPlan(store,floor);
  assert.equal((svg.match(/data-pillar=/g)??[]).length,8);
  assert.ok(svg.includes('36 × 12 ft pillar grid'));
 }
});

test('catalog has distinct Chappal and plastic products tied to the right plan, shelf and scene',()=>{
 assert.ok(store.items.filter(p=>p.type==='plastic').length>=10);
 assert.ok(store.items.some(p=>p.type==='footwear'&&p.name.includes('Chappal')));
 assert.equal(store.catalog_status,'sample');
 for(const floor of store.levels){
  const svg=renderPlan(store,floor),expected=floorItems(store,floor.id),scene=storeScene(store,floor.id,'all');
  assert.deepEqual(scene.products,expected);
  for(const item of expected){
   assert.ok(svg.includes('data-plan-item="'+item.id+'"'));
   const mesh=scene.meshes.filter(m=>m.itemId===item.id);
   assert.ok(mesh.length);
   assert.ok(mesh.every(m=>m.positions.every(Number.isFinite)&&m.indices.every(i=>i>=0&&i<m.positions.length/3)));
   assert.ok(item.brand && item.price_npr>0);
  }
 }
});

test('each storey has ten one-foot bands and every product falls inside its assigned height',()=>{
 assert.deepEqual(store.levels.map(l=>l.elevation),[0,10]);
 assert.deepEqual(store.bands.map(b=>[b.low,b.high]),Array.from({length:10},(_,i)=>[i,i+1]));
 for(const item of store.items){
  assert.ok(item.z>=item.band.low && item.z+item.h<=item.band.high);
  assert.equal(floorItems(store,item.floor,item.room,item.band.level).find(p=>p.id===item.id),item);
 }
 const elevation=renderShelfLevels(store,'kitchen','mixing-bowl',7);
 assert.equal((elevation.match(/data-shelf-band=/g)??[]).length,10);
 assert.match(elevation,/data-shelf-band="7"[^>]*class="store-level-active"/);
 assert.match(elevation,/data-elevation-item="mixing-bowl"/);
});

test('spaced shelves keep each product visible and selectable without moving its saved location',()=>{
 for(const room of store.roomMap.values()){
  const scene=showcaseScene(store,room.floor,room.id);
  const faces=storeFaces(scene.meshes,scene.camera).reverse();
  for(const p of scene.products){
   const original=store.productMap.get(p.id);
   assert.ok(p.w>original.w && p.d>original.d && p.h>original.h);
   assert.equal(p.band,original.band);
   assert.ok(faces.filter(f=>f.itemId===p.id).some(f=>{
    const point=[0,1].map(i=>f.points.reduce((n,v)=>n+v[i],0)/3);
    return faces.find(other=>pointInTriangle(point,other.points))?.itemId===p.id;
   }),'No surface visible for '+p.id);
  }
 }
 const filtered=showcaseScene(store,'ground','kitchen',7);
 assert.deepEqual(filtered.products.map(p=>p.id),['mixing-bowl']);
 assert.equal(showcaseScene(store,'ground','kitchen',10).products.length,0);
});

test('a catalog edit that puts a product outside its shelf is caught before publishing',()=>{
 const invalid=structuredClone(raw);
 invalid.products[0].size_ft[0]=30;
 assert.throws(()=>buildStore(invalid),/does not fit shelf/);
});

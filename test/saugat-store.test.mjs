import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildStore,floorItems,stockItems} from '../public/construction/models/saugat-paneru-virtual-store/store-model.js';
import {storeScene,showcaseScene} from '../public/construction/models/saugat-paneru-virtual-store/store-geometry.js';
import {renderPlan,renderShelfLevels,renderCatalog,renderProduct,cameraPreset,storeFaces} from '../public/construction/models/saugat-paneru-virtual-store/store-view.js';
import {projectPoint,pointInTriangle} from '../public/construction/models/layout-designer/design-view3d.js';
const base=new URL('../public/construction/models/saugat-paneru-virtual-store/',import.meta.url);
const raw=JSON.parse(await readFile(new URL('data/project.json',base),'utf8'));
const store=buildStore(raw);

test('both storeys retain eight pillars and ten one-foot shelf levels',()=>{
 assert.deepEqual(store.levels.map(l=>[l.id,l.elevation,l.rooms.length]),[['ground',0,3],['first',10,3]]);
 assert.deepEqual(store.pillars.map(({x,y})=>[x,y]),[[0,0],[12,0],[24,0],[36,0],[0,12],[12,12],[24,12],[36,12]]);
 assert.deepEqual(store.bands.map(b=>[b.low,b.high]),Array.from({length:10},(_,i)=>[i,i+1]));
 for(const floor of store.levels){
  assert.deepEqual(floor.rooms.map(r=>r.x),[0,12,24]);
  const svg=renderPlan(store,floor);
  assert.equal((svg.match(/data-pillar=/g)??[]).length,8);
  assert.equal((svg.match(/data-plan-rack=/g)??[]).length,9);
  assert.ok(svg.includes('36 × 12 ft pillar grid'));
 }
});

test('all rack levels are stocked with three positions linked to their own category and a unique catalog item',()=>{
 assert.equal(store.racks.size,18);
 assert.equal(store.stockMap.size,540);
 assert.equal(store.home.size,store.items.length);
 assert.equal(store.catalog_status,'sample');
 assert.ok(store.items.filter(p=>p.type==='footwear').length>=10);
 assert.ok(store.items.filter(p=>p.type==='umbrella').length>=6);
 for(const rack of store.racks.values()){
  assert.ok(rack.goods.length>=3);
  for(const band of store.bands){
   const stock=stockItems(store,rack.floor,rack.room,rack.id,band.level);
   assert.equal(stock.length,3);
   assert.equal(new Set(stock.map(f=>f.column)).size,3);
   assert.ok(stock.every(f=>f.category===rack.label && f.z>=band.low && f.z+f.h<=band.high && store.productMap.has(f.productId)));
  }
 }
});

test('catalog, shelf elevation and plan refer to the same facing, with unquoted prices left unset',()=>{
 const p=store.productMap.get('mixing-bowl'),f=store.home.get(p.id);
 const floor=store.levels.find(l=>l.id===p.floor);
 assert.ok(renderPlan(store,floor,p.room,f,p.shelf).includes('data-plan-placement="'+f.id+'"'));
 const elevation=renderShelfLevels(store,p.room,f.id,f.band.level,p.shelf);
 assert.equal((elevation.match(/data-shelf-band=/g)??[]).length,10);
 assert.match(elevation,new RegExp('data-elevation-facing="'+f.id+'"[^>]*aria-pressed="true"'));
 const table=renderCatalog(floorItems(store,p.floor,p.room,0,p.shelf),p.id);
 assert.match(table,/data-catalog-item="mixing-bowl" aria-pressed="true"/);
 assert.match(renderProduct(p,f),/NPR 190/);
 const umbrella=store.productMap.get('compact-folding-umbrella');
 assert.match(renderProduct(umbrella,store.home.get(umbrella.id)),/Price not listed/);
});

test('true front projection shows distinct selectable products and an angled view remains available',()=>{
 const front=cameraPreset(),left=projectPoint([0,0,0],front),right=projectPoint([10,5,0],front);
 assert.ok(Math.abs(right[1]-left[1])<1e-10);
 assert.ok(Math.abs(right[0]-left[0]-10)<1e-10);
 assert.notDeepEqual(cameraPreset('angled'),front);
 for(const rack of store.racks.values()){
  const scene=showcaseScene(store,rack.room,rack.id);
  const faces=storeFaces(scene.meshes,front).reverse();
  assert.equal(scene.targets.length,30);
  for(const p of rack.goods){
   const id=store.home.get(p.id).id;
   assert.ok(faces.filter(f=>f.itemId===id).some(f=>{
    const point=[0,1].map(i=>f.points.reduce((n,v)=>n+v[i],0)/3);
    return faces.find(other=>pointInTriangle(point,other.points))?.itemId===id;
   }),'No front surface visible for '+p.id);
  }
 }
 for(const floor of store.levels){
  const scene=storeScene(store,floor.id,'all');
  assert.equal(scene.stock.length,270);
  assert.ok(scene.meshes.every(m=>m.positions.every(Number.isFinite)&&m.indices.every(i=>i>=0&&i<m.positions.length/3)));
 }
});

test('selecting a level or a single product keeps the same placement identity',()=>{
 const f=store.home.get('mixing-bowl');
 assert.deepEqual(showcaseScene(store,f.room,f.shelf,f.band.level,f.id).stock,[f]);
 const level=showcaseScene(store,f.room,f.shelf,f.band.level);
 assert.equal(level.stock.length,3);
 assert.ok(level.stock.includes(f));
});

test('a catalog edit that puts a product outside its shelf is caught before publishing',()=>{
 const invalid=structuredClone(raw);invalid.products[0].size_ft[0]=30;
 assert.throws(()=>buildStore(invalid),/does not fit shelf/);
});

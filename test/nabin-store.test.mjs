import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildStore,floorItems,stockItems} from '../public/construction/models/saugat-paneru-virtual-store/store-model.js';
import {storeScene,showcaseScene} from '../public/construction/models/saugat-paneru-virtual-store/store-geometry.js';
import {renderPlan,renderCatalog,renderProduct,renderShelfLevels,cameraPreset,storeFaces} from '../public/construction/models/saugat-paneru-virtual-store/store-view.js';
import {pointInTriangle} from '../public/construction/models/layout-designer/design-view3d.js';

const data=new URL('../public/construction/models/nabin-bista-clothes-store/data/project.json',import.meta.url);
const store=buildStore(JSON.parse(await readFile(data,'utf8')));

test('Nabin has two floors and every category displays three distinct garments on every level',()=>{
 assert.deepEqual(store.levels.map(f=>f.rooms.map(r=>r.id)),[
  ['casualwear','womenswear','menswear'],['kidswear','outerwear','traditional']
 ]);
 assert.equal(store.pillars.length,8);
 assert.equal(store.racks.size,18);
 assert.equal(store.stockMap.size,540);
 assert.equal(store.items.length,90);
 assert.equal(store.catalog_status,'sample');
 for(const rack of store.racks.values()){
  assert.equal(rack.goods.length,5);
  for(const band of store.bands){
   const placements=stockItems(store,rack.floor,rack.room,rack.id,band.level);
   assert.equal(new Set(placements.map(p=>p.productId)).size,3);
  }
 }
});

test('a garment on a corner rack uses the same placement across all views',()=>{
 const p=store.productMap.get('burgundy-border-sari'),f=store.home.get(p.id);
 const floor=store.levels.find(l=>l.id===p.floor);
 assert.ok(renderPlan(store,floor,p.room,f,p.shelf).includes(`data-plan-placement="${f.id}"`));
 assert.match(renderShelfLevels(store,p.room,f.id,f.band.level,p.shelf),new RegExp(`data-elevation-facing="${f.id}"[^>]*aria-pressed="true"`));
 assert.match(renderCatalog(floorItems(store,floor.id,p.room,0,p.shelf),p.id),/data-catalog-item="burgundy-border-sari" aria-pressed="true"/);
 assert.match(renderProduct(p,f),/Silk blend/);
 assert.match(renderProduct(p,f),/NPR 4,350/);
 assert.deepEqual(showcaseScene(store,p.room,p.shelf,f.band.level,f.id).stock,[f]);
 const meshes=storeScene(store,floor.id,'all').meshes.filter(m=>m.itemId===f.id);
 assert.ok(meshes.length>1);
 for(const {positions} of meshes)for(let i=0;i<positions.length;i+=3){
  assert.ok(Math.abs(positions[i]-f.x)<=f.w/2+1e-6);
  assert.ok(Math.abs(positions[i+1]-f.y)<=f.d/2+1e-6);
 }
});

test('the straight-on rack shows a selectable surface for every garment shape',()=>{
 for(const rack of store.racks.values()){
  const scene=showcaseScene(store,rack.room,rack.id);
  const faces=storeFaces(scene.meshes,cameraPreset()).reverse();
  assert.equal(scene.targets.length,30);
  for(const garment of rack.goods){
   const id=store.home.get(garment.id).id;
   assert.ok(faces.filter(f=>f.itemId===id).some(f=>{
    const centre=[0,1].map(i=>f.points.reduce((sum,p)=>sum+p[i],0)/3);
    return faces.find(other=>pointInTriangle(centre,other.points))?.itemId===id;
   }), 'No visible front surface for '+garment.name);
  }
 }
});

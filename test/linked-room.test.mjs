import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.min.js';
import {buildRoomModel,createSelection,matchingItems,IDENTITY} from '../public/construction/models/pilates-sketchup/room-model.js';
import {createThreeAdapter} from '../public/construction/models/pilates-sketchup/three-model.js';
const {createModelBatches,updateModelBatches,pickedItem}=createThreeAdapter(THREE);
import {renderModelItems} from '../scripts/render-model-workspace.mjs';
const base=new URL('../public/construction/models/pilates-sketchup/',import.meta.url);
const scene=JSON.parse(await readFile(new URL('studio-room.scene.json',base),'utf8'));
const model=buildRoomModel(scene);

test('room projection retains main-room source placements while preserving the M5 partition and archive lineage',async()=>{
 const hierarchy=JSON.parse(await readFile(new URL('hierarchy.json',base),'utf8')),register=JSON.parse(await readFile(new URL('source-register.json',base),'utf8'));
 assert.equal(scene.source.sha256,register.source_sha256);assert.equal(scene.source.complete_skp,false);
 assert.deepEqual(scene.source.omitted_root_placements.map(p=>p.id).sort(),['2039196','50398','892791']);
 const original=hierarchy.definitions.find(d=>d.id==='ROOT').children;
 for(const item of scene.root.children){if(item.id==='loose-room')continue;const source=original.find(c=>c.id===item.id);assert.ok(source);assert.equal(item.definition_id,source.definition_id);assert.deepEqual(item.matrix_m,source.matrix_m)}
 assert.equal(scene.source.root_placements,242);assert.equal(model.items.length,106);assert.equal(model.items.reduce((n,i)=>n+i.quantity,0),243);
 assert.ok(model.triangles<1000000);assert.ok(model.bounds.max.every((v,i)=>v-model.bounds.min[i]<25));
 const legacy=JSON.parse(await readFile(new URL('architectural-base.scene.json',base),'utf8'));assert.equal(legacy.definitions.length,5);
});

test('every source instance belongs to exactly one shared item row and table totals are model-derived',()=>{
 const ids=new Set(model.items.map(i=>i.id));for(const o of model.objects)assert.ok(ids.has(o.itemId));
 const sofa=model.items.find(i=>i.sourceName==='sofa+003'),lights=model.items.find(i=>i.sourceName==='Light 01');assert.equal(sofa.quantity,1);assert.equal(lights.quantity,27);
 const html=renderModelItems(scene);assert.equal((html.match(/<tr /g)||[]).length,model.items.length);assert.ok(html.includes('data-item-id="'+lights.id+'"'));assert.ok(html.includes('>27</td>'));
 assert.deepEqual(matchingItems(model.items,'sofa'),[sofa.id]);
 const placementOnly=model.items.find(i=>i.sourceName==='towell');assert.equal(placementOnly.geometryAvailable,false);assert.equal(model.markers.filter(m=>m.itemId===placementOnly.id).length,2);
});

test('selection, isolation and clearing preserve the same item identity for all views',()=>{
 const state=createSelection(['a','b']);assert.equal(state.select('unknown'),false);assert.equal(state.selectedId,null);
 state.select('a');state.isolate(true);assert.equal(state.selectedId,'a');assert.equal(state.visible('a',new Set(['a','b'])),true);assert.equal(state.visible('b',new Set(['a','b'])),false);
 state.select('b');assert.equal(state.visible('b',new Set(['a','b'])),true);state.select(null);assert.equal(state.isolated,false);assert.equal(state.visible('a',new Set(['a','b'])),true);
});

test('instanced 3D geometry picks a source item and applies matching highlight and filter state without WebGL',()=>{
 const offset=[...IDENTITY];offset[12]=4;
 const fixture={schema_version:'paila-room-1.0',units:'m',source:{},materials:{},definitions:[{id:'d',name:'Chair',children:[],meshes:[{positions:[0,0,0,1,0,0,0,1,0],indices:[0,1,2],rgb:[100,120,140],material_id:'None'}]}],root:{children:[{id:'one',definition_id:'d',matrix_m:IDENTITY},{id:'two',definition_id:'d',matrix_m:offset}]}};
 const m=buildRoomModel(fixture),b=createModelBatches(m),state=createSelection(m.items.map(i=>i.id));assert.equal(b.length,1);assert.equal(b[0].mesh.count,2);
 const ray=new THREE.Raycaster(new THREE.Vector3(4.2,.2,5),new THREE.Vector3(0,0,-1));const visible=id=>state.visible(id,new Set(['d']));
 assert.equal(pickedItem(ray,b,{visible,cutaway:false}),'d');state.select('d');
 updateModelBatches(b,{visible,selectedId:state.selectedId,highlight:'#ef9c36',cutaway:false});
 const c=new THREE.Color();b[0].mesh.getColorAt(1,c);assert.ok(c.toArray().every((v,i)=>Math.abs(v-new THREE.Color('#ef9c36').toArray()[i])<1e-6));
 updateModelBatches(b,{visible:()=>false,selectedId:null,highlight:'#ef9c36',cutaway:false});assert.equal(pickedItem(ray,b,{visible:()=>false,cutaway:false}),null);
 for(const batch of b){batch.mesh.geometry.dispose();batch.mesh.material.dispose()}
});

test('room page contains only linked views and four schedule columns, with archival files retained separately',async()=>{
 const page=await readFile(new URL('index.html',base),'utf8');assert.equal((page.match(/<th scope=/g)||[]).length,4);
 assert.match(page,/id="plan"/);assert.match(page,/id="three-view"/);assert.match(page,/id="item-rows"/);
 assert.doesNotMatch(page,/MODEL_INSPECTION|MODEL_SAVED_VIEWS|duplicate-list|Desktop validation|<details/);
 assert.match(page,/Counts are placed model components/);assert.match(page,/axis-aligned model extents/);
 for(const path of ['inspection.json','hierarchy.json','archive-register.json','paila_export.rb','saved-views.json'])assert.ok((await readFile(new URL(path,base))).length>0);
});

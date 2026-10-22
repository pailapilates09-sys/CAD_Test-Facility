import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.min.js';
import {buildRoomModel,matchingItems,IDENTITY} from '../public/construction/models/pilates-sketchup/room-model.js';
import {validateNavigation,roomSlice,boundsForZone,cameraForView,navigationFromSearch} from '../public/construction/models/pilates-sketchup/room-navigation.js';
import {createThreeAdapter} from '../public/construction/models/pilates-sketchup/three-model.js';
import {renderModelItems,renderRoomNavigation} from '../scripts/render-model-workspace.mjs';
const base=new URL('../public/construction/models/pilates-sketchup/',import.meta.url);
const scene=JSON.parse(await readFile(new URL('studio-room.scene.json',base),'utf8'));
const nav=JSON.parse(await readFile(new URL('room-navigation.json',base),'utf8'));
const model=buildRoomModel(scene,nav);

test('navigation labels preserve native identity, source-name search and model quantities',()=>{
 const original=buildRoomModel(scene),byId=new Map(original.items.map(i=>[i.id,i]));
 assert.equal(model.items.length,106);assert.equal(Object.keys(nav.labels).length,106);
 for(const item of model.items){const source=byId.get(item.id);assert.equal(item.sourceName,source.sourceName);assert.equal(item.quantity,source.quantity);assert.deepEqual(item.bounds,source.bounds);assert.deepEqual(item.occurrences,source.occurrences);assert.ok(nav.labels[item.id].evidence)}
 assert.deepEqual(matchingItems(model.items,'Group#67'),['2039197']);assert.deepEqual(matchingItems(model.items,'equipment assembly'),['2039197']);
 assert.deepEqual(matchingItems(model.items,'sofa+003'),['161587']);assert.deepEqual(matchingItems(model.items,'lounge sofa'),['161587']);
 assert.ok(model.items.some(i=>i.labelStatus==='unresolved'));assert.ok(model.items.some(i=>i.labelStatus==='suggested'));
 const html=renderModelItems(scene,nav);assert.ok(html.includes('SketchUp: Group#67'));assert.ok(html.includes('suggested name'));assert.ok(html.includes('name to confirm'));assert.equal((html.match(/<tr /g)||[]).length,106);
});

test('area filtering counts placements within a repeated type and keeps shared assemblies as context',()=>{
 const all=roomSlice(model),reception=roomSlice(model,'reception'),lounge=roomSlice(model,'lounge');
 const light=s=>s.items.find(i=>i.id==='10719818');assert.equal(light(all).quantity,27);assert.equal(light(reception).quantity,8);assert.equal(light(lounge).quantity,19);assert.equal(light(reception).totalQuantity,27);
 const left=new Set(light(reception).occurrences.map(o=>o.id));for(const o of light(lounge).occurrences)assert.ok(!left.has(o.id));
 const covered=new Set();for(const zone of nav.zones){const slice=roomSlice(model,zone.id);assert.equal(slice.occurrenceIds.size,slice.items.reduce((n,i)=>n+i.quantity,0));assert.ok(slice.items.some(i=>i.id==='136690'));for(const id of slice.occurrenceIds){assert.ok(all.occurrenceIds.has(id));covered.add(id)}}
 assert.equal(covered.size,all.occurrenceIds.size);assert.equal(all.occurrenceIds.size,243);
 assert.equal(roomSlice(model,'changing').items.find(i=>i.id==='10862987').quantity,2);
 assert.throws(()=>roomSlice(model,'unknown'));assert.throws(()=>boundsForZone(model,'unknown'));
});

test('3D picking and visibility filter individual occurrences of the same item type',()=>{
 const offset=[...IDENTITY];offset[12]=4;
 const fixture={schema_version:'paila-room-1.0',units:'m',source:{sha256:'fixture'},materials:{},definitions:[{id:'d',name:'Chair',children:[],meshes:[{positions:[0,0,0,1,0,0,0,1,0],indices:[0,1,2],rgb:[100,120,140],material_id:'None'}]}],root:{children:[{id:'one',definition_id:'d',matrix_m:IDENTITY},{id:'two',definition_id:'d',matrix_m:offset}]}};
 const n={schema_version:'paila-room-navigation-1.0',source_sha256:'fixture',labels:{},views:[],zones:[{id:'right',name:'Right',rectangles:[[3,-1,6,2]]}]};
 const m=buildRoomModel(fixture,n),slice=roomSlice(m,'right'),{createModelBatches,updateModelBatches,pickedItem}=createThreeAdapter(THREE),batches=createModelBatches(m),visible=(id,occurrence)=>slice.occurrenceIds.has(occurrence);
 updateModelBatches(batches,{visible,selectedId:'d',highlight:'#ef9c36',cutaway:false});
 const leftRay=new THREE.Raycaster(new THREE.Vector3(.2,.2,5),new THREE.Vector3(0,0,-1)),rightRay=new THREE.Raycaster(new THREE.Vector3(4.2,.2,5),new THREE.Vector3(0,0,-1));
 assert.equal(pickedItem(leftRay,batches,{visible,cutaway:false}),null);assert.equal(pickedItem(rightRay,batches,{visible,cutaway:false}),'d');assert.equal(slice.items[0].quantity,1);
 for(const b of batches){b.mesh.geometry.dispose();b.mesh.material.dispose()}
});

test('all 14 source viewpoints use original camera eye, target and FOV converted to metres',async()=>{
 const hierarchy=JSON.parse(await readFile(new URL('hierarchy.json',base),'utf8'));
 assert.equal(nav.views.length,14);
 for(const view of nav.views){const source=hierarchy.saved_cameras.find(c=>c.name===view.source_camera_name);assert.ok(source);assert.deepEqual(view.eye_m,source.eye.map(v=>v*.0254));assert.deepEqual(view.target_m,source.target.map(v=>v*.0254));assert.equal(view.fov,source.fov);
  const pose=cameraForView(model,view.id,'reception');assert.deepEqual(pose.eye,view.eye_m);assert.deepEqual(pose.target,view.target_m);assert.equal(pose.zoneId,'all');assert.equal(pose.focusZoneId,view.zone_id);assert.equal(pose.cutaway,false);assert.equal(pose.interior,true);
  assert.ok(pose.eye[0]>40&&pose.eye[0]<58);assert.ok(pose.eye[2]>.5&&pose.eye[2]<3);
 }
 const top=cameraForView(model,'top','studio');assert.equal(top.zoneId,'studio');assert.ok(top.eye[2]>top.target[2]);assert.equal(top.cutaway,true);assert.throws(()=>cameraForView(model,'bad'));
});

test('shared viewpoint URLs round-trip and reject unknown area or view values',()=>{
 assert.deepEqual(navigationFromSearch('',nav),{viewId:'overview',zoneId:'all'});
 assert.deepEqual(navigationFromSearch('?zone=reception',nav),{viewId:'zone-overview',zoneId:'reception'});
 assert.deepEqual(navigationFromSearch('?zone=reception&view=top',nav),{viewId:'top',zoneId:'reception'});
 assert.deepEqual(navigationFromSearch('?zone=reception&view=studio',nav),{viewId:'studio',zoneId:'all'});
 assert.deepEqual(navigationFromSearch('?zone=unknown&view=unknown',nav),{viewId:'zone-overview',zoneId:'all'});
});

test('invalid navigation overlays cannot relabel another source or invent definition links',()=>{
 const raw=buildRoomModel(scene);assert.throws(()=>validateNavigation({...nav,source_sha256:'wrong'},raw));
 assert.throws(()=>validateNavigation({...nav,labels:{...nav.labels,missing:nav.labels['136690']}},raw));
 assert.throws(()=>validateNavigation({...nav,zones:[{id:'bad',name:'Bad',rectangles:[[0,0,0,1]]}]},raw));
 assert.throws(()=>validateNavigation({...nav,views:[{...nav.views[0],fov:NaN}]},raw));
 const html=renderRoomNavigation(nav);assert.equal((html.match(/<select /g)||[]).length,2);for(const z of nav.zones)assert.ok(html.includes(z.name.replace('&','&amp;')));
});

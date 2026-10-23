import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {presetLayout,validateLayout,newItem,resizeRoom,assessLayout,itemCorners,wallMeshes,layoutMeshes,objDocument,csvDocument,createHistory,clone} from '../public/construction/models/layout-designer/design-model.js';
import {svgDocument} from '../public/construction/models/layout-designer/design-plan.js';
import {projectPoint,projectedFaces,pointInTriangle} from '../public/construction/models/layout-designer/design-view3d.js';
import {reusableComponents} from '../scripts/layout-designer-assets.mjs';
const base=new URL('../public/construction/models/pilates-sketchup/',import.meta.url),raw=await readFile(new URL('studio-room.scene.json',base)),scene=JSON.parse(raw),navigation=JSON.parse(await readFile(new URL('room-navigation.json',base),'utf8')),assets=reusableComponents(scene,navigation);
const bounds=meshes=>{const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const m of meshes)for(let k=0;k<m.positions.length;k++){min[k%3]=Math.min(min[k%3],m.positions[k]);max[k%3]=Math.max(max[k%3],m.positions[k]);}return {min,max};};

test('three authored layouts and an empty room use independent editable metre-based records',()=>{
 for(const [id,area]of [['studio',108],['office',54],['cafe',63],['blank',108]]){const l=presetLayout(id);assert.equal(validateLayout(l).units,'m');assert.equal(assessLayout(l).area,area);assert.equal(assessLayout(l).outOfBounds.length,0);assert.ok(layoutMeshes(l,assets).length>4);}
 const a=presetLayout('studio');a.items[0].label='Changed';assert.notEqual(presetLayout('studio').items[0].label,'Changed');assert.equal(presetLayout('blank').items.length,2);
});

test('room resizing changes geometry and centre positions while furniture dimensions remain independent',()=>{
 const a=presetLayout('studio'),b=resizeRoom(a,{width:18,depth:12});assert.equal(assessLayout(b).area,216);assert.equal(a.room.width,12);
 const before=a.items.find(i=>i.kind==='reformer'),after=b.items.find(i=>i.id===before.id);assert.ok(Math.abs(after.x-before.x*1.5)<1e-8);assert.equal(after.width,before.width);assert.equal(after.height,before.height);
 const floor=bounds(layoutMeshes(b,assets).filter(m=>m.itemId==='floor'));assert.equal(floor.max[0]-floor.min[0],18);assert.equal(floor.max[1]-floor.min[1],12);
 const c=resizeRoom(a,{width:18},false);assert.equal(c.items.find(i=>i.id===before.id).x,before.x);
});

test('doors and windows create real holes in perimeter wall meshes',()=>{
 const l=presetLayout('blank'),walls=wallMeshes(l),contains=(mesh,p)=>{const b=bounds([mesh]);return p.every((v,i)=>v>b.min[i]+1e-8&&v<b.max[i]-1e-8)};
 assert.equal(walls.some(m=>m.wall==='south'&&contains(m,[1.25,-.075,1])),false);
 assert.equal(walls.some(m=>m.wall==='south'&&contains(m,[1.25,-.075,2.5])),true);
 assert.equal(walls.some(m=>m.wall==='north'&&contains(m,[2,9.075,1.5])),false);
 assert.equal(walls.some(m=>m.wall==='north'&&contains(m,[2,9.075,.5])),true);
 const bad=clone(l);bad.items.push({...bad.items[0],id:'item-bad',offset:1});assert.throws(()=>validateLayout(bad),/overlap/);
});

test('three reusable assets retain native IDs, a source hash and finite, indexed geometry without changing the source',()=>{
 assert.equal(assets.source_sha256,scene.source.sha256);assert.deepEqual(assets.items.map(a=>a.source_definition_id),['161587','1878458','10959990']);
 assert.deepEqual(assets.items.map(a=>a.triangles),[5304,15912,2243]);
 for(const asset of assets.items){assert.ok(asset.size.every(n=>n>0));for(const p of asset.parts){assert.ok(p.positions.every(Number.isFinite));assert.ok(p.indices.every(n=>Number.isInteger(n)&&n>=0&&n<p.positions.length/3));}}
 assert.equal(createHash('sha256').update(JSON.stringify(scene)).digest('hex'),createHash('sha256').update(JSON.stringify(JSON.parse(raw))).digest('hex'));
});

test('reused component copies can move, rotate and resize without modifying the asset definition',()=>{
 const l=presetLayout('blank'),before=JSON.stringify(assets),item=newItem('source-sofa','item-copy',l,assets);Object.assign(item,{x:4,y:3,width:3,depth:1,height:1.1,rotation:90,elevation:.2});l.items.push(item);
 const b=bounds(layoutMeshes(l,assets).filter(m=>m.itemId===item.id)),size=b.max.map((v,i)=>v-b.min[i]);assert.ok(Math.abs(size[0]-1)<.0001);assert.ok(Math.abs(size[1]-3)<.0001);assert.ok(Math.abs(size[2]-1.1)<.0001);assert.ok(Math.abs(b.min[2]-.2)<.0001);assert.equal(JSON.stringify(assets),before);
});

test('a cabinet regenerates panels and shelves from parameters rather than stretching panel thickness',()=>{
 const l=presetLayout('blank'),item=newItem('cabinet','item-cabinet',l,assets);item.width=2.4;item.shelves=4;l.items.push(item);const parts=layoutMeshes(l).filter(m=>m.itemId===item.id);assert.equal(parts.length,9);
 const side=bounds([parts[0]]);assert.ok(Math.abs(side.max[0]-side.min[0]-.018)<1e-8);assert.equal(side.max[2]-side.min[2],item.height);
 item.height=1.5;const changed=bounds(layoutMeshes(l).filter(m=>m.itemId===item.id));assert.equal(changed.max[2],1.5);assert.equal(assessLayout(l).sourceCopies,0);
});

test('exports retain editable parameters, valid 3D indices and escaped labels without implying SKP round-trip support',()=>{
 const l=presetLayout('studio');assert.deepEqual(validateLayout(JSON.parse(JSON.stringify(l))),l);l.name='A & <B>';l.items[2].label='<script>bad</script>';
 const svg=svgDocument(l);assert.ok(svg.startsWith('<?xml'));assert.match(svg,/A &amp; &lt;B&gt;/);assert.doesNotMatch(svg,/<script>/);
 const obj=objDocument(l,assets).trim().split('\n'),vertices=obj.filter(s=>s.startsWith('v ')),faces=obj.filter(s=>s.startsWith('f '));assert.ok(vertices.length>1000);assert.ok(faces.length>5000);for(const line of faces)assert.ok(line.slice(2).split(' ').every(n=>Number(n)>0&&Number(n)<=vertices.length));
 l.items[0].label='=HYPERLINK("https://example.invalid")';assert.match(csvDocument(l),/"'=HYPERLINK/);assert.equal(csvDocument(l).split('\r\n').length,l.items.length+2);
});

test('validation rejects foreign files, non-finite dimensions, unknown assets and out-of-wall openings; concept checks expose spatial conflicts',()=>{
 for(const patch of [{units:'ft'},{schema:'sketchup'},{room:{width:NaN,depth:6,height:3,wall:.15}}])assert.throws(()=>validateLayout({...presetLayout('studio'),...patch}));
 const l=presetLayout('studio'),source=l.items.find(i=>i.asset_id);source.asset_id='unknown';assert.throws(()=>validateLayout(l));
 const bad=presetLayout('blank');bad.items[0].offset=100;assert.throws(()=>validateLayout(bad));
 const c=presetLayout('office');c.items.find(i=>i.kind==='table').x=-2;assert.ok(assessLayout(c).outOfBounds.length);assert.equal(assessLayout(presetLayout('cafe')).overlaps.length,1);
 const rotated={id:'item-a',kind:'table',label:'A',x:2,y:2,width:2,depth:1,height:1,rotation:90,elevation:0};assert.ok(Math.abs(itemCorners(rotated,{wall:.15})[0][0]-2.5)<1e-8);
});

test('3D projection and picking use actual geometry, with a floor drawn behind the design',()=>{
 const l=presetLayout('studio'),camera={yaw:225,pitch:38},faces=projectedFaces(layoutMeshes(l,assets),camera);assert.ok(faces.length>5000);assert.equal(faces[0].itemId,'floor');assert.ok(faces.some(f=>f.itemId===l.items.find(i=>i.asset_id).id));
 assert.ok(projectPoint([1,2,3],camera).every(Number.isFinite));assert.equal(pointInTriangle([.2,.2],[[0,0],[1,0],[0,1]]),true);assert.equal(pointInTriangle([2,2],[[0,0],[1,0],[0,1]]),false);
});

test('undo and redo restore whole designs and clear an abandoned redo branch',()=>{
 const h=createHistory(presetLayout('studio'));h.push(presetLayout('cafe'));assert.equal(h.undo().name,'Studio concept');assert.equal(h.redo().name,'Neighbourhood café concept');h.undo();h.push(presetLayout('office'));assert.equal(h.canRedo,false);assert.equal(h.current.name,'Small office concept');const copy=h.current;copy.name='Changed';assert.equal(h.current.name,'Small office concept');
});

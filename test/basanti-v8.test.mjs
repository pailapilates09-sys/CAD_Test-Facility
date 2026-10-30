import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as v6 from '../public/construction/models/basanti-workbench/v6/proposed-model.js';
import {createMEP,SYSTEMS} from '../public/construction/models/basanti-workbench/v7/mep-model.js';
import {scheduleTasks} from '../public/construction/models/basanti-workbench/work-packages.js';
import {createQuantityRegister,filterItems,workspaceState,groupProgramme,taskDiscipline,csv} from '../public/construction/models/basanti-workbench/v8/register-model.js';
import {programmeSVG,buildingPlan} from '../public/construction/models/basanti-workbench/v8/drawings.js';
import {compactBasantiContents} from '../scripts/basanti-contents.mjs';
const source=JSON.parse(await readFile(new URL('../public/construction/models/basanti-residence/data/project.json',import.meta.url),'utf8')),before=JSON.stringify(source);
v6.setBasisMode('proposal');const ctx=v6.protectV3Steel(v6.createWorkContext(v6.reviewProject(source).project)),packages=ctx.tasks.map(task=>({task,rows:v6.packageForTask(ctx,task).rows})),mep=createMEP(source);mep.system_names=Object.fromEntries(Object.entries(SYSTEMS).map(([k,v])=>[k,v.name]));const register=createQuantityRegister(packages,mep,[...ctx.project.components,...ctx.project.rooms,...ctx.proposals,...ctx.steel]);
test('v8 has unique four-discipline BOQ records and keeps source data and unknown quantities intact',()=>{
 assert.equal(JSON.stringify(source),before);assert.equal(new Set(register.items.map(i=>i.id)).size,register.items.length);
 for(const discipline of ['structure','architecture','mep','interior'])assert.ok(register.items.some(i=>i.discipline===discipline));
 assert.ok(register.items.some(i=>i.quantity===null&&i.basis==='pending'));assert.ok(register.items.every(i=>i.quantity===null||Number.isFinite(i.quantity)&&i.quantity>=0));assert.equal(register.no_grand_quantity_total,true);
 for(const item of register.items){const known=item.lines.every(r=>r.value!==null);assert.equal(item.quantity===null,!known);if(known)assert.ok(Math.abs(item.quantity-item.lines.reduce((n,r)=>n+r.value,0))<1e-9);}
});
test('room-finish quantities split by source floor; floor filtering never substitutes a whole-building tile total',()=>{
 const tile=register.items.filter(i=>i.task_id==='tiles');assert.deepEqual(new Set(tile.map(i=>i.floor)),new Set(['ground','first','second']));
 for(const floor of ['ground','first','second']){const expected=source.rooms.filter(r=>r.level===floor).reduce((n,r)=>n+r.written_width_m*r.written_depth_m,0),actual=filterItems(tile,{floor}).reduce((n,r)=>n+r.quantity,0);assert.ok(Math.abs(expected-actual)<1e-8);}
});
test('v8 keeps excavation union semantics, source/model quantities and study units without double-counting gross pits',()=>{
 const original=packages.find(p=>p.task.id==='excavation').rows,items=register.items.filter(i=>i.task_id==='excavation');assert.equal(items.length,1);assert.equal(items[0].quantity,original.find(r=>r.sum).value);assert.equal(items[0].lines.length,1);
 assert.ok(register.items.filter(i=>i.task_id==='formation').every(i=>i.basis==='reference'));assert.ok(register.items.filter(i=>i.task_id==='primer').every(i=>i.basis==='reference'));assert.ok(register.items.filter(i=>/^wall-.*-layout$/.test(i.task_id??'')).every(i=>i.basis==='reference'));
 assert.ok(register.items.some(i=>i.basis==='study'&&i.unit==='display paths'));assert.ok(!filterItems(register.items,{basis:'quantified'}).some(i=>['study','reference'].includes(i.basis)));
});
test('MEP quantities count every v7 route once and replace legacy schematic service records',()=>{
 const lines=register.items.filter(i=>i.id.startsWith('M-route-')).flatMap(i=>i.lines);assert.equal(lines.length,mep.runs.length);assert.equal(new Set(lines.map(i=>i.id)).size,mep.runs.length);
 assert.ok(Math.abs(lines.reduce((n,i)=>n+i.value,0)-mep.runs.reduce((n,r)=>n+r.length_m,0))<1e-8);assert.equal(register.items.filter(i=>i.id.startsWith('M-fixture-')).length,mep.fixtures.length);
 assert.ok(!register.items.some(i=>i.origin==='building'&&i.discipline==='mep'));assert.ok(register.omitted.some(i=>i.task==='plumbing-chases'));
});
test('BOQ search, basis filters, empty results and null CSV fields remain truthful',()=>{
 const furniture=filterItems(register.items,{discipline:'interior',query:'furniture'});assert.ok(furniture.length);assert.ok(furniture.every(i=>i.basis==='proposal'));assert.equal(filterItems(register.items,{query:'definitely-absent-999'}).length,0);
 assert.ok(filterItems(register.items,{basis:'pending'}).every(i=>i.quantity===null));assert.equal(csv([['unknown',null],['zero',0]]),'"unknown",""\r\n"zero","0"\r\n');
});
test('Gantt filters retain original absolute starts and separate calendar-day/workday schedules',()=>{
 const scheduled=scheduleTasks(ctx.tasks),building={name:'Building',unit:'calendar days',duration:scheduled.duration,groups:{},tasks:scheduled.tasks.map(t=>({...t,discipline:taskDiscipline(t)}))};
 const groups=groupProgramme(building,{discipline:'structure',floor:'ground'}),rows=groups.flatMap(g=>g.tasks);assert.ok(rows.length);for(const row of rows)assert.equal(row.start,scheduled.tasks.find(t=>t.id===row.id).start);
 for(const g of groups){assert.equal(g.start,Math.min(...g.tasks.map(t=>t.start)));assert.equal(g.finish,Math.max(...g.tasks.map(t=>t.finish)));}
 const svg=programmeSVG(groups,building,{expanded:true});assert.ok(svg.includes('calendar days'));assert.ok(!/NaN|Infinity/.test(svg));assert.equal(groupProgramme(building,{query:'impossible-999'}).length,0);
});
test('workspace rejects unknown state and grouped contents retain original anchor IDs and links',()=>{
 const s=workspaceState(new URLSearchParams('panel=unknown&floor=attic&programme=mars&basis=bad'));assert.equal(s.panel,'overview');assert.equal(s.floor,'all');assert.equal(s.programme,'building');assert.equal(s.basis,'all');
 const html='<nav class="org-contents project-contents" id="page-contents"><h2 id="contents-heading">Long contents</h2><ol><li><a href="#drawing-plan">01 · Detailed 2D drawing</a></li><li><a href="#programme-panel">04 · Long Gantt programme</a></li><li><a href="#fabrication-panel">Proposed pieces and steel assembly</a></li></ol></nav>',changed=compactBasantiContents(html,'construction/models/basanti-workbench/v6/index.html');
 for(const id of ['page-contents','contents-heading'])assert.ok(changed.includes('id="'+id+'"'));for(const id of ['drawing-plan','programme-panel','fabrication-panel'])assert.ok(changed.includes('href="#'+id+'"'));assert.ok(changed.includes('<summary>Views</summary>'));assert.ok(changed.includes('<summary>Gantt</summary>'));assert.ok(!changed.includes('Long Gantt programme'));
});
test('interior proposal plan uses the same assembly world transform as the 3D adapter',()=>{
 const svg=buildingPlan({...source,rooms:[]},[{id:'chair',label:'Chair',level:'ground',geometry:{type:'assembly',x:10,y:3,z:0,rotation:90,parts:[{x:1,y:0,z:0,width:2,depth:1,height:1}]}}],{interior:true});
 assert.ok(svg.includes('9.5,-3'));assert.ok(svg.includes('10.5,-5'));assert.ok(!/NaN|Infinity/.test(svg));
});
test('grouped contents recognise generated heading anchors inside their owning MEP or interior panel',()=>{
 const html='<nav class="org-contents"><h2>Contents</h2><ol><li><a href="#generated-plan-title">01 · Long working-drawing study</a></li><li><a href="#generated-room-title">Explore rooms by floor</a></li></ol></nav><section id="four-views"><section id="plan-panel"><h2 id="generated-plan-title">2D drawing</h2></section></section><section id="room-explorer"><h2 id="generated-room-title">Rooms</h2></section>',result=compactBasantiContents(html,'construction/models/basanti-workbench/v7/index.html');
 assert.ok(result.includes('<summary>Views</summary>'));assert.ok(result.includes('href="#generated-plan-title">Plan</a>'));assert.ok(result.includes('href="#generated-room-title">Rooms</a>'));assert.ok(!result.includes('Long working-drawing'));
});

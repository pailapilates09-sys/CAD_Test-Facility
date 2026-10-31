import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createMEP} from '../public/construction/models/basanti-workbench/v7/mep-model.js';
import {workspaceState,filterItems,filteredRuns,routeComponents,preferredSelection,selectedPlanLevel,placeFloorLabels} from '../public/construction/models/basanti-workbench/v9/workspace-model.js';

const project=JSON.parse(await readFile(new URL('../public/construction/models/basanti-residence/data/project.json',import.meta.url)));
const mep=createMEP(project);

test('v9 validates shared viewer state and keeps a selected route, layout and camera bookmark',()=>{
  const state=workspaceState(new URLSearchParams('panel=views&discipline=mep&system=cold&element=CW-G-B&layout=model&camera=top'));
  assert.equal(state.system,'cold');assert.equal(state.element,'CW-G-B');assert.equal(state.layout,'model');assert.equal(state.camera,'top');
  const invalid=workspaceState(new URLSearchParams('system=unknown&camera=inside&layout=missing&sort=arbitrary'));
  assert.equal(invalid.system,'all');assert.equal(invalid.camera,'iso');assert.equal(invalid.layout,'split');assert.equal(invalid.sort,'code');
});

test('MEP service, floor and multiword search use the source route list without modifying coordinates',()=>{
  const before=JSON.stringify(mep),runs=filteredRuns(mep,{system:'cold',floor:'ground',query:'cold DN15'});
  assert.ok(runs.length);assert.ok(runs.every(r=>r.system==='cold'&&r.level==='ground'&&r.size.includes('DN15')));
  assert.equal(filteredRuns(mep,{query:'absent-route-999'}).length,0);
  const components=routeComponents(filteredRuns(mep));
  assert.equal(components.length,mep.runs.length);assert.equal(new Set(components.map(c=>c.id)).size,mep.runs.length);
  for(const component of components)assert.deepEqual(component.geometry.points,mep.runs.find(r=>r.id===component.id).points);
  assert.equal(JSON.stringify(mep),before);
});

test('all-floor plans follow the selected route and default to a ground route when available',()=>{
  const components=routeComponents(mep.runs),ground=preferredSelection(components,null);
  assert.equal(components.find(c=>c.id===ground).level,'ground');
  const first=components.find(c=>c.level==='first');assert.equal(preferredSelection(components,first.id),first.id);
  assert.equal(selectedPlanLevel(components,first.id),'first');assert.equal(selectedPlanLevel(components,first.id,'roof'),'roof');
  assert.equal(preferredSelection([],null),null);
});

const items=[
  {id:'a',code:'1',label:'Concrete',discipline:'structure',floor:'ground',unit:'m³',quantity:9,basis:'model',origin:'building',task_id:'frame',lines:[]},
  {id:'b',code:'2',label:'Held concrete',discipline:'structure',floor:'ground',unit:'m³',quantity:null,basis:'pending',origin:'building',task_id:'frame-other',lines:[]},
  {id:'c',code:'3',label:'Tiles',discipline:'interior',floor:'ground',unit:'m²',quantity:20,basis:'model',origin:'building',task_id:'finish',lines:[]},
  {id:'d',code:'4',label:'Concrete 2',discipline:'structure',floor:'first',unit:'m³',quantity:12,basis:'model',origin:'building',task_id:'frame',lines:[]}
];
test('BOQ unit and quantity ordering keep nulls last and never combine different units',()=>{
  const before=JSON.stringify(items),rows=filterItems(items,{unit:'m³',sort:'quantity'});
  assert.deepEqual(rows.map(r=>r.id),['d','a','b']);assert.equal(rows.at(-1).quantity,null);
  assert.deepEqual(filterItems(items,{unit:'m²'}).map(r=>r.id),['c']);
  assert.equal(JSON.stringify(items),before);
});

test('activity-to-BOQ navigation matches the exact task and origin, not a similar code or prefix',()=>{
  assert.deepEqual(filterItems(items,{related:'building:frame'}).map(r=>r.id),['a','d']);
  assert.equal(filterItems(items,{related:'mep:frame'}).length,0);
  assert.equal(filterItems(items,{related:'building:frame',floor:'ground'}).length,1);
});

test('coincident floor labels stay readable in top and steep views without changing their anchors',()=>{
  const labels=['ground','first','second','roof'].map(id=>({id,anchor:[150,200,0]})),before=JSON.stringify(labels);
  const placed=placeFloorLabels(labels,320,400);
  assert.equal(placed.length,4);
  for(let i=1;i<placed.length;i++)assert.ok(placed[i].y-placed[i-1].y>=18);
  assert.ok(placed.every(label=>label.y>=14&&label.y<=386&&label.x>=14&&label.x+126<=320));
  assert.equal(JSON.stringify(labels),before);
});

test('floor labels at the viewport edge remain inside it and off-screen anchors are omitted',()=>{
  const labels=[{id:'a',anchor:[310,399]},{id:'b',anchor:[315,398]},{id:'c',anchor:[100,397]},{id:'hidden',anchor:[-20,100]}];
  const placed=placeFloorLabels(labels,320,400);
  assert.equal(placed.length,3);assert.ok(!placed.some(label=>label.id==='hidden'));
  for(let i=1;i<placed.length;i++)assert.ok(placed[i].y-placed[i-1].y>=18);
  assert.ok(placed.every(label=>label.y>=14&&label.y<=386&&label.x>=14&&label.x+126<=320));
});

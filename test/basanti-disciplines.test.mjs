import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {architectureState,packageAllowsKind,filterInteriorRooms,interiorState} from '../public/construction/models/basanti-residence/discipline-model.js';
import {disciplineNavigation,groupStructureControls,groupMEPScenario} from '../scripts/basanti-interface.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8'),source=JSON.parse(await read('public/construction/models/basanti-residence/data/project.json'));
test('Basanti opens in architecture, accepts valid shared room links and rejects unknown scopes',()=>{
 assert.deepEqual(architectureState(new URLSearchParams(),source),{level:'ground',viewPackage:'architecture',query:'',tab:'elements'});
 assert.equal(architectureState(new URLSearchParams('level=first&register=rooms'),source).tab,'rooms');
 assert.equal(architectureState(new URLSearchParams('level=attic&package=unknown&register=bad'),source).level,'ground');
 assert.equal(architectureState(new URLSearchParams('level=attic&package=unknown&register=bad'),source).viewPackage,'architecture');
 for(const kind of ['door','window','wall','slab','stair'])assert.equal(packageAllowsKind('architecture',kind),true);
 for(const kind of ['column','footing','rebar','sill band'])assert.equal(packageAllowsKind('architecture',kind),false);
 assert.equal(packageAllowsKind('reinforcement','rebar'),true);assert.equal(packageAllowsKind('structure','column'),true);assert.equal(packageAllowsKind('all','rebar'),true);
});
test('interior filters use the seven original room records without introducing furniture or changing dimensions',()=>{
 const before=JSON.stringify(source.rooms);
 assert.equal(filterInteriorRooms(source.rooms).length,3);
 assert.deepEqual(filterInteriorRooms(source.rooms,{level:'all',query:'BEDROOM first'}).map(r=>r.id),['f-bed1','f-bed2']);
 assert.deepEqual(filterInteriorRooms(source.rooms,{level:'second',query:'store'}).map(r=>r.id),['s-store']);
 assert.equal(filterInteriorRooms(source.rooms,{level:'all',query:'sofa'}).length,0);
 assert.equal(JSON.stringify(source.rooms),before);assert.equal(source.rooms.length,7);
 assert.equal(interiorState(new URLSearchParams('level=roof')).level,'ground');
});
test('four distinct discipline pages use native navigation and a single current-page indicator',()=>{
 for(const [path,label] of [['basanti-residence/index.html','Architecture'],['basanti-workbench/v6/index.html','Structure'],['basanti-workbench/v7/index.html','MEP'],['basanti-residence/interior.html','Interior & Furniture']]){
  const html=disciplineNavigation('construction/models/'+path);assert.equal((html.match(/aria-current="page"/g)??[]).length,1);assert.ok(html.includes('<strong>'+label+'</strong>'));assert.equal((html.match(/class="bd-tab-number"/g)??[]).length,4);assert.ok(!html.includes('role="tab"'));
 }
 assert.ok(!disciplineNavigation('construction/models/basanti-residence/milestone.html').includes('aria-current'));
});
test('regrouping structural and MEP forms preserves every input ID, name and option',async()=>{
 const structure=await read('public/construction/models/basanti-workbench/v3/index.html'),mep=await read('public/construction/models/basanti-workbench/v7/index.html');
 const tokens=s=>[...s.matchAll(/<(?:input|select|option)\b[^>]*>/g)].map(m=>m[0]).sort();
 const grouped=groupStructureControls(structure);assert.deepEqual(tokens(grouped),tokens(structure));assert.ok(grouped.includes('Drawing labels, panel layout &amp; bar filters'));
 const scenario=groupMEPScenario(mep);assert.deepEqual(tokens(scenario),tokens(mep));assert.equal((scenario.match(/<fieldset>/g)??[]).length,3);
 for(const title of ['Water demand & pressure','Roof drainage','Electrical sizing'])assert.ok(scenario.includes('<legend>'+title+'</legend>'));
});

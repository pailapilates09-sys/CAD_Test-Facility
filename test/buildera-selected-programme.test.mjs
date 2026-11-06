import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyseSelectedWorks,renderSelectedWorks} from '../scripts/buildera-selected-works.mjs';
import {buildSelectedProgramme,selectedProgrammeCsv} from '../scripts/buildera-selected-programme.mjs';
import {resolveSelectedImages} from '../scripts/buildera-selected-images.mjs';

const dir=new URL('../public/construction/estimates/pilates-buildera-2-selected-works/',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,dir),'utf8'));
const [source,rules,refs,astra]=await Promise.all([
 read('selection.json'),read('../pilates-astra-2026-10-15/v14/planning-rules.json'),
 read('work-images.json'),read('../pilates-astra-2026-10-15/v6/image-register.json')
]);
const model=analyseSelectedWorks(source);
const plan=buildSelectedProgramme(model.items,rules);
const activity=id=>plan.activities.find(x=>x.id===id);

test('programme covers the same 12 quoted works and keeps flooring behind the readiness gates',()=>{
 assert.deepEqual(plan.lanes.flatMap(row=>row.workId?[row.workId]:[]).sort((a,b)=>a-b),source.items.map(x=>x.id));
 const floor=activity('w1-lay');
 assert.equal(floor.workdays,9);
 assert.match(floor.basis,/160\.25 m² ÷ 20 m²/);
 assert.ok(floor.start>=activity('floor-check').finish);
 for(const id of ['w3-set','w9-set','w7-fit','w11-paint-ready'])assert.ok(activity('floor-check').depends.includes(id));
 assert.ok(activity('w3-template').note.includes('may overlap'));
 assert.ok(activity('w9-template').note.includes('may overlap'));
 assert.equal(activity('w7-lead').kind,'allowance');
 assert.deepEqual(activity('w7-lead').crew,{});
 assert.equal(model.total,1413651695);
});

test('work waits for its predecessors, and a second paint crew reduces the assumed completion time',()=>{
 for(const row of plan.activities)for(const before of row.depends)assert.ok(row.start>=activity(before).finish);
 const paint=plan.activities.filter(x=>x.crew.paint);
 for(let day=0;day<plan.duration;day++)assert.ok(paint.filter(x=>x.days.includes(day)).length<=1);
 const parallel=buildSelectedProgramme(model.items,rules,{paintCrews:2});
 assert.ok(parallel.duration<plan.duration);
 assert.equal(plan.activities.length,parallel.activities.length);
 assert.match(selectedProgrammeCsv(plan),/"w1-lay","1","Install laminate and underlay"/);
});

test('all works show a verified reference image and have an in-page schedule link',async()=>{
 const images=await resolveSelectedImages(dir,model.items,refs,astra);
 assert.equal(images.size,12);
 assert.equal(new Set([...images.values()].map(x=>x.src)).size,7);
 assert.equal(images.get(1).kind,'generated');
 assert.equal(images.get(5).license,'CC BY-SA 4.0');
 const html=renderSelectedWorks(model,'qa',{programme:plan,images});
 assert.match(html,/Illustrative finish: working day/);
 assert.equal((html.match(/<figure class="swx-work-image">/g)??[]).length,12);
 assert.equal((html.match(/<div class="swx-track" role="img"/g)??[]).length,16);
 for(const id of model.items.map(x=>String(x.id).padStart(2,'0'))){
  assert.ok(html.includes('id="selected-work-'+id+'"'));
  assert.ok(html.includes('href="#selected-work-'+id+'"'));
 }
 assert.match(html,/Panamitsu/);
 assert.match(html,/AI illustration/);
});

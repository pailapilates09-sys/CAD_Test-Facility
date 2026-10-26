import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {workbenchNavigation,renderProjectHub} from '../scripts/building-navigation.mjs';
import {historicalScript} from '../scripts/building-history.mjs';
const base=new URL('../public/construction/models/',import.meta.url);
const read=path=>readFile(new URL(path,base),'utf8');
const manifest=JSON.parse(await read('basanti-workbench/versions.json'));
const archive=await readFile(new URL('basanti-workbench/history/v1-source.json.gz',base));
const frozen=JSON.parse(gunzipSync(archive));
const assertAnchors=html=>{const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'section IDs must be unique');for(const [,id]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),'contents must land on '+id);};
test('Basanti hub derives recorded versions and measured coverage, with resolvable section links',async()=>{
 const project=JSON.parse(await read('basanti-residence/data/project.json'));
 const html=renderProjectHub(manifest,project,{work_packages:112,quantity_rows:707,programme_duration_calendar_days:241});
 assertAnchors(html);assert.match(html,/133<\/strong>/);assert.match(html,/112<\/strong>/);assert.match(html,/707<\/strong>/);
 for(const version of manifest.versions)assert.ok(html.includes('href="../basanti-workbench/'+version.id+'/"'));
 assert.match(html,/not the Paila Pilates resource programme/);assert.match(html,/without a crew calendar/);
});
test('both workbench shells retain control IDs and expose every contents target without changing the v1 archive',async()=>{
 assert.equal(createHash('sha256').update(archive).digest('hex'),manifest.versions[0].archive_sha256);
 for(const original of [frozen.files['index.html'],await read('basanti-workbench/index.html')]){
  const html=workbenchNavigation(original,'project.css');assertAnchors(html);
  for(const id of ['work-plan','model-host','quantity-rows','task-select','gantt-chart','scenario-form'])assert.match(html,new RegExp('id="'+id+'"'));
  assert.equal((html.match(/id="work-programme"/g)??[]).length,1);
 }
});
test('v1 preserves model isolation but resolves PDF and original-sheet resources outside its frozen module folder',()=>{
 const text=historicalScript("fetch('../basanti-residence/data/project.json');import x from '../basanti-residence/building-model.js';const pdf='../basanti-residence/source/original.pdf';const image='../basanti-residence/sheets/sheet-07.svg';",'123');
 assert.match(text,/\.\/building\/data\/project.json/);assert.match(text,/\.\/building\/building-model.js/);
 assert.match(text,/\.\.\/\.\.\/basanti-residence\/source\/original.pdf/);assert.match(text,/\.\.\/\.\.\/basanti-residence\/sheets\/sheet-07.svg/);
});

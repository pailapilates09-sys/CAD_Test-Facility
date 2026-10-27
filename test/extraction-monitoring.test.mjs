import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildMonitoring,renderMonitoring} from '../scripts/extraction-monitoring.mjs';
import {growthChart} from '../public/progress/monitoring-charts.js';
const root=new URL('../',import.meta.url),ptr=JSON.parse(readFileSync(new URL('progress/recovery/current.json',root)));
const status=JSON.parse(readFileSync(new URL('progress/recovery/'+ptr.path,root)));
const refs=JSON.parse(readFileSync(new URL('public/progress/visualization-references.json',root))).projects;
test('monitoring preserves physical occurrence grain, unknown denominator and source-stage boundaries',()=>{
 const d=buildMonitoring(status),s=status.lanes.find(l=>l.id==='MSCH'),last=d.history.at(-1);
 assert.equal(last.rows,s.inventory.rows);assert.equal(last.files,s.inventory.files);assert.equal(last.folders,s.inventory.folders);
 assert.equal(d.queue.pending,s.inventory.pendingFolders);assert.equal(d.hashing.verified+d.hashing.deferred,d.hashing.total);assert.equal(d.overallCompletionPercent,null);
 assert.ok(d.history.every((p,i)=>p.rows===p.files+p.folders&&(!i||p.cp>d.history[i-1].cp)));
 assert.equal(d.collections.some(c=>c.id==='AEC'),false);
});
test('all ten references have source links, an implemented destination and explicit capability limits',()=>{
 assert.equal(refs.length,10);assert.equal(new Set(refs.map(p=>p.repo)).size,10);
 const html=renderMonitoring(buildMonitoring(status),refs);
 for(const p of refs){assert.ok(p.repo.startsWith('https://github.com/'));assert.ok(p.limit.length>20);assert.ok(html.includes(p.repo));assert.ok(['Apache-2.0','MIT'].includes(p.license));}
 assert.ok(!/download_url|@gmail\.com|drive\.google\.com/.test(html));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
});
test('the growth figure starts at zero and does not fill gaps with invented records',()=>{
 const html=growthChart([{cp:10,rows:100},{cp:30,rows:300}]);
 assert.ok(html.includes('vertical scale starts at zero'));assert.ok(html.includes('data-cp="10"'));assert.ok(html.includes('data-cp="30"'));assert.ok(!html.includes('data-cp="20"'));
});

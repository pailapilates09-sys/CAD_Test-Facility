import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {livePhase} from '../src/live-phase.mjs';
import {renderRecovery} from '../scripts/render-progress-recovery.mjs';

const root=new URL('../progress/recovery/',import.meta.url);
const current=JSON.parse(await readFile(new URL('current.json',root),'utf8'));
const recovery=JSON.parse(await readFile(new URL(current.path,root),'utf8'));

test('current recovery retains the last saved checkpoint of every source lane',()=>{
 assert.deepEqual(recovery.lanes.map(l=>l.id),['MSCS','LSA','AEC','MSCH']);
 assert.equal(recovery.session.completedPhases,Number(livePhase.phase));
 assert.equal(recovery.session.lastSessionCheckpoints,livePhase.sessionReport.milestones);
 for(const lane of recovery.lanes){
  const prior=livePhase.sessionReport[lane.id];
  assert.equal(lane.sync.local,prior.local);
  assert.equal(lane.sync.mainConsumed,prior.mainCursor);
  assert.equal(lane.sync.pendingSequences,lane.sync.local-lane.sync.mainConsumed);
  assert.equal(lane.sync.mainAck,'PENDING');
  if(lane.id==='MSCS')assert.equal(lane.metric.done,prior.afterHashed);
  if(lane.id==='LSA')assert.equal(lane.metric.done,prior.afterRows);
  if(lane.id==='MSCH')assert.equal(lane.inventory.rows,prior.afterRows);
  if(prior.checkpoint){assert.ok(prior.checkpoint.includes(lane.checkpoint));assert.ok(prior.checkpoint.includes(lane.batch));}
 }
});

test('recovery reports stage-specific progress and preserves unknown totals and public boundaries',()=>{
 for(const lane of recovery.lanes){
  if(lane.metric)assert.equal(lane.metric.done+lane.metric.remaining,lane.metric.total);
  if(lane.inventory)assert.equal(lane.inventory.files+lane.inventory.folders,lane.inventory.rows);
  if(['AEC','MSCH'].includes(lane.id))assert.equal(lane.metric,null);
 }
 const html=renderRecovery(recovery);
 const visible=html.replace(/<[^>]*>/g,'');
 for(const lane of recovery.lanes){assert.ok(visible.includes(lane.checkpoint));assert.ok(visible.includes(lane.next.batch));}
 const json=JSON.stringify(recovery);
 assert.ok(!/@gmail\.com|download_url|[?&]sig=|b64_string|npr_per_kg|1kyKGgFi5KRHHw-PLHsyntG2_36ameSYJ|1-6TwlYLwF8-xMa1An-KJFCBfdA1ZLrNU/i.test(json));
 assert.ok(!/NaN|undefined|Infinity/.test(visible));
 assert.ok(visible.includes('Terminal closure incomplete'));
 assert.ok(visible.includes('total unknown'));
});

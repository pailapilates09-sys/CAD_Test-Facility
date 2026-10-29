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
  assert.equal(lane.sync.mainAck,lane.sync.pendingSequences===0?'ACKED':'PENDING');
  assert.ok(lane.sync.pendingSequences>=0);
  if(!recovery.execution.inProgress)assert.equal(lane.sync.pendingSequences,0);
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
 assert.ok(visible.includes(recovery.lanes.find(l=>l.id==='AEC').evidence.g076RecoveryReissued?'Recovery closure verified':'Terminal closure incomplete'));
 assert.ok(visible.includes('total unknown'));
 assert.ok(visible.includes(recovery.lanes.every(l=>l.sync.pendingSequences===0)?'Main acknowledgements verified':'Local verified · Main pending'));
 assert.equal(visible.includes('No pending notice'),recovery.lanes.some(l=>l.sync.noticeState==='IDLE'));
 assert.equal(visible.includes('Local work is ahead'),recovery.lanes.some(l=>l.sync.pendingSequences>0));
 const lsa=recovery.lanes.find(l=>l.id==='LSA');
 assert.equal(lsa.sourceTreeAudit.folderListings,140);
 assert.equal(lsa.sourceTreeAudit.observedRows,lsa.inventory.rows);
 assert.equal(lsa.sourceTreeAudit.historicalFileGap,lsa.metric.remaining);
 assert.equal(lsa.sourceTreeAudit.historicalBytesGap,9304);
});

test('resumed run meets its time window and its checkpoint deltas reconcile to current lanes',()=>{
 const run=recovery.execution;
 assert.ok(run);
 const end=run.inProgress?recovery.checkedAt:run.stoppedAt;
 const elapsed=(Date.parse(end)-Date.parse(run.startedAt))/60000;
 assert.ok(elapsed>=0);
 if(run.inProgress)assert.equal(run.stoppedAt,null);
 if(run.durationPolicy==='maximum'){
  assert.ok(Number.isFinite(run.maximumMinutes)&&run.maximumMinutes>0);
  assert.ok(elapsed<=run.maximumMinutes);
  assert.equal(Date.parse(run.deadline),Date.parse(run.startedAt)+run.maximumMinutes*60000);
  assert.equal(run.maximumWindowRespected,elapsed<=run.maximumMinutes);
 }else{
  if(!run.inProgress)assert.ok(elapsed>=run.minimumMinutes);
  assert.equal(run.minimumWindowMet,elapsed>=run.minimumMinutes);
 }
 assert.ok(Math.abs(elapsed-run.elapsedMinutes)<0.01);
 assert.equal(run.checkpoints.length,recovery.session.lastSessionCheckpoints);
 assert.equal(run.debtClearance.initialEvents+run.debtClearance.newEvents-run.debtClearance.remainingEvents,run.debtClearance.totalAcknowledgedEvents);
 const supplemental=run.supplementalEvents??[];
 assert.equal(run.debtClearance.newEvents,run.checkpoints.length+supplemental.length);
 assert.equal(new Set(supplemental.map(e=>e.lane)).size,supplemental.length);
 for(const event of supplemental){
  const lane=recovery.lanes.find(l=>l.id===event.lane);
  assert.ok(lane);
  assert.equal(event.sequence,lane.sync.local);
  assert.equal(event.providerReadback,'PASS');
  assert.equal(event.canonicalPromotion,lane.supplementalEvidence.canonicalPromotion);
  assert.match(lane.supplementalEvidence.sha256,/^[a-f0-9]{64}$/);
 }
 assert.equal(run.debtClearance.remainingEvents,recovery.lanes.reduce((n,l)=>n+l.sync.pendingSequences,0));
 if(!run.inProgress)assert.equal(run.debtClearance.remainingEvents,0);
 for(const id of ['LSA','MSCH']){
  const rows=run.checkpoints.filter(r=>r.lane===id);
  const prior=livePhase.sessionReport[id].beforeRows;
  let total=prior;
  for(const row of rows){
   total+=row.added.rows;
   assert.equal(row.after.rows,total);
   assert.equal(row.added.files+row.added.folders,row.added.rows);
   assert.match(row.manifest.sha256,/^[a-f0-9]{64}$/);
   assert.ok(Date.parse(row.completedAt)>=Date.parse(run.startedAt));
   assert.ok(Date.parse(row.completedAt)<=Date.parse(end));
  }
  assert.equal(total-prior,run.added[id]);
  const lane=recovery.lanes.find(l=>l.id===id);
  assert.equal(total,lane.metric?.done??lane.inventory.rows);
 }
 const html=renderRecovery(recovery);
 assert.ok(!html.includes('No new source batch was performed'));
 for(const lane of recovery.lanes)assert.ok(html.includes(lane.checkpoint));
});

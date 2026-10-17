const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const number = value => Number(value).toLocaleString('en-IN');
const percent = metric => (metric.done / metric.total * 100).toFixed(1);

export function renderRecovery(status) {
  const date = value => new Intl.DateTimeFormat('en-GB', {timeZone: status.timezone, day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}).format(new Date(value));
  const run = status.execution;
  const allAcknowledged = status.lanes.every(lane => lane.sync.pendingSequences === 0 && lane.sync.mainAck === 'ACKED');
  const heading = run?.inProgress ? 'Extraction running — saved checkpoint' : run ? 'Four-project extraction progress' : 'Four-project work recovered';
  const introduction = run?.inProgress
    ? `${number(run.checkpoints.length)} new source checkpoints are saved. The source window is still running; ${run.elapsedMinutes.toFixed(2)} minutes recorded ${run.durationPolicy === 'maximum' ? `within the maximum ${run.maximumMinutes} minutes` : `toward the minimum ${run.minimumMinutes} minutes`}. LSA added ${number(run.added.LSA)} records; MSCH added ${number(run.added.MSCH)} entries.`
    : run
    ? `${number(run.checkpoints.length)} source and audit checkpoints passed provider readback and Local closeout in ${run.elapsedMinutes.toFixed(2)} minutes. LSA added ${number(run.added.LSA)} catalogue records; MSCH added ${number(run.added.MSCH)} entries.`
    : `The saved source data and Git history survived. ${number(status.session.completedPhases)} completed phases are recorded, including ${number(status.session.lastSessionCheckpoints)} verified checkpoints in the last source session.`;
  const resume = status.continuation.rotation.map(id => {
    const lane = status.lanes.find(lane => lane.id === id);
    return `${id} ${lane.next.batch} (${lane.next.target})`;
  }).join(' → ');
  const latest = status.lanes.map(lane => {
    const progress = lane.metric
      ? `${number(lane.metric.done)} / ${number(lane.metric.total)} ${esc(lane.metric.unit)} · ${percent(lane.metric)}%<br><small>${esc(lane.metric.label)}; ${number(lane.metric.remaining)} remaining</small>`
      : lane.inventory
        ? `${number(lane.inventory.rows)} catalogue entries<br><small>${number(lane.inventory.folders)} folders · ${number(lane.inventory.files)} files · ${number(lane.inventory.pendingFolders)} folders pending; total unknown</small>`
        : `${esc(lane.evidence.rateIds.join(' / '))} present<br><small>Terminal closure incomplete; overall total unknown</small>`;
    return `<tr><th scope="row">${esc(lane.id)}<br><small>${esc(lane.stage)}</small></th><td>${esc(lane.checkpoint)}<br><small>${esc(lane.batch)}</small></td><td>${progress}</td><td><span class="pill ${lane.state.startsWith('READY') ? 'green' : 'amber'}">${esc(lane.stateLabel)}</span><br><small>${esc(lane.blocker)}</small></td><td><b>${esc(lane.next.batch)}</b><br>${esc(lane.next.target)}</td></tr>`;
  }).join('');
  const sync = status.lanes.map(lane => `<tr><th scope="row">${esc(lane.id)}</th><td>${number(lane.sync.local)}</td><td>${number(lane.sync.mainConsumed)}</td><td>${number(lane.sync.pendingSequences)}</td><td>${lane.sync.notice ? esc(lane.sync.notice) + (lane.sync.mainAck === 'ACKED' ? ' acknowledged' : ' pending') : lane.sync.pendingSequences === 0 ? 'No pending notice' : 'Pending sync'}</td></tr>`).join('');
  return `<section class="block" id="current-status" aria-label="Current recovered four-project status">
<div class="block-header"><div><h2>${heading}</h2><p>Verified ${esc(date(status.checkedAt))} NPT · last source session ${esc(date(status.lastSourceSessionCompletedAt))} NPT</p></div><span class="pill ${allAcknowledged ? 'green' : 'amber'}">${allAcknowledged ? 'Main acknowledgements verified' : run ? 'Local verified · Main pending' : 'Recovered · open debts'}</span></div>
<div class="chart-body"><p class="section-copy">${introduction}</p>
<div class="table-scroll"><table class="matrix"><caption style="text-align:left">Latest verified checkpoint for each lane. Percentages describe the named stage.</caption><thead><tr><th>Lane / stage</th><th>Checkpoint</th><th>Preserved work</th><th>Current state</th><th>Next batch / target</th></tr></thead><tbody>${latest}</tbody></table></div>
<p class="metric-note">Metadata cataloguing and byte hashing are separate from source-content extraction. MSCS, LSA and MSCH document/video/semantic extraction has not started. ${run ? 'This run advanced the metadata catalogues; videos, archives and model files remain unextracted.' : 'No new source batch was performed during this recovery.'}</p>
<details><summary class="report-heading">Main acknowledgements and recovery evidence</summary><p class="section-copy">${allAcknowledged ? 'All four Local and Main cursors agree. Reciprocal Local acknowledgements, Main mailbox states and the final frozen Main record passed provider readback. Source-stage gates remain visible above.' : 'Local work is ahead of Main acknowledgement. The pending notices and Local SyncState describe the work awaiting consumption.'}</p><div class="table-scroll"><table class="matrix"><thead><tr><th>Lane</th><th>Local</th><th>Main consumed</th><th>Unconsumed sequences</th><th>Notice</th></tr></thead><tbody>${sync}</tbody></table></div><ul class="next-list">${status.lanes.map(lane => `<li><b>${esc(lane.id)}:</b> ${esc(lane.evidence.agreement)}</li>`).join('')}</ul></details>
<p class="section-copy"><b>Resume point:</b> ${esc(resume)}. Retain one verified checkpoint per phase and preserve each checkpoint before continuing. The current run follows the latest user-authorized duration.</p>
<p class="chart-note">${allAcknowledged ? 'This run completed Main reconciliation and reciprocal acknowledgements. Scheduler state was unchanged.' : `${run ? 'This run' : 'This recovery'} did not restart the scheduler or advance Main acknowledgements.`} JP Cost is a separate pipeline; its raw-page totals below remain historical.</p>
<div class="export-tools"><a class="plain-button" href="./recovery/status.json" download>Download current status JSON ↓</a><a class="plain-button" href="./recovery/report.md">Read the checkpoint report ↗</a><a class="plain-button" href="https://github.com/pailapilates09-sys/CAD_Test-Facility/commits/main/src/live-phase.mjs">Open checkpoint version history ↗</a></div></div></section>`;
}

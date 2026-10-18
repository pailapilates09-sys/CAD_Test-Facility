const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const num = value => Number(value).toLocaleString('en-IN');

export function renderExtractionRoadmap(status) {
  const lane = id => status.lanes.find(item => item.id === id);
  const m = lane('MSCH'), l = lane('LSA'), s = lane('MSCS'), a = lane('AEC');
  const cards = [
    {item:m, title:'Hydropower research', label:'Ready to resume', ready:true,
      current:`${num(m.inventory.rows)} identities catalogued; ${num(m.inventory.pendingFolders)} folders still queued.`,
      next:`${m.next.batch} — ${m.next.target}. Continue the FIFO catalogue, one verified folder checkpoint at a time.`,
      gate:'Finish the catalogue and establish its full scope, then define the selected sources and content-extraction rules.',
      later:'Extract approved document text, OCR and media/model content; validate provenance before building research knowledge.'},
    {item:l, title:'Lok Sewa study', label:'Reconciliation gate', ready:false,
      current:`${num(l.metric.done)} of ${num(l.metric.total)} inventory occurrences recorded. The historical gap is two files and 9,304 bytes.`,
      next:`${l.next.batch} — reconcile the historical baseline against the current source tree.`,
      gate:'Resolve the two-file discrepancy with evidence and close the matching checkpoint; a matching sync cursor alone does not resolve it.',
      later:'Choose the document/OCR/video extraction scope, then build source-linked study material after content validation.'},
    {item:s, title:'Structural archive', label:'Hash policy gate', ready:false,
      current:`${num(s.metric.done)} of ${num(s.metric.total)} files hashed; ${num(s.metric.remaining)} remain deferred.`,
      next:`${s.next.batch} — define the oversized-file and Google-native hashing policy before another hash batch.`,
      gate:'The current eligible tier is exhausted. Record a separate policy for the deferred files, then verify their hashes and sizes.',
      later:'Begin source-content extraction after the integrity gate and extraction scope are settled; preserve physical-copy identities.'},
    {item:a, title:'Engineering cost rates', label:'Access gate', ready:false,
      current:`${a.checkpoint} evidence remains preserved; the original terminal checkpoint is unavailable to the connected account.`,
      next:'Restore access to the original terminal, then verify its checkpoint and rate evidence.',
      gate:'Reconcile the preserved G076 records with the original terminal before declaring closure or creating further rows.',
      later:'Validate units, dates, provenance and accepted rate meanings before using rates in estimates.'}
  ];
  const stages = [
    ['01','Inventory','Find every source and preserve its identity.'],
    ['02','Integrity','Reconcile gaps, copies, bytes and required hashes.'],
    ['03','Extract content','Read the approved text, OCR, media and model scope.'],
    ['04','Validate knowledge','Check meaning, units, evidence and source links.'],
    ['05','Use & maintain','Build useful outputs and track source freshness.']
  ];
  return `<section class="block extraction-roadmap" id="extraction-roadmap" aria-labelledby="extraction-roadmap-title">
<div class="block-header"><div><p class="eyebrow">Four lanes · next actions</p><h2 id="extraction-roadmap-title">Roadmap to usable knowledge</h2><p>Current checkpoints determine the next step. Gates must be resolved before later stages can begin.</p></div><span class="pill blue">Sequence, not a dated forecast</span></div>
<div class="chart-body"><ol class="extraction-stages" aria-label="Extraction stages in order">${stages.map(([n,title,copy])=>`<li><span class="stage-number" aria-hidden="true">${n}</span><h3>${title}</h3><p>${copy}</p></li>`).join('')}</ol>
<p class="metric-note">Stages are a route through the work, not five equal percentages. Inventory and hashing are prerequisites; they do not certify content extraction. MSCH's complete corpus total remains unknown, so an overall completion percentage or finish date is not available.</p>
<div class="extraction-lanes">${cards.map(({item,title,label,ready,current,next,gate,later})=>`<article class="extraction-lane"><div class="roadmap-card-head"><div><p class="eyebrow">${esc(item.id)}</p><h3>${esc(title)}</h3></div><span class="pill ${ready?'green':'amber'}">${label}</span></div><p class="roadmap-current"><b>Now · ${esc(item.checkpoint)}</b><br>${esc(current)}</p><div class="roadmap-next"><h4>Next checkpoint</h4><p>${esc(next)}</p></div><details><summary>What unlocks the later stages?</summary><p><b>Gate:</b> ${esc(gate)}</p><p><b>Then:</b> ${esc(later)}</p></details></article>`).join('')}</div>
<p class="section-copy"><b>Every work cycle:</b> verify the saved state, preserve a PRE snapshot, complete one bounded checkpoint, read back the result, reconcile Local/Main, then publish the updated boundary. Continue ready work while retaining the other lane gates.</p>
<a class="plain-button" href="#current-status">Check the latest evidence ↑</a></div></section>`;
}

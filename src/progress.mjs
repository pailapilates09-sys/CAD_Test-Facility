import {onboarding as data} from './progress-data.mjs';
import {livePhase} from './live-phase.mjs';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const number=value=>Number(value).toLocaleString('en-US');
const pct=(done,total)=>(done/total*100).toFixed(1);
const sourceMap=new Map(data.sources.map(s=>[s.id,s]));
const proofScope=source=>sourceMap.get(source)?.scope||'Global';
let scope='All';
const inScope=id=>scope==='All'||id===scope;
const sourceButton=(id,label='Evidence ↗')=>`<button type="button" class="source-button" data-source="${esc(id)}">${label}</button>`;
const stageLabels={'done':'Verified','partial':'Partial','not-started':'Not started','reported-complete':'Checkpoint complete','pending':'Review pending','blocked':'Blocked','not-authorized':'Not authorized'};
const date=new Intl.DateTimeFormat('en-GB',{timeZone:data.timezone,day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(data.snapshotAt));
$('snapshot-date').textContent='Checked '+date+' NPT';
$('kpis').innerHTML=[['Project lanes','4','Plus the separate JP Cost pipeline'],['Accessible handover IDs','70 / 71','One exact checkpoint returns 404'],['Library cursors aligned','3 / 4','AEC: Local 11 / Main 10'],['New project writes','0','Read-only sources, cursors and schedules']].map(([title,value,note])=>`<div class="kpi"><span>${title}</span><strong>${value}</strong><small>${note}</small></div>`).join('');

function projectMap(){
 const positions=[45,330,615,900];
 const lanes=data.projects.slice(0,4);
 const marks=lanes.map((p,i)=>{const x=positions[i];return `<g class="map-node" role="button" tabindex="0" data-scope="${p.id}" aria-label="Inspect ${p.id}"><title>${esc(p.name+': '+p.checkpoint)}</title><rect x="${x}" y="157" width="250" height="115" rx="10"/><rect x="${x}" y="157" width="5" height="115" rx="2" style="fill:${['#155b63','#416faf','#b67a26','#7b6b96'][i]};stroke:none"/><text x="${x+18}" y="184" font-size="17" font-weight="600">${p.id}</text><text x="${x+18}" y="207" font-size="12">${['Structural engineering','Lok Sewa study archive','Cost & rate intelligence','Hydropower research'][i]}</text><text class="small" x="${x+18}" y="229" font-size="11">${esc(p.checkpoint)}</text><text class="small" x="${x+18}" y="251" font-size="10">${['1,015 / 1,867 files hashed','416 / 1,244 catalogue rows','G076 terminal debt remains','500 rows · 99 pending folders'][i]}</text></g>`;}).join('');
 $('project-map').innerHTML=`<svg class="project-map" viewBox="0 0 1195 373" role="img" aria-label="A9 control plane governing MSCS, LSA, AEC and MSCH; JP Cost is a separate AEC pipeline"><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#aec6c6"/></marker></defs><rect x="410" y="23" width="375" height="66" rx="11" fill="#155b63"/><text x="597" y="51" text-anchor="middle" font-size="17" font-family="Arial" fill="#fff">A9 Control Towers & Main Library</text><text x="597" y="73" text-anchor="middle" font-size="11" font-family="Arial" fill="#dcebec">Normative controls · catalogue · four project lanes</text><path d="M597 89V122M170 122H1025" fill="none" stroke="#aec6c6" stroke-width="1.5"/>${positions.map(x=>`<path d="M${x+125} 122V151" fill="none" stroke="#aec6c6" stroke-width="1.5" marker-end="url(#arrow)"/>`).join('')}${marks}<path d="M740 272V299" fill="none" stroke="#aec6c6" stroke-width="1.5" marker-end="url(#arrow)"/><g class="map-node" role="button" tabindex="0" data-scope="JP Cost" aria-label="Inspect separate JP Cost pipeline"><rect x="615" y="305" width="250" height="54" rx="9" style="fill:#f7f4fa"/><text x="633" y="327" font-size="12" font-weight="600">JP Cost · M02 v0.5.14</text><text x="633" y="346" class="small" font-size="10">697 pages raw · semantic QA pending</text></g><text x="45" y="343" font-size="11" fill="#61747c" font-family="Arial">Master schedule: no automations in this account.</text><text x="45" y="360" font-size="10" fill="#61747c" font-family="Arial">Originating-account disablement is handover-reported.</text></svg>`;
}
function phaseBars(){
 $('phase-bars').innerHTML=data.projects.filter(p=>inScope(p.id)).map(p=>p.metric?`<article class="progress-item" data-reviewed-rows="phase-${esc(p.id)}"><div class="progress-label"><strong>${esc(p.id)} · ${esc(p.metric.label)}</strong><span>${number(p.metric.done)} / ${number(p.metric.total)} · <b>${pct(p.metric.done,p.metric.total)}%</b></span></div><div class="bar-track" role="img" aria-label="${esc(p.id)} ${esc(p.metric.label)}: ${pct(p.metric.done,p.metric.total)} percent, ${number(p.metric.remaining)} remaining"><div class="bar-fill ${p.id==='LSA'?'lsa':p.id==='JP Cost'?'jp':''}" style="width:${pct(p.metric.done,p.metric.total)}%"></div></div><p class="metric-note">${esc(p.metric.definition)}</p><div class="scope-row"><p class="chart-note">${p.metric.basis?esc(p.metric.basis):number(p.metric.remaining)+' '+esc(p.metric.unit)+' remaining'}</p>${sourceButton(p.source)}</div></article>`:`<article class="no-total"><div class="scope-row"><strong>${esc(p.id)} · ${esc(p.phase)}</strong>${sourceButton(p.source)}</div><p>${p.id==='MSCH'?'500 catalogue rows; 99 pending folders. The final corpus size is unknown.':'RO-2436/2437 exist; terminal lock and one Main ACK remain open. No total extraction denominator is established.'}</p></article>`).join('');
}
function syncChart(){
 const rows=data.sync.filter(p=>inScope(p.scope)||(scope==='JP Cost'&&p.scope==='AEC'));
 const height=rows.length*62+45;
 const marks=rows.map((r,i)=>{const y=i*62+27;return `<g data-source="main" tabindex="0" role="button" aria-label="${r.scope} Local ${r.local}, Main ${r.main}; ${esc(r.status)}"><title>${esc(r.note)}</title><text x="0" y="${y+13}" font-family="Arial" font-size="12" fill="#172c34">${r.scope}</text><rect x="62" y="${y}" height="10" rx="2" width="${r.local*24}" fill="#155b63"/><text x="${68+r.local*24}" y="${y+9}" font-family="Arial" font-size="10" fill="#155b63">${r.local}</text><rect x="62" y="${y+15}" height="10" rx="2" width="${r.main*24}" fill="#99abb5"/><text x="${68+r.main*24}" y="${y+24}" font-family="Arial" font-size="10" fill="#61747c">${r.main}</text>${r.local!==r.main?`<text x="62" y="${y+43}" fill="#a86412" font-family="Arial" font-size="10">1 sequence awaiting Main ACK</text>`:''}</g>`;}).join('');
 $('sync-chart').innerHTML=`<div class="legend"><span><i style="background:#155b63"></i>Local change sequence</span><span><i style="background:#99abb5"></i>Main consumed sequence</span></div><svg class="sync-svg" viewBox="0 0 410 ${height}" role="img" aria-label="Current library sequence cursors">${marks}</svg><div class="minor-notice">MSCS 3/3 is aligned, but its registrar narrative is behind the independently proven CP84/B072 machine state.</div>`;
}
function projectCards(){
 $('project-cards').innerHTML=data.projects.filter(p=>inScope(p.id)).map(p=>`<article class="project-card"><header><div><h3>${esc(p.name)}</h3><p class="checkpoint">${esc(p.checkpoint)}</p></div>${sourceButton(p.source)}</header><dl class="facts">${p.facts.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p class="boundary">${esc(p.boundary)}</p><p class="next"><b>Next:</b> ${esc(p.next)}</p></article>`).join('');
 $('stage-matrix').innerHTML=`<table class="matrix"><caption class="section-copy" style="text-align:left">Stages have different meanings by project; a physical catalogue is not content extraction.</caption><thead><tr><th>Project</th><th>Stage 1</th><th>Stage 2</th><th>Stage 3</th><th>Stage 4</th><th>Stage 5</th></tr></thead><tbody>${data.projects.filter(p=>inScope(p.id)).map(p=>`<tr><td><strong>${esc(p.id)}</strong><br>${esc(p.checkpoint)}</td>${p.stages.map(s=>`<td>${esc(s.name)}<br><span class="stage ${s.state}"><i></i>${stageLabels[s.state]}</span></td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function debts(){
 const rows=data.debts.filter(d=>inScope(d.scope)||d.scope==='Global');
 $('debt-count').textContent=rows.length+' open items';
 $('debts-list').innerHTML=rows.map(d=>`<article class="debt"><div class="meta"><span>${d.id} · ${esc(d.scope)}</span><span class="pill ${d.priority==='High'?'red':'amber'}">${d.priority}</span></div><h3>${esc(d.title)}</h3><p>${esc(d.detail)}</p><div class="scope-row"><span class="pill amber">${esc(d.state)}</span>${sourceButton(d.source)}</div></article>`).join('');
}
function proofs(){
 const tests=data.tests.filter(t=>inScope(proofScope(t.source))||proofScope(t.source)==='Global');
 $('proof-grid').innerHTML=tests.map(t=>`<article class="proof ${t.state}"><span class="proof-symbol" aria-label="${t.state}">${t.state==='pass'?'✓':t.state==='partial'?'△':'○'}</span><div><h3>${esc(t.label)}</h3><p>${esc(t.detail)}</p>${sourceButton(t.source)}</div></article>`).join('');
}
function update(){phaseBars();syncChart();projectCards();debts();proofs();}
function setScope(value){scope=value;$('scope-filter').value=value;update();}
$('scope-filter').addEventListener('change',event=>setScope(event.target.value));
$('reset-filter').addEventListener('click',()=>setScope('All'));
projectMap();update();

const nodes=new Map(data.tree.nodes.map(n=>[n.id,n]));
const children=new Map();
for(const n of nodes.values())for(const p of n.parents){if(!children.has(p))children.set(p,[]);children.get(p).push(n.id);}
for(const ids of children.values())ids.sort((a,b)=>{const x=nodes.get(a),y=nodes.get(b);return (x.kind==='folder'?0:1)-(y.kind==='folder'?0:1)||x.name.localeCompare(y.name);});
const expanded=new Set([data.tree.rootId]);
for(const n of nodes.values())if(n.parents.includes(data.tree.rootId))expanded.add(n.id);
let treeQuery='';
function matches(id,visited=new Set()){
 if(visited.has(id))return false;visited.add(id);
 const n=nodes.get(id);return !treeQuery||(n.name+' '+(n.driveId||'')).toLowerCase().includes(treeQuery)||(children.get(id)||[]).some(c=>matches(c,new Set(visited)));
}
function treeNode(id,path=new Set()){
 if(path.has(id)||!matches(id))return '';const n=nodes.get(id);path.add(id);
 const childIds=(children.get(id)||[]).filter(c=>matches(c));
 const open=treeQuery||expanded.has(id);
 const match=treeQuery&&(n.name+' '+(n.driveId||'')).toLowerCase().includes(treeQuery);
 return `<li class="${match?'tree-match':''}" data-tree-row="${esc(id)}"><div class="tree-row">${childIds.length?`<button class="toggle" type="button" data-toggle="${esc(id)}" aria-expanded="${!!open}" aria-label="${open?'Collapse':'Expand'} ${esc(n.name)}">${open?'−':'+'}</button>`:'<span class="tree-spacer"></span>'}<span class="tree-icon" aria-hidden="true">${n.kind==='folder'?'▱':n.kind==='sheet'?'▤':'▧'}</span><button class="tree-select" type="button" data-node="${esc(id)}">${esc(n.name)}</button><span class="pill ${n.status==='blocked'?'red':n.restricted?'amber':'green'}">${n.status==='blocked'?'Unavailable':n.restricted?'Link withheld':'Verified'}</span></div>${n.driveId?`<span class="tree-id">${esc(n.driveId)}</span>`:''}${childIds.length&&open?`<ul>${childIds.map(c=>treeNode(c,new Set(path))).join('')}</ul>`:''}</li>`;
}
function renderTree(){
 const roots=[...nodes.values()].filter(n=>n.id!==data.tree.rootId&&!n.parents.some(p=>nodes.has(p))).sort((a,b)=>a.name.localeCompare(b.name));
 const root=treeNode(data.tree.rootId);
 const external=roots.map(n=>treeNode(n.id)).join('');
 $('drive-tree').innerHTML=(root||'')+(external?`<li><div class="report-heading">External references / parent outside checked scope</div><ul>${external}</ul></li>`:'')||'<li class="empty">No matching reference.</li>';
 $('tree-count').textContent=data.tree.nodes.length+' checked references';
}
$('expand-tree').addEventListener('click',()=>{for(const id of nodes.keys())expanded.add(id);renderTree();});
$('collapse-tree').addEventListener('click',()=>{expanded.clear();renderTree();});
$('tree-search').addEventListener('input',event=>{treeQuery=event.target.value.trim().toLowerCase();renderTree();});
renderTree();

const dialog=$('evidence-dialog');
function showEvidence(id){
 const source=sourceMap.get(id);if(!source)return;
 const definitions=data.projects.filter(p=>p.source===id&&p.metric).map(p=>`<dt>${esc(p.id)} · ${esc(p.metric.label)}</dt><dd>${esc(p.metric.definition)}<br>${number(p.metric.done)} ÷ ${number(p.metric.total)} × 100 = ${pct(p.metric.done,p.metric.total)}%</dd>`).join('');
 $('evidence-content').innerHTML=`<h2>${esc(source.label)}</h2><p>${esc(source.type)}</p><dl><dt>Independent evidence / coverage</dt><dd>${esc(source.evidence)}</dd><dt>Snapshot</dt><dd>${esc(date)} NPT</dd>${definitions}<dt>Scope and limitations</dt><dd>Read-only onboarding. Metadata access is distinct from byte access. Only named samples were parsed; no project ingestion or write probes occurred.</dd></dl>${source.url?`<p><a href="${esc(source.url)}" target="_blank" rel="noopener">Open original provider evidence ↗</a></p>`:'<p>Source IDs and links are withheld from this public view because of observed sharing exposure. The original handover retains the authoritative locations.</p>'}`;
 dialog.showModal();
}
function showNode(id){
 const n=nodes.get(id);if(!n)return;
 $('evidence-content').innerHTML=`<h2>${esc(n.name)}</h2><dl><dt>Type</dt><dd>${esc(n.kind)}</dd><dt>Stable Drive ID</dt><dd>${n.driveId?esc(n.driveId):'Withheld from public projection — observed public edit-link exposure'}</dd><dt>Independent verification</dt><dd>${n.status==='blocked'?'Drive metadata request returned 404. The object may be missing or inaccessible; deletion is unproven.':'Drive metadata was successfully read in this account.'}</dd><dt>Verified parent references</dt><dd>${n.parents.map(id=>esc(nodes.get(id)?.name||id)).join(', ')||'Parent is outside the checked tree / no accessible parent supplied.'}</dd><dt>Mutations</dt><dd>None. Original file, parent, permissions and identity were preserved.</dd></dl>${n.url&&n.status!=='blocked'?`<p><a href="${esc(n.url)}" target="_blank" rel="noopener">Open original Drive item ↗</a></p>`:''}`;
 dialog.showModal();
}
document.addEventListener('click',event=>{
 const source=event.target.closest('[data-source]');if(source){showEvidence(source.dataset.source);return;}
 const toggle=event.target.closest('[data-toggle]');if(toggle){const id=toggle.dataset.toggle;expanded.has(id)?expanded.delete(id):expanded.add(id);renderTree();return;}
 const node=event.target.closest('[data-node]');if(node){showNode(node.dataset.node);return;}
 const map=event.target.closest('[data-scope]');if(map){setScope(map.dataset.scope);$('progress').scrollIntoView({behavior:'smooth'});}
});
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-scope],[data-source][role="button"]')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
$('dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
$('controls-table').innerHTML=`<table class="controls-table"><thead><tr><th>Authority</th><th>Current version</th><th>Proof</th></tr></thead><tbody>${data.controls.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.version)}</td><td>${esc(c.status)}</td></tr>`).join('')}</tbody></table>`;
$('capabilities-table').innerHTML=`<table class="cap-table"><thead><tr><th>Capability</th><th>Current proof level</th><th>Exact action contract</th><th>Evidence / limitation</th></tr></thead><tbody>${data.capabilities.map(c=>`<tr><td>${esc(c.area)}</td><td>${esc(c.status)}</td><td><code>${esc(c.tool)}</code><br>${esc(c.contract)}</td><td>${esc(c.proof)}</td></tr>`).join('')}</tbody></table>`;
$('next-actions').innerHTML=data.nextActions.map(a=>`<li>${esc(a)}</li>`).join('');
function download(filename,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export-json').addEventListener('click',()=>download('A9_Read_Only_Status_Snapshot.json',JSON.stringify({...data,livePhase,view:{scope}},null,2)+'\n','application/json'));
$('export-csv').addEventListener('click',()=>{const rows=data.debts.filter(d=>inScope(d.scope)||d.scope==='Global');const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';const csv=[['ID','Project','Priority','Debt','State','Details'],...rows.map(d=>[d.id,d.scope,d.priority,d.title,d.state,d.detail])].map(r=>r.map(quote).join(',')).join('\n');download('A9_Visible_Debts.csv',csv+'\n','text/csv');});
window.onboardingView={snapshot:data,get scope(){return scope;},setScope};

const phaseDate=new Intl.DateTimeFormat('en-GB',{timeZone:data.timezone,day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(livePhase.completedAt));
$('live-phase').innerHTML=`<div class="block-header"><div><h2>Live phase 01 - stopped at verified CP13</h2><p>${esc(phaseDate)} NPT · MSCH B013 · one completed catalogue batch</p></div><span class="pill green">Checkpoint verified</span></div><div class="chart-body"><div class="kpis"><div class="kpi"><span>Catalogue rows</span><strong>500 → 501</strong><small>One physical child folder added</small></div><div class="kpi"><span>Folders / files</span><strong>150 / 351</strong><small>Original source files unchanged</small></div><div class="kpi"><span>Pending folders</span><strong>99</strong><small>One consumed; one appended to FIFO</small></div><div class="kpi"><span>Local / Main closure</span><strong>Pending</strong><small>Separate registrar phase next</small></div></div><p class="section-copy">${esc(livePhase.providerReadback)} ${esc(livePhase.scope)}</p><div class="minor-notice"><b>Stopping rule for each phase:</b> one verified checkpoint or 20 minutes maximum; stop new work at 14 weighted work units / approximately 14 minutes, reserving 6 units for closeout. Do not start a transaction that cannot close safely. No schedule will be created or resumed.</div><p class="report-heading">Bounded phase plan</p><div class="table-scroll"><table><thead><tr><th>Phase</th><th>Lane</th><th>Bounded work</th><th>Stopping criterion</th><th>Status</th></tr></thead><tbody>${livePhase.phases.map(p=>`<tr><td>${p.phase}</td><td>${esc(p.lane)}</td><td>${esc(p.work)}</td><td>${esc(p.stop)}</td><td>${esc(p.status)}</td></tr>`).join('')}</tbody></table></div><p class="chart-note">${esc(livePhase.usageVisibility)} The historical onboarding charts below retain their original evidence date; they do not include this new catalogue row.</p></div>`;
window.livePhase=livePhase;

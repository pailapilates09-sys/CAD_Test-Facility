import {chartRows} from './comparison-model.js';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const compact=n=>Number(n).toLocaleString('en-IN',{maximumFractionDigits:0});
const range=r=>r.low===null?'Not published':r.high===null?'From '+money(r.low):r.low===r.high?money(r.low):money(r.low)+'–'+money(r.high)+(r.qualifier==='open_upper_bound'?'+':'');
const niceMax=n=>{const p=10**Math.floor(Math.log10(n||1));return Math.ceil(n/p)*p};
export function svgChart(item,rows,assumeNPR){
 if(!rows.length)return '<div class="comparison-hold"><strong>On hold · original values retained.</strong><p>No public replacement rate is assigned. The original rate and amount remain in the estimate.</p></div>';
 const unit=rows[0].unit,plot=rows.filter(r=>r.unit===unit),showEstimate=assumeNPR&&plot.some(r=>r.estimate_rate!==null);
 const maximum=niceMax(Math.max(...plot.flatMap(r=>[Number(r.low)||0,Number(r.high)||0,...(r.estimate_rate===null?[]:[Number(r.estimate_rate)])]))*1.12);
 const left=285,right=795,width=right-left,height=100+plot.length*78,scale=n=>left+Number(n)/maximum*width;
 let marks='';
 for(let t=0;t<=4;t++){const v=maximum*t/4,x=scale(v);marks+=`<line x1="${x}" x2="${x}" y1="28" y2="${height-45}" stroke="#e0e8e8"/><text class="tick" x="${x}" y="${height-24}" text-anchor="middle">${compact(v)}</text>`}
 plot.forEach((r,i)=>{const y=65+i*78,x1=scale(r.low),x2=r.high===null?Math.min(right,x1+34):scale(r.high);const single=r.high===r.low;
  marks+=`<text x="8" y="${y-7}">${esc(r.id+' · '+r.publisher)}</text><text class="small" x="8" y="${y+13}">${esc(r.basis.replaceAll('_',' '))}</text>`;
  if(single)marks+=`<circle cx="${x1}" cy="${y}" r="5" fill="white" stroke="#936b21" stroke-width="2"/>`;
  else marks+=`<line x1="${x1}" x2="${x2}" y1="${y}" y2="${y}" stroke="#b18128" stroke-width="6"/><line x1="${x1}" x2="${x1}" y1="${y-7}" y2="${y+7}" stroke="#936b21" stroke-width="1.5"/>${r.high===null||r.qualifier==='open_upper_bound'?`<path d="M${x2-6},${y-6} L${x2+2},${y} L${x2-6},${y+6}" fill="none" stroke="#936b21" stroke-width="2"/>`:`<line x1="${x2}" x2="${x2}" y1="${y-7}" y2="${y+7}" stroke="#936b21" stroke-width="1.5"/>`}`;
  if(r.estimate_rate!==null){const x=scale(r.estimate_rate);marks+=`<path d="M${x},${y-8} L${x+7},${y} L${x},${y+8} L${x-7},${y} Z" fill="#155b63"/>`}
  marks+=`<text x="817" y="${y-4}">${esc(range(r))}</text><text class="small" x="817" y="${y+14}">NPR / ${esc(r.unit_label)}</text>`;
 });
 const description=`Public rate evidence for ${item.title}. ${plot.map(r=>r.publisher+': '+range(r)+' NPR per '+r.unit_label).join('; ')}. ${showEstimate?'Original estimate overlaid under an explicit unconfirmed NPR assumption.':'Original estimate currency is unconfirmed and is not on the NPR axis.'} Scope equivalence is unverified.`;
 return `<svg viewBox="0 0 1030 ${height}" role="img" aria-labelledby="comparison-svg-title comparison-svg-desc"><title id="comparison-svg-title">${esc(item.title)} · public rate references</title><desc id="comparison-svg-desc">${esc(description)}</desc><text class="small" x="${left}" y="16">NPR per ${esc(plot[0].unit_label)} · zero baseline</text><line x1="${left}" x2="${right}" y1="${height-45}" y2="${height-45}" stroke="#93a7aa"/>${marks}</svg>`;
}
export async function initComparison(dataPath='./comparison.json'){
 const response=await fetch(dataPath);if(!response.ok)throw new Error('Comparison data unavailable');const d=await response.json();
 const held=d.items.filter(x=>x.status==='on_hold_original_retained');
 $('comparison-summary').innerHTML=`<div><strong>${d.coverage.reference_items}</strong>Items with public references</div><div><strong>${d.coverage.unit_compatible_items}</strong>Items with same-unit references</div><div><strong>${held.length}</strong>On hold · old values kept</div>`;
 $('comparison-area').innerHTML+=d.sections.filter(s=>s.item_count).map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
 $('held-items').innerHTML=held.map(x=>`<tr><td><button class="scope-link" data-detail="${esc(x.id)}">${esc(x.title)}</button><small>${esc(x.section_name)} · ${esc(x.id)}</small></td><td>${esc(x.original.unit??'Not supplied')}</td><td class="num">${money(x.original.rate)}</td><td class="num">${money(x.original.amount)}</td></tr>`).join('');
 $('held-total').textContent=`Held original amount: ${money(d.coverage.held_original_amount_minor/100)} · included in the unchanged source estimate total · source currency unspecified.`;
 function options(preferred){const area=$('comparison-area').value,state=$('comparison-state').value,items=d.items.filter(x=>(!area||x.section_id===area)&&(state==='all'||(state==='hold'?x.status==='on_hold_original_retained':x.references.some(r=>r.unit_matches_estimate))));$('comparison-item').innerHTML=items.map(x=>`<option value="${esc(x.id)}">${esc(x.section_name+' · '+x.title)}${x.status==='on_hold_original_retained'?' [ON HOLD]':''}</option>`).join('');$('comparison-item').value=items.some(x=>x.id===preferred)?preferred:items[0]?.id??'';render()}
 function render(){const x=d.items.find(x=>x.id===$('comparison-item').value);if(!x){$('comparison-item-title').textContent='No items in this filter';$('comparison-original-rate').textContent='';$('comparison-original-meta').textContent='';$('comparison-chart').innerHTML='';$('comparison-values').innerHTML='';$('comparison-note').textContent='Change the filters.';$('comparison-details').disabled=true;return}
  $('comparison-details').disabled=false;$('comparison-details').dataset.detail=x.id;
  const assume=$('assume-npr').checked,rows=chartRows(x,assume),compatible=x.references.some(r=>r.unit_matches_estimate);
  $('comparison-item-title').textContent=x.title;$('comparison-original-rate').textContent=`${money(x.si.rate)} / ${x.si.unit_label}`;
  $('comparison-original-meta').textContent=`Currency unspecified · ${x.section_name} · original amount ${money(x.original.amount)} · ${x.status==='on_hold_original_retained'?'ON HOLD · OLD VALUES KEPT':x.research_state.replaceAll('_',' ')}`;
  $('comparison-note').textContent=x.status==='on_hold_original_retained'?'This item is on hold as instructed. Its original values remain unchanged.':!compatible?'Reference units differ from the estimate. Public prices are charted in their own units; the original rate cannot be overlaid.':assume?'Scenario only: original rate is plotted as if its currency were NPR. Matching units do not confirm matching materials, labour, design or VAT.':'Original currency is unconfirmed. Public prices use the NPR axis; the original rate stays in the separate card above. Enable the explicit NPR assumption to overlay it.';
  $('comparison-chart').innerHTML=svgChart(x,rows,assume);
  $('comparison-values').innerHTML=rows.length?`<div class="table-scroll"><table><caption class="sr-only">Exact reference values, scope qualifications and sources for ${esc(x.title)}</caption><thead><tr><th>Reference</th><th>Public price · NPR</th><th>Scope and limitations</th><th>Source</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.id+' · '+r.label)}<small>${r.unit_matches_estimate?'Same measurement unit · scope unverified':'Different measurement unit'}</small></td><td>${esc(range(r))}<small>Per ${esc(r.unit_label)}</small></td><td>${esc(r.basis.replaceAll('_',' '))}<small>${esc(r.qualification)}</small><small>${esc(r.availability.replaceAll('_',' '))} · ${esc(r.source_access.replaceAll('_',' '))}</small></td><td><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.publisher)} ↗</a><small>Published: ${esc(r.published_date??'not stated')}<br>Retrieved: ${esc(r.retrieved_date)}</small>${r.source_note?`<small>${esc(r.source_note)}</small>`:''}</td></tr>`).join('')}</tbody></table></div>`:'';
 }
 $('comparison-area').addEventListener('change',()=>options($('comparison-item').value));$('comparison-state').addEventListener('change',()=>options($('comparison-item').value));$('comparison-item').addEventListener('change',render);$('assume-npr').addEventListener('change',render);options('reception-012');
}

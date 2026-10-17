const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const unit=u=>({m2:'m²',ft2:'ft²',each:'each',day:'worker-day',L:'litre',sheet:'8×4 ft sheet',fabric_m:'linear metre of fabric',bag_40kg:'40 kg bag',point:'point',m:'m'}[u]??u??'unspecified unit');
const range=r=>r.low===null?'Unknown':r.high===null?'From '+money(r.low):r.low===r.high?money(r.low):money(r.low)+'–'+money(r.high);
export function componentRefs(item,d,type){
 const lookup=new Map(d.observations.map(o=>[o.id,o]));
 return item[type+'_reference_ids'].map(id=>lookup.get(id));
}
function referenceList(item,d,type){
 const refs=componentRefs(item,d,type),sources=new Map(d.sources.map(s=>[s.id,s]));
 if(!refs.length)return `<span class="component-unknown">${item.status==='on_hold_original_retained'?'On hold · original retained':'Unknown · matching breakdown needed'}</span>`;
 return refs.map(o=>{
  const s=sources.get(o.source_id),n=o.normalized,same=n.unit===item.si.unit&&item.si.unit!==null;
  return `<div class="component-ref"><strong>${o.currency??'Currency unspecified'} ${esc(range(n))} / ${esc(unit(n.unit))}</strong><small>${esc(o.label)}${o.price_qualifier?' · '+esc(o.price_qualifier.replaceAll('_',' ')):''}${o.availability?' · '+esc(o.availability.replaceAll('_',' ')):''}</small><span class="pill ${same?'blue':'amber'}">${same?'Same unit · scope unverified':'Different basis / unit'}</span><details><summary>${esc(o.id)} · scope + source</summary><p>${esc(o.qualification)}</p><p>Basis: ${esc(o.basis.replaceAll('_',' '))}. Published basis: ${o.currency??'Currency unspecified'} ${esc(range(o))} / ${esc(unit(o.unit))}. VAT: ${esc(o.vat_status.replaceAll('_',' '))}.${o.availability?' Availability: '+esc(o.availability.replaceAll('_',' '))+'.':''}</p><a href="${esc(s.url)}${o.source_pdf_page?'#page='+o.source_pdf_page:''}" target="_blank" rel="noopener">${esc(s.publisher)} ↗</a><p>Published ${esc(s.published_date??'date not stated')}; retrieved ${esc(s.retrieved_date)}${o.source_pdf_page?` · PDF page ${o.source_pdf_page}`:''}. ${esc(s.note??'')}</p></details></div>`;
 }).join('');
}
export function componentDetail(id,d){
 const x=d.items.find(x=>x.item_id===id);if(!x)return '';
 return `<section class="rate-refs"><h3>V7 labour and material evidence</h3><p>Original quoted rate remains ${money(x.si.rate)} / ${esc(unit(x.si.unit))}, currency unspecified. Original labour and material allocations are unknown.</p><h4>Labour references</h4>${referenceList(x,d,'labour')}<h4>Material / purchased supply references</h4>${referenceList(x,d,'material')}${x.combined_reference_ids.length?'<h4>Combined references · kept unsplit</h4>'+referenceList(x,d,'combined'):''}<ul>${x.gaps.map(g=>'<li>'+esc(g)+'</li>').join('')}</ul></section>`;
}
export function renderComponentTables(ids,d){
 const lookup=new Set(ids),items=d.items.filter(x=>lookup.has(x.item_id)),$=id=>document.getElementById(id);
 const both=items.filter(x=>x.labour_reference_ids.length&&x.material_reference_ids.length).length,labour=items.filter(x=>x.labour_reference_ids.length).length,material=items.filter(x=>x.material_reference_ids.length).length;
 $('component-summary').innerHTML=`<div><strong>${labour} / ${items.length}</strong>Labour references available</div><div><strong>${material} / ${items.length}</strong>Material / supply references</div><div><strong>${both} / ${items.length}</strong>Both components referenced · 0 accepted quote splits</div>`;
 const areas=[...new Set(items.map(x=>x.section_id))];
 $('component-tables').innerHTML=areas.length?areas.map(id=>{
  const rows=items.filter(x=>x.section_id===id);
  return `<section class="area-table"><header class="area-table-head"><h3>${esc(rows[0].section_name)} · component rates</h3><p>${rows.length} matching items · references remain separate from the quote</p></header><div class="table-scroll"><table class="component-table"><caption class="sr-only">${esc(rows[0].section_name)} labour and material evidence</caption><thead><tr><th>Work item</th><th>Original rate · unsplit</th><th>Labour reference</th><th>Material / supply reference</th><th>Still required</th></tr></thead><tbody>${rows.map(x=>`<tr data-component-item="${esc(x.item_id)}"><td><button class="scope-link" data-detail="${esc(x.item_id)}">${esc(x.title)}</button><small>${esc(x.item_id)}</small></td><td><strong>${money(x.si.rate)} / ${esc(unit(x.si.unit))}</strong><small>Currency unspecified</small><small>Quoted labour: unknown<br>Quoted material: unknown</small></td><td>${referenceList(x,d,'labour')}</td><td>${referenceList(x,d,'material')}</td><td>${x.status==='on_hold_original_retained'?'<span class="pill amber">On hold</span>':''}<details><summary>${x.status==='on_hold_original_retained'?'Hold note':'Scope gaps + unsplit packages'}</summary><ul>${x.gaps.map(g=>'<li>'+esc(g)+'</li>').join('')}</ul>${x.combined_reference_ids.length?'<h4>Combined package · not material-only</h4>'+referenceList(x,d,'combined'):''}</details></td></tr>`).join('')}</tbody></table></div></section>`;
 }).join(''):'<p class="empty">No matching items. Change the table filters above.</p>';
}
export function calculateDraft(item,values){
 if(item.status==='on_hold_original_retained')return {ok:false,reason:'This item is on hold. Original values remain locked.'};
 if(!item.si.unit)return {ok:false,reason:'The source measurement unit is missing. Confirm it before entering a component unit rate.'};
 if(!Array.isArray(values)||values.length!==3)return {ok:false,reason:'All three component fields are required.'};
 const amounts=[];
 for(const [i,value] of values.entries()){
  const s=String(value??'').trim();if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(s))return {ok:false,reason:`Enter a known non-negative ${['labour','material','other-cost'][i]} rate with up to 2 decimals. Blank means unknown.`};
  const [whole,part='']=s.split('.');amounts.push(BigInt(whole)*100n+BigInt(part.padEnd(2,'0')));
 }
 const total=amounts.reduce((n,x)=>n+x,0n),q=String(item.si.quantity),[whole,fraction='']=q.split('.'),factor=10n**BigInt(fraction.length),quantity=BigInt(whole+fraction),line=(total*quantity+factor/2n)/factor;
 return {ok:true,currency:'NPR',unit:item.si.unit,labour_minor:Number(amounts[0]),material_minor:Number(amounts[1]),other_minor:Number(amounts[2]),rate_minor:Number(total),line_amount_minor:Number(line),accepted_split:false};
}
export function componentChart(item,d){
 const refs=[...componentRefs(item,d,'labour'),...componentRefs(item,d,'material')].filter(x=>x.currency==='NPR');
 if(!refs.length)return '<p class="comparison-hold">No NPR component chart for this item. Original values remain unchanged.</p>';
 const groups=[...new Set(refs.map(x=>x.normalized.unit))],sources=new Map(d.sources.map(s=>[s.id,s]));
 return groups.map((u,group)=>{
  const rows=refs.filter(x=>x.normalized.unit===u),maxValue=Math.max(...rows.flatMap(x=>[Number(x.normalized.low)||0,Number(x.normalized.high)||0])),max=Math.ceil((maxValue||1)*1.1),left=310,right=760,height=rows.length*72+95,scale=n=>left+Number(n)/max*(right-left);
  let marks='';for(let i=0;i<=4;i++){const v=max*i/4,x=scale(v);marks+=`<line x1="${x}" x2="${x}" y1="30" y2="${height-42}" stroke="#dfe8e7"/><text class="small" x="${x}" y="${height-20}" text-anchor="middle">${Math.round(v).toLocaleString('en-IN')}</text>`}
  rows.forEach((r,i)=>{const y=62+i*72,n=r.normalized,x1=scale(n.low),x2=scale(n.high??n.low),color=r.component==='labour'?'#155b63':'#916816';marks+=`<g data-component-ref="${esc(r.id)}"><title>${esc(r.label)}: ${range(n)} NPR per ${unit(u)}.</title><text x="8" y="${y-7}">${esc(r.id+' · '+(r.component==='labour'?'Labour':'Material / supply'))}</text><text class="small" x="8" y="${y+13}">${esc(sources.get(r.source_id).publisher)}</text>${x1===x2?`<circle cx="${x1}" cy="${y}" r="5" fill="${color}"/>`:`<line x1="${x1}" x2="${x2}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="6"/>`}<text x="785" y="${y+4}">${esc(range(n))}</text></g>`});
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 ${height}" role="img" aria-labelledby="component-svg-${group}"><title id="component-svg-${group}">${esc(item.title)}: labour and supply references in NPR per ${esc(unit(u))}. Separate unit groups; scope unverified.</title><text class="small" x="${left}" y="16">NPR / ${esc(unit(u))} · separate scale · zero baseline</text>${marks}</svg>`;
 }).join('');
}
export function initComponents(d,debt){
 const $=id=>document.getElementById(id);
 $('component-allowances').innerHTML=`<div class="table-scroll"><table><caption class="sr-only">Unsplit original summary allowances</caption><thead><tr><th>Area</th><th>Original allowance</th><th>Labour amount</th><th>Material amount</th><th>Unit rate</th></tr></thead><tbody>${d.allowances.map(x=>`<tr><td>${esc(x.name)}</td><td>${money(x.original_amount)}<small>Currency unspecified</small></td><td>Unknown</td><td>Unknown</td><td>Unavailable · no quantities</td></tr>`).join('')}</tbody></table></div>`;
 $('component-source-list').innerHTML=d.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.id+' · '+s.publisher)} ↗</a><p>${esc(s.locator??'')} · retrieved ${esc(s.retrieved_date)}. ${esc(s.note??'')}</p>${s.preserved_copy_url?`<a href="${esc(s.preserved_copy_url)}" target="_blank" rel="noopener">Preserved official PDF ↗</a>`:''}</li>`).join('');
 $('debt-summary').textContent='Official district PDF access recovered and selected rows reviewed. Source currency, original quote allocation, six holds, two allowance breakdowns and the SKP download limit remain explicitly unresolved.';
 $('component-item').innerHTML=d.items.map(x=>`<option value="${esc(x.item_id)}">${esc(x.section_name+' · '+x.title)}${x.status==='on_hold_original_retained'?' [ON HOLD]':''}</option>`).join('');
 $('component-item').value='coffee-lounge-008';
 function selected(){return d.items.find(x=>x.item_id===$('component-item').value)}
 function render(){const x=selected();if(!x)return;const locked=x.status==='on_hold_original_retained'||!x.si.unit;$('component-current').textContent=`${x.item_id} · original ${money(x.si.rate)} / ${unit(x.si.unit)} · original currency unspecified · accepted labour/material split: unknown`;$('component-chart').innerHTML=componentChart(x,d);for(const id of ['draft-labour','draft-material','draft-other']){$(id).value='';$(id).disabled=locked}$('calculate-components').disabled=locked;$('draft-result').textContent=locked?(x.status==='on_hold_original_retained'?'On hold · original values retained.':'Measurement unit missing · draft locked.'):'No draft calculation entered.'}
 $('component-item').addEventListener('change',render);
 $('calculate-components').addEventListener('click',()=>{const x=selected(),r=calculateDraft(x,['draft-labour','draft-material','draft-other'].map(id=>$(id).value));$('draft-result').textContent=r.ok?`Temporary NPR draft / ${unit(x.si.unit)}: labour ${money(r.labour_minor/100)} + material ${money(r.material_minor/100)} + other ${money(r.other_minor/100)} = ${money(r.rate_minor/100)}. At ${x.si.quantity} ${unit(x.si.unit)}: NPR ${money(r.line_amount_minor/100)} before any unentered costs/VAT. Not saved or applied to the original estimate.`:r.reason});
 render();
}

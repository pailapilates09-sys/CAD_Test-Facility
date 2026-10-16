const $=id=>document.getElementById(id);
export const money=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
export const quantity=n=>Number(n).toLocaleString('en-IN',{maximumFractionDigits:4});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pdf=p=>`../source/pilates-estimate-astra.pdf#page=${p}`;
export async function init(){
 const fetchJSON=async path=>{const r=await fetch(path);if(!r.ok)throw new Error(`Request failed (${r.status})`);return r.json()};
 const [d,g,si,research]=await Promise.all([fetchJSON('../data/estimate.json'),fetchJSON('../v2/hierarchy.json'),fetchJSON('../v3/estimate-si.json'),fetchJSON('./market-rates.json')]);
 const itemResearch=new Map(research.items.map(x=>[x.item_id,x])),observations=new Map(research.observations.map(x=>[x.id,x])),sources=new Map(research.sources.map(x=>[x.id,x]));
 const unitLabel=u=>({ft2:'ft²',m2:'m²',fabric_m:'linear metre of fabric',each:'each',m:'m'}[u]??u);
 const range=(low,high,qualifier)=>low===null?'Not published':high===null?'From '+money(low):low===high?money(low):money(low)+'–'+money(high)+(qualifier==='open_upper_bound'?'+':'');
 const rateLabel=o=>{const n=o.normalized_si;return `NPR ${range(n?n.low:o.low,n?n.high:o.high,o.price_qualifier)} / ${unitLabel(n?n.unit:o.unit)}`};
 const evidence=x=>{const r=itemResearch.get(x.id),refs=r.reference_ids.map(id=>observations.get(id));return `<span class="pill ${refs.length?'blue':'amber'}">${esc(r.research_state.replaceAll('_',' '))}</span>${refs.length?`<strong>${esc(rateLabel(refs[0]))}</strong><small>${esc(refs[0].basis.replaceAll('_',' '))} · ${esc(refs[0].id)} · ${esc(sources.get(refs[0].source_id).publisher)}</small>${refs.length>1?`<small>+ ${refs.length-1} additional reference(s) in details</small>`:''}`:'<strong>Custom quote needed</strong>'}<small>${esc(r.qualification)}</small>`};
 $('coverage').textContent=`51 items reviewed · ${research.coverage.items_with_numeric_reference} with numeric references · ${research.coverage.items_without_numeric_reference} without numeric references · ${research.coverage.source_count} sources · 0 exact-scope quotations.`;
 $('research-sources').innerHTML=research.sources.map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.id)} · ${esc(x.publisher)} ↗</a><br>${esc(x.access_status.replaceAll('_',' '))} · published: ${esc(x.published_date??'not stated')} · retrieved: ${esc(x.retrieved_date)}${x.note?`<br>${esc(x.note)}`:''}</li>`).join('');
 const converted=new Map(si.line_items.map(x=>[x.id,x]));
 d.line_items=d.line_items.map(x=>({...x,...converted.get(x.id)}));
 const nodes=new Map(g.nodes.map(n=>[n.id,n])),items=new Map(d.line_items.map(n=>[n.id,n]));
 const node=(id,extra='')=>{const n=nodes.get(id);return `<button class="node ${extra}" data-node="${esc(id)}" data-detail="${esc(id)}"><strong>${esc(n.title)}</strong><span class="value">${money(n.amount)}</span>${id==='grand-total'?'<small>Total including VAT</small>':''}</button>`};
 $('total').textContent=money(d.summary.grand_total);$('subtotal').textContent=money(d.summary.subtotal);$('vat').textContent=money(d.summary.vat_amount);
 $('chart-root').innerHTML=node('grand-total');$('chart-fiscal').innerHTML=node('subtotal')+node('vat','tax');
 $('chart-areas').innerHTML=d.sections.map(s=>{const n=nodes.get(s.id),rows=d.line_items.filter(x=>x.section_id===s.id);return `<div class="area-branch"><button class="node ${rows.length?'':'allowance'}" data-node="${esc(s.id)}" ${rows.length?`data-toggle="${esc(s.id)}" aria-expanded="false" aria-controls="children-${esc(s.id)}"`:`data-detail="${esc(s.id)}"`}><strong>${esc(n.title)}</strong><span class="value">${money(s.summary_amount)}</span><small>${rows.length?`${rows.length} items · expand +`:'Summary only · view details'}</small></button>${rows.length?`<ul class="item-branch" id="children-${esc(s.id)}" hidden>${rows.map(x=>`<li>${node(x.id)}</li>`).join('')}</ul>`:''}</div>`}).join('');
 function drawEdges(){
  const chart=$('chart'),bounds=chart.getBoundingClientRect(),svg=$('edges');
  const visible=new Map([...chart.querySelectorAll('[data-node]')].filter(el=>el.getClientRects().length).map(el=>[el.dataset.node,el]));
  svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  svg.innerHTML=g.edges.filter(e=>visible.has(e.source)&&visible.has(e.target)).map(e=>{
   const a=visible.get(e.source).getBoundingClientRect(),b=visible.get(e.target).getBoundingClientRect();
   if(nodes.get(e.target).kind==='item'){
    const x=a.left-bounds.left+6,y=a.bottom-bounds.top,left=b.left-bounds.left-9,end=b.top-bounds.top+b.height/2;
    return `<path data-source="${esc(e.source)}" data-target="${esc(e.target)}" d="M${x},${y} V${y+8} H${left} V${end} H${b.left-bounds.left}"/>`;
   }
   const x=a.left-bounds.left+a.width/2,y=a.bottom-bounds.top,tx=b.left-bounds.left+b.width/2,ty=b.top-bounds.top,mid=y+12;
   const route=nodes.get(e.target).kind==='area'?`M${x},${y} V${mid} H${b.left-bounds.left-12} V${ty-12} H${tx} V${ty}`:`M${x},${y} V${mid} H${tx} V${ty}`;
   return `<path data-source="${esc(e.source)}" data-target="${esc(e.target)}" d="${route}"/>`;
  }).join('');
 }
 const redraw=()=>requestAnimationFrame(drawEdges);
 function toggle(button,expanded){button.setAttribute('aria-expanded',String(expanded));$('children-'+button.dataset.toggle).hidden=!expanded;button.querySelector('small').textContent=`${d.sections.find(s=>s.id===button.dataset.toggle).item_count} items · ${expanded?'collapse −':'expand +'}`;redraw()}
 const openDetail=id=>{
  const n=nodes.get(id),x=items.get(id),s=d.sections.find(s=>s.id===id);
  $('detail-title').textContent=n.title;
  $('detail-meta').textContent=x?`${x.section_name} · source no. ${x.source_sn} · ${id}`:n.kind==='area'?'Cost area · summary allowance':'Estimate cost structure';
  if(x){
   const facts=[['SI / retained quantity',quantity(x.quantity)],['SI / retained unit',x.unit_raw??'Not supplied'],['Rate per '+(x.unit_raw??'unspecified unit'),money(x.rate)],['Original quantity',Number(x.original.quantity).toLocaleString('en-IN',{maximumFractionDigits:12})],['Original unit',x.original.unit_raw??'Not supplied'],['Original unit rate',money(x.original.rate)],['No. multiplier',quantity(x.no)],['Printed line amount',money(x.amount)],['Source page',x.source.page]];
   const issues=d.issues.filter(issue=>JSON.stringify(issue).includes(x.id));
   $('detail-body').innerHTML=`<dl class="detail-values">${facts.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><h3>Conversion details</h3><p>${x.conversion.status==='converted'?`Quantity × ${esc(x.conversion.quantity_factor)}; unit rate ÷ ${esc(x.conversion.quantity_factor)}. Exact quantity: ${esc(x.quantity)} ${esc(x.unit_raw)}. Rate decimal: ${esc(x.rate)} per ${esc(x.unit_raw)}. Printed amount retained.`:x.conversion.status==='missing_unit'?'The source unit is missing. No dimensional conversion is assumed.':'Source count retained; no length or area conversion applies.'}</p><h3>Complete source description</h3><p class="source-description">${esc(x.description_raw??x.description)}</p>${issues.length?`<h3>Source qualifications</h3>${issues.map(i=>`<p>${esc(i.message)}</p>`).join('')}`:''}<a class="detail-source" href="${pdf(x.source.page)}" target="_blank" rel="noopener">Open original PDF · page ${x.source.page} ↗</a>`;
  }else{
   const text=s?'Summary allowance only. The source provides no detailed quantities, unit rates or item breakdown for this area.':id==='vat'?'VAT is printed at 13% of the subtotal.':id==='subtotal'?'Sum of all eight cost areas, including the two summary allowances, before VAT.':'Subtotal plus VAT. Currency is not stated in the source.';
   $('detail-body').innerHTML=`<p class="detail-amount">${money(n.amount)}</p><p>${esc(text)}</p><a href="${pdf(1)}" target="_blank" rel="noopener">Open summary · page 1 ↗</a>`;
  }
  if(x){
   const r=itemResearch.get(x.id);
   $('detail-body').innerHTML+=`<section class="rate-refs"><h3>Kathmandu public rate evidence</h3><p>${esc(r.qualification)}</p><ul>${r.reference_ids.map(id=>{const o=observations.get(id),source=sources.get(o.source_id);return `<li><strong>${esc(o.label)}: ${esc(rateLabel(o))}</strong><p>Published basis: NPR ${esc(range(o.low,o.high,o.price_qualifier))} / ${esc(unitLabel(o.unit))}. ${esc(o.basis.replaceAll('_',' '))}. VAT: ${esc(o.vat_status.replaceAll('_',' '))}. Availability: ${esc(o.availability.replaceAll('_',' '))}.</p><p>${esc(o.qualification)}</p><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.publisher)} · ${esc(id)} · source ↗</a><p>Published ${esc(source.published_date??'date not stated')}; retrieved ${esc(source.retrieved_date)}. ${esc(source.access_status.replaceAll('_',' '))}.</p></li>`}).join('')||'<li>No numeric reference verified. Obtain a scope-matched quote.</li>'}</ul><p>Original quote remains unchanged. No accepted replacement rate or market grand total has been assigned.</p></section>`;
  }
  $('detail').showModal();
 };
 document.addEventListener('click',event=>{const button=event.target.closest('[data-toggle], [data-detail]');if(!button)return;if(button.dataset.toggle)toggle(button,button.getAttribute('aria-expanded')!=='true');else openDetail(button.dataset.detail)});
 $('close-detail').addEventListener('click',()=>$('detail').close());
 $('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
 $('expand-all').addEventListener('click',()=>document.querySelectorAll('[data-toggle]').forEach(b=>toggle(b,true)));
 $('collapse-all').addEventListener('click',()=>document.querySelectorAll('[data-toggle]').forEach(b=>toggle(b,false)));
 $('area').innerHTML+=d.sections.filter(s=>s.item_count).map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
 function render(){
  const area=$('area').value,q=$('search').value.trim().toLowerCase(),sort=$('sort').value;
  const evidenceFilter=$('evidence-filter').value;
  const rows=d.line_items.filter(x=>(!evidenceFilter||(evidenceFilter==='has-reference'?itemResearch.get(x.id).reference_ids.length:!itemResearch.get(x.id).reference_ids.length))&&(!area||x.section_id===area)&&(!q||`${nodes.get(x.id).title} ${x.description} ${x.section_name} ${x.id}`.toLowerCase().includes(q)));
  if(sort!=='source')rows.sort((a,b)=>(a.amount_minor-b.amount_minor)*(sort==='desc'?-1:1));
  $('count').textContent=`${rows.length} of 51 items · displayed amount ${money(rows.reduce((sum,x)=>sum+x.amount_minor,0)/100)} · before allowances and VAT`;
  $('items').innerHTML=rows.length?d.sections.map(section=>{
   const areaRows=rows.filter(x=>x.section_id===section.id);
   if(!areaRows.length)return '';
   const areaTotal=areaRows.reduce((sum,x)=>sum+x.amount_minor,0)/100;
   return `<section class="area-table" aria-labelledby="table-${esc(section.id)}"><header class="area-table-head"><h3 id="table-${esc(section.id)}">${esc(section.name)}</h3><p>${areaRows.length} items · ${areaRows.length===section.item_count?'Area total':'Matching items total'} <strong>${money(areaTotal)}</strong></p></header><div class="table-scroll"><table><caption class="sr-only">${esc(section.name)} — concise source-linked estimate items</caption><thead><tr><th>Scope title · click for details</th><th class="num">SI / count quantity</th><th>Unit</th><th class="num">Rate / unit</th><th class="num">Amount</th><th>Public rate evidence · NPR</th></tr></thead><tbody>${areaRows.map(x=>`<tr><td><button class="scope-link" data-detail="${esc(x.id)}">${esc(nodes.get(x.id).title)}</button><small class="item-id">${esc(x.id)} · source no. ${esc(x.source_sn)}</small></td><td class="num">${quantity(x.quantity)}</td><td>${esc(x.unit_raw??'—')}</td><td class="num">${money(x.rate)}</td><td class="num">${money(x.amount)}</td><td class="market-cell">${evidence(x)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row" colspan="4">${areaRows.length===section.item_count?'Area total':'Matching items total'} · before VAT</th><td class="num">${money(areaTotal)}</td><td>Original amount retained</td></tr></tfoot></table></div></section>`;
  }).join(''):'<p class="empty">No matching items.</p>';
 }
 for(const id of ['area','search','sort','evidence-filter'])$(id).addEventListener(id==='search'?'input':'change',render);
 $('issues').innerHTML=d.issues.map(x=>`<li>${esc(x.message)}</li>`).join('');
 render();$('status').hidden=true;$('content').hidden=false;
 new ResizeObserver(redraw).observe($('chart'));redraw();
}
if(typeof document!=='undefined')init().catch(error=>{$('status').textContent=`Unable to load v4. ${error.message}. Use the original estimate or refresh.`});

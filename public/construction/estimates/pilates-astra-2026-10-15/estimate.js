const $=id=>document.getElementById(id);
const amount=n=>Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pdf=page=>`./source/pilates-estimate-astra.pdf#page=${page}`;
async function init(){
 const response=await fetch('./data/estimate.json');
 if(!response.ok)throw new Error(`Data request failed (${response.status})`);
 const d=await response.json();
 $('grand').textContent=amount(d.summary.grand_total);$('subtotal').textContent=amount(d.summary.subtotal);$('vat').textContent=amount(d.summary.vat_amount);
 $('areas').innerHTML=d.sections.map(s=>{const share=Number(s.summary_amount)/Number(d.summary.subtotal)*100;return `<tr><td>${escape(s.name)}</td><td><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${share}%"></span></span><span class="bar-label">${share.toFixed(1)}%</span></td><td><span class="coverage ${s.item_count?'':'allowance'}">${s.item_count?s.item_count+' items · pp. '+s.pages.join(', '):'Summary only'}</span></td><td class="num">${amount(s.summary_amount)}</td></tr>`}).join('');
 $('area-filter').innerHTML+=d.sections.filter(s=>s.item_count).map(s=>`<option value="${escape(s.id)}">${escape(s.name)}</option>`).join('');
 function render(){
  const area=$('area-filter').value,query=$('search').value.trim().toLowerCase(),sort=$('sort').value;
  const rows=d.line_items.filter(x=>(!area||x.section_id===area)&&(!query||`${x.description} ${x.section_name} ${x.id} ${x.source_sn}`.toLowerCase().includes(query)));
  if(sort!=='source')rows.sort((a,b)=>(a.amount_minor-b.amount_minor)*(sort==='amount-desc'?-1:1));
  const total=rows.reduce((s,r)=>s+r.amount_minor,0)/100;
  $('result-count').textContent=`${rows.length} of ${d.line_items.length} items · sum of displayed amounts: ${amount(total)} (before allowances and VAT)`;
  $('items').innerHTML=rows.length?rows.map(x=>`<tr><td>${escape(x.section_name)}<small>Source no. ${escape(x.source_sn)} · ${escape(x.id)}</small></td><td>${escape(x.description)}</td><td>${escape(x.unit_raw??'—')}</td><td class="num">${escape(x.no)}</td><td class="num">${escape(x.quantity)}</td><td class="num">${amount(x.rate)}</td><td class="num">${amount(x.amount)}</td><td><a href="${pdf(x.source.page)}" target="_blank" rel="noopener">Page ${x.source.page} ↗</a></td></tr>`).join(''):'<tr><td colspan="8">No matching items. Change the filters to see more.</td></tr>';
 }
 for(const id of ['search','area-filter','sort'])$(id).addEventListener(id==='search'?'input':'change',render);
 render();
 $('issues').innerHTML=d.issues.map(x=>`<li><strong>${escape(x.type.replaceAll('_',' '))}</strong>${escape(x.message)}</li>`).join('');
 const v=d.validation;
 $('validation').innerHTML=`<p>All ${v.pages} pages were reviewed. Every line product agrees with its printed amount after rounding to two decimals. Interior summary: ${amount(v.interior_sum)}. Subtotal: ${amount(v.subtotal_calculated)}. VAT: ${amount(v.vat_calculated)}. Grand total: ${amount(v.grand_total_calculated)}.</p><p>VAT before rounding: ${escape(v.vat_unrounded)}. Detail totals and summary totals are kept separately because the coffee lounge total is printed as 591770.9 and the studio total as 1964709, while their summary values retain two decimals.</p>`;
 const labels=['Summary','Reception · part 1','Reception · part 2','Coffee lounge','Locker Space','Studio','Changing Room','Washroom'];
 $('pages').innerHTML=labels.map((label,i)=>`<a href="${pdf(i+1)}" target="_blank" rel="noopener">Page ${i+1}<small>${label}</small></a>`).join('');
 $('checksum').textContent=`Original PDF SHA-256: ${d.source.sha256}`;
 $('load-status').hidden=true;$('estimate').hidden=false;
}
init().catch(error=>{$('load-status').textContent=`The estimate could not load. ${error.message}. Open the original PDF or refresh this page.`;});

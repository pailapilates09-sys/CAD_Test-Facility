const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>(n/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const integer=n=>n.toLocaleString('en-IN',{maximumFractionDigits:0});
const percent=n=>n.toLocaleString('en-IN',{maximumFractionDigits:1})+'%';
const palette={original:'#155b63',compatible:'#155b63',different:'#5b718e',held:'#916816'};
export function deriveGraphs(rows,sections,comparisonItems){
 const lookup=new Map(comparisonItems.map(x=>[x.id,x]));
 const items=rows.map(x=>{
  const reference=lookup.get(x.id);
  if(!reference)throw new Error(`Missing comparison record: ${x.id}`);
  const category=reference.status==='on_hold_original_retained'?'held':reference.references.some(r=>r.unit_matches_estimate)?'compatible':'different';
  return {id:x.id,section_id:x.section_id,section_name:x.section_name,title:reference.title,amount_minor:x.amount_minor,category};
 });
 const total_minor=items.reduce((n,x)=>n+x.amount_minor,0);
 const areas=sections.map(s=>{
  const members=items.filter(x=>x.section_id===s.id);
  return {id:s.id,name:s.name,count:members.length,amount_minor:members.reduce((n,x)=>n+x.amount_minor,0),counts:Object.fromEntries(['compatible','different','held'].map(k=>[k,members.filter(x=>x.category===k).length]))};
 }).filter(s=>s.count);
 return {count:items.length,total_minor,held_count:items.filter(x=>x.category==='held').length,areas,ranked:items.sort((a,b)=>b.amount_minor-a.amount_minor||a.id.localeCompare(b.id))};
}
const niceMax=n=>{if(n<=0)return 1;const p=10**Math.floor(Math.log10(n));return Math.ceil(n/p)*p};
function frame(id,title,description,height,marks){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(description)}</desc><style>text{font-family:Arial,Helvetica,sans-serif;font-size:14px;fill:#19383f}.small{font-size:12px;fill:#536b71}.tick{font-size:12px;fill:#536b71}</style>${marks}</svg>`;
}
function axis(maximum,left,right,bottom,unit,count=false){
 let out=`<text class="small" x="${left}" y="20">${esc(unit)} · zero baseline</text>`;
 for(let t=0;t<=4;t++){
  const value=maximum*t/4,x=left+(right-left)*t/4;
  out+=`<line x1="${x}" x2="${x}" y1="34" y2="${bottom}" stroke="#e0e8e8"/><text class="tick" x="${x}" y="${bottom+25}" text-anchor="middle">${count?value:integer(value/100)}</text>`;
 }
 return out+`<line x1="${left}" x2="${right}" y1="${bottom}" y2="${bottom}" stroke="#93a7aa"/>`;
}
function wrap(text,max=38){
 const lines=[''];for(const word of text.split(' ')){let i=lines.length-1;if(lines[i]&&(lines[i]+' '+word).length>max){lines.push(word)}else lines[i]+=(lines[i]?' ':'')+word}return lines;
}
export function areaChart(d){
 if(!d.count)return '<p class="empty">No matching items to graph.</p>';
 const areas=[...d.areas].sort((a,b)=>b.amount_minor-a.amount_minor),left=220,right=760,bottom=44+areas.length*70,max=niceMax(Math.max(...areas.map(s=>s.amount_minor))*1.06);
 let marks=axis(max,left,right,bottom,'Original amount · currency unspecified');
 areas.forEach((s,i)=>{const y=68+i*70,w=s.amount_minor/max*(right-left);marks+=`<g data-area="${esc(s.id)}" data-amount-minor="${s.amount_minor}"><title>${esc(s.name)}: ${money(s.amount_minor)}; ${s.count} items; ${percent(s.amount_minor/d.total_minor*100)} of displayed total.</title><text x="8" y="${y-1}">${esc(s.name)}</text><text class="small" x="8" y="${y+18}">${s.count} item${s.count===1?'':'s'}</text><rect x="${left}" y="${y-14}" width="${w}" height="29" rx="3" fill="${palette.original}"/><text x="782" y="${y+4}">${money(s.amount_minor)}</text><text class="small" x="970" y="${y+4}" text-anchor="end">${percent(s.amount_minor/d.total_minor*100)}</text></g>`});
 return frame('area-cost','Original amount by area',areas.map(s=>`${s.name}: ${money(s.amount_minor)}`).join('; ')+'. Excludes summary-only allowances and VAT; currency unspecified.',bottom+50,marks);
}
export function itemChart(d,showAll=false){
 if(!d.count)return '<p class="empty">No matching items to graph.</p>';
 const rows=showAll?d.ranked:d.ranked.slice(0,10),left=360,right=810,max=niceMax(d.ranked[0].amount_minor*1.06);
 let y=44;const positions=rows.map(x=>{const lines=wrap(x.title),at=y+25;y+=Math.max(78,lines.length*19+48);return {x,lines,at}}),bottom=y+4;
 let marks=axis(max,left,right,bottom,'Original amount · currency unspecified');
 positions.forEach(({x,lines,at},i)=>{const held=x.category==='held';marks+=`<g data-item="${esc(x.id)}" data-amount-minor="${x.amount_minor}"><title>${esc(x.title+' · '+x.section_name)}: ${money(x.amount_minor)}${held?'; on hold, original retained':''}.</title>${lines.map((line,j)=>`<text x="8" y="${at-8+j*19}">${j===0?`${i+1}. `:''}${esc(line)}</text>`).join('')}<text class="small" x="8" y="${at+lines.length*19-5}">${esc(x.section_name)}${held?' · ON HOLD':''}</text><rect x="${left}" y="${at-13}" width="${x.amount_minor/max*(right-left)}" height="28" rx="3" fill="${held?palette.held:palette.original}"/><text x="836" y="${at+6}">${money(x.amount_minor)}</text></g>`});
 return frame('item-cost','Largest original item amounts',`${rows.length} of ${d.count} filtered items, descending by printed line amount. `+rows.map(x=>`${x.title}: ${money(x.amount_minor)}${x.category==='held'?' (on hold)':''}`).join('; ')+'. Original currency unspecified.',bottom+50,marks);
}
export function evidenceChart(d){
 if(!d.count)return '<p class="empty">No matching items to graph.</p>';
 const left=220,right=820,bottom=44+d.areas.length*68,max=Math.max(4,Math.ceil(Math.max(...d.areas.map(x=>x.count))/4)*4);
 let marks=axis(max,left,right,bottom,'Item count',true);
 for(const [i,s]of d.areas.entries()){
  const y=68+i*68;let start=0;
  marks+=`<text x="8" y="${y+5}">${esc(s.name)}</text><g data-area="${esc(s.id)}"><title>${esc(s.name)}: ${s.counts.compatible} same-unit, ${s.counts.different} different-unit only, ${s.counts.held} on hold.</title>`;
  for(const k of ['compatible','different','held']){const n=s.counts[k];if(n){const x=left+start/max*(right-left),w=n/max*(right-left);marks+=`<rect data-category="${k}" data-count="${n}" x="${x}" y="${y-15}" width="${w}" height="30" fill="${palette[k]}"/><text x="${x+w/2}" y="${y+5}" text-anchor="middle" style="fill:white;font-weight:bold">${n}</text>`}start+=n}
  marks+=`<text x="845" y="${y+5}">${s.count} item${s.count===1?'':'s'}</text></g>`;
 }
 return frame('evidence-counts','Rate evidence by area',d.areas.map(s=>`${s.name}: ${s.counts.compatible} same-unit, ${s.counts.different} different-unit only, ${s.counts.held} on hold`).join('; ')+'. Each item counted once. Scope unverified; no exact-scope quotations.',bottom+50,marks);
}
export function renderOverview(rows,sections,comparisonItems,showAll=false){
 const d=deriveGraphs(rows,sections,comparisonItems),$=id=>document.getElementById(id);
 $('graph-summary').textContent=`${d.count} matching items · ${d.areas.length} detailed areas · original amount ${money(d.total_minor)} · ${d.held_count} on hold included once`;
 $('graph-area').innerHTML=areaChart(d);$('graph-items').innerHTML=itemChart(d,showAll);$('graph-evidence').innerHTML=evidenceChart(d);
 $('graph-limit').textContent=`Showing ${showAll?d.count:Math.min(10,d.count)} of ${d.count} matching items, largest first. Exact amounts label every bar.`;
 $('graph-show-all').textContent=showAll?'Show top 10':'Show all items';$('graph-show-all').setAttribute('aria-expanded',String(showAll));$('graph-show-all').hidden=d.count<=10;
 return d;
}

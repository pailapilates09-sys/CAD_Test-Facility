const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const short=n=>Number(n).toLocaleString('en-IN',{maximumFractionDigits:0});
const label=r=>r.low===null?'Not published':r.high===null?'From '+money(r.low):r.low===r.high?money(r.low):money(r.low)+'–'+money(r.high)+(r.qualifier==='open_upper_bound'?'+':'');
const matching=(item,r)=>r.unit_matches_estimate&&r.currency==='NPR'&&item.si.unit!==null;
export function rangePosition(item,r,assumeNPR=false){
 if(!matching(item,r))return {state:'different',text:`Different units or currency · original per ${item.si.unit_label}; reference ${r.currency} per ${r.unit_label}. No original overlay.`};
 if(!assumeNPR)return {state:'hidden',text:'Select the original estimate marker to compare, assuming NPR.'};
 if(r.low===null)return {state:'unknown',text:'Published minimum unavailable. No distance calculated.'};
 const valueMinor=Math.round(Number(item.si.rate)*100),lowMinor=Math.round(Number(r.low)*100),highMinor=r.high===null?null:Math.round(Number(r.high)*100);
 const value=valueMinor/100,low=lowMinor/100,high=highMinor===null?null:highMinor/100,fromLow=(valueMinor-lowMinor)/100,fromHigh=highMinor===null?null:(valueMinor-highMinor)/100;
 const signed=n=>(n>0?'+':n<0?'−':'')+money(Math.abs(n));
 const result={value,low,high,fromLow,fromHigh,position:null};
 if(high===null||r.qualifier==='open_upper_bound')return {...result,state:'open',text:`${money(Math.abs(fromLow))} ${fromLow<0?'below':fromLow>0?'above':'from'} the published starting price · maximum unknown.`,distance:`Δ from starting price: ${signed(fromLow)} NPR / ${r.unit_label}`};
 if(high===low)return {...result,state:'point',text:fromLow===0?'Same numeric rate as this listed price.':`${money(Math.abs(fromLow))} ${fromLow<0?'below':'above'} this listed price.`,distance:`Δ from listed price: ${signed(fromLow)} NPR / ${r.unit_label} · single price, no range position`};
 const position=(value-low)/(high-low)*100,state=value<low?'below':value>high?'above':'within';
 return {...result,state,position,text:state==='below'?`${money(low-value)} below the published minimum.`:state==='above'?`${money(value-high)} above the published maximum.`:`${position.toFixed(1)}% along the published range · low 0% → high 100%.`,distance:`Δ from low: ${signed(fromLow)} · Δ from high: ${signed(fromHigh)} NPR / ${r.unit_label}`};
}
export function rangePlot(item,r,showOriginal=false){
 if(r.low===null)return '<p class="range-empty">No numeric public range.</p>';
 const show=showOriginal&&matching(item,r),value=show?Math.round(Number(item.si.rate)*100)/100:null,low=Number(r.low),high=r.high===null?null:Number(r.high);
 const rawMax=Math.max(low,high??low,value??0,1)*1.16,power=10**Math.floor(Math.log10(rawMax)),maximum=Math.ceil(rawMax/power)*power;
 const left=40,right=680,scale=n=>left+Number(n)/maximum*(right-left),x1=scale(low),x2=high===null?Math.min(right,x1+32):scale(high),uid=`range-${item.id}-${r.id}`;
 let marks='';for(let i=0;i<=4;i++){const n=maximum*i/4,x=scale(n);marks+=`<line x1="${x}" x2="${x}" y1="30" y2="89" class="range-grid"/><text x="${x}" y="111" text-anchor="middle">${short(n)}</text>`}
 marks+=`<line x1="${left}" x2="${right}" y1="89" y2="89" class="range-axis"/>`;
 if(high===low)marks+=`<circle cx="${x1}" cy="61" r="5" class="range-dot"/>`;
 else marks+=`<line x1="${x1}" x2="${x2}" y1="61" y2="61" class="range-band"/><line x1="${x1}" x2="${x1}" y1="53" y2="69" class="range-cap"/>${high===null||r.qualifier==='open_upper_bound'?`<path d="M${x2-7},54 L${x2+1},61 L${x2-7},68" class="range-arrow"/>`:`<line x1="${x2}" x2="${x2}" y1="53" y2="69" class="range-cap"/>`}`;
 if(show){const x=scale(value);marks+=`<g data-estimate-marker="${esc(item.id)}"><line x1="${x}" x2="${x}" y1="25" y2="85" class="range-original-line"/><path d="M${x},51 L${x+9},61 L${x},71 L${x-9},61 Z" class="range-original"/><text x="${Math.max(100,Math.min(620,x))}" y="18" text-anchor="middle" class="range-original-label">Original ${money(value)}</text></g>`}
 return `<svg viewBox="0 0 720 124" role="img" aria-labelledby="${uid}-title ${uid}-desc"><title id="${uid}-title">${esc(item.title+' · '+r.id)}</title><desc id="${uid}-desc">Public ${esc(label(r))} ${esc(r.currency)} per ${esc(r.unit_label)}.${show?' Original '+money(value)+' under the unconfirmed NPR assumption.':' Original marker hidden.'} Independent zero-based axis; scope unverified.</desc>${marks}</svg>`;
}
export function itemRangeCard(item,show=false){
 const held=item.status==='on_hold_original_retained',canCompare=item.references.some(r=>matching(item,r)),enabled=show&&canCompare&&!held;
 return `<article class="range-item" id="range-item-${esc(item.id)}" data-range-item="${esc(item.id)}"><header class="range-item-head"><div><small>${esc(item.id)}</small><h4><button class="scope-link" data-detail="${esc(item.id)}">${esc(item.title)}</button></h4><p>Original <strong>${money(item.si.rate)} / ${esc(item.si.unit_label)}</strong> · currency unspecified</p></div><button class="plain-button range-toggle" data-range-toggle="${esc(item.id)}" aria-pressed="${enabled}" ${!canCompare||held?'disabled':''} aria-label="${enabled?'Hide':'Show'} original marker for ${esc(item.title)}, assuming NPR" title="NPR assumption only; matching scope remains unverified"><i class="estimate-key" aria-hidden="true"></i>${held?'On hold':!canCompare?'Units differ':enabled?'Hide original marker':'Show original marker'}</button></header>${held?'<p class="range-empty held">On hold · original rate and amount retained. No public replacement reference assigned.</p>':item.references.map(r=>{const position=rangePosition(item,r,enabled);return `<section class="range-reference" data-range-ref="${esc(item.id+'-'+r.id)}"><div class="range-reference-head"><div><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.id+' · '+r.publisher)} ↗</a><small>${esc(r.basis.replaceAll('_',' '))} · ${esc(r.qualifier.replaceAll('_',' '))}</small></div><div><strong>${esc(label(r))}</strong><small>${esc(r.currency)} / ${esc(r.unit_label)}</small></div></div><div class="range-plot" tabindex="0" role="region" aria-label="${esc(item.title+' · '+r.id+' range plot; scroll horizontally if needed')}">${rangePlot(item,r,enabled)}</div><div class="range-position ${position.state}">${enabled&&matching(item,r)?'<small class="range-scenario">NPR assumed · scope unverified</small>':''}<strong>${esc(position.text)}</strong>${position.distance?'<small>'+esc(position.distance)+'</small>':''}</div><details class="range-evidence"><summary>Scope, date + source details</summary><p>${esc(r.label)}. ${esc(r.qualification)}</p><p>Availability: ${esc(r.availability.replaceAll('_',' '))} · ${esc(r.source_access.replaceAll('_',' '))}. Published ${esc(r.published_date??'date not stated')}; retrieved ${esc(r.retrieved_date)}.</p>${r.source_note?'<p>'+esc(r.source_note)+'</p>':''}<a href="${esc(r.url)}" target="_blank" rel="noopener">Open original source ↗</a></details></section>`}).join('')}</article>`;
}
export function boardMarkup(items,sections,show=false,overrides=new Map()){
 if(!items.length)return '<p class="range-empty">No matching items. Change the table filters above.</p>';
 return sections.map(s=>{const rows=items.filter(x=>x.section_id===s.id);return rows.length?`<section class="range-area" id="range-area-${esc(s.id)}"><header><h3>${esc(s.name)}</h3><span>${rows.length} items</span><a href="#graphs-title">Back to chart controls ↑</a></header>${rows.map(x=>itemRangeCard(x,overrides.get(x.id)??show)).join('')}</section>`:''}).join('');
}
export function createRangeBoard(data){
 const $=id=>document.getElementById(id),lookup=new Map(data.items.map(x=>[x.id,x])),overrides=new Map();let current=[];
 function draw(){const show=$('assume-npr').checked,held=current.filter(x=>x.status==='on_hold_original_retained').length,compatible=current.filter(x=>x.references.some(r=>matching(x,r))).length;
  $('board-assume-npr').checked=show;$('range-board-summary').textContent=`${current.length} matching items · ${compatible} with same-unit references · ${current.length-compatible-held} with different-unit references only · ${held} on hold`;
  $('range-board').innerHTML=boardMarkup(current,data.sections,show,overrides);
  $('range-area-links').innerHTML=data.sections.filter(s=>current.some(x=>x.section_id===s.id)).map(s=>`<a href="#range-area-${esc(s.id)}">${esc(s.name)}</a>`).join('');
 }
 $('assume-npr').addEventListener('change',()=>{overrides.clear();draw()});
 $('board-assume-npr').addEventListener('change',()=>{$('assume-npr').checked=$('board-assume-npr').checked;$('assume-npr').dispatchEvent(new Event('change'))});
 $('range-board').addEventListener('click',event=>{const button=event.target.closest('[data-range-toggle]');if(!button||button.disabled)return;const id=button.dataset.rangeToggle;overrides.set(id,!(overrides.get(id)??$('assume-npr').checked));draw()});
 return rows=>{current=rows.map(x=>{const item=lookup.get(x.id);if(!item)throw new Error('Missing comparison record '+x.id);return item});draw()};
}

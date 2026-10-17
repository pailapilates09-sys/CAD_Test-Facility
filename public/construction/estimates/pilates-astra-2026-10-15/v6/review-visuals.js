import {rangePosition} from '../v5.1/range-board.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
const trim=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;
export function positionRows(items){
 return items.flatMap(item=>item.status==='on_hold_original_retained'?[]:item.references.flatMap(reference=>{
  const p=rangePosition(item,reference,true);
  return ['within','below','above'].includes(p.state)?[{id:item.id+'__'+reference.id,item,reference,...p}]:[];
 }));
}
export function positionOverview(rows){
 if(!rows.length)return '<p class="range-empty">No matching closed, same-unit public ranges. Single prices, open bounds, different units and held items remain in the detailed comparisons below.</p>';
 const left=430,right=930,width=right-left,scale=n=>left+(n+50)/250*width,height=75+rows.length*48;
 let marks=`<rect x="${scale(0)}" y="35" width="${scale(100)-scale(0)}" height="${height-65}" fill="#fbf1d8"/>`;
 for(const v of [-50,0,50,100,150,200])marks+=`<line x1="${scale(v)}" x2="${scale(v)}" y1="35" y2="${height-30}" class="review-grid"/><text x="${scale(v)}" y="23" text-anchor="middle">${v}%</text>`;
 rows.forEach((r,i)=>{const y=65+i*48,x=scale(Math.max(-50,Math.min(200,r.position))),outside=r.position< -50||r.position>200;
  const marker=outside?`<path d="${r.position>200?`M${x-11},${y-7} L${x},${y} L${x-11},${y+7}`:`M${x+11},${y-7} L${x},${y} L${x+11},${y+7}`}" class="position-overflow"/>`:`<path d="M${x},${y-7} L${x+6},${y} L${x},${y+7} L${x-6},${y} Z" class="position-diamond"/>`;
  marks+=`<a href="#range-item-${esc(r.item.id)}" data-position-id="${esc(r.id)}" tabindex="0" aria-label="${esc(r.item.title+'; '+r.reference.id+'; '+pct(r.position)+' of published span; NPR assumed')}"><title>${esc(r.item.title+' · '+r.reference.publisher+' · '+pct(r.position))}</title><rect x="0" y="${y-19}" width="1100" height="45" fill="transparent"/><text x="8" y="${y-3}">${esc(trim(r.item.title,42))}</text><text class="review-small" x="8" y="${y+15}">${esc(trim(r.item.section_name+' · '+r.reference.id+' · '+r.reference.basis.replaceAll('_',' '),58))}</text><line x1="${left}" x2="${right}" y1="${y}" y2="${y}" class="position-guide"/>${marker}<text class="position-label" x="955" y="${y+5}">${pct(r.position)}</text></a>`;
 });
 return `<svg viewBox="0 0 1100 ${height}" role="img" aria-labelledby="position-title position-desc"><title id="position-title">Original rate position within each public price range</title><desc id="position-desc">${rows.length} source comparisons. Shaded band is published low 0% to high 100%. Original rates assume NPR and scope remains unverified. The visible axis is minus 50% to 200%. Arrows show observations outside the window; exact positions are labeled, never clipped numerically. Each row links to its detailed evidence.</desc>${marks}</svg>`;
}
// Balanced binary treemap: every rectangle's area is proportional to its non-negative weight.
export function splitRectangles(nodes,rect={x:0,y:0,w:1100,h:650}){
 if(!nodes.length)return [];
 if(nodes.length===1)return [{...nodes[0],x:rect.x,y:rect.y,w:rect.w,h:rect.h}];
 const total=nodes.reduce((n,x)=>n+x.weight,0);let sum=0,index=1,best=Infinity;
 for(let i=1;i<nodes.length;i++){sum+=nodes[i-1].weight;const distance=Math.abs(total/2-sum);if(distance<best){best=distance;index=i}}
 const a=nodes.slice(0,index),b=nodes.slice(index),fraction=a.reduce((n,x)=>n+x.weight,0)/total;
 const first=rect.w>=rect.h?{...rect,w:rect.w*fraction}:{...rect,h:rect.h*fraction};
 const second=rect.w>=rect.h?{...rect,x:rect.x+first.w,w:rect.w-first.w}:{...rect,y:rect.y+first.h,h:rect.h-first.h};
 return [...splitRectangles(a,first),...splitRectangles(b,second)];
}
export function costLayout(items,sections){
 for(const item of items)if(!Number.isSafeInteger(item.original.amount_minor)||item.original.amount_minor<0)throw new Error('Invalid original amount for '+item.id);
 const positive=items.filter(x=>x.original.amount_minor>0),zero=items.filter(x=>x.original.amount_minor===0),total=items.reduce((n,x)=>n+x.original.amount_minor,0);
 const areas=splitRectangles(sections.map(s=>({id:s.id,name:s.name,weight:positive.filter(x=>x.section_id===s.id).reduce((n,x)=>n+x.original.amount_minor,0)})).filter(s=>s.weight>0).sort((a,b)=>b.weight-a.weight));
 const cells=areas.flatMap(area=>splitRectangles(positive.filter(x=>x.section_id===area.id).map(item=>({id:item.id,item,area,weight:item.original.amount_minor})).sort((a,b)=>b.weight-a.weight),area));
 return {areas,cells,zero,total};
}
export function costTreemap(layout){
 if(!layout.total)return '<p class="range-empty">No positive original amounts in this filtered selection.</p>';
 let shapes='<defs><pattern id="held-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f6ead1"/><path d="M-2,2 L2,-2 M0,8 L8,0 M6,10 L10,6" stroke="#b18128" stroke-width="1.3"/></pattern></defs>';
 for(const c of layout.cells){const held=c.item.status==='on_hold_original_retained',title=trim(c.item.title,Math.max(3,Math.floor((c.w-16)/8.5))),hasLabel=c.w>100&&c.h>65,top=Math.max(c.y+25,c.area.y+58),show=hasLabel&&top+24<c.y+c.h;
  shapes+=`<a href="#range-item-${esc(c.id)}" data-treemap-item="${esc(c.id)}" data-detail="${esc(c.id)}" tabindex="0" aria-label="${esc(c.item.title+'; '+c.item.section_name+'; original amount '+money(c.weight/100)+'; '+pct(c.weight/layout.total*100)+' of matching original detailed total'+(held?'; on hold':''))}"><title>${esc(c.item.title+' · '+money(c.weight/100))}</title><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${held?'url(#held-hatch)':'#c8dfdb'}" stroke="white" stroke-width="2"/>${show?`<text x="${c.x+8}" y="${top}" class="treemap-item-label">${esc(title)}</text><text x="${c.x+8}" y="${top+23}" class="treemap-item-label">${money(c.weight/100)}</text>`:''}</a>`;
 }
 for(const a of layout.areas){shapes+=`<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" fill="none" stroke="#335c60" stroke-width="2" pointer-events="none"/>`;if(a.w>105&&a.h>35)shapes+=`<g pointer-events="none"><rect x="${a.x+3}" y="${a.y+3}" width="${a.w-6}" height="29" fill="white" fill-opacity=".92"/><text x="${a.x+9}" y="${a.y+23}" class="treemap-area-label">${esc(trim(a.name,Math.floor((a.w-20)/10)))}</text></g>`}
 return `<svg viewBox="0 0 1100 650" role="img" aria-labelledby="treemap-title treemap-desc"><title id="treemap-title">Original detailed cost treemap</title><desc id="treemap-desc">${layout.cells.length} positive-cost items grouped into ${layout.areas.length} areas. Rectangle areas are proportional to original line amounts. Total ${money(layout.total/100)}, source currency unspecified, before VAT and summary allowances. Hatched items are on hold and remain included once. ${layout.zero.length} zero-amount item(s) have no rectangle. Hover, focus, select or tap for full item details.</desc>${shapes}</svg>`;
}
export function createReviewVisuals(data,{detailLabel='Full scope + image'}={}){
 const $=id=>document.getElementById(id),lookup=new Map(data.items.map(x=>[x.id,x]));let current=[],layout,positions=[],selected='';
 function inspect(id){const item=current.find(x=>x.id===id);if(!item)return;selected=id;$('treemap-item').value=id;$('treemap-inspect').innerHTML=`<strong>${esc(item.section_name+' · '+item.title)}</strong><span>Original amount ${money(item.original.amount_minor/100)} · ${layout.total?pct(item.original.amount_minor/layout.total*100):'0.0%'} of matching detailed total · currency unspecified${item.status==='on_hold_original_retained'?' · ON HOLD':''}</span><button class="plain-button" data-detail="${esc(id)}">${esc(detailLabel)} ↗</button>`}
 const hoverMap=event=>{const target=event.target.closest('[data-treemap-item]');if(target)inspect(target.dataset.treemapItem)};
 for(const event of ['pointerover','focusin'])$('cost-treemap').addEventListener(event,hoverMap);
 $('treemap-item').addEventListener('change',()=>inspect($('treemap-item').value));
 const hoverPosition=event=>{const target=event.target.closest('[data-position-id]');if(!target)return;const p=positions.find(x=>x.id===target.dataset.positionId);if(!p)return;$('position-inspect').innerHTML=`<strong>${esc(p.item.section_name+' · '+p.item.title+' · '+p.reference.id+' · '+p.reference.publisher)}</strong><span>Original ${money(p.value)}; reference ${money(p.low)}–${money(p.high)} NPR / ${esc(p.reference.unit_label)}. ${esc(p.text)} NPR assumed; scope unverified.</span><a href="#range-item-${esc(p.item.id)}">Open range + source ↓</a>`};
 for(const event of ['pointerover','focusin'])$('position-overview').addEventListener(event,hoverPosition);
 return rows=>{current=rows.map(x=>{const item=lookup.get(x.id);if(!item)throw new Error('Missing comparison record '+x.id);return item});positions=positionRows(current);layout=costLayout(current,data.sections);
  $('position-overview').innerHTML=positionOverview(positions);$('position-count').textContent=`${positions.length} closed-range source comparisons across ${new Set(positions.map(x=>x.item.id)).size} items. Single prices, open bounds, incompatible units and held items stay in the detailed comparisons.`;
  $('position-inspect').textContent='Hover or focus a row for its exact original rate, reference bounds and source ID. The original marker is already visible.';
  $('cost-treemap').innerHTML=costTreemap(layout);$('treemap-total').textContent=`Matching original detailed amount: ${money(layout.total/100)} · ${current.length} items · currency unspecified · before summary allowances and VAT`;
  $('treemap-areas').innerHTML=layout.areas.map(a=>`<span>${esc(a.name)} · ${money(a.weight/100)} · ${pct(a.weight/layout.total*100)}</span>`).join('');
  $('treemap-zero').innerHTML=layout.zero.map(x=>`<span>Zero amount · no area: <button class="scope-link" data-detail="${esc(x.id)}">${esc(x.title)}</button> · ${money(0)}</span>`).join('');
  $('treemap-item').innerHTML=current.map(x=>`<option value="${esc(x.id)}">${esc(x.section_name+' · '+x.title)}</option>`).join('');
  if(current.length)inspect(current.some(x=>x.id===selected)?selected:[...current].sort((a,b)=>b.original.amount_minor-a.original.amount_minor)[0].id);else{$('treemap-inspect').textContent='No matching items.';$('treemap-item').value=''}
 };
}

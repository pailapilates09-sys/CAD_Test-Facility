import {mobileQuery} from './mobile-config.js';

const text=node=>String(node.textContent??'').replace(/\s+/g,' ').trim();
const set=(node,name,value)=>{if(node.getAttribute(name)!==value)node.setAttribute(name,value)};
const flag=(node,name,on)=>{if(on)set(node,name,'');else node.removeAttribute(name)};
const role=(node,value)=>{if(!node.getAttribute('role'))node.setAttribute('role',value)};
const wideLabel=/description|purpose|scope|basis|evidence|reference|still required|stock|preserved work|next batch|proof|contract|limitation|stage \d/i;

// Keep the original table, row, controls, values and event listeners. Only annotate its layout.
// Explicit table roles retain semantics when CSS changes the display model on phones:
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/table_role
export function decorateMobileTable(table){
 const head=table.tHead,headRows=Array.from(head?.rows??[]);
 const headers=Array.from(headRows[0]?.cells??[]);
 const sections=[...Array.from(table.tBodies??[]),...(table.tFoot?[table.tFoot]:[])];
 const rows=sections.flatMap(section=>Array.from(section.rows));
 const invalid=headRows.length!==1||headers.length<2||headers.some(c=>c.colSpan!==1||c.rowSpan!==1)
  ||rows.some(row=>Array.from(row.cells).some(c=>c.rowSpan!==1)||Array.from(row.cells).reduce((n,c)=>n+c.colSpan,0)!==headers.length)
  ||table.getAttribute('data-mobile-layout')==='scroll'||['grid','presentation','none'].includes(table.getAttribute('role'));
 if(invalid){table.classList.remove('mobile-card-table');return false}
 const labels=headers.map(text);
 role(table,'table');role(head,'rowgroup');role(headRows[0],'row');
 headers.forEach(cell=>role(cell,'columnheader'));
 for(const section of sections){
  role(section,'rowgroup');
  for(const row of Array.from(section.rows)){
   role(row,'row');let column=0;
   for(const cell of Array.from(row.cells)){
    const span=cell.colSpan,label=labels.slice(column,column+span).join(' / '),primary=column===0&&span===1&&section!==table.tFoot;
    role(cell,cell.tagName==='TH'?'rowheader':'cell');
    set(cell,'data-mobile-label',label);set(cell,'aria-colindex',String(column+1));
    if(span>1)set(cell,'aria-colspan',String(span));else cell.removeAttribute('aria-colspan');
    flag(cell,'data-mobile-primary',primary);
    flag(cell,'data-mobile-wide',primary||span>1||wideLabel.test(label)||text(cell).length>180);
    flag(cell,'data-mobile-money',/amount|subtotal|allowance/i.test(label));
    flag(cell,'data-mobile-span-all',span===headers.length);
    column+=span;
   }
  }
 }
 table.classList.add('mobile-card-table');return true;
}

export function initMobile(win=window,doc=document){
 const media=win.matchMedia(mobileQuery),hintByRegion=new WeakMap(),hints=new Set();
 let frame=0,observer=null,nextHint=0;
 const regions='.table-scroll,.table-card,.comparison-chart,.review-plot,.range-plot,.overview-svg,.map-scroll,#drawing';
 function enhance(){
  frame=0;if(!media.matches)return;
  doc.querySelectorAll('table').forEach(table=>{
   const cards=decorateMobileTable(table),wrap=table.closest('.table-scroll,.table-card');
   if(wrap)wrap.classList.toggle('mobile-cards-wrap',cards);
  });
  for(const hint of hints)if(!hint.isConnected)hints.delete(hint);
  doc.querySelectorAll(regions).forEach(region=>{
   const overflow=region.clientWidth>0&&region.scrollWidth>region.clientWidth+4&&!region.classList.contains('mobile-cards-wrap');
   let hint=hintByRegion.get(region);
   if(overflow){
    if(!hint?.isConnected){
     hint=doc.createElement('p');hint.className='mobile-pan-hint';hint.id='cad-mobile-pan-'+(++nextHint);
     hint.textContent=region.querySelector('table')?'Swipe sideways to see all columns →':'Swipe sideways to explore →';
     region.prepend(hint);hintByRegion.set(region,hint);hints.add(hint);
     const described=(region.getAttribute('aria-describedby')??'').split(/\s+/).filter(id=>id&&!id.startsWith('cad-mobile-pan-'));
     set(region,'aria-describedby',[...described,hint.id].join(' '));
    }
    region.classList.add('mobile-pan-region');
    if(!region.hasAttribute('tabindex'))set(region,'tabindex','0');
   }
   if(hint)hint.hidden=!overflow;
  });
 }
 function schedule(){if(media.matches&&!frame)frame=win.requestAnimationFrame(enhance)}
 function apply(){
  if(media.matches){
   enhance();
   if(win.MutationObserver){observer??=new win.MutationObserver(schedule);observer.observe(doc.body,{childList:true,subtree:true})}
  }else{
   win.cancelAnimationFrame(frame);frame=0;observer?.disconnect();
   for(const hint of hints)hint.hidden=true;
  }
 }
 media.addEventListener('change',apply);
 win.addEventListener('resize',schedule,{passive:true});
 win.addEventListener('beforeprint',()=>{for(const hint of hints)hint.hidden=true});
 win.addEventListener('afterprint',apply);
 doc.addEventListener('toggle',schedule,true);
 doc.fonts?.ready.then(schedule);
 apply();
}
if(typeof window!=='undefined'&&typeof document!=='undefined')initMobile();

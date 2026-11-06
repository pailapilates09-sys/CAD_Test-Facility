import {toMills,formatMills,selectedWorksCsv} from './selected-works-model.js';

const report=document.querySelector('.swx');
const form=report.querySelector('[data-swx-filters]');
const {query,area,sort}=form.elements;
const table=report.querySelector('.swx-table'),tbody=table.tBodies[0];
const exportLink=report.querySelector('[data-swx-export]'),print=report.querySelector('[data-swx-print]');
const count=report.querySelector('[data-swx-count]'),subtotal=report.querySelector('[data-swx-subtotal]');
const subtotalLabel=report.querySelector('[data-swx-subtotal-label]'),empty=report.querySelector('[data-swx-empty]');
const normalize=text=>text.normalize('NFKC').toLowerCase().replaceAll(',','');
const records=[...tbody.rows].map(row=>{
 const data={...row.dataset,work:row.querySelector('[data-swx-description]').textContent};
 return {row,data,mills:toMills(data.amount),search:normalize(row.textContent+' '+Object.values(data).join(' '))};
});
let shown=records,activeSort='original';
function update(){
 const words=normalize(query.value.trim()).split(/\s+/).filter(Boolean);
 const ordered=[...records].sort((a,b)=>{
  if(sort.value==='high')return b.mills-a.mills;
  if(sort.value==='low')return a.mills-b.mills;
  if(sort.value==='area')return a.data.areaOrder-b.data.areaOrder;
  return a.data.id-b.data.id;
 });
 if(activeSort!==sort.value){
  tbody.append(...ordered.map(r=>r.row));
  activeSort=sort.value;
 }
 shown=ordered.filter(r=>(!area.value||r.data.area===area.value)&&words.every(word=>r.search.includes(word)));
 const visible=new Set(shown);
 for(const record of records)record.row.hidden=!visible.has(record);
 count.textContent='Showing '+shown.length+' of '+records.length+' selected works';
 subtotal.textContent='NPR '+formatMills(shown.reduce((sum,r)=>sum+r.mills,0));
 subtotalLabel.textContent=shown.length===records.length?'Total selected works':'Filtered subtotal';
 empty.hidden=shown.length!==0;
 table.hidden=shown.length===0;
 exportLink.hidden=shown.length===0;
 print.disabled=shown.length===0;
}
form.addEventListener('submit',event=>event.preventDefault());
query.addEventListener('input',update);
form.addEventListener('change',update);
form.addEventListener('reset',event=>{
 event.preventDefault();
 query.value='';area.value='';sort.value='original';
 update();
});
exportLink.addEventListener('click',event=>{
 if(shown.length===records.length&&sort.value==='original')return;
 event.preventDefault();
 const url=URL.createObjectURL(new Blob([selectedWorksCsv(shown.map(r=>r.data))],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');
 link.href=url;
 link.download='buildera-2-selected-works.csv';
 document.body.append(link);
 link.click();
 link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
let printDetails=[];
window.addEventListener('beforeprint',()=>{
 printDetails=shown.map(r=>r.row.querySelector('details')).filter(d=>!d.open);
 for(const detail of printDetails)detail.open=true;
});
window.addEventListener('afterprint',()=>{
 for(const detail of printDetails)detail.open=false;
 printDetails=[];
});
print.addEventListener('click',()=>window.print());
form.hidden=false;
print.hidden=false;
update();

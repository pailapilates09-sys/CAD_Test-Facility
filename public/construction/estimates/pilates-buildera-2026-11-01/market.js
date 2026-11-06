const form=document.querySelector('[data-bmq-filters]');
if(form){
 const {q,area,assessment,order}=form.elements;
 const groups=[...document.querySelectorAll('[data-bmq-rows]')];
 const byId=groups.map(group=>new Map([...group.children].map(row=>[row.dataset.bmqItem,row])));
 const normalize=text=>text.normalize('NFKC').toLocaleLowerCase('en');
 const items=[...byId[0]].map(([id,row])=>({
  id,area:row.dataset.area,assessment:row.dataset.assessment,rank:Number(row.dataset.rank),
  order:Number(row.dataset.order),amount:Number(row.dataset.amount),text:normalize(row.textContent)
 }));
 const count=document.querySelector('[data-bmq-count]');
 const empty=[...document.querySelectorAll('[data-bmq-empty]')];
 const table=document.querySelector('.bmq-table');
 let activeOrder='boq';

 function update(){
  const terms=normalize(q.value.trim()).split(/\s+/).filter(Boolean);
  const selected=items.filter(item=>(!area.value||area.value===item.area)&&
   (!assessment.value||assessment.value===item.assessment)&&terms.every(term=>item.text.includes(term)));
  const visible=new Set(selected.map(item=>item.id));
  for(const rows of byId)for(const [id,row] of rows)row.hidden=!visible.has(id);
  if(activeOrder!==order.value){
   const sorted=[...items].sort((a,b)=>{
    if(order.value==='review')return a.rank-b.rank||b.amount-a.amount||a.order-b.order;
    if(order.value==='amount')return b.amount-a.amount||a.order-b.order;
    return a.order-b.order;
   });
   for(let i=0;i<groups.length;i++)groups[i].append(...sorted.map(item=>byId[i].get(item.id)));
   activeOrder=order.value;
  }
  count.textContent='Showing '+selected.length+' of '+items.length+' works · '+
   selected.filter(item=>item.assessment==='above').length+' above · '+
   selected.filter(item=>item.assessment==='below').length+' below';
  table.hidden=!selected.length;
  for(const node of empty)node.hidden=selected.length!==0;
 }

 form.addEventListener('submit',event=>event.preventDefault());
 q.addEventListener('input',update);
 form.addEventListener('change',update);
 form.addEventListener('reset',event=>{
  event.preventDefault();
  q.value='';area.value='';assessment.value='';order.value='boq';
  update();
 });
 // Audit and table links should still reveal their target if a filter hid it.
 function revealLinkedWork(){
  const target=document.getElementById(location.hash.slice(1));
  if(target?.matches('.bmq-item[hidden]')){
   form.reset();
   target.scrollIntoView();
  }
 }
 window.addEventListener('hashchange',revealLinkedWork);
 const controls=form.closest('[data-bmq-controls]');
 controls.open=window.matchMedia('(min-width: 800px)').matches;
 controls.hidden=false;
 update();
 revealLinkedWork();
}

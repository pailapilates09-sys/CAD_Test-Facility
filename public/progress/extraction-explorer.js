const root=document.querySelector('.extraction-explorer');
if(root){
 const tabs=[...root.querySelectorAll('[data-lane-tab]')];
 function selectLane(tab,focus=false){
  for(const item of tabs){const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;}
  for(const panel of root.querySelectorAll('[data-lane-panel]'))panel.hidden=panel.dataset.lanePanel!==tab.dataset.laneTab;
  if(focus)tab.focus();
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectLane(tab));
  tab.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;
   if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;
   if(event.key==='Home')next=0;
   if(event.key==='End')next=tabs.length-1;
   if(next!==undefined){event.preventDefault();selectLane(tabs[next],true);}
  });
 });
 root.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{
  for(const item of root.querySelectorAll('[data-format]'))item.setAttribute('aria-pressed',String(item===button));
  for(const panel of root.querySelectorAll('[data-format-panel]'))panel.hidden=panel.dataset.formatPanel!==button.dataset.format;
 }));
}
document.querySelectorAll('[data-open-evidence]').forEach(link=>link.addEventListener('click',()=>{
 const details=document.querySelector('.extraction-evidence');if(details)details.open=true;
}));

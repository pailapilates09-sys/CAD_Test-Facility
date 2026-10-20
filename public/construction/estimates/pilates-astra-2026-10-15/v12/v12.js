export function filterDecisions(doc=document){
 const query=doc.getElementById('decision-search').value.trim().toLowerCase(),area=doc.getElementById('decision-area').value;
 const counts={work:0,allowance:0,option:0};
 for(const row of doc.querySelectorAll('[data-decision-profile]')){
  let shown=0;
  for(const subject of row.querySelectorAll('[data-decision-subject]')){
   const matches=(!area||subject.dataset.area===area)&&(!query||row.dataset.search.includes(query)||subject.dataset.search.includes(query));
   subject.hidden=!matches;if(matches){shown++;counts[subject.dataset.subjectType]++}
  }
  row.hidden=shown===0;
 }
 for(const section of doc.querySelectorAll('.decision-group'))section.hidden=![...section.querySelectorAll('[data-decision-profile]')].some(row=>!row.hidden);
 const total=counts.work+counts.allowance+counts.option;
 doc.getElementById('decision-count').textContent=`${counts.work} quoted works, ${counts.allowance} allowances and ${counts.option} new options shown.`;
 doc.getElementById('decision-empty').hidden=total>0;
 return counts;
}
export function initDecisions(win=window,doc=document){
 const search=doc.getElementById('decision-search'),area=doc.getElementById('decision-area'),clear=doc.getElementById('decision-clear'),print=doc.getElementById('decision-print');
 if(!search||!area)return;
 for(const control of [search,area,clear,print])control.disabled=false;
 search.addEventListener('input',()=>filterDecisions(doc));area.addEventListener('change',()=>filterDecisions(doc));
 clear.addEventListener('click',()=>{search.value='';area.value='';filterDecisions(doc)});
 print.addEventListener('click',()=>win.print());filterDecisions(doc);
}
if(typeof document!=='undefined')initDecisions();

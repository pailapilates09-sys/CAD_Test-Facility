import {searchRecords} from './site-model.js';

export function initOrganization(win=window,doc=document) {
  const body=doc.body,script=doc.querySelector('script[data-org-root]');
  if(!script)return;
  body.classList.add('org-js');
  const root=new URL(script.dataset.orgRoot,win.location.href),wide=win.matchMedia('(min-width:1180px)');
  const sidebar=doc.getElementById('org-workspace-nav'),menu=doc.querySelector('[data-org-menu]');
  const closes=[...doc.querySelectorAll('[data-org-menu-close]')];
  let menuReturn=null;
  const setMenu=(open,restore=false)=>{
    body.dataset.orgMenuOpen=String(open);
    menu?.setAttribute('aria-expanded',String(open));
    if(sidebar){sidebar.inert=!wide.matches&&!open;sidebar.setAttribute('aria-hidden',String(!wide.matches&&!open));}
    for(const button of closes)button.hidden=wide.matches||!open;
    if(open){menuReturn=doc.activeElement;sidebar?.querySelector('a')?.focus();}
    else if(restore)menuReturn?.focus();
  };
  menu?.addEventListener('click',event=>{event.preventDefault();setMenu(body.dataset.orgMenuOpen!=='true',true);});
  closes.forEach(button=>button.addEventListener('click',()=>setMenu(false,true)));
  sidebar?.addEventListener('click',event=>{if(event.target.closest('a')&&!wide.matches)setMenu(false);});
  wide.addEventListener('change',()=>setMenu(false));setMenu(false);
  doc.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&body.dataset.orgMenuOpen==='true'){event.preventDefault();setMenu(false,true);}
    if(event.key==='Tab'&&body.dataset.orgMenuOpen==='true'&&!wide.matches){
      const focusable=[...sidebar.querySelectorAll('a,button:not([hidden])')],first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first?.focus();}
    }
  });

  const small=win.matchMedia('(max-width:900px)');
  let tocSequence=0;
  for(const nav of doc.querySelectorAll('.org-contents')){
    const button=nav.querySelector('[data-org-toc-toggle]'),list=nav.querySelector('[data-org-toc-list]');
    if(!button||!list)continue;
    if(!list.id)list.id='org-contents-list-'+(++tocSequence);
    button.setAttribute('aria-controls',list.id);
    let touched=false;
    const setOpen=open=>{button.setAttribute('aria-expanded',String(open));list.hidden=!open;button.querySelector('span').textContent=open?'−':'+';};
    const compact=!!nav.closest('.basanti-discipline');
    button.hidden=!(small.matches||compact);setOpen(!(small.matches||compact));
    button.addEventListener('click',()=>{touched=true;setOpen(button.getAttribute('aria-expanded')!=='true');});
    small.addEventListener('change',()=>{button.hidden=!(small.matches||compact);if(!touched||(!small.matches&&!compact))setOpen(!(small.matches||compact));});
    list.addEventListener('click',event=>{if(event.target.closest('a')&&small.matches){touched=true;setOpen(false);}});
  }
  // Section links open any native disclosure that contains their target, without changing its data.
  const revealHash=()=>{
    let id;try{id=decodeURIComponent(win.location.hash.slice(1));}catch{return;}
    const target=doc.getElementById(id);if(!target)return;
    let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
  };
  win.addEventListener('hashchange',revealHash);revealHash();

  for(const catalogue of doc.querySelectorAll('[data-org-catalogue]')){
    const node=catalogue.querySelector('[data-org-catalogue-data]');if(!node)continue;
    let records;try{records=JSON.parse(node.textContent);}catch{continue;}
    const query=catalogue.querySelector('[data-org-filter-query]'),project=catalogue.querySelector('[data-org-filter-project]'),format=catalogue.querySelector('[data-org-filter-format]'),reset=catalogue.querySelector('[data-org-filter-reset]');
    const rows=[...catalogue.querySelectorAll('[data-org-record]')],count=catalogue.querySelector('[data-org-result-count]'),empty=catalogue.querySelector('[data-org-no-results]');
    const apply=(syncURL=true)=>{
      const results=new Set(searchRecords(records,query.value,{project:project.value,format:format?.value??''}));
      rows.forEach(row=>{row.hidden=!results.has(records[Number(row.dataset.orgRecord)]);});
      count.textContent=`${results.size} of ${records.length} ${catalogue.dataset.orgCatalogue==='pages'?'pages':'files'}`;
      empty.hidden=results.size>0;reset.hidden=!(query.value||project.value||format?.value);
      if(syncURL){
        const url=new URL(win.location.href);
        for(const [key,value]of [['q',query.value.trim()],['project',project.value],['format',format?.value??'']]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}
        win.history.replaceState(null,'',url);
      }
    };
    const params=new URLSearchParams(win.location.search);query.value=params.get('q')??'';
    if([...project.options].some(o=>o.value===params.get('project')))project.value=params.get('project');
    if(format&&[...format.options].some(o=>o.value===params.get('format')))format.value=params.get('format');
    query.addEventListener('input',()=>apply());project.addEventListener('change',()=>apply());format?.addEventListener('change',()=>apply());
    reset.addEventListener('click',()=>{query.value='';project.value='';if(format)format.value='';apply();query.focus();});apply(false);
  }

  const dialog=doc.querySelector('[data-org-search-dialog]'),input=dialog?.querySelector('[data-org-search-input]'),results=dialog?.querySelector('[data-org-search-results]'),status=dialog?.querySelector('[data-org-search-status]'),all=dialog?.querySelector('[data-org-search-all]');
  let index=null,indexPromise=null,searchReturn=null;
  const loadIndex=()=>indexPromise??=(async()=>{
    const response=await win.fetch(new URL('organization/page-index.json',root));if(!response.ok)throw Error('Page index unavailable');
    const data=await response.json();index=data.pages;return index;
  })();
  const renderResults=()=>{
    if(!index)return;
    const featured=['index.html','projects/paila-pilates/index.html','construction/models/basanti-residence/milestone.html','cad/index.html','construction/models/basanti-workbench/v7/index.html','construction/estimates/pilates-astra-2026-10-15/milestone.html','construction/estimates/pilates-hamro-2026-10-28/index.html','directory/index.html','library/index.html','guide/organization/index.html'];
    const matches=input.value.trim()?searchRecords(index,input.value,{limit:10}):featured.map(path=>index.find(item=>item.path===path)).filter(Boolean);results.replaceChildren();
    for(const item of matches){
      const link=doc.createElement('a'),strong=doc.createElement('strong'),smallLabel=doc.createElement('small');
      link.href=new URL(item.path,root).href;strong.textContent=item.title;smallLabel.textContent=`${item.project_label} · ${item.category}`;link.append(strong,smallLabel);results.append(link);
    }
    status.textContent=matches.length?`${matches.length} page${matches.length===1?'':'s'} shown · use All pages for the complete list.`:'No matching pages. Try fewer words.';
    const destination=new URL('directory/',root);if(input.value.trim())destination.searchParams.set('q',input.value.trim());all.href=destination.href;
  };
  const openSearch=async event=>{
    if(!dialog?.showModal)return;
    event?.preventDefault();if(body.dataset.orgMenuOpen==='true')setMenu(false);
    searchReturn=doc.activeElement;dialog.showModal();input.focus();status.textContent='Loading page directory…';
    try{await loadIndex();renderResults();}catch{status.textContent='Search could not load. Open the page directory below.';indexPromise=null;}
  };
  doc.querySelector('[data-org-search]')?.addEventListener('click',openSearch);
  dialog?.querySelector('[data-org-search-close]')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('close',()=>searchReturn?.focus());
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  input?.addEventListener('input',renderResults);
  input?.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('a')?.focus();}if(event.key==='Enter'){event.preventDefault();win.location.href=all.href;}});
  dialog?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dialog.close();}});
  doc.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){if(!dialog.open)openSearch(event);else{event.preventDefault();input.focus();}}});
}

if(typeof window!=='undefined'&&typeof document!=='undefined')initOrganization();

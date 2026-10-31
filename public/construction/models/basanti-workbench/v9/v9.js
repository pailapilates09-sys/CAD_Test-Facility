import {DISCIPLINES,BASIS,FLOORS,filterItems,workspaceState,groupProgramme,csv,filteredRuns,routeComponents,preferredSelection,selectedPlanLevel,placeFloorLabels} from './workspace-model.js';
import {buildingPlan,programmeSVG} from './drawings.js';
import {escapeHTML as e,componentDimensions} from '../../basanti-residence/building-model.js';
import {ARCHITECTURE_KINDS} from '../../basanti-residence/discipline-model.js';
import {createModelViewer} from './model-viewer.js';
import {drawPlan as mepPlan,drawProfile} from '../v7/mep-drawings.js';
import {SYSTEMS} from '../v7/mep-model.js';
const $=id=>document.getElementById(id),number=new Intl.NumberFormat('en',{maximumFractionDigits:3}),fmt=n=>n===null?'Pending':number.format(n),pageSize=15;
let state=workspaceState(new URL(location.href).searchParams),data,scene,scenePromise,steel=[],viewer,selectedElement=state.element,page=0,expanded=false,cameraMode=state.camera,modelItems=[],isolate=false,renderEpoch=0,modelKey='',currentPlan='',currentPlanURL=null;
const fetchJSON=async path=>{const response=await fetch(new URL(path+'?v=V9_REVISION',import.meta.url));if(!response.ok)throw Error('Could not load '+path);return response.json();};
const badge=b=>`<span class="v9-basis v9-basis-${e(b)}">${e(BASIS[b]??b)}</span>`;
const sourcePages=pages=>[...new Set(pages??[])].map(p=>`<a href="../../basanti-residence/source/original.pdf#page=${p}">Sheet ${p} ↗</a>`).join(' · ');
const download=(name,value,type)=>{const url=URL.createObjectURL(new Blob([value],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function share(push=false){const url=new URL(location.href);for(const [key,value]of Object.entries({panel:state.panel,discipline:state.discipline,floor:state.floor,q:state.query,basis:state.basis,programme:state.programme,item:state.item,task:state.task,system:state.system,element:state.element,layout:state.layout,camera:state.camera,sort:state.sort,unit:state.unit,related:state.related})){if(value&&!(value==='all'||value==='building'&&key==='programme'||value==='split'&&key==='layout'||value==='iso'&&key==='camera'||value==='code'&&key==='sort'))url.searchParams.set(key,value);else url.searchParams.delete(key);}url.hash=state.panel;if(url.href!==location.href)history[push?'pushState':'replaceState'](null,'',url);}
function syncControls(){for(const b of document.querySelectorAll('[data-discipline]'))b.setAttribute('aria-pressed',String(b.dataset.discipline===state.discipline));$('floor-filter').value=state.floor;$('workspace-search').value=state.query;$('basis-filter').value=state.basis;$('programme-select').value=state.programme;$('service-filter').value=state.system;$('view-layout').value=state.layout;$('unit-filter').value=state.unit;$('boq-sort').value=state.sort;}
function openPanel(panel,{push=true,focus=false}={}){if(!['overview','views','boq','gantt','sources'].includes(panel))return;state.panel=panel;if(panel==='views'&&state.discipline==='all')state.discipline='architecture';share(push);render();if(focus)$('tab-'+panel).focus();requestAnimationFrame(()=>{if(panel==='overview')window.scrollTo(0,0);else $(['views','boq','gantt'].includes(panel)?'workspace-filters':panel).scrollIntoView({block:'start'});});}
function render(){
 for(const b of document.querySelectorAll('[data-panel]')){const active=b.dataset.panel===state.panel;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$(b.dataset.panel).hidden=!active;}
 $('workspace-filters').hidden=!['views','boq','gantt'].includes(state.panel);syncControls();renderFilterSummary();
 if(state.panel==='overview'){$('workspace-message').textContent='V9 overview · earlier pages and source files are preserved.';}
 if(state.panel==='boq')renderBOQ();if(state.panel==='gantt')renderGantt();if(state.panel==='views')renderViews().catch(showError);if(state.panel==='sources')$('workspace-message').textContent='Source files, the complete panel inventory and reference methods.';
 document.documentElement.dataset.v9Panel=state.panel;
}
function renderOverview(){
 $('overview-stats').innerHTML=[[data.items.length,'BOQ records'],[data.schedules.building.tasks.length,'building activities'],[data.schedules.mep.tasks.length,'MEP activities'],[data.rooms.length,'source room records']].map(([n,label])=>`<article><strong>${n}</strong><span>${label}</span></article>`).join('');
 $('discipline-summary').innerHTML=['structure','architecture','mep','interior'].map(id=>`<button type="button" data-summary-discipline="${id}"><span>${DISCIPLINES[id]}</span><strong>${data.items.filter(i=>i.discipline===id).length} <small>records</small></strong><span aria-hidden="true">→</span></button>`).join('');
 const groups=[
  ['Architecture','../../basanti-residence/',[['Filters','building-explore'],['2D plan','building-2d'],['3D model','building-3d'],['Element detail','detail-panel'],['Registers · elements','building-register','elements'],['Registers · dimensions','building-register','facts'],['Registers · rooms','building-register','rooms'],['Registers · openings','building-register','openings'],['Registers · structure','building-register','structure'],['Registers · reinforcement','building-register','reinforcement'],['Registers · steps','building-register','steps'],['Registers · IFC','building-register','ifc'],['Registers · source values','building-register','observations'],['Registers · sheets','building-register','sheets'],['Source checks','building-confirmation'],['Downloads','building-downloads']]],
  ['Structure','../v6/',[['Filters','work-controls'],['2D drawing','drawing-plan'],['3D model','drawing-model'],['Quantities','measurement-tables'],['Member / bars','member-inspection'],['Code checks','code-checks'],['BBS study','bbs-study'],['Beam assembly','fabrication-panel'],['Column connections','connection-panel'],['Renderer checks','renderer-check'],['Excavation study','space-study'],['Concrete materials','concrete-planner'],['Gantt','programme-panel'],['Work breakdown','wbs-register'],['Design basis','v6-decisions'],['Source review','source-review'],['References','references']]],
  ['MEP','../v7/',[['Route filters','four-views'],['2D plan','plan-panel'],['3D model','model-panel'],['Route quantities','table-panel'],['Gantt','programme-panel'],['Profile / connections','inspector'],['Room context','locations'],['Sizing calculations','calculations'],['Review items','coordination'],['Downloads','downloads'],['References','references'],['Update guide','change-guide']]],
  ['Interior','../../basanti-residence/interior.html',[['Room filters / cards','room-explorer'],['Selected room','interior-inspector'],['Source plan','interior-floor-plan'],['Furniture status','furniture-status'],['Source basis','interior-source-basis']]]
 ];
 $('all-panel-groups').innerHTML=groups.map(([label,path,links])=>`<details class="v9-inventory-group"><summary>${label} <span>${links.length} panels / registers</span></summary><ul>${links.map(([label,id,register])=>`<li><a href="${path}${register?'?register='+register:''}#${id}">${e(label)} ↗</a></li>`).join('')}</ul></details>`).join('');
 $('method-references').innerHTML=data.references.sources.map(r=>`<article class="v9-method"><h3><a href="${e(r.url)}">${e(r.title)} ↗</a></h3><p>${e(r.publisher+' · '+r.application)}</p><p class="v9-note">${e(r.scope)}</p></article>`).join('');
}
function renderBOQ(){
 const rows=filterItems(data.items,state);if(state.item){const selectedIndex=rows.findIndex(row=>row.id===state.item);if(selectedIndex>=0)page=Math.floor(selectedIndex/pageSize);}
 const pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages-1);const shown=rows.slice(page*pageSize,(page+1)*pageSize);
 $('boq-rows').innerHTML=shown.map(r=>`<tr${state.item===r.id?' class="v9-selected-row"':''}><th scope="row"><button type="button" data-item="${e(r.id)}" aria-pressed="${state.item===r.id}"><span class="v9-item-code">${e(r.code+' · '+(DISCIPLINES[r.discipline]??r.discipline))}</span><strong>${e(r.label)}</strong><span>${badge(r.basis)}</span></button></th><td data-label="Floor">${e(FLOORS[r.floor]??r.floor)}</td><td data-label="Quantity" class="v9-number">${r.quantity===null?'<span class="v9-pending">Pending</span>':fmt(r.quantity)}</td><td data-label="Unit">${e(r.unit)}</td></tr>`).join('');
 $('boq-count').textContent=rows.length+' matching work records';$('boq-empty').hidden=rows.length>0;$('boq-page-status').textContent=rows.length?`${page*pageSize+1}–${Math.min(rows.length,(page+1)*pageSize)} of ${rows.length}`:'0 records';$('boq-previous').disabled=page===0;$('boq-next').disabled=page>=pages-1;
 $('workspace-message').textContent=`${rows.length} BOQ records · ${rows.filter(r=>r.quantity===null).length} pending · ${DISCIPLINES[state.discipline]??'All disciplines'}`;
 const selected=rows.find(r=>r.id===state.item);$('boq-inspector').hidden=!selected;if(selected)renderItem(selected);
}
function renderItem(item){
 $('boq-selection-title').textContent=item.code+' · '+item.label;
 $('boq-selection-detail').innerHTML=`<div class="v9-item-summary"><strong>${fmt(item.quantity)} <small>${e(item.unit)}</small></strong>${badge(item.basis)}<span>${e(DISCIPLINES[item.discipline]+' · '+(FLOORS[item.floor]??item.floor))}</span><a href="${e(item.source_path)}">Open detailed source view ↗</a></div>${item.reference?'<p class="v9-callout">'+e(item.reference)+'</p>':''}${item.basis==='study'?'<p class="v9-callout">Displayed study paths are not a procurement count or final cutting schedule.</p>':''}<div class="v9-table-wrap"><table class="v9-table v9-detail-table"><caption>Measurement lines · ${item.lines.length} records</caption><thead><tr><th scope="col">Part / evidence</th><th scope="col">Quantity / unit</th><th scope="col">Measurement basis</th></tr></thead><tbody>${item.lines.map(r=>`<tr><th scope="row">${e(r.label)}<small>${e(r.id)}</small>${sourcePages(r.pages)}</th><td>${fmt(r.value)} ${e(r.unit)}</td><td>${e(r.formula??'')}<small>${e(r.note??'')}</small></td></tr>`).join('')}</tbody></table></div><div class="v9-actions">${item.task_id?'<button type="button" data-item-programme="'+e(item.id)+'">Show related Gantt activity →</button>':''}<button type="button" data-download-item="${e(item.id)}">Item evidence JSON ↓</button></div>`;
}
function renderGantt(){
 const chart=$('gantt-chart'),scroll={top:chart.scrollTop,left:chart.scrollLeft},openGroups=[...chart.querySelectorAll('details[open]')].map(el=>el.dataset.group),schedule=data.schedules[state.programme],groups=groupProgramme(schedule,state),count=groups.reduce((n,g)=>n+g.tasks.length,0),unit=state.programme==='mep'?'wd':'d',total=Math.max(1,schedule.duration),width=$('timeline-zoom').value==='800'?Math.max(420,chart.clientWidth-(matchMedia('(max-width:700px)').matches?170:260)-2):Number($('timeline-zoom').value);
 $('programme-basis').textContent=schedule.basis;$('programme-csv').href='./data/programme-'+state.programme+'.csv';$('download-gantt').href='./data/gantt-'+state.programme+'.svg';
 const bar=t=>`<button type="button" class="v9-task-bar${t.critical?' v9-critical':''}${state.task===t.id?' v9-bar-selected':''}" data-task="${e(t.id)}" style="left:${t.start/total*100}%;width:${Math.max(.8,(t.finish-t.start)/total*100)}%" aria-label="${e(t.label+' · '+t.duration+' '+schedule.unit)}"><span>${(t.finish-t.start)/total*width>30?t.duration+unit:''}</span></button>`;
 $('gantt-chart').innerHTML=groups.length?`<div class="v9-gantt-board" style="--timeline-width:${width}px"><div class="v9-gantt-axis"><span class="v9-gantt-label">${e(schedule.name+' · '+schedule.unit)}</span><div>${Array.from({length:6},(_,i)=>`<span style="left:${i*20}%">${Math.round(total*i/5)}${unit}</span>`).join('')}</div></div>${groups.map(g=>`<details class="v9-programme-group" data-group="${e(g.id)}"${expanded||openGroups.includes(g.id)||g.tasks.some(t=>t.id===state.task)?' open':''}><summary><span class="v9-gantt-label"><b aria-hidden="true">+</b> ${e((schedule.groups[g.id]??g.id).replace(/^\d+\s*·\s*/,''))}<small>${g.tasks.length} activities · ${g.start}–${g.finish}${unit}</small></span><span class="v9-timeline"><span class="v9-summary-bar" style="left:${g.start/total*100}%;width:${Math.max(.8,(g.finish-g.start)/total*100)}%"></span></span></summary>${g.tasks.map(t=>`<div class="v9-gantt-row"><button type="button" class="v9-gantt-label" data-task="${e(t.id)}"><span>${e(t.code??t.id)}</span><strong>${e(t.label)}</strong></button><div class="v9-timeline">${bar(t)}</div></div>`).join('')}</details>`).join('')}</div>`:'<p class="v9-empty">No activities match. Reset the filters or choose another programme.</p>';
 chart.scrollTop=scroll.top;chart.scrollLeft=scroll.left;
 $('expand-programme').textContent=expanded?'Collapse tasks':'Expand tasks';$('expand-programme').setAttribute('aria-expanded',String(expanded));$('workspace-message').textContent=`${count} activities in ${groups.length} groups · full ${schedule.name.toLowerCase()} baseline ${schedule.duration} ${schedule.unit}`;
 $('gantt').querySelector('.v9-gantt-key span:nth-child(3)').hidden=state.programme==='mep';
 const selected=schedule.tasks.find(t=>t.id===state.task);$('gantt-inspector').hidden=!selected;if(selected){$('gantt-selection-title').textContent=(selected.code??selected.id)+' · '+selected.label;const predecessors=selected.depends??[],related=data.items.filter(i=>i.task_id===selected.id&&i.origin===(state.programme==='mep'?'mep':'building'));$('gantt-selection-detail').innerHTML=`<div class="v9-item-summary"><strong>${selected.duration} <small>${e(schedule.unit)}</small></strong><span>${selected.start}–${selected.finish} ${e(unit+' from baseline start')}</span><span>${e(DISCIPLINES[selected.discipline])}</span></div><p><strong>Predecessors:</strong> ${predecessors.length?predecessors.map(id=>{const p=schedule.tasks.find(t=>t.id===id);return '<button class="v9-inline-button" type="button" data-predecessor="'+e(id)+'">'+e(p?.label??id)+'</button>';}).join(' · '):'None'}</p><p class="v9-note">${e(selected.hold??'')}</p><div class="v9-actions">${related.length?'<button type="button" data-task-boq="'+e(selected.id)+'">Related BOQ records · '+related.length+' →</button>':'<span class="v9-note">No measured BOQ items for this coordination activity.</span>'}<a href="${state.programme==='mep'?'../v7/#programme-panel':'../v6/?work='+encodeURIComponent(selected.id)+'#programme-panel'}">Open detailed programme ↗</a></div>`;}
}
async function loadScene(){if(!scenePromise)scenePromise=fetchJSON('./data/scene.json').then(result=>scene=result);return scenePromise;}
function sceneItems(){
 if(state.discipline==='shared')return [];
 const structural=['column','beam','slab','stair','footing','tie beam','strap beam','sill band','lintel band'];
 let items=state.discipline==='mep'?routeComponents(filteredRuns(scene.mep,state)):
   state.discipline==='interior'?scene.proposals.filter(c=>['furniture','joinery','appliance','worktop'].includes(c.kind)):
   state.discipline==='structure'?scene.components.filter(c=>structural.includes(c.kind)):
   state.discipline==='architecture'?scene.components.filter(c=>ARCHITECTURE_KINDS.includes(c.kind)):
   [...scene.components,...scene.proposals.filter(c=>['furniture','joinery','appliance','worktop'].includes(c.kind)),...routeComponents(filteredRuns(scene.mep,state))];
 if($('view-steel').checked&&['all','structure'].includes(state.discipline)){const hosts=new Set(items.map(c=>c.id));items=[...items,...steel.filter(c=>hosts.has(c.host_id))];}
 if(state.discipline==='mep')return items;
 const words=state.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return items.filter(c=>(state.floor==='all'||c.level===state.floor)&&words.every(w=>[c.id,c.label,c.kind,c.level].join(' ').toLowerCase().includes(w)));
}
function planLevel(){return selectedPlanLevel(modelItems,selectedElement,state.floor);}
function currentMEP(){return {...scene.mep,runs:filteredRuns(scene.mep,state)};}
function drawCurrentPlan(){
 const level=planLevel();
 if(!modelItems.length){currentPlan='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><text x="24" y="60" font-family="Arial" font-size="16" fill="#52646c">No matching plan geometry. Reset the filters.</text></svg>';commitPlan();return;}
 if(state.discipline==='mep')currentPlan=mepPlan(currentMEP(),scene.project,{system:state.system,level,search:'',selected:selectedElement,labels:'selected'}).replaceAll('href="#inspector"','href="#view-inspector"').replace('MEP-01 · ground plan',level==='site'?'MEP-01 · site routes / ground context':'MEP-01 · ground plan');
 else{const items=modelItems.filter(c=>c.level===level),context=scene.components.filter(c=>c.level===level&&ARCHITECTURE_KINDS.includes(c.kind));currentPlan=buildingPlan(scene.project,items,{selected:selectedElement,interior:state.discipline==='interior',context});}
 commitPlan();
}
function commitPlan(){
 currentPlan=currentPlan.replace(/^(<svg\b[^>]*>)/,`$1<title>Basanti v9 · ${e(DISCIPLINES[state.discipline]??'Building')} · ${e(planLevel())} plan</title>`);
 $('plan-view').innerHTML=currentPlan;if(currentPlanURL)URL.revokeObjectURL(currentPlanURL);
 currentPlanURL=URL.createObjectURL(new Blob([currentPlan],{type:'image/svg+xml'}));
 const link=$('download-plan');link.href=currentPlanURL;link.setAttribute('aria-disabled','false');link.tabIndex=0;
}
function viewerData(){
 if(!modelItems.length)return [];
 const items=isolate?modelItems.filter(c=>c.id===selectedElement):modelItems;
 const context=['mep','interior'].includes(state.discipline)?scene.components.filter(c=>['slab','column'].includes(c.kind)&&(state.floor==='all'||c.level===state.floor)).map(c=>({...c,id:'context-'+c.id,context_only:true})):[];
 return [...items,...context];
}
function manualCamera(){for(const button of document.querySelectorAll('[data-camera]'))button.setAttribute('aria-pressed','false');}
function refreshModel(){
 const key=JSON.stringify([modelItems.map(c=>c.id),state.discipline,isolate,isolate?selectedElement:null]);
 if(key!==modelKey){viewer.setData(viewerData(),selectedElement);viewer.setCamera(cameraMode);modelKey=key;}else viewer.select(selectedElement);
 viewer.setContext($('view-context').checked);$('model-isolate').setAttribute('aria-pressed',String(isolate));
 $('model-focus').disabled=$('model-isolate').disabled=!selectedElement;
}
async function renderViews(){
 const epoch=++renderEpoch;if(state.panel!=='views')return;
 $('workspace-message').textContent='Loading source-linked views…';await loadScene();if(state.panel!=='views'||epoch!==renderEpoch)return;
 modelItems=sceneItems();selectedElement=preferredSelection(modelItems,state.element??selectedElement,state.floor);state.element=selectedElement;
 if(!viewer)viewer=createModelViewer({host:$('model-host'),svg:$('model-vector'),note:$('renderer-note'),empty:$('model-empty'),onPick:id=>selectElement(id),onHover:()=>{},onManualCamera:manualCamera,onFrame:renderModelLabels});
 $('view-element').innerHTML=modelItems.length?modelItems.map(c=>`<option value="${e(c.id)}">${e(c.label??c.id)}</option>`).join(''):'<option value="">No matching elements</option>';$('view-element').value=selectedElement??'';
 for(const button of document.querySelectorAll('[data-camera]'))button.setAttribute('aria-pressed',String(button.dataset.camera===cameraMode));
 $('view-steel').closest('label').hidden=!['all','structure'].includes(state.discipline);
 $('view-context').closest('label').hidden=!['mep','interior'].includes(state.discipline);
 $('open-detailed-view').href=state.discipline==='mep'?'../v7/':state.discipline==='structure'?'../v6/':state.discipline==='interior'?'../v2/?work=furniture':'../../basanti-residence/?level='+encodeURIComponent(state.floor==='all'?'ground':state.floor);
 drawCurrentPlan();renderElement();setViewLayout();refreshModel();renderViewScope();renderLegend();share();
 $('renderer-note').textContent='Drag to orbit · right-drag to pan · scroll/pinch to zoom · arrow keys rotate. '+(state.discipline==='mep'?'Proposed routes; symbolic widths.':'Select an element for source detail.');
 $('workspace-message').textContent=modelItems.length+' matching '+(state.discipline==='mep'?'service routes':'model elements')+' · select to inspect.';
}
function renderViewScope(){
 $('view-scope').textContent=`2D: ${FLOORS[planLevel()]??planLevel()} · 3D: ${FLOORS[state.floor]} · ${modelItems.length} ${state.discipline==='mep'?'routes':'elements'}${state.discipline==='interior'?' · illustrative furniture proposals':''}`;
}
function renderModelLabels(frame){
 const overlay=$('model-labels');overlay.setAttribute('viewBox',`0 0 ${frame.width} ${frame.height}`);
 const labels=state.discipline==='mep'&&$('view-context').checked&&modelItems.length?scene.components.filter(c=>c.kind==='slab'&&(state.floor==='all'||c.level===state.floor)).map(c=>({label:(FLOORS[c.level]??c.level)+' · '+fmt(c.geometry.z+c.geometry.height)+' m',anchor:frame.project([...c.geometry.points[0],c.geometry.z+c.geometry.height])})):[];
 overlay.innerHTML=placeFloorLabels(labels,frame.width,frame.height).map(label=>`<path d="M${label.anchor[0]},${label.anchor[1]} L${label.x-4},${label.y-4}" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width=".7"/><text x="${label.x}" y="${label.y}">${e(label.label)}</text>`).join('');
}
function renderLegend(){
 $('service-legend').hidden=state.discipline!=='mep';
 $('service-legend').innerHTML=[...new Set(modelItems.map(c=>c.system).filter(Boolean))].map(id=>`<span><i style="background:${SYSTEMS[id].colour}"></i>${e(SYSTEMS[id].name)}</span>`).join('');
}
function renderElement(){
 const selected=modelItems.find(c=>c.id===selectedElement);$('view-selection-title').textContent=selected?.label??selected?.id??'No selection';
 if(!selected){$('view-selection-detail').innerHTML='<p>No elements match these filters. Reset or choose another floor.</p>';return;}
 if(state.discipline==='mep'){const r=selected;$('view-selection-detail').innerHTML=`<div class="v9-item-summary"><strong>${fmt(r.length_m)} <small>m routed</small></strong>${badge('proposal')}<span>${e(r.size+' · '+(FLOORS[r.level]??r.level))}</span><a href="../v7/?system=${e(r.system)}&amp;level=${e(r.level)}&amp;run=${e(r.id)}#inspector">Full route detail ↗</a></div><p class="v9-note">${e(r.takeoff_basis+' · '+r.note)}</p><details class="v9-disclosure"><summary>Route profile</summary><div class="v9-drawing">${drawProfile(scene.mep,r.id)}</div></details>`;}
 else{const dimensions=componentDimensions(selected),parts=selected.geometry.parts??[],size=dimensions==='See source detail'?(parts.length?parts.length+' assembly parts':'Source detail'):e(dimensions)+' <small>m · model dimensions</small>';$('view-selection-detail').innerHTML=`<div class="v9-item-summary"><strong>${size}</strong><span>${e(FLOORS[selected.level]??selected.level)}</span>${sourcePages(selected.source?.pages??[selected.source?.page].filter(Boolean))}</div><p class="v9-note">${e(selected.note??'')}</p>${state.discipline==='interior'?'<p class="v9-callout">Illustrative proposal from the retained workbench, not a confirmed source furniture schedule.</p>':''}${parts.length?'<details class="v9-disclosure"><summary>Part sizes · m</summary><div class="v9-table-wrap"><table class="v9-table v9-detail-table"><thead><tr><th>Part</th><th>Width × depth × height</th></tr></thead><tbody>'+parts.map((p,i)=>'<tr><th scope="row">Part '+(i+1)+'</th><td>'+[p.width,p.depth,p.height].map(n=>fmt(n)).join(' × ')+' m</td></tr>').join('')+'</tbody></table></div></details>':''}`;}
}
function selectElement(id){
 if(!modelItems.some(c=>c.id===id))return;selectedElement=id;state.element=id;$('view-element').value=id;
 refreshModel();drawCurrentPlan();renderElement();renderViewScope();share();
}
function setViewLayout(){const mode=state.layout;$('view-layout').value=mode;$('plan-card').hidden=mode==='model';$('model-card').hidden=mode==='plan';$('view-grid').dataset.layout=mode;viewer?.invalidate();}
function renderFilterSummary(){
 const active=state.discipline==='mep'&&['views','boq'].includes(state.panel);$('service-filter-label').hidden=!active;
 const labels=[state.discipline!=='all'?DISCIPLINES[state.discipline]:null,state.floor!=='all'?FLOORS[state.floor]:null,state.query?'“'+state.query+'”':null,active&&state.system!=='all'?SYSTEMS[state.system]?.name:null,state.panel==='boq'&&state.basis!=='all'?BASIS[state.basis]??state.basis:null,state.panel==='boq'&&state.unit!=='all'?state.unit:null,state.related&&state.panel==='boq'?'Related activity':null].filter(Boolean);
 $('active-filters').hidden=!['views','boq','gantt'].includes(state.panel)||!labels.length;$('active-filters').textContent=labels.join(' · ');
}
function revealInspector(id){requestAnimationFrame(()=>{const inspector=$(id);inspector.tabIndex=-1;inspector.focus({preventScroll:true});inspector.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});}
function showError(error){$('workspace-message').innerHTML=e(error.message)+' · <a href="../v8/">Open previous workspace</a> · <a href="../../basanti-residence/source/original.pdf">Source PDF</a>';$('workspace-message').classList.add('v9-error');console.error(error);}
function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=$(id);if(id==='open-source-review'&&target){target.querySelector('details').open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));return;}const panel=target?.closest('[role="tabpanel"]');if(panel){state.panel=panel.id;render();for(let node=target;node&&node!==panel;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;if(target!==panel)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
async function boot(){
 data=await fetchJSON('./data/workspace.json');if(data.schema!=='basanti-workspace-9.0')throw Error('Unexpected workspace data');$('service-filter').innerHTML='<option value="all">All services</option>'+Object.entries(SYSTEMS).map(([id,service])=>`<option value="${id}">${e(service.name)}</option>`).join('');
 $('unit-filter').innerHTML='<option value="all">All units</option>'+[...new Set(data.items.map(i=>i.unit))].sort().map(unit=>`<option value="${e(unit)}">${e(unit)}</option>`).join('');
 if(!data.items.some(i=>i.unit===state.unit))state.unit='all';
 renderOverview();syncControls();revealHash();render();
 document.addEventListener('click',event=>{
  const target=event.target.closest('button,[data-pick],[data-run]');if(!target)return;
  if(target.dataset.panel)openPanel(target.dataset.panel);if(target.dataset.openPanel)openPanel(target.dataset.openPanel,{focus:true});
  if(target.dataset.discipline){state.discipline=target.dataset.discipline;state.system='all';state.item=null;state.task=null;state.element=null;state.related='';selectedElement=null;isolate=false;page=0;share();render();}
  if(target.dataset.summaryDiscipline){Object.assign(state,{discipline:target.dataset.summaryDiscipline,floor:'all',query:'',basis:'all',unit:'all',related:'',system:'all',item:null});page=0;openPanel('boq',{focus:true});}
  if(target.dataset.item){state.item=target.dataset.item;share();renderBOQ();revealInspector('boq-inspector');}
  if(target.dataset.task||target.dataset.predecessor){state.task=target.dataset.task??target.dataset.predecessor;if(target.dataset.predecessor){state.discipline='all';state.floor='all';state.query='';syncControls();}share();renderGantt();renderFilterSummary();revealInspector('gantt-inspector');}
  if(target.dataset.itemProgramme){const item=data.items.find(i=>i.id===target.dataset.itemProgramme);if(item){Object.assign(state,{programme:item.origin==='mep'?'mep':'building',task:item.task_id,query:'',floor:'all',discipline:item.origin==='mep'?'mep':'all'});openPanel('gantt',{focus:true});requestAnimationFrame(()=>revealInspector('gantt-inspector'));}}
  if(target.dataset.taskBoq){const related=data.items.filter(i=>i.task_id===target.dataset.taskBoq&&i.origin===(state.programme==='mep'?'mep':'building'));Object.assign(state,{query:'',basis:'all',floor:'all',discipline:'all',system:'all',unit:'all',related:(state.programme==='mep'?'mep':'building')+':'+target.dataset.taskBoq,item:related[0]?.id??null});page=0;openPanel('boq',{focus:true});}
  if(target.dataset.downloadItem){const item=data.items.find(i=>i.id===target.dataset.downloadItem);if(item)download('Basanti_v9_'+item.id+'.json',JSON.stringify({source_sha256:data.source_sha256,item},null,2),'application/json');}
  if(target.dataset.pick||target.dataset.run){event.preventDefault();selectElement(target.dataset.pick??target.dataset.run);}
  if(target.dataset.camera){cameraMode=state.camera=target.dataset.camera;for(const b of document.querySelectorAll('[data-camera]'))b.setAttribute('aria-pressed',String(b===target));viewer?.setCamera(cameraMode);share();}
 });
 $('workspace-contents').addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[data-panel]')],index=tabs.indexOf(event.target);if(index<0)return;let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();openPanel(tabs[next].dataset.panel,{focus:true});}});
 document.addEventListener('keydown',event=>{const target=event.target.closest('[data-pick],[data-run]');if(target&&target instanceof SVGElement&&['Enter',' '].includes(event.key)){event.preventDefault();selectElement(target.dataset.pick??target.dataset.run);}});
 $('filter-form').addEventListener('submit',event=>event.preventDefault());
 for(const [id,key]of [['floor-filter','floor'],['basis-filter','basis'],['service-filter','system'],['unit-filter','unit'],['boq-sort','sort']])$(id).addEventListener('change',event=>{state[key]=event.target.value;state.item=null;if(key==='system'||key==='floor'){state.element=null;selectedElement=null;isolate=false;}page=0;share();render();});
 $('workspace-search').addEventListener('input',event=>{state.query=event.target.value;state.item=null;page=0;share();render();});
 $('reset-filters').addEventListener('click',()=>{Object.assign(state,{discipline:state.panel==='gantt'&&state.programme==='mep'?'mep':'all',floor:'all',query:'',basis:'all',unit:'all',related:'',system:'all',element:null,item:null,task:null});page=0;share();render();});
 $('boq-previous').onclick=()=>{state.item=null;page=Math.max(0,page-1);share();renderBOQ();$('boq').scrollIntoView({block:'start'});};$('boq-next').onclick=()=>{state.item=null;page++;share();renderBOQ();$('boq').scrollIntoView({block:'start'});};$('close-boq-detail').onclick=()=>{const id=state.item;state.item=null;share();renderBOQ();document.querySelector('[data-item="'+CSS.escape(id??'')+'"]')?.focus();};
 $('download-boq-csv').onclick=()=>download('Basanti_v9_filtered_BOQ.csv',csv([['id','code','discipline','work_item','floor','quantity','unit','basis'],...filterItems(data.items,state).map(i=>[i.id,i.code,i.discipline,i.label,i.floor,i.quantity,i.unit,i.basis])]),'text/csv');
 $('programme-select').onchange=event=>{$('gantt-chart').innerHTML='';Object.assign(state,{programme:event.target.value,discipline:event.target.value==='mep'?'mep':'all',floor:'all',query:'',task:null});expanded=false;share();render();};$('timeline-zoom').onchange=renderGantt;$('expand-programme').onclick=()=>{expanded=!expanded;if(!expanded)for(const group of $('gantt-chart').querySelectorAll('details'))group.open=false;renderGantt();};
 $('model-fit').onclick=()=>{isolate=false;refreshModel();viewer?.fit();};
 $('model-focus').onclick=()=>viewer?.focus();$('model-zoom-in').onclick=()=>viewer?.zoom(1.2);$('model-zoom-out').onclick=()=>viewer?.zoom(1/1.2);
 $('model-isolate').onclick=()=>{isolate=!isolate;refreshModel();};$('view-context').onchange=()=>viewer?.setContext($('view-context').checked);
 $('close-task-detail').onclick=()=>{state.task=null;share();renderGantt();$('gantt-chart').focus();};
 $('view-element').onchange=event=>selectElement(event.target.value);$('view-layout').onchange=event=>{state.layout=event.target.value;setViewLayout();share();};$('view-steel').onchange=async()=>{try{if($('view-steel').checked&&!steel.length)steel=(await fetchJSON('./data/steel.json')).components;await renderViews();}catch(error){showError(error);}};
 window.addEventListener('popstate',()=>{state=workspaceState(new URL(location.href).searchParams);selectedElement=state.element;cameraMode=state.camera;modelKey='';page=0;render();revealHash();});window.addEventListener('hashchange',revealHash);
 for(const control of document.querySelectorAll('[data-panel],[data-open-panel]'))control.disabled=false;
 document.documentElement.dataset.v9Ready='true';
 if(state.panel==='boq'&&state.item)revealInspector('boq-inspector');
 if(state.panel==='gantt'&&state.task)revealInspector('gantt-inspector');
}
boot().catch(showError);

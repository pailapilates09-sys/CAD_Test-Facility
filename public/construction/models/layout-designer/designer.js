import {CATALOG,clone,validateLayout,presetLayout,newItem,isOpening,openingPose,assessLayout,resizeRoom,layoutMeshes,objDocument,csvDocument,createHistory,escapeXML,round} from './design-model.js';
import {planDrawing,svgDocument} from './design-plan.js';
import {createDesignView} from './design-view3d.js';

const $=id=>document.getElementById(id),storageKey='paila-layout-designer-draft-v1';
let storage=null,layout=presetLayout('studio'),assets={},selectedId=null,frame=0,drag=null,sequence=0;
try{storage=window.localStorage;const saved=storage.getItem(storageKey);if(saved)layout=validateLayout(JSON.parse(saved));}catch{}
const history=createHistory(layout),view=createDesignView($('design-3d'),id=>select(id));
const selected=()=>layout.items.find(i=>i.id===selectedId),number=id=>{const raw=$(id).value;if(!raw.trim())throw Error('Fill all required numeric fields.');const value=Number(raw);if(!Number.isFinite(value))throw Error('Use a valid number.');return value;};
const newId=()=>{let id;do{id='item-custom-'+(++sequence)}while(layout.items.some(i=>i.id===id));return id;};
function error(message=''){$('design-error').hidden=!message;$('design-error').textContent=message;}
function save(){try{storage?.setItem(storageKey,JSON.stringify(layout));$('design-save-status').textContent=storage?'Draft saved on this browser · download JSON to keep a portable copy.':'Browser saving unavailable · download JSON to keep this design.';}catch{$('design-save-status').textContent='Browser saving unavailable · download JSON to keep this design.';}}
function commit(next){layout=validateLayout(next);history.push(layout);if(!selected())selectedId=null;error();save();render(true);}
function attempt(action){const previous=selectedId;try{action();error();}catch(e){if(!selected())selectedId=previous;error(e.message);}}
function select(id){selectedId=layout.items.some(i=>i.id===id)?id:null;render(true);}
function sourceLabel(item){return item.asset_id?'PILATES source copy':item.kind==='cabinet'?'New parametric cabinet':'New concept geometry';}
function fields(){
 const item=selected();$('element-empty').hidden=!!item;$('element-form').hidden=!item;if(!item)return;
 const opening=isOpening(item),pose=opening?openingPose(item,layout.room):item;
 for(const field of ['label','width','depth','height','x','y','rotation','elevation'])$('element-'+field).value=field==='depth'&&opening?layout.room.wall:['x','y','rotation'].includes(field)?pose[field]:item[field];
 for(const field of ['depth','x','y','rotation','elevation'])$('element-'+field).disabled=opening;
 $('opening-fields').hidden=!opening;$('cabinet-fields').hidden=item.kind!=='cabinet';
 for(const field of ['wall','offset','sill'])$('element-'+field).disabled=!opening;
 for(const field of ['panel','shelves'])$('element-'+field).disabled=item.kind!=='cabinet';
 if(opening){$('element-wall').value=item.wall;$('element-offset').value=item.offset;$('element-sill').value=item.sill;$('element-sill').disabled=item.kind==='door';}
 if(item.kind==='cabinet'){$('element-panel').value=item.panel;$('element-shelves').value=item.shelves;}
 const asset=assets.items?.find(a=>a.id===item.asset_id);
 $('element-origin').textContent=asset?`Source copy: ${asset.source_definition_name} · definition ${asset.source_definition_id}. Resizing scales its display mesh; internal construction remains unverified.`:item.asset_id?'Source copy · geometry loading; a labelled envelope is shown temporarily.':item.kind==='cabinet'?'Panels and shelves regenerate from these dimensions. This is an authored concept, with no supplier specification.':'Authored concept geometry. Confirm actual product dimensions for a real project.';
}
function render(forceFields=false){
 const checks=assessLayout(layout),item=selected(),drawing=planDrawing(layout,{selectedId,issues:checks.outOfBounds}),svg=$('design-plan');svg.setAttribute('viewBox',drawing.viewBox);svg.innerHTML=drawing.content;
 view.update(layoutMeshes(layout,assets),selectedId);
 $('design-name').value=layout.name;for(const field of ['width','depth','height','wall'])$('room-'+field).value=layout.room[field];
 $('floor-area').textContent=checks.area.toLocaleString('en-IN',{maximumFractionDigits:2});$('element-count').textContent=layout.items.length;$('source-copy-count').textContent=checks.sourceCopies;$('schedule-count').textContent=layout.items.length+' elements';
 $('undo-design').disabled=!history.canUndo;$('redo-design').disabled=!history.canRedo;
 $('design-selection').textContent=item?`${item.label} · selected in the plan, 3D view and schedule.`:'Select an element in the plan, model or schedule.';
 const labels=new Map(layout.items.map(i=>[i.id,i.label]));$('layout-checks').textContent=`Concept checks: ${checks.outOfBounds.length} element${checks.outOfBounds.length===1?'':'s'} outside the room envelope${checks.outOfBounds.length?' ('+checks.outOfBounds.map(id=>labels.get(id)).slice(0,4).join(', ')+')':''} · ${checks.overlaps.length} overlapping plan footprints. Overlap can be intentional, such as a sink over a counter; this is not a clearance or building-code check.`;
 $('design-item-rows').innerHTML=layout.items.map(i=>{const p=isOpening(i)?openingPose(i,layout.room):i;return `<tr${i.id===selectedId?' class="design-row-selected"':''}><th scope="row"><button type="button" data-select-item="${escapeXML(i.id)}" aria-pressed="${i.id===selectedId}">${escapeXML(i.label)}</button><small>${escapeXML(CATALOG.find(t=>t.kind===i.kind).name)}</small></th><td>${i.width.toFixed(2)} × ${(isOpening(i)?layout.room.wall:i.depth).toFixed(2)} × ${i.height.toFixed(2)}</td><td>${p.x.toFixed(2)}, ${p.y.toFixed(2)} · ${p.rotation.toFixed(0)}°<small>${isOpening(i)?escapeXML(i.wall)+' wall · offset '+i.offset.toFixed(2)+' m':'elevation '+i.elevation.toFixed(2)+' m'}</small></td><td>${sourceLabel(i)}${i.asset_id?'<small>Geometry reference: '+escapeXML(i.asset_id)+'</small>':''}</td></tr>`;}).join('');
 if(forceFields||!document.activeElement?.closest('#element-form'))fields();
 document.documentElement.dataset.designerReady='true';document.documentElement.dataset.designerElements=String(layout.items.length);
}
const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;render()})};
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>attempt(()=>{selectedId=null;commit(presetLayout(button.dataset.preset))}));
$('design-name').addEventListener('change',()=>attempt(()=>commit({...layout,name:$('design-name').value})));
$('room-form').addEventListener('submit',event=>{event.preventDefault();attempt(()=>commit(resizeRoom(layout,Object.fromEntries(['width','depth','height','wall'].map(f=>[f,number('room-'+f)])),$('room-reposition').checked)))});
$('element-form').addEventListener('submit',event=>{event.preventDefault();attempt(()=>{const item=selected();if(!item)return;const next=clone(layout),target=next.items.find(i=>i.id===item.id);target.label=$('element-label').value;for(const f of ['width','height'])target[f]=number('element-'+f);if(isOpening(item)){target.wall=$('element-wall').value;target.offset=number('element-offset');target.sill=item.kind==='door'?0:number('element-sill');}else for(const f of ['depth','x','y','rotation','elevation'])target[f]=number('element-'+f);if(item.kind==='cabinet'){target.panel=number('element-panel');target.shelves=number('element-shelves');}commit(next);})});
$('add-element').addEventListener('click',()=>attempt(()=>{const next=clone(layout),item=newItem($('element-type').value,newId(),layout,assets);next.items.push(item);selectedId=item.id;commit(next);}));
$('remove-element').addEventListener('click',()=>attempt(()=>{if(!selected())return;const next=clone(layout);next.items=next.items.filter(i=>i.id!==selectedId);selectedId=null;commit(next)}));
$('duplicate-element').addEventListener('click',()=>attempt(()=>{const item=selected();if(!item)return;const copy={...clone(item),id:newId(),label:(item.label+' copy').slice(0,100)};if(isOpening(copy))copy.offset=round(copy.offset+copy.width+.2);else{copy.x=round(copy.x+.5);copy.y=round(copy.y+.5);}const next=clone(layout);next.items.push(copy);selectedId=copy.id;commit(next)}));
$('rotate-element').addEventListener('click',()=>attempt(()=>{const item=selected();if(!item||isOpening(item))return;const next=clone(layout);next.items.find(i=>i.id===item.id).rotation+=90;commit(next)}));
for(const [id,method]of [['undo-design','undo'],['redo-design','redo']])$(id).addEventListener('click',()=>{layout=history[method]();if(!selected())selectedId=null;error();save();render(true)});
$('design-item-rows').addEventListener('click',e=>{const button=e.target.closest('[data-select-item]');if(button)select(button.dataset.selectItem)});
const svg=$('design-plan');
function planPoint(event){const matrix=svg.getScreenCTM();return matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):null;}
svg.addEventListener('pointerdown',event=>{const group=event.target.closest('[data-design-item]');if(!group){select(null);return;}select(group.dataset.designItem);const item=selected(),p=planPoint(event);if(item&&!isOpening(item)&&p){drag={id:item.id,start:clone(layout),x:p.x,y:layout.room.depth-p.y,itemX:item.x,itemY:item.y,moved:false};svg.setPointerCapture(event.pointerId)}});
svg.addEventListener('pointermove',event=>{if(!drag)return;const p=planPoint(event);if(!p)return;const snap=value=>$('snap-grid').checked?Math.round(value*10)/10:round(value,3);const item=layout.items.find(i=>i.id===drag.id);item.x=snap(drag.itemX+p.x-drag.x);item.y=snap(drag.itemY+layout.room.depth-p.y-drag.y);drag.moved=drag.moved||Math.hypot(item.x-drag.itemX,item.y-drag.itemY)>.001;schedule()});
function finishDrag(){if(drag?.moved)attempt(()=>{const previous=drag.start;try{commit(layout)}catch(e){layout=previous;render(true);throw e}});drag=null;}
svg.addEventListener('pointerup',finishDrag);svg.addEventListener('pointercancel',()=>{if(drag){layout=drag.start;drag=null;render(true)}});
svg.addEventListener('keydown',event=>{const item=selected();if(!item||isOpening(item)||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();attempt(()=>{const next=clone(layout),target=next.items.find(i=>i.id===item.id),step=event.shiftKey?.5:.1;target.x=round(target.x+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0));target.y=round(target.y+(event.key==='ArrowDown'?-step:event.key==='ArrowUp'?step:0));commit(next)})});
$('orbit-left').addEventListener('click',()=>view.turn(-15));$('orbit-right').addEventListener('click',()=>view.turn(15));$('reset-view').addEventListener('click',()=>{view.reset();$('model-zoom').value=1});$('open-near-walls').addEventListener('change',()=>view.setCutaway($('open-near-walls').checked));$('model-zoom').addEventListener('input',()=>view.setZoom(Number($('model-zoom').value)));
for(const button of document.querySelectorAll('[data-export]'))button.addEventListener('click',()=>attempt(()=>{
 const format=button.dataset.export;if(format==='obj'&&layout.items.some(i=>i.asset_id&&!assets.items?.some(a=>a.id===i.asset_id)))throw Error('Wait for source geometry to load before exporting its 3D mesh. JSON and SVG remain available.');
 const content=format==='json'?JSON.stringify(validateLayout(layout),null,2)+'\n':format==='svg'?svgDocument(layout):format==='obj'?objDocument(layout,assets):csvDocument(layout),types={json:'application/json',svg:'image/svg+xml',obj:'text/plain',csv:'text/csv'},url=URL.createObjectURL(new Blob([content],{type:types[format]})),a=document.createElement('a');a.href=url;a.download=(layout.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60)||'layout')+'.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('design-save-status').textContent='Export prepared · '+format.toUpperCase()+'. Browser download settings control where it is saved.';
}));
$('import-design').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('Use a Layout Designer JSON file smaller than 2 MB.');const next=validateLayout(JSON.parse(await file.text()));selectedId=null;commit(next);}catch(e){error('Could not open this design: '+e.message);}finally{event.target.value=''}});
new MutationObserver(()=>schedule()).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
render(true);save();
fetch('./reusable-components.json').then(response=>{if(!response.ok)throw Error('Source library unavailable');return response.json()}).then(data=>{if(data.schema!=='paila-reusable-geometry-1.0'||data.units!=='m'||data.items?.length!==3||data.items.some(a=>!a.size?.every(n=>n>0&&Number.isFinite(n))||!a.parts?.length))throw Error('Unexpected source library');assets=data;for(const option of $('element-type').options)if(option.hasAttribute('data-source'))option.disabled=false;$('asset-status').textContent='3 reusable source components ready: sofa, lockers and sink. Their copies retain the original source IDs.';document.documentElement.dataset.designerAssets='ready';render();}).catch(()=>{$('asset-status').textContent='Source geometry could not load. New concept shapes still work; source copies show their size envelopes. Reload to retry.';document.documentElement.dataset.designerAssets='unavailable'});

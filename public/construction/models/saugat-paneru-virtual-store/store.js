import {buildStore,floorItems,escapeHTML as e} from './store-model.js';
import {storeScene,showcaseScene} from './store-geometry.js';
import {createStore3D,renderPlan,renderCatalog,renderProduct,renderShelfLevels} from './store-view.js';

const $=id=>document.getElementById(id);
const store=buildStore(JSON.parse($('store-data').textContent));
const params=new URL(location.href).searchParams;
const item=store.productMap.get(params.get('item'));
let floor=store.levels.find(l=>l.id===(item?.floor??params.get('floor')))??store.levels[0];
let mode=params.get('view')==='floor'?'floor':'shelves';
const requestedRoom=params.get('room');
let room=mode==='floor'&&requestedRoom==='all'?'all':
 (floor.rooms.some(r=>r.id===requestedRoom)?requestedRoom:item?.room??floor.rooms[0].id);
let level=store.bands.some(b=>b.level===Number(params.get('level')))&&mode==='shelves'?Number(params.get('level')):0;
let selected=item&&(room==='all'||item.room===room)&&(!level||item.band.level===level)?item.id:'';
let focused=false;
const panel=$('store-3d-shop'),slot=$('store-3d-slot'),dialog=$('store-full-dialog');
const viewer=createStore3D($('store-canvas'),$('store-pins'),choose);
const candidates=()=>floorItems(store,floor.id,room,level);
const shelfRoom=()=>room==='all'?(store.productMap.get(selected)?.room??floor.rooms[0].id):room;

function saveView(){
 const url=new URL(location.href);
 url.searchParams.set('floor',floor.id);
 url.searchParams.set('room',room);
 if(mode==='floor')url.searchParams.set('view','floor');else url.searchParams.delete('view');
 if(level)url.searchParams.set('level',level);else url.searchParams.delete('level');
 if(selected)url.searchParams.set('item',selected);else url.searchParams.delete('item');
 history.replaceState(null,'',url);
}

function showDetails(){
 if(dialog.open)return;
 const detail=$('store-detail'),r=detail.getBoundingClientRect();
 if(r.bottom>innerHeight-92)detail.scrollIntoView({block:'end'});
 else if(r.top<70)detail.scrollIntoView({block:'start'});
}

function renderSelection(){
 const product=store.productMap.get(selected);
 $('store-detail').innerHTML=renderProduct(product);
 $('store-detail').dataset.selectedItem=selected;
 $('store-item-focus').hidden=!product;
 $('store-item-focus').textContent=focused?'Back to spaced shelves':'Enlarge this item';
 $('store-item-focus').setAttribute('aria-pressed',String(focused));
 for(const el of document.querySelectorAll('[data-catalog-item],[data-plan-item],[data-elevation-item]')){
  const active=(el.dataset.catalogItem??el.dataset.planItem??el.dataset.elevationItem)===selected;
  el.setAttribute('aria-pressed',String(active));el.classList.toggle('is-selected',active);
 }
 viewer?.select(selected);
}

function choose(id){
 const product=store.productMap.get(id);
 if(!product||product.floor!==floor.id)return;
 const oldRoom=shelfRoom(),oldSelection=selected;
 const changeRoom=room!=='all'&&product.room!==room,changeLevel=level>0&&product.band.level!==level;
 if(changeRoom)room=product.room;
 if(changeLevel)level=product.band.level;
 selected=id;
 if(changeRoom||changeLevel||focused&&oldSelection!==selected)renderScope();
 else {
  if(oldRoom!==shelfRoom())$('store-elevation-grid').innerHTML=renderShelfLevels(store,shelfRoom(),selected,level);
  renderSelection();
 }
 saveView();showDetails();
}

function renderScope(){
 const items=candidates();
 if(!items.some(p=>p.id===selected))selected=items[0]?.id??'';
 $('store-workspace').dataset.floor=floor.id;
 $('store-workspace').dataset.view=mode;
 $('store-level-select').value=String(level);
 for(const btn of document.querySelectorAll('[data-store-floor]'))btn.setAttribute('aria-pressed',String(btn.dataset.storeFloor===floor.id));
 for(const btn of document.querySelectorAll('[data-store-mode]'))btn.setAttribute('aria-pressed',String(btn.dataset.storeMode===mode));
 $('store-rooms').innerHTML=[{id:'all',name:'All rooms'},...floor.rooms].map(r=>`<button type="button" data-store-room="${r.id}" aria-pressed="${r.id===room}">${e(r.name)}</button>`).join('');
 $('store-plan-wrap').innerHTML=renderPlan(store,floor,room,selected);
 $('store-elevation-grid').innerHTML=renderShelfLevels(store,shelfRoom(),selected,level);
 $('store-catalog-items').innerHTML=renderCatalog(items,selected)||'<p>No products at this height. Choose All heights to browse again.</p>';
 $('store-catalog-count').textContent=items.length+' '+(items.length===1?'product':'products');
 const band=store.bands.find(b=>b.level===level);
 const area=room==='all'?'All rooms':store.roomMap.get(room).name;
 $('store-model-scope').textContent=floor.label+' · '+area+(band?' · Level '+band.level+' ('+band.low+'–'+band.high+' ft)':'');
 $('store-display-note').textContent=mode==='shelves'?
  (items.length?'Display view: products are enlarged and the stocked cells are spaced apart.':'This shelf height is empty. Choose another level or All heights.'):
  'Floor overview: see the racks in their building positions.';
 $('store-zoom').value=1;
 viewer?.setScene(mode==='shelves'?showcaseScene(store,floor.id,shelfRoom(),level,focused?selected:''):storeScene(store,floor.id,room),selected,{reset:true});
 renderSelection();
}

function setLevel(next){
 if(next!==0&&!store.bands.some(b=>b.level===next))return;
 room=shelfRoom();mode='shelves';level=next;focused=false;
 renderScope();saveView();
}

document.addEventListener('click',ev=>{
 const f=ev.target.closest('[data-store-floor]'),r=ev.target.closest('[data-store-room]'),m=ev.target.closest('[data-store-mode]'),l=ev.target.closest('[data-store-level]');
 const p=ev.target.closest('[data-catalog-item],[data-plan-item],[data-elevation-item]');
 if(f&&floor.id!==f.dataset.storeFloor){
  floor=store.levels.find(l=>l.id===f.dataset.storeFloor);
  room=mode==='shelves'?floor.rooms[0].id:'all';level=0;focused=false;selected='';renderScope();saveView();
 }else if(r&&room!==r.dataset.storeRoom){
  room=r.dataset.storeRoom;mode=room==='all'?'floor':'shelves';level=0;focused=false;
  renderScope();saveView();$('store-rooms').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
 }else if(m&&mode!==m.dataset.storeMode){
  const activeRoom=shelfRoom();mode=m.dataset.storeMode;
  room=mode==='floor'?'all':activeRoom;level=0;focused=false;renderScope();saveView();
 }else if(l){
  const n=Number(l.dataset.storeLevel);setLevel(level===n?0:n);
  $('store-level-select').focus({preventScroll:true});
  if(!dialog.open)panel.scrollIntoView({block:'start'});
 }else if(p)choose(p.dataset.catalogItem??p.dataset.planItem??p.dataset.elevationItem);
});
$('store-level-select').addEventListener('change',ev=>setLevel(Number(ev.target.value)));
$('store-plan-wrap').addEventListener('keydown',ev=>{
 const button=ev.target.closest('[data-plan-item]');
 if(button&&['Enter',' '].includes(ev.key)){ev.preventDefault();choose(button.dataset.planItem);}
});
$('store-item-focus').addEventListener('click',()=>{
 if(!selected)return;
 focused=!focused;
 room=shelfRoom();mode='shelves';renderScope();saveView();
 if(!dialog.open)panel.scrollIntoView({block:'start'});
});
$('store-left').addEventListener('click',()=>viewer?.turn(-18));
$('store-right').addEventListener('click',()=>viewer?.turn(18));
$('store-fit').addEventListener('click',()=>{viewer?.fit();$('store-zoom').value=1;});
$('store-zoom').addEventListener('input',ev=>viewer?.zoom(Number(ev.target.value)));
const expand=$('store-expand');
expand.hidden=typeof dialog.showModal!=='function';
expand.addEventListener('click',()=>{
 if(dialog.open){dialog.close();return;}
 dialog.append(panel);dialog.showModal();
 expand.textContent='Close large view';expand.setAttribute('aria-expanded','true');expand.focus();
});
dialog.addEventListener('close',()=>{
 slot.append(panel);expand.textContent='Expand 3D';expand.setAttribute('aria-expanded','false');expand.focus({preventScroll:true});
});
$('store-3d-unavailable').hidden=Boolean(viewer);
renderScope();

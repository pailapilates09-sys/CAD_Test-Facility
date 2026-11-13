import {buildStore,floorItems,stockItems,escapeHTML as e,rackKey,shelfLabels} from './store-model.js';
import {storeScene,showcaseScene} from './store-geometry.js';
import {createStore3D,renderPlan,renderCatalog,renderProduct,renderShelfLevels} from './store-view.js';

const $=id=>document.getElementById(id);
const store=buildStore(JSON.parse($('store-data').textContent));
const params=new URL(location.href).searchParams;
const linked=store.stockMap.get(params.get('position')),item=store.productMap.get(linked?.productId??params.get('item'));
let floor=store.levels.find(l=>l.id===(item?.floor??params.get('floor')))??store.levels[0];
let mode=params.get('view')==='floor'?'floor':'shelves';
let room=mode==='floor'?'all':floor.rooms.find(r=>r.id===(item?.room??params.get('room')))?.id??floor.rooms[0].id;
let shelf=mode==='floor'?'all':item?.shelf??(Object.hasOwn(shelfLabels,params.get('rack'))?params.get('rack'):'rear');
let level=mode==='shelves'&&store.bands.some(b=>b.level===Number(params.get('level')))?Number(params.get('level')):0;
let angle=params.get('camera')==='angled'?'angled':'front',focused=false;
let selected=linked??(item?store.home.get(item.id):null);
const panel=$('store-3d-shop'),slot=$('store-3d-slot'),dialog=$('store-full-dialog');
const model=createStore3D($('store-canvas'),$('store-targets'),id=>selectFacing(id),next=>{angle=next;syncAngle();saveView();});
const products=()=>floorItems(store,floor.id,room,level,shelf);
const rackFacings=()=>stockItems(store,floor.id,room,shelf,level);
const shelfRoom=()=>room==='all'?(selected?.room??floor.rooms[0].id):room;
const activeRack=()=>shelf==='all'?(selected?.shelf??'rear'):shelf;

function saveView(){
 const url=new URL(location.href);
 for(const [key,value] of Object.entries({floor:floor.id,room,rack:shelf==='all'?'':shelf,view:mode==='floor'?'floor':'',camera:angle==='angled'?'angled':'',level:level||'',item:selected?.productId??'',position:selected?.id??''})){
  if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
 }
 history.replaceState(null,'',url);
}
function syncAngle(){
 $('store-3d-shop').dataset.camera=angle;
 $('store-canvas').parentElement.dataset.camera=angle;
 for(const b of document.querySelectorAll('[data-store-camera]'))b.setAttribute('aria-pressed',String(b.dataset.storeCamera===angle));
}
function showDetails(){
 if(dialog.open)return;
 const detail=$('store-detail'),r=detail.getBoundingClientRect();
 if(r.bottom>innerHeight-82)detail.scrollIntoView({block:'end'});
 else if(r.top<70)detail.scrollIntoView({block:'start'});
}
function refreshPlan(){
 $('store-plan-wrap').innerHTML=renderPlan(store,floor,room,selected,shelf);
}
function refreshElevation(){
 $('store-elevation-grid').innerHTML=renderShelfLevels(store,shelfRoom(),selected?.id,level,activeRack());
}
function renderSelection(){
 const p=store.productMap.get(selected?.productId);
 $('store-detail').innerHTML=renderProduct(p,selected);
 $('store-detail').dataset.selectedItem=p?.id??'';
 $('store-detail').dataset.selectedFacing=selected?.id??'';
 $('store-item-focus').hidden=!p;
 $('store-item-focus').textContent=focused?'Back to stocked shelves':'Enlarge this item';
 $('store-item-focus').setAttribute('aria-pressed',String(focused));
 for(const el of document.querySelectorAll('[data-catalog-item],[data-elevation-facing]')){
  const active=el.dataset.catalogItem?el.dataset.catalogItem===p?.id:el.dataset.elevationFacing===selected?.id;
  el.setAttribute('aria-pressed',String(active));
  if(el.dataset.catalogItem)el.closest('tr').classList.toggle('is-selected',active);
 }
 model?.select(selected?.id);
}
function selectFacing(id,fromList=false){
 const facing=store.stockMap.get(id);
 if(!facing||facing.floor!==floor.id)return;
 const previous=selected,changedRack=mode==='shelves'&&(facing.room!==room||facing.shelf!==shelf)||fromList&&mode==='floor';
 selected=facing;
 if(changedRack){
  room=facing.room;shelf=facing.shelf;mode='shelves';
 }
 const changedLevel=level>0&&level!==facing.band.level;
 if(changedLevel)level=facing.band.level;
 if(changedRack||changedLevel||focused&&previous?.id!==id){
  renderScope();
 }else{
  refreshPlan();
  if(previous?.room!==selected.room||previous?.shelf!==selected.shelf)refreshElevation();
  renderSelection();
 }
 saveView();showDetails();
}
function selectCatalog(id){
 const p=store.productMap.get(id);if(!p)return;
 const found=rackFacings().filter(f=>f.productId===id),home=store.home.get(id);
 const target=found.find(f=>f.id===selected?.id)??found.find(f=>f.id===home.id)??found[0]??home;
 selectFacing(target.id,true);
}

function renderScope(){
 const choices=rackFacings(),items=products();
 if(!choices.some(f=>f.id===selected?.id)){
  const home=items[0]&&store.home.get(items[0].id);
  selected=choices.find(f=>f.id===home?.id)??choices[0]??null;
 }
 $('store-workspace').dataset.floor=floor.id;$('store-workspace').dataset.view=mode;
 $('store-level-select').value=String(level);
 for(const b of document.querySelectorAll('[data-store-floor]'))b.setAttribute('aria-pressed',String(b.dataset.storeFloor===floor.id));
 for(const b of document.querySelectorAll('[data-store-mode]'))b.setAttribute('aria-pressed',String(b.dataset.storeMode===mode));
 $('store-rooms').innerHTML=[{id:'all',name:store.apparel?'All departments':'All rooms'},...floor.rooms].map(r=>`<button type="button" data-store-room="${r.id}" aria-pressed="${r.id===room}">${e(r.name)}</button>`).join('');
 $('store-rack-controls').hidden=mode==='floor';
 const selectedRoom=store.roomMap.get(shelfRoom());
 $('store-rack-select').innerHTML=Object.entries(selectedRoom.rack_labels).map(([id,label])=>`<option value="${id}">${e(label)} · ${shelfLabels[id]}</option>`).join('');
 $('store-rack-select').value=activeRack();
 refreshPlan();refreshElevation();
 $('store-catalog-items').innerHTML=renderCatalog(items,selected?.productId);
 $('store-catalog-count').textContent=items.length+' '+(items.length===1?'product':'products');
 const band=store.bands.find(b=>b.level===level);
 const section=mode==='floor'?(store.apparel?'All departments':'All rooms'):selectedRoom.name+' · '+selectedRoom.rack_labels[activeRack()];
 $('store-model-scope').textContent=floor.label+' · '+section+(band?' · '+band.low+'–'+band.high+' ft':'');
 $('store-display-note').textContent=mode==='shelves'?
  (focused?'Product close-up. Return to stocked shelves to see the whole category.':store.apparel?'Tap a garment to inspect it. Each level shows sample display stock.':'Tap an item on the rack. Repeated display stock fills each level of the sample assortment.'):
  'See the racks in their building positions. On a phone, swipe across the front view or choose a category for a closer look.';
 $('store-zoom').value=1;syncAngle();
 model?.setScene(mode==='shelves'?showcaseScene(store,room,shelf,level,focused?selected?.id:''):storeScene(store,floor.id,room),selected?.id,angle);
 renderSelection();
}
function setLevel(n){
 if(n!==0&&!store.bands.some(b=>b.level===n))return;
 const active=shelfRoom(),rack=activeRack();
 room=active;shelf=rack;mode='shelves';level=n;focused=false;
 renderScope();saveView();
}
function showRack(key){
 const r=store.racks.get(key);
 if(!r||r.floor!==floor.id)return;
 room=r.room;shelf=r.id;mode='shelves';level=0;focused=false;
 renderScope();saveView();
}

document.addEventListener('click',ev=>{
 const f=ev.target.closest('[data-store-floor]'),r=ev.target.closest('[data-store-room]'),m=ev.target.closest('[data-store-mode]'),l=ev.target.closest('[data-store-level]'),a=ev.target.closest('[data-store-camera]');
 const plan=ev.target.closest('[data-plan-rack]'),placement=ev.target.closest('[data-elevation-facing]'),p=ev.target.closest('[data-catalog-item],[data-catalog-row]');
 if(f&&floor.id!==f.dataset.storeFloor){
  floor=store.levels.find(l=>l.id===f.dataset.storeFloor);
  room=mode==='shelves'?floor.rooms[0].id:'all';shelf=mode==='shelves'?'rear':'all';level=0;focused=false;selected=null;renderScope();saveView();
 }else if(r&&room!==r.dataset.storeRoom){
  room=r.dataset.storeRoom;mode=room==='all'?'floor':'shelves';shelf=mode==='shelves'?'rear':'all';level=0;focused=false;
  renderScope();saveView();$('store-rooms').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
 }else if(m&&mode!==m.dataset.storeMode){
  const sr=shelfRoom(),ar=activeRack();mode=m.dataset.storeMode;
  room=mode==='floor'?'all':sr;shelf=mode==='floor'?'all':ar;level=0;focused=false;renderScope();saveView();
 }else if(a){
  angle=a.dataset.storeCamera;model?.orientation(angle);$('store-zoom').value=1;syncAngle();saveView();
 }else if(l){
  const n=Number(l.dataset.storeLevel);setLevel(level===n?0:n);
  $('store-level-select').focus({preventScroll:true});panel.scrollIntoView({block:'start'});
 }else if(plan){
  showRack(plan.dataset.planRack);panel.scrollIntoView({block:'start'});
 }else if(placement)selectFacing(placement.dataset.elevationFacing,true);
 else if(p)selectCatalog(p.dataset.catalogItem??p.dataset.catalogRow);
});
$('store-level-select').addEventListener('change',ev=>setLevel(Number(ev.target.value)));
$('store-rack-select').addEventListener('change',ev=>showRack(rackKey(shelfRoom(),ev.target.value)));
$('store-plan-wrap').addEventListener('keydown',ev=>{
 const b=ev.target.closest('[data-plan-rack]');
 if(b&&['Enter',' '].includes(ev.key)){ev.preventDefault();showRack(b.dataset.planRack);panel.scrollIntoView({block:'start'});}
});
$('store-item-focus').addEventListener('click',()=>{
 if(!selected)return;
 focused=!focused;room=selected.room;shelf=selected.shelf;mode='shelves';
 renderScope();saveView();
 if(!dialog.open)panel.scrollIntoView({block:'start'});
});
$('store-left').addEventListener('click',()=>model?.turn(-18));
$('store-right').addEventListener('click',()=>model?.turn(18));
$('store-fit').addEventListener('click',()=>{model?.fit();$('store-zoom').value=1;});
$('store-zoom').addEventListener('input',ev=>model?.zoom(Number(ev.target.value)));
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
$('store-3d-unavailable').hidden=Boolean(model);
renderScope();

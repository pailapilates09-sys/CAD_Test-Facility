import {buildStore,floorItems,escapeHTML as e} from './store-model.js';
import {storeScene} from './store-geometry.js';
import {createStore3D,renderPlan,renderCatalog,renderProduct} from './store-view.js';

const $=id=>document.getElementById(id);
const store=buildStore(JSON.parse($('store-data').textContent));
const params=new URL(location.href).searchParams;
const item=store.productMap.get(params.get('item'));
let floor=store.levels.find(l=>l.id===(item?.floor??params.get('floor')))??store.levels[0];
let room=floor.rooms.some(r=>r.id===params.get('room'))?params.get('room'):'all';
if(item&&room!=='all')room=item.room;
let selected=item?.id??floorItems(store,floor.id,room)[0]?.id??'';
const viewer=createStore3D($('store-canvas'),$('store-pins'),id=>choose(id));

function saveView(){
 const url=new URL(location.href);
 url.searchParams.set('floor',floor.id);
 if(room==='all')url.searchParams.delete('room');else url.searchParams.set('room',room);
 if(selected)url.searchParams.set('item',selected);else url.searchParams.delete('item');
 history.replaceState(null,'',url);
}

function renderSelection(){
 const product=store.productMap.get(selected);
 $('store-detail').innerHTML=renderProduct(product);
 $('store-detail').dataset.selectedItem=selected;
 for(const el of document.querySelectorAll('[data-catalog-item],[data-plan-item]')){
  const active=(el.dataset.catalogItem??el.dataset.planItem)===selected;
  el.setAttribute('aria-pressed',String(active));
  el.classList.toggle('is-selected',active);
 }
 viewer?.select(selected);
}

function choose(id){
 const product=store.productMap.get(id);
 if(!product||product.floor!==floor.id||room!=='all'&&product.room!==room)return;
 if(selected!==id){
  selected=id;renderSelection();saveView();
 }
 const panel=$('store-detail'),detail=panel.getBoundingClientRect();
 if(detail.bottom>innerHeight-92)panel.scrollIntoView({block:'end'});
 else if(detail.top<70)panel.scrollIntoView({block:'start'});
}

function renderScope(resetCamera=false){
 const items=floorItems(store,floor.id,room);
 $('store-workspace').dataset.floor=floor.id;
 for(const btn of document.querySelectorAll('[data-store-floor]'))btn.setAttribute('aria-pressed',String(btn.dataset.storeFloor===floor.id));
 $('store-rooms').innerHTML=[{id:'all',name:'All rooms'},...floor.rooms].map(r=>`<button type="button" data-store-room="${r.id}" aria-pressed="${r.id===room}">${e(r.name)}</button>`).join('');
 $('store-plan-wrap').innerHTML=renderPlan(store,floor,room,selected);
 $('store-catalog-items').innerHTML=renderCatalog(items,selected)||'<p>No products in this room yet.</p>';
 $('store-catalog-count').textContent=items.length+' '+(items.length===1?'product':'products');
 $('store-model-scope').textContent=floor.label+' · '+(room==='all'?'All rooms':floor.rooms.find(r=>r.id===room).name);
 if(resetCamera){viewer?.fit();$('store-zoom').value=1;}
 viewer?.setScene(storeScene(store,floor.id,room),selected);
 renderSelection();
}

$('store-workspace').addEventListener('click',ev=>{
 const f=ev.target.closest('[data-store-floor]');
 const r=ev.target.closest('[data-store-room]');
 const p=ev.target.closest('[data-catalog-item],[data-plan-item]');
 if(f&&floor.id!==f.dataset.storeFloor){
  floor=store.levels.find(l=>l.id===f.dataset.storeFloor);room='all';
  selected=floorItems(store,floor.id)[0]?.id??'';renderScope(true);saveView();
 }else if(r&&room!==r.dataset.storeRoom){
  room=r.dataset.storeRoom;const items=floorItems(store,floor.id,room);
  if(!items.some(p=>p.id===selected))selected=items[0]?.id??'';
  renderScope(true);saveView();
  $('store-rooms').querySelector('[aria-pressed="true"]').focus({preventScroll:true});
 }else if(p)choose(p.dataset.catalogItem??p.dataset.planItem);
});
$('store-plan-wrap').addEventListener('keydown',ev=>{
 const button=ev.target.closest('[data-plan-item]');
 if(button&&['Enter',' '].includes(ev.key)){ev.preventDefault();choose(button.dataset.planItem);}
});
$('store-left').addEventListener('click',()=>viewer?.turn(-18));
$('store-right').addEventListener('click',()=>viewer?.turn(18));
$('store-fit').addEventListener('click',()=>{viewer?.fit();$('store-zoom').value=1;});
$('store-zoom').addEventListener('input',ev=>viewer?.zoom(Number(ev.target.value)));
$('store-3d-unavailable').hidden=Boolean(viewer);
renderScope();

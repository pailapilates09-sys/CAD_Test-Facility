import * as THREE from '../../../vendor/three.module.min.js';
import {OrbitControls} from '../../../vendor/OrbitControls.js';
import {buildRoomModel,matchingItems,createSelection} from './room-model.js';
import {createThreeAdapter} from './three-model.js';
const {createModelBatches,updateModelBatches,pickedItem}=createThreeAdapter(THREE);
const $=id=>document.getElementById(id),canvas=$('plan'),ctx=canvas.getContext('2d'),host=$('three-view');
const cache=document.createElement('canvas'),cacheCtx=cache.getContext('2d');
let model,state,matching=new Set(),renderer,scene,camera,controls,group,instanceGroups=[],dirty=true,visibleObjects=[];
let cacheMap,plan={zoom:1,x:0,y:0},viewMap,framePending=false,planTriangles=[],lightingMarkers=[];
const PLAN_HEIGHT=1.5;
const css=name=>getComputedStyle(document.querySelector('.room-workspace')).getPropertyValue(name).trim();
function itemColor(item){return css('--room-'+({'Room geometry':'architecture','Plants':'plants','Lighting':'lighting','Furniture':'furniture','Equipment':'equipment','Fittings':'fittings'}[item.category]))}
function finiteBox(b){return b.min.every(Number.isFinite)&&b.max.every(Number.isFinite)}
function visible(id){return state.visible(id,matching)}
function updateSelection(id,origin='view'){
 if(!state||!state.select(id))return;
 updateUI(false);
 if(origin==='view'&&id){const row=[...$('item-rows').rows].find(r=>r.dataset.itemId===id);if(row){const viewport=row.closest('.table-wrap'),r=row.getBoundingClientRect(),v=viewport.getBoundingClientRect(),header=viewport.querySelector('thead').getBoundingClientRect().height;if(r.top<v.top+header)viewport.scrollTop+=r.top-v.top-header;else if(r.bottom>v.bottom)viewport.scrollTop+=r.bottom-v.bottom}}
}
function updateUI(rebuildPlan=false){
 const selected=model.items.find(i=>i.id===state.selectedId);
 for(const row of $('item-rows').rows){const id=row.dataset.itemId;row.hidden=!visible(id);row.classList.toggle('is-selected',id===state.selectedId);row.querySelector('button').setAttribute('aria-pressed',String(id===state.selectedId))}
 $('selection').textContent=selected?`${selected.name} · ${selected.quantity} ${selected.quantity===1?'placement':'placements'} selected in 2D, 3D and the table.`:'Select an item to see it across all three views.';
 $('focus').disabled=$('isolate').disabled=$('clear-selection').disabled=!selected;
 $('isolate').setAttribute('aria-pressed',String(state.isolated));$('isolate').textContent=state.isolated?'Exit isolation':'Isolate selected';
 const count=model.items.filter(i=>visible(i.id)).length;$('visible-count').textContent=`${count} / ${model.items.length} item types`;
 $('no-items').hidden=count!==0;visibleObjects=model.objects.filter(o=>visible(o.itemId));
 update3D();if(rebuildPlan)buildPlanCache();else drawPlan();dirty=true;
}
function update3D(){
 if(!renderer)return;
 updateModelBatches(instanceGroups,{visible,selectedId:state.selectedId,highlight:css('--room-highlight'),cutaway:$('cutaway').checked,height:PLAN_HEIGHT});
}

function init3D(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.localClippingEnabled=true;
  renderer.domElement.setAttribute('aria-label','Linked 3D studio. Drag to orbit. Select an item or use the item table.');renderer.domElement.setAttribute('tabindex','0');host.appendChild(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color(css('--room-plan-bg'));
  camera=new THREE.PerspectiveCamera(42,1,.01,500);camera.up.set(0,0,1);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.addEventListener('change',()=>{dirty=true});
  scene.add(new THREE.HemisphereLight(0xffffff,0x56675e,2.1));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(10,-15,22);scene.add(light);
  group=new THREE.Group();scene.add(group);
  instanceGroups=createModelBatches(model);for(const batch of instanceGroups)group.add(batch.mesh);
  let start;
  renderer.domElement.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY,e.pointerId]});
  renderer.domElement.addEventListener('pointerup',e=>{
   if(!start||start[2]!==e.pointerId||Math.hypot(e.clientX-start[0],e.clientY-start[1])>6)return;
   const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
   const itemId=pickedItem(ray,instanceGroups,{visible,cutaway:$('cutaway').checked,height:PLAN_HEIGHT});if(itemId)updateSelection(itemId);
  });
  $('three-empty').hidden=true;resize3D();
  function frame(){requestAnimationFrame(frame);controls.update();if(dirty){renderer.render(scene,camera);dirty=false}}frame();
 }catch(error){$('three-empty').textContent='3D needs WebGL in this browser. The 2D plan and item table remain available.';console.warn('3D renderer unavailable',error)}
}
function fit3D(bounds){if(!renderer||!finiteBox(bounds))return;const a=new THREE.Vector3(...bounds.min),b=new THREE.Vector3(...bounds.max),center=a.clone().add(b).multiplyScalar(.5),size=b.clone().sub(a),span=Math.max(size.x,size.y,size.z,.3);controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(span,-span,span*.8));camera.near=Math.max(.005,span/10000);camera.far=span*50;camera.updateProjectionMatrix();controls.update();dirty=true}
function resize3D(){if(!renderer)return;const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();dirty=true}
function clipToPlan(points){
 const output=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],inside=a[2]<=PLAN_HEIGHT,next=b[2]<=PLAN_HEIGHT;
  if(inside)output.push(a);
  if(inside!==next){const t=(PLAN_HEIGHT-a[2])/(b[2]-a[2]);output.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),PLAN_HEIGHT])}
 }
 return output;
}
function hull(points){
 const sorted=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(sorted.length<3)return sorted;
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lower=[],upper=[];
 for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p)}
 for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p)}
 lower.pop();upper.pop();return lower.concat(upper);
}
function preparePlan(){
 const exact=new Set(['136690','137855','138154','138883','138934','loose-room']);
 for(const o of model.objects){const p=o.worldPositions,index=o.mesh.indices;if(o.bounds.min[2]>PLAN_HEIGHT)continue;
  if(!exact.has(o.definitionId)){
   const points=[];for(let i=0;i<p.length;i+=3)points.push([p[i],p[i+1],Math.min(p[i+2],PLAN_HEIGHT)]);
   const poly=hull(points);if(poly.length>2)planTriangles.push({itemId:o.itemId,points:poly,z:Math.min(o.bounds.max[2],PLAN_HEIGHT),rgb:o.rgb});continue;
  }
  for(let i=0;i<index.length;i+=3){const ids=index.slice(i,i+3),points=ids.map(id=>[p[id*3],p[id*3+1],p[id*3+2]]);if(points.every(v=>v[2]>PLAN_HEIGHT))continue;
   const poly=clipToPlan(points);if(poly.length<3)continue;planTriangles.push({itemId:o.itemId,points:poly,z:poly.reduce((s,v)=>s+v[2],0)/poly.length,rgb:o.rgb});}
 }
 planTriangles.sort((a,b)=>a.z-b.z);
 lightingMarkers=model.items.filter(i=>i.category==='Lighting').flatMap(item=>item.occurrences.map(o=>({itemId:item.id,point:finiteBox(o.bounds)?o.bounds.min.map((v,i)=>(v+o.bounds.max[i])/2):o.origin}))).concat(model.markers.map(m=>({itemId:m.itemId,point:m.point})));
}
function buildPlanCache(){
 if(!model)return;
 const b=model.bounds,dx=b.max[0]-b.min[0],dy=b.max[1]-b.min[1],scale=1700/Math.max(dx,dy,.01);
 cache.width=Math.ceil(dx*scale+80);cache.height=Math.ceil(dy*scale+80);cacheMap={scale,minX:b.min[0],maxY:b.max[1],pad:40};cacheCtx.fillStyle=css('--room-plan-bg');cacheCtx.fillRect(0,0,cache.width,cache.height);
 let previousColor='';
 for(const t of planTriangles){if(!visible(t.itemId))continue;const color='rgb('+t.rgb.map(v=>Math.round(v*.8+255*.2)).join(',')+')';if(color!==previousColor){cacheCtx.fillStyle=color;previousColor=color}
  cacheCtx.beginPath();for(let i=0;i<t.points.length;i++){const p=cachePoint(t.points[i]);i?cacheCtx.lineTo(...p):cacheCtx.moveTo(...p)}cacheCtx.closePath();cacheCtx.fill();
 }
 cacheCtx.strokeStyle=css('--room-lighting');cacheCtx.lineWidth=2;
 for(const marker of lightingMarkers){if(!visible(marker.itemId))continue;const [x,y]=cachePoint(marker.point);cacheCtx.beginPath();cacheCtx.arc(x,y,5,0,Math.PI*2);cacheCtx.moveTo(x-3,y);cacheCtx.lineTo(x+3,y);cacheCtx.moveTo(x,y-3);cacheCtx.lineTo(x,y+3);cacheCtx.stroke()}
 drawPlan();
}
function cachePoint(p){return [cacheMap.pad+(p[0]-cacheMap.minX)*cacheMap.scale,cacheMap.pad+(cacheMap.maxY-p[1])*cacheMap.scale]}
function screenPoint(p){const q=cachePoint(p);return [viewMap.x+q[0]*viewMap.scale,viewMap.y+q[1]*viewMap.scale]}
function drawPlan(){
 if(!model||!cacheMap)return;const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(!r.width||!r.height)return;
 if(canvas.width!==Math.round(r.width*dpr)||canvas.height!==Math.round(r.height*dpr)){canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=css('--room-plan-bg');ctx.fillRect(0,0,r.width,r.height);
 const scale=Math.min((r.width-28)/cache.width,(r.height-48)/cache.height)*plan.zoom;
 viewMap={scale,x:(r.width-cache.width*scale)/2+plan.x,y:(r.height-cache.height*scale)/2+plan.y};ctx.drawImage(cache,viewMap.x,viewMap.y,cache.width*scale,cache.height*scale);
 const selected=model.items.find(i=>i.id===state.selectedId);
 if(selected){ctx.strokeStyle=css('--room-selected');ctx.fillStyle=css('--room-selected');ctx.lineWidth=2;
  for(const o of selected.occurrences){if(!finiteBox(o.bounds)){const p=screenPoint(o.origin);ctx.beginPath();ctx.arc(...p,8,0,Math.PI*2);ctx.stroke();continue;}const p=screenPoint([o.bounds.min[0],o.bounds.max[1],0]),q=screenPoint([o.bounds.max[0],o.bounds.min[1],0]);ctx.strokeRect(p[0]-3,p[1]-3,Math.max(7,q[0]-p[0]+6),Math.max(7,q[1]-p[1]+6));}
 }
 // A scale bar derives from the same SI projection, not an authored dimension.
 const pxPerMetre=cacheMap.scale*scale,target=75/pxPerMetre,metres=[.1,.2,.5,1,2,5,10].reduce((best,n)=>Math.abs(n-target)<Math.abs(best-target)?n:best,1),length=metres*pxPerMetre;
 ctx.strokeStyle=css('--room-plan-ink');ctx.fillStyle=css('--room-plan-ink');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.width-24-length,r.height-25);ctx.lineTo(r.width-24,r.height-25);ctx.stroke();ctx.font='11px Manrope,Arial,sans-serif';ctx.textAlign='right';ctx.fillText(metres+' m',r.width-24,r.height-32);ctx.textAlign='left';
}
function requestPlan(){if(framePending)return;framePending=true;requestAnimationFrame(()=>{framePending=false;drawPlan()})}
function pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
function pickPlan(x,y){
 const marker=lightingMarkers.find(m=>{const p=screenPoint(m.point);return visible(m.itemId)&&Math.hypot(x-p[0],y-p[1])<8});if(marker)return marker.itemId;
 const cx=(x-viewMap.x)/viewMap.scale,cy=(y-viewMap.y)/viewMap.scale,wx=(cx-cacheMap.pad)/cacheMap.scale+cacheMap.minX,wy=cacheMap.maxY-(cy-cacheMap.pad)/cacheMap.scale;
 for(let i=planTriangles.length-1;i>=0;i--){const t=planTriangles[i];if(visible(t.itemId)&&pointInPolygon(wx,wy,t.points))return t.itemId}return null;
}
const pointers=new Map();let gesture=null;
canvas.addEventListener('pointerdown',e=>{if(!model)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);gesture={start:[e.clientX,e.clientY],previous:[e.clientX,e.clientY],moved:false};if(pointers.size>1){const a=[...pointers.values()];gesture.distance=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);gesture.moved=true}});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size>1){const a=[...pointers.values()],distance=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(gesture.distance)plan.zoom=Math.max(.5,Math.min(8,plan.zoom*distance/gesture.distance));gesture.distance=distance;gesture.moved=true}else{plan.x+=e.clientX-old[0];plan.y+=e.clientY-old[1];if(Math.hypot(e.clientX-gesture.start[0],e.clientY-gesture.start[1])>5)gesture.moved=true}requestPlan()});
canvas.addEventListener('pointerup',e=>{if(gesture&&!gesture.moved&&model){const r=canvas.getBoundingClientRect(),id=pickPlan(e.clientX-r.left,e.clientY-r.top);if(id)updateSelection(id)}pointers.delete(e.pointerId);if(!pointers.size)gesture=null;else gesture.moved=true});
canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gesture=null});
canvas.addEventListener('wheel',e=>{if(!model)return;e.preventDefault();plan.zoom=Math.max(.5,Math.min(8,plan.zoom*Math.exp(-e.deltaY*.001)));requestPlan()},{passive:false});
function zoomPlan(factor){plan.zoom=Math.max(.5,Math.min(8,plan.zoom*factor));drawPlan()}
$('plan-in').addEventListener('click',()=>zoomPlan(1.3));$('plan-out').addEventListener('click',()=>zoomPlan(1/1.3));
canvas.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){zoomPlan(1.3);e.preventDefault()}else if(e.key==='-'){zoomPlan(1/1.3);e.preventDefault()}else if(e.key==='Escape')updateSelection(null)});
$('item-rows').addEventListener('click',e=>{const button=e.target.closest('button[data-item-id]');if(button)updateSelection(button.dataset.itemId,'table')});
$('fit').addEventListener('click',()=>{if(!model)return;plan={zoom:1,x:0,y:0};fit3D(model.bounds);drawPlan()});
$('focus').addEventListener('click',()=>{const item=model.items.find(i=>i.id===state.selectedId);if(!item||!finiteBox(item.bounds))return;fit3D(item.bounds);const center=item.bounds.min.map((v,i)=>(v+item.bounds.max[i])/2),r=canvas.getBoundingClientRect(),dx=item.bounds.max[0]-item.bounds.min[0],dy=item.bounds.max[1]-item.bounds.min[1];plan={zoom:Math.min(5,Math.max(1,Math.min((model.bounds.max[0]-model.bounds.min[0])/Math.max(dx,.5),(model.bounds.max[1]-model.bounds.min[1])/Math.max(dy,.5))*.65)),x:0,y:0};drawPlan();const p=screenPoint(center);plan.x=r.width/2-p[0];plan.y=r.height/2-p[1];drawPlan();if(item.bounds.min[2]>PLAN_HEIGHT){$('cutaway').checked=false;update3D()}});
$('isolate').addEventListener('click',()=>{state.isolate(!state.isolated);updateUI(true)});
$('clear-selection').addEventListener('click',()=>{state.select(null);updateUI(true)});
$('cutaway').addEventListener('change',()=>{update3D();dirty=true});
let searchTimer;
$('item-search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if(!model)return;matching=new Set(matchingItems(model.items,$('item-search').value));if(state.selectedId&&!matching.has(state.selectedId))state.select(null);updateUI(true)},140)});
new ResizeObserver(()=>{resize3D();requestPlan()}).observe(host);new ResizeObserver(requestPlan).observe(canvas.parentElement);
new MutationObserver(()=>{if(!model)return;if(scene)scene.background.set(css('--room-plan-bg'));buildPlanCache();update3D();dirty=true}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
async function start(){
 try{const response=await fetch('./studio-room.scene.json');if(!response.ok)throw Error('Room scene request failed');const data=await response.json();model=buildRoomModel(data);state=createSelection(model.items.map(i=>i.id));matching=new Set(matchingItems(model.items,$('item-search').value));
  init3D();fit3D(model.bounds);preparePlan();buildPlanCache();$('plan-empty').hidden=true;updateUI();
  document.documentElement.dataset.roomReady='true';
 }catch(error){$('plan-empty').textContent='The room could not load. Reload the page to try again.';$('model-status').textContent='Model loading failed: '+error.message;console.error(error)}
}
start();

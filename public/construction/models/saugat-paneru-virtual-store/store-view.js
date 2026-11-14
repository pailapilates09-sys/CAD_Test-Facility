import {projectPoint,projectedFaces,pointInTriangle} from '../layout-designer/design-view3d.js';
import {displayDimensions,escapeHTML as e,priceLabel,rackKey,shelfLabels} from './store-model.js';
import {productMeshes} from './store-geometry.js';

export function renderPlan(store,floor,roomId='all',selected=null,rack='all'){
 const scale=13,left=48,top=55,w=store.length*scale,h=store.depth*scale;
 const width=left+w+57,height=top+h+57,px=x=>left+x*scale,py=y=>top+(store.depth-y)*scale;
 const roomMarkup=floor.rooms.map(r=>{
  const roomX=px(r.x),active=roomId==='all'||roomId===r.id,name=r.name.split(' ');
  const lines=name.length>1?[name.slice(0,-1).join(' '),name.at(-1)]:name;
  return `<g class="store-plan-room${active?'':' is-muted'}"><rect x="${roomX+2}" y="${top+2}" width="${store.step*scale-4}" height="${h*.61}" fill="${e(r.color)}" opacity=".12"/>
   ${r.shelves.map(s=>{const chosen=selected?.room===r.id&&selected.shelf===s.id||roomId===r.id&&rack===s.id;return `<g role="button" tabindex="0" data-plan-rack="${r.id}/${s.id}" aria-label="Show ${e(r.rack_labels[s.id])} in ${e(r.name)}" aria-pressed="${chosen}"><title>${e(r.rack_labels[s.id])}</title><rect class="store-plan-shelf${chosen?' is-selected':''}" x="${px(s.x)}" y="${py(s.y+s.d)}" width="${s.w*scale}" height="${s.d*scale}" rx="2"/></g>`;}).join('')}
   <text class="store-plan-room-name" x="${roomX+store.step*scale/2}" y="${top+h*.33}">${lines.map((l,i)=>`<tspan x="${roomX+store.step*scale/2}" dy="${i?14:0}">${e(l)}</tspan>`).join('')}</text></g>`;
 }).join('');
 const columns=Array.from({length:store.grid.columns},(_,i)=>i*store.step);
 const dim=(x1,y1,x2,y2)=>`<line class="store-plan-dimension" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
 const boundaries=columns.map(x=>dim(px(x),top-27,px(x),top-12)).join('');
 const bays=columns.slice(0,-1).map(x=>`${dim(px(x),top-19,px(x+store.step),top-19)}<text class="store-plan-measure" x="${px(x+store.step/2)}" y="${top-25}">${store.step} ft</text>`).join('');
 const spot=selected?.floor===floor.id?`<rect class="store-plan-placement" data-plan-placement="${selected.id}" x="${px(selected.x-selected.w/2)}" y="${py(selected.y+selected.d/2)}" width="${selected.w*scale}" height="${selected.d*scale}" rx="2" fill="${e(selected.color)}"><title>${e(selected.name)}</title></rect>`:'';
 return `<svg id="store-plan" class="store-plan" viewBox="0 0 ${width} ${height}" role="group" aria-label="${e(floor.label)} plan; ${store.pillars.length} pillars and ${floor.rooms.length} rooms">
  <rect class="store-plan-base" x="${left}" y="${top}" width="${w}" height="${h}" rx="2"/>
  ${roomMarkup}
  <path class="store-plan-wall" d="M${left} ${top+h}V${top}H${left+w}V${top+h} ${columns.slice(1,-1).map(x=>`M${px(x)} ${top}v${h*.61}`).join(' ')}"/>
  <path class="store-plan-front" d="M${left} ${top+h}H${left+w}"/>
  <text class="store-plan-caption" x="${left+w/2}" y="${top+h*.83}">OPEN FRONT AISLE</text>
  ${boundaries}${bays}
  ${dim(left+w+23,top,left+w+23,top+h)}${dim(left+w+15,top,left+w+31,top)}${dim(left+w+15,top+h,left+w+31,top+h)}
  <text class="store-plan-measure" x="${left+w+31}" y="${top+h/2}" transform="rotate(90 ${left+w+31} ${top+h/2})">${store.depth} ft</text>
  ${store.pillars.map(p=>`<g data-pillar="${p.id}"><rect class="store-plan-pillar" x="${px(p.x)-5}" y="${py(p.y)-5}" width="10" height="10" rx="1"/>
   <text class="store-plan-grid-label" x="${px(p.x)}" y="${py(p.y)+(p.y===0?19:-8)}">${p.id}</text></g>`).join('')}
  ${spot}
  <text class="store-plan-caption" x="${left+w/2}" y="${height-9}">${store.length} × ${store.depth} ft pillar grid · centre to centre</text>
 </svg>`;
}

export function renderCatalog(items,selected){
 return `<table class="store-catalog-table"><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Sample price</th></tr></thead><tbody>${items.map(p=>`<tr data-catalog-row="${p.id}"${p.id===selected?' class="is-selected"':''}><th scope="row"><button type="button" data-catalog-item="${p.id}" aria-pressed="${p.id===selected}"><i class="store-color-chip" style="--item-color:${e(p.color)}" aria-hidden="true"></i>${e(p.name)}</button></th><td>${e(p.category)}</td><td>${priceLabel(p.price_npr)}</td></tr>`).join('')}</tbody></table>`;
}

const colorCSS=rgb=>'rgb('+rgb.map(c=>Math.round(c)).join(',')+')';
export const cameraPreset=(view='front',mode='rack')=>view==='front'?{yaw:270,pitch:0,zoom:1}:{yaw:284,pitch:mode==='floor'?36:15,zoom:1};
export const storeFaces=(meshes,camera)=>projectedFaces(meshes,camera).filter(({points:[a,b,c]})=>
 (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])<-1e-9);

export function faceBounds(faces){
 let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 for(const f of faces)for(const [x,y] of f.points){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 return {left,top,right,bottom};
}
export function renderCloseup(p){
 const faces=storeFaces(productMeshes({...p,...displayDimensions(p),x:0,y:0,z:0}),{yaw:292,pitch:22});
 const b=faceBounds(faces),pad=.1,view=[b.left-pad,b.top-pad,b.right-b.left+pad*2,b.bottom-b.top+pad*2].join(' ');
 return `<svg class="store-closeup" viewBox="${view}" role="img" aria-label="Close-up of ${e(p.name)}">${faces.map(f=>`<polygon points="${f.points.map(v=>v.slice(0,2).join(',')).join(' ')}" fill="${colorCSS(f.rgb)}" stroke="${colorCSS(f.rgb)}" stroke-width=".004"/>`).join('')}</svg>`;
}

export function renderProduct(p,facing){
 if(!p||!facing)return '<p>Select a product to see its details.</p>';
 const apparelFacts=p.type==='apparel'?`<div><dt>Fabric</dt><dd>${e(p.fabric)}</dd></div><div><dt>Sample sizes</dt><dd>${e(p.sizes)}</dd></div>`:'';
 return `<p class="store-product-place">${e(p.category)} · ${e(shelfLabels[facing.shelf])}</p><h3>${e(p.name)}</h3>
  ${renderCloseup(p)}
  <dl class="store-product-facts"><div><dt>Brand</dt><dd>${e(p.brand??'Not specified')}</dd></div><div><dt>Sample price</dt><dd class="store-detail-price">${priceLabel(p.price_npr)}</dd></div>${apparelFacts}</dl>
  <p class="store-location">${e(facing.floorLabel)} · Level ${facing.band.level} · ${facing.band.low}–${facing.band.high} ft</p>`;
}

export function renderShelfLevels(store,roomId,selected='',level=0,activeRack='all'){
 const room=store.roomMap.get(roomId);
 const shelves=Object.entries(shelfLabels).filter(([id])=>activeRack==='all'||id===activeRack).map(([id,label])=>({id,label,rack:store.racks.get(rackKey(roomId,id))}));
 return `<table class="store-elevation"><caption>${e(room.name)} · ${e(room.floorLabel)}</caption>
 <thead><tr><th scope="col">Height</th>${shelves.map(s=>`<th scope="col"${activeRack===s.id?' class="store-elevation-active-rack"':''}>${e(s.rack.label)}<small>${e(s.label)}</small></th>`).join('')}</tr></thead>
 <tbody>${[...store.bands].reverse().map(b=>`<tr data-shelf-band="${b.level}"${b.level===level?' class="store-level-active"':''}>
 <th scope="row"><button type="button" class="store-level-button" data-store-level="${b.level}" aria-label="Show level ${b.level}, ${b.low} to ${b.high} feet" aria-pressed="${b.level===level}"><strong>L${b.level}</strong><small>${b.low}–${b.high} ft</small></button></th>
 ${shelves.map(({rack})=>`<td>${rack.facings.filter(f=>f.band.level===b.level).map(f=>`<button type="button" class="store-elevation-item" data-elevation-facing="${f.id}" title="${e(f.name)}" aria-label="Inspect ${e(f.name)} at level ${b.level}" aria-pressed="${f.id===selected}"><i class="store-color-chip" style="--item-color:${e(f.color)}" aria-hidden="true"></i><small>${e(f.name)}</small></button>`).join('')}</td>`).join('')}
 </tr>`).join('')}</tbody></table>`;
}

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
export function createStore3D(canvas,targetsRoot,onSelect,onAngleChange,onCabinetControl){
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 let scene,selected='',orientation='front',camera=cameraPreset(),frame=0,faces=[],base=[],bounds,map,drag,geometryKey='';
 let cabinetButton,opening=1,shot=null;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const targets=new Map(),pickable=new Set();
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const project=([x,y])=>[x*map.scale+map.ox,y*map.scale+map.oy];

 function draw(time){
  frame=0;const width=canvas.clientWidth,height=canvas.clientHeight;
  if(!width||!height||!scene)return;
  const ratio=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(width*ratio))canvas.width=Math.round(width*ratio);
  if(canvas.height!==Math.round(height*ratio))canvas.height=Math.round(height*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  const key=camera.yaw+'/'+camera.pitch;
  if(key!==geometryKey){base=storeFaces(scene.meshes,camera);bounds=faceBounds(base);geometryKey=key;}
  if(shot){
   const progress=clamp((time-shot.start)/shot.duration,0,1);
   const easing=progress*progress*(3-2*progress);
   opening=shot.from+(shot.to-shot.from)*easing;
   if(progress<1)schedule();else shot=null;
  }
  const movingDoors=scene.cabinet&&opening<1?storeFaces(scene.cabinet.doors(opening),camera):[];
  if(movingDoors.length){
   const ordered=[];let i=0;
   for(const face of base){
    while(i<movingDoors.length&&movingDoors[i].depth<face.depth)ordered.push(movingDoors[i++]);
    ordered.push(face);
   }
   faces=ordered.concat(movingDoors.slice(i));
  }else faces=base;
  const b=bounds;if(!Number.isFinite(b.left))return;
  const scale=Math.min((width-24)/Math.max(b.right-b.left,.01),(height-28)/Math.max(b.bottom-b.top,.01))*camera.zoom;
  map={scale,ox:width/2-(b.left+b.right)*scale/2,oy:height/2-(b.top+b.bottom)*scale/2};
  for(const f of faces){
   const points=f.points.map(project);
   ctx.beginPath();ctx.moveTo(...points[0]);ctx.lineTo(...points[1]);ctx.lineTo(...points[2]);ctx.closePath();
   ctx.fillStyle=colorCSS(f.itemId===selected&&(orientation==='angled'||scene.display==='floor')?f.rgb.map((v,i)=>v*.7+[255,199,88][i]*.3):f.rgb);
   ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.45;ctx.stroke();
  }
  function position(t,button,enabled){
   const points=[[t.x,t.y,t.z],[t.x+t.w,t.y,t.z],[t.x,t.y,t.z+t.h],[t.x+t.w,t.y,t.z+t.h]].map(p=>project(projectPoint(p,camera)));
   const [x,y]=[0,1].map(i=>Math.min(...points.map(p=>p[i])));
   const w=Math.max(...points.map(p=>p[0]))-x,h=Math.max(...points.map(p=>p[1]))-y;
   const bw=button===cabinetButton?Math.max(w,44):w,bh=button===cabinetButton?Math.max(h,44):h;
   const visible=enabled&&orientation==='front'&&x+w>0&&x<width&&y+h>0&&y<height;
   Object.assign(button.style,{left:x+(w-bw)/2+'px',top:y+(h-bh)/2+'px',width:bw+'px',height:bh+'px'});
   button.hidden=!visible;button.tabIndex=visible?0:-1;
  }
  for(const t of scene.targets??[])position(t,targets.get(t.id),opening>=.999);
  if(cabinetButton)position(scene.cabinet.target,cabinetButton,true);
 }

 function hit(ev){
  if(!map)return null;
  const r=canvas.getBoundingClientRect(),point=[(ev.clientX-r.left-map.ox)/map.scale,(ev.clientY-r.top-map.oy)/map.scale];
  for(let i=faces.length-1;i>=0;i--)if(pointInTriangle(point,faces[i].points)){
   const id=faces[i].itemId;
   return id===scene.cabinet?.target.id||opening>=.999&&pickable.has(id)?id:null;
  }
  return null;
 }
 function angle(){
  if(orientation==='angled')return;
  orientation='angled';onAngleChange('angled');
 }
 canvas.addEventListener('pointerdown',ev=>{
  if(!ev.isPrimary||ev.button!==0)return;
  drag={x:ev.clientX,y:ev.clientY,yaw:camera.yaw,pitch:camera.pitch,pointer:ev.pointerId,moved:false};
  canvas.setPointerCapture(ev.pointerId);
 });
 canvas.addEventListener('pointermove',ev=>{
  if(!drag){if(ev.pointerType==='mouse')canvas.style.cursor=hit(ev)?'pointer':'grab';return;}
  if(drag.pointer!==ev.pointerId)return;
  const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  drag.moved=true;angle();camera.yaw=drag.yaw+dx*.45;camera.pitch=clamp(drag.pitch+dy*.28,0,68);schedule();
 });
 canvas.addEventListener('pointerup',ev=>{
  if(drag?.pointer!==ev.pointerId)return;
  const pick=!drag.moved?hit(ev):null;drag=null;
  if(pick===scene?.cabinet?.target.id&&pick)onCabinetControl?.();
  else if(pick)onSelect(pick);
 });
 canvas.addEventListener('pointercancel',()=>{drag=null;});
 canvas.addEventListener('keydown',ev=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key))return;
  ev.preventDefault();angle();
  if(ev.key==='ArrowLeft')camera.yaw-=15;if(ev.key==='ArrowRight')camera.yaw+=15;
  if(ev.key==='ArrowUp')camera.pitch=clamp(camera.pitch+6,0,68);if(ev.key==='ArrowDown')camera.pitch=clamp(camera.pitch-6,0,68);schedule();
 });
 function select(id){
  selected=id;for(const [key,b] of targets)b.setAttribute('aria-pressed',String(key===id));schedule();
 }
 new ResizeObserver(schedule).observe(canvas);
 return {
  setScene(next,id,view='front',{open=true,keepCamera=false}={}){
   scene=next;geometryKey='';map=null;targets.clear();pickable.clear();orientation=view;
   opening=open?1:0;shot=null;cabinetButton=null;
   if(!keepCamera)camera=cameraPreset(orientation,scene.display);
   canvas.parentElement.dataset.display=scene.display;canvas.parentElement.style.setProperty('--rack-rows',scene.rows??1);
   const group=document.createDocumentFragment(),stock=new Map(scene.stock.map(f=>[f.id,f]));
   for(const f of scene.stock)pickable.add(f.id);
   if(scene.cabinet&&onCabinetControl){
    cabinetButton=document.createElement('button');cabinetButton.type='button';cabinetButton.className='store-model-target store-cabinet-trigger';cabinetButton.hidden=true;
    cabinetButton.title='Cabinet controls';cabinetButton.dataset.cabinetTrigger='';cabinetButton.setAttribute('aria-label','Open cabinet controls from the cabinet');
    cabinetButton.setAttribute('aria-controls','store-cabinet-options');cabinetButton.setAttribute('aria-expanded','false');
    cabinetButton.addEventListener('click',onCabinetControl);group.append(cabinetButton);
   }
   for(const t of scene.targets??[]){
    const f=stock.get(t.id),b=document.createElement('button');b.type='button';b.className='store-model-target';b.hidden=true;
    b.dataset.modelFacing=f.id;b.title=f.name;b.setAttribute('aria-label','Inspect '+f.name+' at shelf level '+f.band.level);
    b.addEventListener('click',()=>onSelect(f.id));group.append(b);targets.set(f.id,b);
   }
   targetsRoot.replaceChildren(group);select(id);
  },
  setCabinetOpen(open){
   if(!scene?.cabinet)return;
   if(reducedMotion.matches){opening=open?1:0;shot=null;}
   else if(opening!==Number(open))shot={from:opening,to:Number(open),start:performance.now(),duration:280};
   else shot=null;
   schedule();
  },
  select,orientation(value){orientation=value;camera=cameraPreset(value,scene?.display);schedule();},
  turn(delta){if(orientation==='front'){angle();camera=cameraPreset('angled',scene?.display);}camera.yaw+=delta;schedule();},
  zoom(value){camera.zoom=value;schedule();},fit(){camera=cameraPreset(orientation,scene?.display);schedule();}
 };
}

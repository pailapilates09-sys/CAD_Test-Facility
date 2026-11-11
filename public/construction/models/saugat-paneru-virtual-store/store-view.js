import {projectPoint,projectedFaces,pointInTriangle} from '../layout-designer/design-view3d.js';
import {escapeHTML as e,priceLabel,shelfLabels} from './store-model.js';

export function renderPlan(store,floor,roomId='all',selected='') {
 const scale=13,left=48,top=55,w=store.length*scale,h=store.depth*scale;
 const width=left+w+57,height=top+h+57,px=x=>left+x*scale,py=y=>top+(store.depth-y)*scale;
 const roomMarkup=floor.rooms.map(r=>{
  const roomX=px(r.x), active=roomId==='all'||roomId===r.id, name=r.name.split(' ');
  const lines=name.length>1?[name.slice(0,-1).join(' '),name.at(-1)]:name;
  return `<g class="store-plan-room${active?'':' is-muted'}"><rect x="${roomX+2}" y="${top+2}" width="${store.step*scale-4}" height="${h*.61}" fill="${e(r.color)}" opacity=".12"/>
   ${r.shelves.map(s=>`<rect class="store-plan-shelf" x="${px(s.x)}" y="${py(s.y+s.d)}" width="${s.w*scale}" height="${s.d*scale}" rx="2"/>`).join('')}
   <text class="store-plan-room-name" x="${roomX+store.step*scale/2}" y="${top+h*.33}">${lines.map((l,i)=>`<tspan x="${roomX+store.step*scale/2}" dy="${i?14:0}">${e(l)}</tspan>`).join('')}</text></g>`;
 }).join('');
 const columns=Array.from({length:store.grid.columns},(_,i)=>i*store.step);
 const dim=(x1,y1,x2,y2)=>`<line class="store-plan-dimension" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
 const boundaries=columns.map(x=>dim(px(x),top-27,px(x),top-12)).join('');
 const bays=columns.slice(0,-1).map(x=>`${dim(px(x),top-19,px(x+store.step),top-19)}<text class="store-plan-measure" x="${px(x+store.step/2)}" y="${top-25}">${store.step} ft</text>`).join('');
 const planItems=store.items.filter(p=>p.floor===floor.id && (roomId==='all'||p.room===roomId));
 const items=planItems.map(p=>`<g role="button" tabindex="0" data-plan-item="${p.id}" aria-label="Inspect ${e(p.name)}" aria-pressed="${p.id===selected}" class="store-plan-item${p.id===selected?' is-selected':''}">
  <circle cx="${px(p.x)}" cy="${py(p.y)}" r="8.5" fill="${e(p.roomColor)}"/><text x="${px(p.x)}" y="${py(p.y)+3.8}">${p.number}</text></g>`).join('');
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
  ${items}
  <text class="store-plan-caption" x="${left+w/2}" y="${height-9}">${store.length} × ${store.depth} ft pillar grid · centre to centre</text>
 </svg>`;
}

export function renderCatalog(items,selected) {
 return items.map(p=>`<button type="button" class="store-product" data-catalog-item="${p.id}" aria-pressed="${p.id===selected}">
  <span class="store-item-number" style="--item-color:${e(p.roomColor)}">${p.number}</span><span class="store-product-text"><strong>${e(p.name)}</strong><small>${e(p.roomName)}</small></span>
  <span class="store-card-price">${priceLabel(p.price_npr)}</span></button>`).join('');
}

export function renderProduct(product) {
 if(!product)return '<p>Select a product to see its name, brand and price.</p>';
 return `<p class="store-product-place"><span class="store-item-number" style="--item-color:${e(product.roomColor)}">${product.number}</span>${e(product.roomName)} · ${e(shelfLabels[product.shelf])}</p>
  <h3>${e(product.name)}</h3><dl class="store-product-facts"><div><dt>Brand</dt><dd>${e(product.brand)}</dd></div><div><dt>Sample price</dt><dd class="store-detail-price">${priceLabel(product.price_npr)}</dd></div></dl>
  <p class="store-location">${e(product.floorLabel)} · Shelf level ${product.tier+1}</p>`;
}

const defaultCamera=()=>({yaw:284,pitch:43,zoom:1});
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const colorCSS=rgb=>'rgb('+rgb.map(c=>Math.round(c)).join(',')+')';
export const storeFaces=(meshes,camera)=>projectedFaces(meshes,camera).filter(({points:[a,b,c]})=>
 (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])<0);

export function createStore3D(canvas,pins,onSelect) {
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 let scene, selected='', camera=defaultCamera(), frame=0, faces=[], map, drag;
 const pinButtons=new Map(), productIds=new Set();
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const project=point=>[point[0]*map.scale+map.ox,point[1]*map.scale+map.oy];

 function draw(){
  frame=0;
  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(!width||!height||!scene)return;
  const ratio=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  faces=storeFaces(scene.meshes,camera);
  let loX=Infinity,loY=Infinity,hiX=-Infinity,hiY=-Infinity;
  for(const f of faces)for(const [x,y] of f.points){loX=Math.min(loX,x);loY=Math.min(loY,y);hiX=Math.max(hiX,x);hiY=Math.max(hiY,y);}
  const scale=Math.min((width-40)/Math.max(hiX-loX,.01),(height-52)/Math.max(hiY-loY,.01))*camera.zoom;
  map={scale,ox:width/2-(loX+hiX)*scale/2,oy:height/2-(loY+hiY)*scale/2+8};
  for(const f of faces){
   const points=f.points.map(project);ctx.beginPath();ctx.moveTo(...points[0]);ctx.lineTo(...points[1]);ctx.lineTo(...points[2]);ctx.closePath();
   ctx.fillStyle=colorCSS(f.itemId===selected?f.rgb.map((v,i)=>v*.45+[255,182,60][i]*.55):f.rgb);
   ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.45;ctx.stroke();
  }
  const occupied=[];
  for(const item of scene.products){
   const button=pinButtons.get(item.id),[x,y]=project(projectPoint([item.x,item.y,item.z+item.h+.30],camera));
   let bx=clamp(x,17,width-17),by=clamp(y-8,17,height-17);
   for(const [ox,oy] of occupied)if(Math.abs(bx-ox)<22&&Math.abs(by-oy)<22)by=clamp(oy-23,17,height-17);
   occupied.push([bx,by]);
   button.style.left=bx+'px';button.style.top=by+'px';button.style.visibility='';
  }
 }

 function hit(e){
  if(!map)return null;
  const r=canvas.getBoundingClientRect(),point=[(e.clientX-r.left-map.ox)/map.scale,(e.clientY-r.top-map.oy)/map.scale];
  for(let i=faces.length-1;i>=0;i--)if(pointInTriangle(point,faces[i].points))return productIds.has(faces[i].itemId)?faces[i].itemId:null;
  return null;
 }
 canvas.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;
  drag={x:e.clientX,y:e.clientY,yaw:camera.yaw,pitch:camera.pitch,pointer:e.pointerId,moved:false};
  canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag){if(e.pointerType==='mouse')canvas.style.cursor=hit(e)?'pointer':'grab';return;}
  if(drag.pointer!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  drag.moved=true;camera.yaw=drag.yaw+dx*.45;camera.pitch=clamp(drag.pitch+dy*.28,17,78);schedule();
 });
 canvas.addEventListener('pointerup',e=>{
  if(drag?.pointer!==e.pointerId)return;
  const pick=!drag.moved?hit(e):null;drag=null;
  if(pick)onSelect(pick);
 });
 canvas.addEventListener('pointercancel',()=>{drag=null;});
 canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='ArrowLeft')camera.yaw-=15;if(e.key==='ArrowRight')camera.yaw+=15;
  if(e.key==='ArrowUp')camera.pitch=clamp(camera.pitch+6,17,78);if(e.key==='ArrowDown')camera.pitch=clamp(camera.pitch-6,17,78);schedule();
 });
 function select(id){
  selected=id;for(const [key,b] of pinButtons)b.setAttribute('aria-pressed',String(key===id));schedule();
 }
 new ResizeObserver(schedule).observe(canvas);
 return {
  setScene(next,id){
   scene=next;map=null;pinButtons.clear();productIds.clear();
   const group=document.createDocumentFragment();
   for(const item of scene.products){
    const b=document.createElement('button');b.type='button';b.className='store-pin';b.textContent=item.number;
    b.dataset.pinItem=item.id;b.style.setProperty('--item-color',item.roomColor);b.style.visibility='hidden';
    b.title=item.name;b.setAttribute('aria-label','Inspect '+item.name);
    b.addEventListener('click',()=>onSelect(item.id));group.append(b);
    pinButtons.set(item.id,b);productIds.add(item.id);
   }
   pins.replaceChildren(group);select(id);
  },
  select,turn(delta){camera.yaw+=delta;schedule();},
  zoom(value){camera.zoom=value;schedule();},fit(){camera=defaultCamera();schedule();}
 };
}

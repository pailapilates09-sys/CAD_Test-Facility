// The editable layout is the source. Plans, meshes, schedules and exports derive from it.
export const SCHEMA='paila-layout-1.0';
export const CATALOG=[
 {kind:'table',name:'Table / desk',size:[1.4,.75,.75],color:[112,162,192]},
 {kind:'chair',name:'Chair',size:[.5,.5,.85],color:[176,148,200]},
 {kind:'counter',name:'Counter',size:[1.8,.65,1],color:[193,157,112]},
 {kind:'cabinet',name:'Parametric cabinet',size:[1.2,.45,2],color:[152,180,148]},
 {kind:'reformer',name:'Reformer concept',size:[2.4,.75,.45],color:[91,161,153]},
 {kind:'partition',name:'Partition',size:[.12,3,2.8],color:[188,196,202]},
 {kind:'zone',name:'Space / room zone',size:[3,3,.01],color:[159,190,213]},
 {kind:'door',name:'Perimeter door opening',size:[.9,.15,2.1],color:[166,129,88]},
 {kind:'window',name:'Perimeter window opening',size:[1.8,.15,1.2],color:[119,185,211]},
 {kind:'source-sofa',name:'PILATES source sofa',asset_id:'sofa',color:[143,166,175]},
 {kind:'source-lockers',name:'PILATES source lockers',asset_id:'lockers',color:[170,147,112]},
 {kind:'source-sink',name:'PILATES source sink',asset_id:'sink',color:[160,178,190]}
];
export const clone=value=>structuredClone(value);
export const round=(n,d=4)=>Number(n.toFixed(d));
export const escapeXML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const isOpening=item=>['door','window'].includes(item.kind);
export function newItem(kind,id,layout,assets={}){
 const type=CATALOG.find(t=>t.kind===kind);if(!type)throw Error('Unknown element type');
 const asset=assets.items?.find(a=>a.id===type.asset_id),size=type.size??asset?.size;
 if(!size)throw Error('Source component geometry has not loaded yet.');
 const item={id,kind,label:type.name,x:round(layout.room.width/2),y:round(layout.room.depth/2),width:round(size[0]),depth:round(size[1]),height:round(size[2]),rotation:0,elevation:0};
 if(type.asset_id)item.asset_id=type.asset_id;
 if(kind==='cabinet'){item.panel=.018;item.shelves=2;}
 if(isOpening(item)){item.wall='south';item.offset=round(Math.max(0,(layout.room.width-item.width)/2));item.sill=kind==='window'?.9:0;}
 return item;
}
export function presetLayout(id='studio'){
 const layout={schema:SCHEMA,units:'m',name:{studio:'Studio concept',office:'Small office concept',cafe:'Neighbourhood café concept',blank:'New room concept'}[id]??'New room concept',room:{width:id==='cafe'?9:id==='office'?9:12,depth:id==='cafe'?7:id==='office'?6:9,height:2.8,wall:.15},items:[]};
 let n=0;const add=(kind,properties)=>{const type=CATALOG.find(t=>t.kind===kind);const assetSize={sofa:[2.2,.75,.7],lockers:[4,.46,2.3],sink:[.6,.35,.46]}[type.asset_id];const assets={items:assetSize?[{id:type.asset_id,size:assetSize}]:[]};const item={...newItem(kind,'item-'+(++n),layout,assets),...properties};layout.items.push(item);return item;};
 add('door',{label:'Entrance',wall:'south',offset:.8});
 add('window',{label:'Daylight window',wall:'north',offset:1.2,width:3,sill:1});
 if(id==='studio'){
  for(let row=0;row<2;row++)for(let col=0;col<3;col++)add('reformer',{label:'Reformer '+(row*3+col+1),x:2.2+col*3.1,y:2.2+row*3.2});
  add('counter',{label:'Reception counter',x:10.5,y:1.4,width:1.8,rotation:90});
  add('source-sofa',{label:'Waiting sofa · source copy',x:9.9,y:7.9});
  add('cabinet',{label:'Props cabinet',x:1.8,y:8.65,width:2.5,height:2.2,shelves:3});
 }else if(id==='office'){
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){add('table',{label:'Work desk',x:1.6+col*2.2,y:1.6+row*2.6});add('chair',{label:'Work chair',x:1.6+col*2.2,y:2.5+row*2.6});}
  add('table',{label:'Meeting table',x:7,y:3,width:1.1,depth:2});
  for(const y of [2.4,3.5])for(const x of [5.9,8.1])add('chair',{label:'Meeting chair',x,y});
  add('cabinet',{label:'Files cabinet',x:7,y:5.5,width:2.4,height:1.5});
 }else if(id==='cafe'){
  add('counter',{label:'Coffee counter',x:6.7,y:5.9,width:3.6,depth:.8});
  add('source-sink',{label:'Sink · source copy',x:7.7,y:5.9,elevation:.65});
  for(const [x,y]of [[2,2],[4.6,2],[2,4.6],[4.6,4.6]]){add('table',{label:'Café table',x,y,width:.8,depth:.8});add('chair',{label:'Café chair',x:x-.8,y,rotation:90});add('chair',{label:'Café chair',x:x+.8,y,rotation:270});}
  add('source-sofa',{label:'Lounge sofa · source copy',x:2,y:6.4});
 }
 return validateLayout(layout);
}
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function validateLayout(input){
 if(!input||input.schema!==SCHEMA||input.units!=='m')throw Error('Use a Layout Designer JSON file in metres.');
 if(typeof input.name!=='string'||!input.name.trim()||input.name.length>100)throw Error('Give the design a name of 1–100 characters.');
 const r=input.room;if(!r||!finite(r.width,2,60)||!finite(r.depth,2,60)||!finite(r.height,1.8,8)||!finite(r.wall,.05,.5))throw Error('Room: width/depth 2–60 m, height 1.8–8 m and wall thickness 0.05–0.5 m.');
 if(!Array.isArray(input.items)||input.items.length>80)throw Error('A design supports up to 80 editable elements.');
 const ids=new Set();
 const items=input.items.map(item=>{
  const type=CATALOG.find(t=>t.kind===item.kind);
  if(!type||!/^item-[a-z0-9-]{1,50}$/i.test(item.id)||ids.has(item.id))throw Error('Every element needs a unique, valid ID and type.');ids.add(item.id);
  if(typeof item.label!=='string'||!item.label.trim()||item.label.length>100)throw Error('Element names need 1–100 characters.');
  if(![item.x,item.y].every(v=>finite(v,-60,120))||!finite(item.width,.05,60)||!finite(item.depth,.02,60)||!finite(item.height,.005,8)||!finite(item.rotation,-3600,3600)||!finite(item.elevation,0,8))throw Error('Element dimensions or location are outside the supported range.');
  const clean={id:item.id,kind:item.kind,label:item.label,x:item.x,y:item.y,width:item.width,depth:item.depth,height:item.height,rotation:((item.rotation%360)+360)%360,elevation:item.elevation};
  if(type.asset_id){if(item.asset_id!==type.asset_id)throw Error('Source component reference does not match its type.');clean.asset_id=item.asset_id;}
  if(item.kind==='cabinet'){if(!finite(item.panel,.006,.05)||item.panel*2>=Math.min(item.width,item.depth,item.height)||!Number.isInteger(item.shelves)||item.shelves<0||item.shelves>6)throw Error('Cabinet panels must fit its dimensions; use 0–6 shelves.');clean.panel=item.panel;clean.shelves=item.shelves;}
  if(isOpening(item)){
   const length=['north','south'].includes(item.wall)?r.width:r.depth;
   if(!['north','south','east','west'].includes(item.wall)||!finite(item.offset,0,length)||item.offset+item.width>length+1e-8||!finite(item.sill,0,r.height)||item.sill+item.height>r.height+1e-8||(item.kind==='door'&&item.sill!==0))throw Error('Openings must fit the selected wall, with the sill and height below the ceiling.');
   clean.wall=item.wall;clean.offset=item.offset;clean.sill=item.sill;
  }
  return clean;
 });
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(isOpening(a)&&isOpening(b)&&a.wall===b.wall&&a.offset<b.offset+b.width-1e-8&&b.offset<a.offset+a.width-1e-8&&a.sill<b.sill+b.height&&b.sill<a.sill+a.height)throw Error('Two openings overlap on the same wall.');}
 return {schema:SCHEMA,units:'m',name:input.name.trim(),room:{width:r.width,depth:r.depth,height:r.height,wall:r.wall},items};
}
export function openingPose(item,room){
 const horizontal=['north','south'].includes(item.wall),a=item.offset+item.width/2;
 return {x:horizontal?a:item.wall==='west'?0:room.width,y:horizontal?item.wall==='south'?0:room.depth:a,rotation:horizontal?0:90};
}
export function itemCorners(item,room){
 const pose=isOpening(item)?openingPose(item,room):item,angle=pose.rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),depth=isOpening(item)?room.wall:item.depth;
 return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[pose.x+x*item.width/2*c-y*depth/2*s,pose.y+x*item.width/2*s+y*depth/2*c]);
}
function overlap(a,b){
 for(const p of [a,b])for(let i=0;i<4;i++){const q=p[(i+1)%4],axis=[-(q[1]-p[i][1]),q[0]-p[i][0]],project=points=>points.map(v=>v[0]*axis[0]+v[1]*axis[1]);const x=project(a),y=project(b);if(Math.max(...x)<=Math.min(...y)+1e-8||Math.max(...y)<=Math.min(...x)+1e-8)return false;}return true;
}
export function assessLayout(layout){
 const elements=layout.items.filter(i=>!isOpening(i)&&i.kind!=='zone'),outOfBounds=elements.filter(i=>itemCorners(i,layout.room).some(([x,y])=>x<-.001||y<-.001||x>layout.room.width+.001||y>layout.room.depth+.001)||i.elevation+i.height>layout.room.height+.001).map(i=>i.id),overlaps=[];
 for(let i=0;i<elements.length;i++)for(let j=i+1;j<elements.length;j++)if(overlap(itemCorners(elements[i],layout.room),itemCorners(elements[j],layout.room)))overlaps.push([elements[i].id,elements[j].id]);
 return {area:round(layout.room.width*layout.room.depth),outOfBounds,overlaps,sourceCopies:layout.items.filter(i=>i.asset_id).length};
}
export function resizeRoom(layout,room,reposition=true){
 const result=clone(layout),old=layout.room;result.room={...old,...room};
 if(reposition)for(const item of result.items){
  if(isOpening(item)){const horizontal=['north','south'].includes(item.wall),length=horizontal?result.room.width:result.room.depth,previous=horizontal?old.width:old.depth;item.offset=round(Math.max(0,Math.min(length-item.width,(item.offset+item.width/2)*length/previous-item.width/2)));}
  else{item.x=round(item.x*result.room.width/old.width);item.y=round(item.y*result.room.depth/old.depth);}
 }
 return validateLayout(result);
}
const BOX_INDICES=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
export function boxMesh(id,label,x,y,z,w,d,h,rotation=0,rgb=[180,190,200],extra={}){
 const c=Math.cos(rotation*Math.PI/180),s=Math.sin(rotation*Math.PI/180),positions=[];
 for(const [a,b,k]of [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]])positions.push(x+a*w/2*c-b*d/2*s,y+a*w/2*s+b*d/2*c,z+k*h/2);
 return {itemId:id,label,positions,indices:BOX_INDICES,rgb,...extra};
}
export function wallMeshes(layout){
 const {width:W,depth:D,height:H,wall:t}=layout.room,meshes=[];
 for(const wall of ['south','north','west','east']){
  const horizontal=['south','north'].includes(wall),length=horizontal?W:D,holes=layout.items.filter(i=>isOpening(i)&&i.wall===wall),cuts=[...new Set([horizontal?-t:0,horizontal?length+t:length,...holes.flatMap(i=>[i.offset,i.offset+i.width])])].sort((a,b)=>a-b);
  for(let k=0;k<cuts.length-1;k++){
   const lo=cuts[k],hi=cuts[k+1],mid=(lo+hi)/2,zs=[...new Set([0,H,...holes.filter(h=>mid>h.offset-1e-8&&mid<h.offset+h.width+1e-8).flatMap(h=>[h.sill,h.sill+h.height])])].sort((a,b)=>a-b);
   for(let j=0;j<zs.length-1;j++){const base=zs[j],top=zs[j+1],z=(base+top)/2;if(holes.some(h=>mid>h.offset&&mid<h.offset+h.width&&z>h.sill&&z<h.sill+h.height))continue;
    const x=horizontal?mid:wall==='west'?-t/2:W+t/2,y=horizontal?wall==='south'?-t/2:D+t/2:mid;
    meshes.push(boxMesh('wall-'+wall,wall+' wall',x,y,z,horizontal?hi-lo:t,horizontal?t:hi-lo,top-base,0,[204,211,216],{wall}));
   }
  }
 }
 return meshes;
}
export function layoutMeshes(layout,assets={}){
 const {width:W,depth:D}=layout.room,meshes=[boxMesh('floor','Floor',W/2,D/2,-.045,W,D,.09,0,[229,231,224]),...wallMeshes(layout)];
 for(const item of layout.items){
  const {width:w,depth:d,height:h,elevation:z,rotation:r}=item,type=CATALOG.find(t=>t.kind===item.kind),color=type.color;
  const local=(x,y,base,ww,dd,hh,rgb=color)=>{const a=r*Math.PI/180;meshes.push(boxMesh(item.id,item.label,item.x+x*Math.cos(a)-y*Math.sin(a),item.y+x*Math.sin(a)+y*Math.cos(a),z+base+hh/2,ww,dd,hh,r,rgb));};
  if(isOpening(item)){
   const pose=openingPose(item,layout.room);meshes.push(boxMesh(item.id,item.label,pose.x,pose.y,item.sill+h/2,w,.025,h,pose.rotation,color,{opacity:item.kind==='window'?.35:.16}));continue;
  }
  if(item.asset_id){
   const asset=assets.items?.find(a=>a.id===item.asset_id);
   if(asset){const a=r*Math.PI/180;for(const part of asset.parts){const positions=[];for(let k=0;k<part.positions.length;k+=3){const x=part.positions[k]*w/asset.size[0],y=part.positions[k+1]*d/asset.size[1];positions.push(item.x+x*Math.cos(a)-y*Math.sin(a),item.y+x*Math.sin(a)+y*Math.cos(a),z+part.positions[k+2]*h/asset.size[2]);}meshes.push({itemId:item.id,label:item.label,positions,indices:part.indices,rgb:part.rgb,assetId:asset.id});}continue;}
   local(0,0,0,w,d,h);continue;
  }
  if(item.kind==='zone'){local(0,0,0,w,d,.008);continue;}
  if(item.kind==='partition'||item.kind==='counter'){local(0,0,0,w,d,h);continue;}
  if(item.kind==='cabinet'){
   const p=item.panel;local(-w/2+p/2,0,0,p,d,h);local(w/2-p/2,0,0,p,d,h);local(0,d/2-p/2,0,w,p,h);local(0,0,0,w,d,p);local(0,0,h-p,w,d,p);for(let s=1;s<=item.shelves;s++)local(0,0,(h-p)*s/(item.shelves+1),w-2*p,d-p,p);continue;
  }
  if(item.kind==='reformer'){
   local(0,0,h*.2,w,d,h*.25,[78,104,104]);local(0,0,h*.55,w*.65,d*.87,h*.2,[77,145,138]);const leg=Math.min(.06,w*.1,d*.1);for(const x of [-w*.4,w*.4])for(const y of [-d*.38,d*.38])local(x,y,0,leg,leg,h*.45,[80,87,91]);local(w*.4,0,h*.72,Math.min(.05,w*.1),d,h*.28,[76,87,91]);continue;
  }
  const top=item.kind==='chair'?h*.52:h,thickness=Math.min(.055,top*.12);local(0,0,top-thickness,w,d,thickness);
  const leg=Math.min(.045,w*.15,d*.15);for(const x of [-w*.4,w*.4])for(const y of [-d*.35,d*.35])local(x,y,0,leg,leg,top-thickness,[90,101,113]);
  if(item.kind==='chair')local(0,d/2-.03,top,w,.055,h-top);
 }
 return meshes;
}
export function objDocument(layout,assets={}){
 const lines=['# Paila Layout Designer · concept geometry','# Units: metres; Z is up','# Editable parameters are retained in the separate JSON export'];let offset=1;
 for(const mesh of layoutMeshes(layout,assets)){lines.push('g '+mesh.itemId.replace(/[^a-z0-9_-]/gi,'_'));for(let k=0;k<mesh.positions.length;k+=3)lines.push('v '+mesh.positions.slice(k,k+3).map(n=>round(n,6)).join(' '));for(let k=0;k<mesh.indices.length;k+=3)lines.push('f '+mesh.indices.slice(k,k+3).map(n=>n+offset).join(' '));offset+=mesh.positions.length/3;}
 return lines.join('\n')+'\n';
}
export function csvDocument(layout){
 const q=value=>{let s=String(value??'');if(typeof value==='string'&&/^[=+@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 return [['ID','Element','Type','Width m','Depth m','Height m','X m','Y m','Rotation degrees','Elevation m','Source component'],...layout.items.map(i=>{const p=isOpening(i)?openingPose(i,layout.room):i;return [i.id,i.label,i.kind,i.width,isOpening(i)?layout.room.wall:i.depth,i.height,p.x,p.y,p.rotation,i.elevation,i.asset_id??'Authored concept'];})].map(row=>row.map(q).join(',')).join('\r\n')+'\r\n';
}
export function createHistory(initial){
 let states=[clone(initial)],index=0;
 return {get current(){return clone(states[index])},get canUndo(){return index>0},get canRedo(){return index<states.length-1},push(value){states=states.slice(0,index+1);states.push(clone(value));if(states.length>40)states.shift();index=states.length-1;return this.current},undo(){if(index)index--;return this.current},redo(){if(index<states.length-1)index++;return this.current}};
}

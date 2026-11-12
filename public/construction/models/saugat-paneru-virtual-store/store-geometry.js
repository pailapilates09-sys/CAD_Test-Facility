// Display geometry in feet. The 2D plan and the 3D scene use the same shelf and product locations.
import {rackKey,viewScope} from './store-model.js';

const faces = [0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
const rgb = color => color.match(/[0-9a-f]{2}/gi).map(h=>parseInt(h,16));
const tone = (color,factor) => color.map(c=>Math.max(0,Math.min(255,c*factor)));
const mix = (color,other,weight) => color.map((c,i)=>c+(other[i]-c)*weight);
const mesh = (itemId,rgb,points,indices,extra={}) => ({itemId,rgb,positions:points.flat(),indices,...extra});

function box(id,color,x,y,z,w,d,h,extra) {
 const points=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>[x+a,y+b,z]);
 return mesh(id,color,[...points,...points.map(p=>[p[0],p[1],z+h])],faces,extra);
}

function bar(id,color,a,b,r) {
 const dir=b.map((v,i)=>v-a[i]), length=Math.hypot(...dir), u=dir.map(n=>n/length);
 const horizontal=Math.hypot(u[0],u[1]), v=horizontal>1e-6?[-u[1]/horizontal,u[0]/horizontal,0]:[1,0,0];
 const w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
 return mesh(id,color,[...corners.map(([s,t])=>a.map((p,i)=>p+r*(s*v[i]+t*w[i]))),
   ...corners.map(([s,t])=>b.map((p,i)=>p+r*(s*v[i]+t*w[i])))],faces);
}

function rings(id,color,x,y,profile,{caps=false,sides=12}={}) {
 const points=profile.flatMap(([w,d,z])=>Array.from({length:sides},(_,i)=>{
  const a=2*Math.PI*i/sides;
  return [x+Math.cos(a)*w/2,y+Math.sin(a)*d/2,z];
 }));
 const indices=[];
 for(let r=1;r<profile.length;r++)for(let i=0;i<sides;i++){
  const a=(r-1)*sides+i,b=(r-1)*sides+(i+1)%sides,c=b+sides,d=a+sides;
  indices.push(a,b,c,a,c,d);
 }
 if(caps)for(let i=1;i<sides-1;i++)indices.push(0,i+1,i,points.length-sides,points.length-sides+i,points.length-sides+i+1);
 return mesh(id,color,points,indices);
}

function profileSolid(id,color,x,y,z,w,d,h,outline){
 const front=outline.map(([a,b])=>[x+a*w,y-d/2,z+b*h]),n=front.length;
 const triangles=[];
 for(let i=1;i<n-1;i++)triangles.push(0,i,i+1,n,n+i+1,n+i);
 for(let i=0;i<n;i++){const j=(i+1)%n;triangles.push(i,n+i,n+j,i,n+j,j);}
 return mesh(id,color,[...front,...front.map(([a,b,c])=>[a,b+d,c])],triangles);
}

export function productMeshes(p,{compact=false}={}) {
 const id=p.id, color=rgb(p.color), dark=tone(color,.62), light=mix(color,[255,255,255],.36), {x,y,z,w,d,h}=p, out=[];
 const block=(cx,cy,bottom,a,b,c,shade=color)=>out.push(box(id,shade,cx,cy,bottom,a,b,c));
 const rail=(a,b,r,shade=color)=>out.push(bar(id,shade,a,b,r));
 const hollow=(cx,cy,bottom,a,b,c,taper,shade=color)=>{
  const sides=compact?8:14;
  out.push(rings(id,shade,cx,cy,[[a*taper,b*taper,bottom],[a,b,bottom+c],[a*.86,b*.86,bottom+c],[a*taper*.83,b*taper*.83,bottom+c*.17]],{sides}));
  if(!compact)out.push(rings(id,tone(shade,.64),cx,cy,[[a*taper*.84,b*taper*.84,bottom+c*.16],[a*taper*.84,b*taper*.84,bottom+c*.18]],{caps:true,sides}));
 };
 const handle=(cx,cy,bottom,a,c,shade=dark)=>{
  const points=[[cx,cy,bottom],[cx+a*.64,cy,bottom+c*.14],[cx+a,cy,bottom+c*.53],[cx+a*.64,cy,bottom+c*.92],[cx,cy,bottom+c]];
  for(let i=1;i<points.length;i++)rail(points[i-1],points[i],Math.max(.018,a*.14),shade);
 };
 switch(p.shape){
  case 'slippers':
  case 'slides':
  case 'sandals': {
   const sole=[[-.49,.08],[.44,.08],[.5,.22],[.44,.37],[-.43,.37],[-.5,.27]];
   for(const [offset,depthOffset] of [[.1,.2],[-.1,-.21]]){
    const cx=x+offset*w,cy=y+depthOffset*d;
    out.push(profileSolid(id,dark,cx,cy,z,w*.8,d*.42,h,sole));
    const front=[cx-w*.21,cy-d*.16,z+h*.29],arch=[cx-w*.08,cy,z+h*.91],heel=[cx+w*.04,cy+d*.16,z+h*.28];
    rail(front,arch,h*.09,light);rail(arch,heel,h*.09,light);
    if(p.shape!=='slippers'){
     rail([cx+w*.16,cy-d*.18,z+h*.31],[cx+w*.14,cy,z+h*.72],h*.10,color);
     rail([cx+w*.14,cy,z+h*.72],[cx+w*.16,cy+d*.18,z+h*.31],h*.10,color);
    }
   }
   break;
  }
  case 'sneaker':
  case 'school-shoe':
  case 'boot': {
   const sole=[[-.49,.04],[.44,.04],[.5,.14],[.47,.27],[-.44,.27],[-.5,.17]];
   const upper=[[-.46,.22],[.47,.22],[.48,.46],[.37,.93],[.11,.94],[-.04,.70],[-.29,.49],[-.45,.43]];
   out.push(profileSolid(id,p.shape==='sneaker'?[227,225,215]:dark,x,y,z,w,d,h,sole));
   out.push(profileSolid(id,color,x,y,z,w,d*.91,h,upper));
   for(let i=0;i<(compact?2:3);i++)block(x+(-.19+i*.105)*w,y-d*.46,z+(.41+i*.095)*h,w*.105,d*.035,h*.065,light);
   block(x+w*.29,y-d*.462,z+h*.25,w*.21,d*.04,h*.31,dark);
   break;
  }
  case 'open-umbrella': {
   const shaft=[91,104,106],rim=z+h*.64;
   rail([x,y,z+h*.08],[x,y,z+h*.95],Math.min(w,h)*.025,shaft);
   rail([x,y,z+h*.08],[x+w*.075,y,z+h*.027],h*.032,dark);
   rail([x+w*.075,y,z+h*.027],[x+w*.14,y,z+h*.095],h*.032,dark);
   const n=8, canopy=Array.from({length:n},(_,i)=>{
    const a=2*Math.PI*i/n+Math.PI/8,b=2*Math.PI*(i+1)/n+Math.PI/8;
    return [[x+w*.5*Math.cos(a),y+d*.5*Math.sin(a),rim],[x+w*.5*Math.cos(b),y+d*.5*Math.sin(b),rim],[x,y,z+h*.98]];
   });
   for(const [i,ps] of canopy.entries())out.push(mesh(id,i%2?light:color,ps,[0,1,2,2,1,0]));
   break;
  }
  case 'folded-umbrella':
  case 'stick-umbrella': {
   const long=p.shape==='stick-umbrella',r=w*(long?.26:.47),stem=[86,95,101];
   out.push(rings(id,color,x,y,[[r*.76,d*.58,z+h*.19],[r,d*.73,z+h*.33],[r*.42,d*.37,z+h*.91]],{caps:true,sides:8}));
   out.push(rings(id,light,x,y,[[r*1.05,d*.77,z+h*.43],[r*1.05,d*.77,z+h*.51]],{caps:true,sides:8}));
   rail([x,y,z+h*.13],[x,y,z+h*.98],h*.028,stem);
   if(long)handle(x,y,z+h*.032,w*.34,h*.18,dark);
   else block(x,y,z+h*.02,w*.52,d*.66,h*.18,dark);
   break;
  }
  case 'bottle':
   out.push(rings(id,color,x,y,[[w*.89,d*.89,z],[w,d,z+h*.15],[w,d,z+h*.71],[w*.49,d*.49,z+h*.88]],{caps:true,sides:10}));
   out.push(rings(id,dark,x,y,[[w*.51,d*.51,z+h*.85],[w*.51,d*.51,z+h]],{caps:true,sides:10}));
   block(x,y-d*.48,z+h*.34,w*.55,d*.06,h*.16,light);
   break;
  case 'brush':
   block(x,y,z+h*.18,w,d*.88,h*.37,color);
   for(let i=0;i<6;i++)block(x+(i-2.5)*w*.15,y,z,w*.093,d*.76,h*.25,dark);
   rail([x-w*.25,y,z+h*.54],[x+w*.31,y,z+h*.92],h*.08,light);
   break;
  case 'box':
   block(x,y,z,w*.92,d*.91,h*.84); block(x,y,z+h*.81,w,d,h*.19,light);
   block(x,y-d*.475,z+h*.62,w*.28,d*.04,h*.22,dark);
   break;
  case 'bowl':
   hollow(x,y,z,w,d,h,.5);
   break;
  case 'jug':
  case 'mug':
   hollow(x-w*.11,y,z,w*.67,d,h*.92,p.shape==='jug'?.76:.91);
   handle(x+w*.22,y,z+h*.17,w*.24,h*.62);
   if(p.shape==='jug')block(x-w*.14,y-d*.42,z+h*.85,w*.24,d*.16,h*.1,light);
   break;
  case 'bucket': {
   hollow(x,y,z,w,d,h*.76,.73);
   const a=Array.from({length:9},(_,i)=>[x+(i/8-.5)*w*.91,y,z+h*.59+Math.sin(Math.PI*i/8)*h*.36]);
   for(let i=1;i<a.length;i++)rail(a[i-1],a[i],w*.024,light);
   break;
  }
  case 'bin':
   out.push(rings(id,color,x,y,[[w*.73,d*.73,z],[w*.96,d*.96,z+h*.88]],{caps:true}));
   out.push(rings(id,light,x,y,[[w,d,z+h*.86],[w*.86,d*.86,z+h]],{caps:true}));
   break;
  case 'basket':
   hollow(x,y,z,w,d,h,.66);
   for(const s of [-1,1]){
    rail([x-w*.26,y+d*.39*s,z+h*.8],[x+w*.26,y+d*.39*s,z+h*.8],w*.033,light);
    for(const n of [-.23,-.11,0,.11,.23])block(x+w*n,y+s*d*.397,z+h*.35,w*.044,d*.022,h*.24,dark);
   }
   break;
  case 'tray':
   block(x,y,z,w,d,h*.33,dark);
   for(const s of [-1,1]){
    block(x,y+s*d*.46,z+h*.29,w,d*.08,h*.6);
    block(x+s*w*.46,y,z+h*.29,w*.08,d*.88,h*.6);
   }
   break;
  case 'dustpan':
   block(x,y+d*.15,z,w*.92,d*.65,h*.29);
   block(x,y-d*.16,z+h*.24,w*.92,d*.065,h*.43,light);
   for(const s of [-1,1])block(x+s*w*.43,y+d*.15,z+h*.22,w*.065,d*.62,h*.36,light);
   rail([x,y-d*.13,z+h*.43],[x,y-d*.44,z+h*.92],w*.064,dark);
   break;
  case 'stool':
   for(const a of [-.35,.35])for(const b of [-.34,.34])block(x+a*w,y+b*d,z,w*.16,d*.16,h*.88,dark);
   block(x,y,z+h*.78,w,d,h*.22);
   break;
  default: throw Error('Missing product mesh: '+p.shape);
 }
 return out;
}

export function storeScene(store,floorId,roomId) {
 const scope=viewScope(store,floorId,roomId),{rooms,start,end,depth,pillars,stock}=scope;
 const slab=[203,216,209], wall=[221,227,221], trim=[128,149,141], board=[217,180,131], posts=[91,112,105], wallHeight=store.storeyHeight*.58;
 const add=[], push=(...args)=>add.push(box(...args)), span=end-start;
 push('floor',slab,(start+end)/2,depth/2,-.28,span+.78,depth+.8,.28);
 push('floor',[235,230,214],(start+end)/2,2.22,.005,span-.5,3.9,.02);
 push('wall-back',wall,(start+end)/2,depth,0,span,.23,wallHeight,{wall:'north'});
 for(const [x,id] of [[start,'west'],[end,'east']])push('wall-'+id,wall,x,depth/2,0,.23,depth,wallHeight,{wall:id});
 for(const r of rooms){
  const roomColor=rgb(r.color);
  push('floor',mix(roomColor,[247,244,236],.88),r.x+store.step/2,depth*.69,.009,store.step-.43,depth*.56,.018);
  push('floor',mix(roomColor,[247,244,236],.4),r.x+store.step/2,depth*.385,.02,store.step-.72,.1,.016);
  if(r.x>start)push('wall-partition-'+r.id,wall,r.x,depth*.72,0,.19,depth*.56,2.7);
  for(const s of r.shelves){
   const id='shelf-'+r.id+'-'+s.id, x=s.x+s.w/2,y=s.y+s.d/2;
   for(const band of store.bands)push(id,board,x,y,band.low,s.w,s.d,store.board);
   push(id,board,x,y,store.storeyHeight-store.board,s.w,s.d,store.board);
   for(const a of [s.x+.07,s.x+s.w-.07])for(const b of [s.y+.07,s.y+s.d-.07])push(id,posts,a,b,0,.14,.14,store.storeyHeight);
  }
 }
 for(const p of pillars)push('pillar-'+p.id,trim,p.x,p.y,0,store.pillarWidth,store.pillarWidth,wallHeight+.22);
 for(const p of stock)add.push(...productMeshes(p,{compact:true}));
 return {...scope,meshes:add,display:'floor'};
}

// Straighten each rack to face its aisle. Extra spacing here is for browsing;
// the floor model and plan keep the real rack coordinates.
export function showcaseScene(store,room,shelf,level=0,focus=''){
 const rack=store.racks.get(rackKey(room,shelf));
 const stock=rack.facings.filter(f=>(!level||f.band.level===level)&&(!focus||f.id===focus));
 const levels=[...new Set(stock.map(f=>f.band.level))],cols=focus?1:store.slots;
 const cellW=focus?3.9:2.24,depth=focus?2.6:1.36,h=focus?2.62:1.08,pitch=h+(focus ? .12 : .13);
 const width=cols*cellW+.16,wood=[187,152,109],back=[235,234,222],metal=[117,125,112];
 const meshes=[],targets=[];
 const height=levels.length*pitch;
 meshes.push(box('rack-back',back,width/2,depth/2,0,width,.11,height),
  box('rack-side-left',metal,.04,0,0,.08,depth,height),box('rack-side-right',metal,width-.04,0,0,.08,depth,height));
 for(const [i] of levels.entries())meshes.push(box('rack-board',wood,width/2,0,i*pitch,width,depth,.073));
 meshes.push(box('rack-top',wood,width/2,0,height,width,depth,.07));
 for(const f of stock){
  const column=focus?0:f.column,x=.08+cellW*(column+.5),z=levels.indexOf(f.band.level)*pitch;
  const scale=Math.min(cellW*.86/f.w,depth*.89/f.d,(h-.13)/f.h);
  const view={...f,x,y:-.04,z:z+.075,w:f.w*scale,d:f.d*scale,h:f.h*scale};
  meshes.push(...productMeshes(view));
  targets.push({id:f.id,x:x-cellW*.48,z:z+.08,w:cellW*.96,h:pitch-.12,y:-depth/2-.01});
 }
 return {meshes,stock,targets,display:focus?'item':'rack',rows:levels.length};
}

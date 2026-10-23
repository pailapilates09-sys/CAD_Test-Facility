// Orthographic 3D projection rendered on Canvas 2D. No WebGL or SketchUp session is required.
export function projectPoint(p,camera){
 const yaw=camera.yaw*Math.PI/180,pitch=camera.pitch*Math.PI/180,c=Math.cos(yaw),s=Math.sin(yaw),a=Math.sin(pitch),b=Math.cos(pitch);
 return [-s*p[0]+c*p[1],a*(c*p[0]+s*p[1])-b*p[2],b*(c*p[0]+s*p[1])+a*p[2]];
}
export function projectedFaces(meshes,camera,{cutaway=true}={}){
 const direction={east:Math.cos(camera.yaw*Math.PI/180),west:-Math.cos(camera.yaw*Math.PI/180),north:Math.sin(camera.yaw*Math.PI/180),south:-Math.sin(camera.yaw*Math.PI/180)};
 const faces=[];
 for(const mesh of meshes){
  if(cutaway&&mesh.wall&&direction[mesh.wall]>.05)continue;
  const projected=[];for(let k=0;k<mesh.positions.length;k+=3)projected.push(projectPoint(mesh.positions.slice(k,k+3),camera));
  for(let k=0;k<mesh.indices.length;k+=3){const indices=mesh.indices.slice(k,k+3),points=indices.map(i=>projected[i]);const area=(points[1][0]-points[0][0])*(points[2][1]-points[0][1])-(points[1][1]-points[0][1])*(points[2][0]-points[0][0]);if(Math.abs(area)<1e-9)continue;
   const world=indices.map(i=>mesh.positions.slice(i*3,i*3+3)),a=world[1].map((v,i)=>v-world[0][i]),b=world[2].map((v,i)=>v-world[0][i]),normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=Math.hypot(...normal)||1,shade=.68+.32*Math.abs((normal[0]*.3+normal[1]*.4+normal[2]*.85)/length);
   faces.push({itemId:mesh.itemId,points,rgb:mesh.rgb.map(n=>n*shade),opacity:mesh.opacity??1,depth:points.reduce((n,p)=>n+p[2],0)/3});}
 }
 return faces.sort((a,b)=>a.itemId==='floor'&&b.itemId!=='floor'?-1:b.itemId==='floor'&&a.itemId!=='floor'?1:a.depth-b.depth);
}
export function pointInTriangle(point,points){const signs=points.map((p,i)=>{const q=points[(i+1)%3];return (point[0]-q[0])*(p[1]-q[1])-(p[0]-q[0])*(point[1]-q[1]);});return !(signs.some(n=>n<0)&&signs.some(n=>n>0));}
export function createDesignView(canvas,onSelect){
 const ctx=canvas.getContext('2d');let meshes=[],faces=[],frame=0,lastMap=null,selected=null,camera={yaw:225,pitch:38,zoom:1},cutaway=true,drag=null;
 function draw(){frame=0;const ratio=Math.min(devicePixelRatio||1,2),width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  faces=projectedFaces(meshes,camera,{cutaway});if(!faces.length)return;
  let lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];for(const face of faces)for(const p of face.points)for(let a=0;a<2;a++){lo[a]=Math.min(lo[a],p[a]);hi[a]=Math.max(hi[a],p[a]);}
  const scale=Math.min((width-44)/(hi[0]-lo[0]||1),(height-44)/(hi[1]-lo[1]||1))*camera.zoom,ox=width/2-(lo[0]+hi[0])/2*scale,oy=height/2-(lo[1]+hi[1])/2*scale;lastMap={scale,ox,oy};
  for(const face of faces){const p=face.points;ctx.beginPath();ctx.moveTo(p[0][0]*scale+ox,p[0][1]*scale+oy);for(let k=1;k<3;k++)ctx.lineTo(p[k][0]*scale+ox,p[k][1]*scale+oy);ctx.closePath();const rgb=face.itemId===selected?[224,166,68]:face.rgb;ctx.fillStyle=`rgb(${rgb.map(n=>Math.round(n)).join(',')})`;ctx.globalAlpha=face.opacity;ctx.fill();ctx.globalAlpha=1;}
  if(selected){ctx.strokeStyle='#a4660d';ctx.lineWidth=.7;for(const face of faces.filter(f=>f.itemId===selected)){const p=face.points;ctx.beginPath();ctx.moveTo(p[0][0]*scale+ox,p[0][1]*scale+oy);ctx.lineTo(p[1][0]*scale+ox,p[1][1]*scale+oy);ctx.lineTo(p[2][0]*scale+ox,p[2][1]*scale+oy);ctx.closePath();ctx.stroke();}}
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw)};
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:camera.yaw,pitch:camera.pitch,moved:false};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;if(drag.moved){camera.yaw=drag.yaw+dx*.45;camera.pitch=Math.max(15,Math.min(80,drag.pitch+dy*.3));schedule()}});
 canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&lastMap){const r=canvas.getBoundingClientRect(),point=[(e.clientX-r.left-lastMap.ox)/lastMap.scale,(e.clientY-r.top-lastMap.oy)/lastMap.scale],face=[...faces].reverse().find(f=>!f.itemId.startsWith('wall-')&&f.itemId!=='floor'&&pointInTriangle(point,f.points));if(face)onSelect(face.itemId);}drag=null});
 canvas.addEventListener('pointercancel',()=>{drag=null});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')camera.yaw-=15;if(e.key==='ArrowRight')camera.yaw+=15;if(e.key==='ArrowUp')camera.pitch=Math.min(80,camera.pitch+5);if(e.key==='ArrowDown')camera.pitch=Math.max(15,camera.pitch-5);schedule()}});
 new ResizeObserver(schedule).observe(canvas);
 return {update(next,id){meshes=next;selected=id;schedule()},turn(delta){camera.yaw+=delta;schedule()},setCutaway(value){cutaway=value;schedule()},setZoom(value){camera.zoom=value;schedule()},reset(){camera={yaw:225,pitch:38,zoom:1};schedule()}};
}

export const wardrobeLights={
 ice:[132,233,255],
 amber:[255,192,122],
 neutral:[224,238,250]
};

export function wardrobeFace({x,y,z,w,h},left=0,right=1) {
 return [[x+w*left,y,z],[x+w*right,y,z],[x+w*right,y,z+h],[x+w*left,y,z+h]];
}

export function drawWardrobeDoors(ctx,face,project,opened,light) {
 const {h}=face,[r,g,b]=light;
 const trace=points=>{
  ctx.beginPath();
  points.map(project).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();
 };
 ctx.save();
 trace(wardrobeFace(face,-.01,1.01));ctx.clip();
 for(const side of [0,1]){
  const left=side/2+(side?1:-1)*opened*.51;
  const corners=wardrobeFace(face,left+.005,left+.495);
  const [bottomX,bottomY]=project(corners[0]),[topX,topY]=project(corners[2]);
  const glass=ctx.createLinearGradient(topX,topY,bottomX,bottomY);
  glass.addColorStop(0,'rgba(17,35,49,.70)');
  glass.addColorStop(.49,'rgba(31,52,66,.43)');
  glass.addColorStop(.54,'rgba(16,31,43,.64)');
  glass.addColorStop(1,'rgba(10,20,31,.77)');
  trace(corners);ctx.fillStyle=glass;ctx.fill();
  ctx.lineWidth=1.4;ctx.strokeStyle=`rgba(${r},${g},${b},.66)`;ctx.stroke();
  const topHandle=face.z+h*.58, bottomHandle=face.z+h*.42;
  const grip=left+(side?.025:.475);
  const [gx,gy]=project([face.x+face.w*grip,face.y,bottomHandle]);
  const [ex,ey]=project([face.x+face.w*grip,face.y,topHandle]);
  ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(ex,ey);
  ctx.lineWidth=5;ctx.strokeStyle='#09141d';ctx.stroke();
  ctx.lineWidth=2;ctx.strokeStyle=`rgb(${r},${g},${b})`;ctx.stroke();
 }
 ctx.restore();
}

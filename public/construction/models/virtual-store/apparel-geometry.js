// Garment outlines use x across the rack and z up. The same meshes appear in the rack and close-up.
const tee = [[-.27,.84],[-.12,.93],[-.07,.88],[.07,.88],[.12,.93],[.27,.84],[.48,.65],[.35,.54],[.25,.62],[.25,.06],[-.25,.06],[-.25,.62],[-.35,.54],[-.48,.65]];
const shirt = [[-.29,.85],[-.13,.94],[.13,.94],[.29,.85],[.47,.23],[.34,.18],[.24,.51],[.26,.08],[.12,.05],[-.12,.05],[-.26,.08],[-.24,.51],[-.34,.18],[-.47,.23]];
const shortSleeve = [[-.28,.85],[-.12,.94],[.12,.94],[.28,.85],[.46,.69],[.36,.55],[.23,.63],[.25,.07],[-.25,.07],[-.23,.63],[-.36,.55],[-.46,.69]];
const dress = [[-.23,.90],[-.10,.94],[-.06,.87],[.06,.87],[.10,.94],[.23,.90],[.34,.68],[.23,.61],[.18,.71],[.16,.54],[.37,.07],[-.37,.07],[-.16,.54],[-.18,.71],[-.23,.61],[-.34,.68]];
const tunic = [[-.25,.88],[-.10,.94],[.10,.94],[.25,.88],[.43,.44],[.32,.39],[.21,.61],[.26,.06],[.06,.06],[0,.16],[-.06,.06],[-.26,.06],[-.21,.61],[-.32,.39],[-.43,.44]];
const trousers = [[-.34,.92],[.34,.92],[.37,.64],[.30,.07],[.08,.07],[0,.58],[-.08,.07],[-.30,.07],[-.37,.64]];
const shorts = [[-.36,.92],[.36,.92],[.46,.10],[.08,.10],[0,.49],[-.08,.10],[-.46,.10]];
const skirt = [[-.23,.91],[.23,.91],[.48,.09],[-.48,.09]];
const hoodie = [[-.32,.79],[-.17,.85],[-.12,.97],[.12,.97],[.17,.85],[.32,.79],[.47,.21],[.35,.17],[.26,.46],[.27,.08],[-.27,.08],[-.26,.46],[-.35,.17],[-.47,.21]];
const vest = [[-.25,.92],[-.12,.93],[-.07,.78],[.07,.78],[.12,.93],[.25,.92],[.25,.71],[.32,.63],[.31,.09],[-.31,.09],[-.32,.63],[-.25,.71]];
const onesie = [[-.22,.85],[-.09,.94],[.09,.94],[.22,.85],[.40,.71],[.30,.54],[.22,.60],[.27,.30],[.18,.12],[.09,.06],[-.09,.06],[-.18,.12],[-.27,.30],[-.22,.60],[-.30,.54],[-.40,.71]];
const briefs = [[-.46,.88],[.46,.88],[.43,.57],[.24,.42],[.10,.12],[-.10,.12],[-.24,.42],[-.43,.57]];
const sock = [[-.19,.91],[.10,.91],[.12,.44],[.35,.34],[.44,.23],[.39,.13],[.18,.10],[-.20,.25],[-.25,.39]];
const sari = [[-.29,.93],[.28,.93],[.31,.64],[.24,.09],[-.32,.09],[-.25,.44]];

const outlines = {
 tee, polo:shortSleeve, shirt, blouse:shortSleeve, tunic, dress, skirt, trousers, shorts, onesie,
 jacket:shirt, blazer:shirt, hoodie, sweater:shirt, cardigan:shirt, vest, briefs, socks:sock, sari, folded:null
};
export const apparelShapes = new Set(Object.keys(outlines));
export const apparelPatterns = new Set(['solid','stripe','check','embroidered']);

const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);

// A fan would fill the openings between sleeves and legs, so triangulate the concave profiles.
function profile(points) {
 const area=points.reduce((sum,[x,z],i)=>{
  const [nx,nz]=points[(i+1)%points.length];
  return sum+x*nz-nx*z;
 },0);
 const vertices=area>0?points:[...points].reverse();
 const remaining=vertices.map((_,i)=>i),triangles=[];
 while(remaining.length>3){
  const ear=remaining.findIndex((i,j)=>{
   const a=remaining.at(j-1),b=remaining[(j+1)%remaining.length];
   const [u,v,w]=[a,i,b].map(index=>vertices[index]);
   return cross(u,v,w)>1e-8&&!remaining.some(n=>n!==a&&n!==i&&n!==b&&
    cross(u,v,vertices[n])>=0&&cross(v,w,vertices[n])>=0&&cross(w,u,vertices[n])>=0);
  });
  if(ear<0)throw Error('Could not triangulate garment outline');
  triangles.push(remaining.at(ear-1),remaining[ear],remaining[(ear+1)%remaining.length]);
  remaining.splice(ear,1);
 }
 return {vertices,triangles:[...triangles,...remaining]};
}

const garmentProfiles=new Map(Object.values(outlines).filter(Boolean).map(points=>[points,profile(points)]));
const rectangle=(left,low,right,high)=>[[left,low],[right,low],[right,high],[left,high]];
const mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);

export function apparelMeshes(product,{compact=false}={}) {
 const {id,shape,pattern,x,y,z,w,d,h}=product;
 const color=product.color.match(/\w\w/g).map(v=>parseInt(v,16));
 const seam=mix(color,[32,28,34],.40),light=mix(color,[249,239,221],.60),out=[];
 function piece(points,shade,front=-.43,back=null){
  const {vertices,triangles}=garmentProfiles.get(points)??profile(points);
  const n=vertices.length,coords=depth=>vertices.flatMap(([a,b])=>[x+a*w,y+depth*d,z+b*h]);
  const positions=coords(front),indices=[...triangles];
  if(back!==null){
   positions.push(...coords(back));
   for(let i=0;i<triangles.length;i+=3)indices.push(triangles[i]+n,triangles[i+2]+n,triangles[i+1]+n);
   for(let i=0;i<n;i++){
    const j=(i+1)%n;
    indices.push(i,n+i,n+j,i,n+j,j);
   }
  }
  out.push({itemId:id,rgb:shade,positions,indices});
 }
 const rect=(l,b,r,t,shade)=>piece(rectangle(l,b,r,t),shade,-.48);
 const detail=(points,shade=seam)=>piece(points,shade,-.49);
 if(shape==='folded'){
  for(const [low,high,shade] of [[.08,.32,seam],[.37,.62,mix(color,light,.20)],[.67,.92,color]]){
   const fold=[[-.46,low+.04],[-.40,low],[.38,low],[.46,low+.04],[.46,high-.04],[.38,high],[-.39,high],[-.46,high-.04]];
   piece(fold,shade,-.44,.42);
   rect(-.40,low+.06,.35,low+.095,mix(shade,light,.45));
  }
  return out;
 }
 if(shape==='socks'){
  const offset=(dx,dz)=>sock.map(([a,b])=>[a+dx,b+dz]);
  piece(offset(-.18,-.055),seam,-.29,.26);
  piece(offset(.045,0),color,-.44,.24);
  rect(-.13,.79,.135,.835,light);
  return out;
 }
 piece(outlines[shape],color,-.44,.33);
 if(['tee','polo','blouse','sweater'].includes(shape)&&pattern==='stripe'){
  for(const z of [.26,.40,.54,.68])rect(-.234,z,.234,z+.037,light);
 }
 if(shape==='shirt'&&pattern==='check'){
  for(const z of [.23,.36,.49,.62,.75])rect(-.229,z,.229,z+.028,light);
  for(const x of [-.175,-.075,.055,.155])rect(x,.13,x+.022,.84,seam);
 }
 if(['polo','shirt','blouse','blazer','cardigan'].includes(shape)){
  detail([[-.125,.92],[.125,.92],[.04,.76],[0,.81],[-.04,.76]],light);
  rect(-.018,.14,.018,.80,seam);
  if(!compact)for(const z of [.28,.43,.58,.72])rect(-.008,z,.010,z+.018,light);
 }
 if(['hoodie','jacket','vest','onesie'].includes(shape)){
  const top=shape==='vest'?.77:.88;
  rect(-.024,.14,.024,top,seam);
  if(shape!=='onesie'){
   detail([[-.22,.29],[-.09,.25],[-.09,.30],[-.22,.34]],light);
   detail([[.09,.25],[.22,.29],[.22,.34],[.09,.30]],light);
  }
 }
 if(shape==='hoodie')detail([[-.14,.86],[-.10,.95],[.10,.95],[.14,.86],[0,.81]]);
 if(['trousers','shorts','skirt','briefs'].includes(shape)){
  rect(-.22,.81,.22,.87,seam);
  if(shape==='trousers'){
   rect(-.23,.14,-.20,.73,light);
   rect(.20,.14,.23,.73,light);
  }
 }
 if(shape==='sari'||pattern==='embroidered'){
  const border=mix(light,[219,162,79],.62);
  if(shape==='sari')detail([[-.27,.84],[-.18,.84],[-.20,.19],[-.28,.19]],border);
  rect(-.21,.12,.21,.18,border);
  if(!compact)for(const x of [-.12,0,.12])for(const z of [.27,.46,.62]){
   detail([[x-.024,z],[x,z+.026],[x+.024,z],[x,z-.026]],border);
  }
 }
 if(shape==='tee'&&pattern==='solid')rect(-.04,.81,.04,.835,seam);
 return out;
}

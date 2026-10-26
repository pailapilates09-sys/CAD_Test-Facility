// Gross closed-mesh measurements for exchange QA, distinct from net takeoff.
// Centre coordinates before summing tetrahedra to reduce translation error.
export function measureMesh(mesh){
 const {vertices,triangles}=mesh;if(!vertices?.length||!triangles?.length)return {volume_m3:null,closed:false,reason:'No solid mesh'};
 if(vertices.some(p=>p.length!==3||p.some(n=>!Number.isFinite(n))))throw Error('Invalid mesh coordinates');
 const lo=[0,1,2].map(a=>Math.min(...vertices.map(p=>p[a]))),hi=[0,1,2].map(a=>Math.max(...vertices.map(p=>p[a]))),origin=lo.map((n,a)=>(n+hi[a])/2),edges=new Map();let signed=0;
 const key=p=>p.map(n=>Math.round(n*1e7)).join(',');
 for(const tri of triangles){if(tri.length!==3||tri.some(i=>!Number.isInteger(i)||!vertices[i]))throw Error('Invalid mesh triangle');const raw=tri.map(i=>vertices[i]),[a,b,c]=raw.map(p=>p.map((v,j)=>v-origin[j]));signed+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;for(let i=0;i<3;i++){const u=key(raw[i]),v=key(raw[(i+1)%3]);if(u===v)continue;const k=u<v?u+'|'+v:v+'|'+u,e=edges.get(k)??{count:0,direction:0};e.count++;e.direction+=u<v?1:-1;edges.set(k,e);}}
 const closed=edges.size>0&&[...edges.values()].every(e=>e.count===2&&e.direction===0);return {closed,volume_m3:closed?Math.abs(signed):null,bounds_m:{min:lo,max:hi},reason:closed?null:'Open, inconsistently oriented or non-manifold mesh'};
}
export function measureExport(geometry){const checks=geometry.meshes.map(measureMesh);if(checks.some(c=>!c.bounds_m))return {closed:false,volume_m3:null,reason:'No solid mesh'};if(!checks.length)return {closed:false,volume_m3:null,reason:'Curve-only / thickness unassigned'};return {closed:checks.every(c=>c.closed),volume_m3:checks.every(c=>c.closed)?checks.reduce((n,c)=>n+c.volume_m3,0):null,bounds_m:{min:[0,1,2].map(a=>Math.min(...checks.map(c=>c.bounds_m.min[a]))),max:[0,1,2].map(a=>Math.max(...checks.map(c=>c.bounds_m.max[a])))},reason:checks.find(c=>!c.closed)?.reason??null};}
export function pickGesture(threshold=5){let start=null,moved=false;return {begin(x,y){start=[x,y];moved=false;},move(x,y){if(start&&Math.hypot(x-start[0],y-start[1])>threshold)moved=true;return moved;},end(x,y){this.move(x,y);const picked=!!start&&!moved;start=null;return picked;},cancel(){start=null;moved=true;}};}

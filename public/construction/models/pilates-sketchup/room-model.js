// One source model and stable item IDs for the plan, 3D view and item schedule.
export const IDENTITY=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function multiply(a,b){return Array.from({length:16},(_,i)=>{const r=i%4,c=Math.floor(i/4);return [0,1,2,3].reduce((s,k)=>s+a[k*4+r]*b[c*4+k],0)})}
export function transform(p,m){return [0,1,2].map(r=>p[0]*m[r]+p[1]*m[4+r]+p[2]*m[8+r]+m[12+r])}
export function emptyBounds(){return {min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]}}
export function extend(bounds,p){for(let i=0;i<3;i++){bounds.min[i]=Math.min(bounds.min[i],p[i]);bounds.max[i]=Math.max(bounds.max[i],p[i])}return bounds}
export function mergeBounds(a,b){if(b.min.every(Number.isFinite)){extend(a,b.min);extend(a,b.max)}return a}
export function categoryFor(name){
 if(/plant|palm|cactus|ficus|strelitzia/i.test(name))return 'Plants';
 if(/light|lamp|pendant/i.test(name))return 'Lighting';
 if(/sofa|chair|table|locker|sabrina|bin|book|curtain/i.test(name))return 'Furniture';
 if(/yoga|pilates|reformer|treadmill/i.test(name))return 'Equipment';
 if(/door|sink|coffee|jar|towell|asciugamani|painting|picture|restroom|vigor/i.test(name))return 'Fittings';
 return 'Room geometry';
}
const validMatrix=m=>Array.isArray(m)&&m.length===16&&m.every(Number.isFinite);
export function buildRoomModel(scene){
 if(scene.schema_version!=='paila-room-1.0'||scene.units!=='m'||!Array.isArray(scene.definitions)||!Array.isArray(scene.root?.children))throw Error('Expected a room scene in metres');
 const definitions=new Map(),items=new Map(),objects=[],markers=[],bounds=emptyBounds();let triangles=0;
 for(const d of scene.definitions){if(definitions.has(d.id))throw Error('Duplicate definition '+d.id);definitions.set(d.id,d);
  for(const mesh of d.meshes){if(mesh.positions.length%3||mesh.indices.length%3||!mesh.positions.every(Number.isFinite)||!mesh.indices.every(i=>Number.isInteger(i)&&i>=0&&i<mesh.positions.length/3))throw Error('Invalid mesh '+d.id);}}
 function walk(did,m,path,item,materialId,ancestors){
  if(ancestors.includes(did))throw Error('Recursive definition '+did);
  const d=definitions.get(did);if(!d)throw Error('Missing definition '+did);
  for(let k=0;k<d.meshes.length;k++){
   const mesh=d.meshes[k];if(!mesh.indices.length)continue;
   triangles+=mesh.indices.length/3;if(triangles>3000000)throw Error('Room preview exceeds display budget');
   const b=emptyBounds(),worldPositions=new Float32Array(mesh.positions.length);
   for(let i=0;i<mesh.positions.length;i+=3){const p=transform(mesh.positions.slice(i,i+3),m);worldPositions.set(p,i);extend(b,p)}
   mergeBounds(item.bounds,b);mergeBounds(bounds,b);
   const mid=mesh.material_id==='None'||mesh.material_id==='null'?materialId:mesh.material_id;
   const material=scene.materials?.[mid],rgb=material?.rgb??mesh.rgb;
   if(material?.name)item.finishes.add(material.name);
   objects.push({id:path+'/'+k,itemId:item.id,definitionId:did,meshIndex:k,mesh,matrix:m,rgb,bounds:b,worldPositions,occurrenceId:item.currentOccurrence});
  }
  for(const c of d.children){if(c.visible===false)continue;if(!validMatrix(c.matrix_m))throw Error('Invalid transform '+c.id);
   walk(c.definition_id,multiply(m,c.matrix_m),path+'/'+c.id,item,c.material_id&&c.material_id!=='None'?c.material_id:materialId,[...ancestors,did]);}
 }
 for(const c of scene.root.children){
  if(c.visible===false)continue;if(!validMatrix(c.matrix_m))throw Error('Invalid root transform '+c.id);
  const d=definitions.get(c.definition_id);if(!d)throw Error('Missing definition '+c.definition_id);
  let item=items.get(c.definition_id);
  if(!item){item={id:c.definition_id,name:d.name.replace(/^Group#(\d+)$/,'Group $1'),sourceName:d.name,category:categoryFor(d.name),quantity:0,bounds:emptyBounds(),occurrences:[],finishes:new Set()};items.set(item.id,item)}
  item.quantity++;item.currentOccurrence=c.id;const first=objects.length;
  walk(c.definition_id,c.matrix_m,c.id,item,c.material_id,[]);
  const b=emptyBounds();for(const o of objects.slice(first))mergeBounds(b,o.bounds);
  item.occurrences.push({id:c.id,bounds:b,origin:c.matrix_m.slice(12,15)});
 }
 if(!objects.length)throw Error('No room geometry found');
 const rows=[...items.values()].map(item=>{
  delete item.currentOccurrence;
  const sizes=item.occurrences.filter(o=>o.bounds.min.every(Number.isFinite)).map(o=>o.bounds.max.map((v,i)=>v-o.bounds.min[i]));
  item.sizeRanges=[0,1,2].map(i=>sizes.length?[Math.min(...sizes.map(s=>s[i])),Math.max(...sizes.map(s=>s[i]))]:null);
  item.finishes=[...item.finishes].filter(Boolean).sort();item.geometryAvailable=sizes.length>0;
  for(const o of item.occurrences)if(!o.bounds.min.every(Number.isFinite)){markers.push({itemId:item.id,point:o.origin,occurrenceId:o.id});extend(item.bounds,o.origin);extend(bounds,o.origin)}
  return item;
 }).sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name,undefined,{numeric:true}));
 return {items:rows,objects,markers,bounds,triangles,source:scene.source};
}
export function formatDimensions(item){return item.sizeRanges.every(Boolean)?item.sizeRanges.map(([a,b])=>{const v=n=>n.toFixed(2);return Math.abs(b-a)<.015?v(b):v(a)+'–'+v(b)}).join(' × '):'—'}
export function matchingItems(items,query){const q=query.trim().toLocaleLowerCase();return items.filter(i=>!q||[i.name,i.category,...i.finishes].join(' ').toLocaleLowerCase().includes(q)).map(i=>i.id)}
export function createSelection(itemIds){const valid=new Set(itemIds);let selectedId=null,isolated=false;return {
 get selectedId(){return selectedId},get isolated(){return isolated},
 select(id){if(id!==null&&!valid.has(id))return false;selectedId=id;if(id===null)isolated=false;return true},
 isolate(value){isolated=!!value&&selectedId!==null},
 visible(id,matching){return matching.has(id)&&(!isolated||id===selectedId)}
}}

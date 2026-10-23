import {buildRoomModel} from '../public/construction/models/pilates-sketchup/room-model.js';

// Derived at build time from the preserved display scene; no independent geometry copy is edited.
export function reusableComponents(scene,navigation){
 const model=buildRoomModel(scene,navigation);
 const choices=[{id:'sofa',definition:'161587',name:'PILATES source sofa',yaw:0},{id:'lockers',definition:'1878458',name:'PILATES source lockers',yaw:90},{id:'sink',definition:'10959990',name:'PILATES source sink',yaw:90}];
 const items=choices.map(choice=>{
  const item=model.items.find(i=>i.id===choice.definition);if(!item)throw Error('Missing reusable source component '+choice.definition);
  const occurrence=item.occurrences[0],objects=model.objects.filter(o=>o.itemId===item.id&&o.occurrenceId===occurrence.id),angle=choice.yaw*Math.PI/180;
  const parts=objects.map(o=>{const positions=[];for(let k=0;k<o.worldPositions.length;k+=3){const x=o.worldPositions[k],y=o.worldPositions[k+1];positions.push(x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle),o.worldPositions[k+2]);}return {positions,indices:[...o.mesh.indices],rgb:o.rgb??[165,175,180]};});
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const part of parts)for(let k=0;k<part.positions.length;k++) {const axis=k%3;min[axis]=Math.min(min[axis],part.positions[k]);max[axis]=Math.max(max[axis],part.positions[k]);}
  const origin=[(min[0]+max[0])/2,(min[1]+max[1])/2,min[2]],size=max.map((v,i)=>Number((v-min[i]).toFixed(6)));
  for(const part of parts)part.positions=part.positions.map((v,i)=>Number((v-origin[i%3]).toFixed(5)));
  return {id:choice.id,name:choice.name,source_definition_id:item.id,source_definition_name:item.sourceName,source_occurrence_id:occurrence.id,canonical_yaw_degrees:choice.yaw,size,triangles:parts.reduce((n,p)=>n+p.indices.length/3,0),parts};
 });
 return {schema:'paila-reusable-geometry-1.0',units:'m',source_sha256:scene.source.sha256,source_scene:'../pilates-sketchup/studio-room.scene.json',geometry_scope:'Copies of three optimized display components. Colour values are appearances; dimensions are display bounds. No edit to the native SKP, no inferred construction layers or product certification.',items};
}

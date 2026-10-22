export function createThreeAdapter(THREE){
// Geometry is shared between repeated placements; item IDs survive ray picking.
function createModelBatches(model){
 const groups=new Map(),items=new Map(model.items.map(i=>[i.id,i]));
 for(const object of model.objects){const architectural=items.get(object.itemId).category==='Room geometry',key=object.definitionId+'/'+object.meshIndex+'/'+architectural;
  if(!groups.has(key))groups.set(key,{objects:[],architectural});groups.get(key).objects.push(object);
 }
 for(const marker of model.markers??[]){
  const key='placement-marker';if(!groups.has(key))groups.set(key,{objects:[],architectural:false,guide:true});
  const matrix=[1,0,0,0,0,1,0,0,0,0,1,0,...marker.point,1];
  groups.get(key).objects.push({id:marker.occurrenceId,occurrenceId:marker.occurrenceId,itemId:marker.itemId,matrix,rgb:[90,125,145],mesh:{positions:[0,0,.06,.06,0,0,0,.06,0,-.06,0,0,0,-.06,0,0,0,-.06],indices:[0,1,2,0,2,3,0,3,4,0,4,1,5,2,1,5,3,2,5,4,3,5,1,4]}});
 }
 const batches=[];
 for(const batch of groups.values()){
  const source=batch.objects[0].mesh,geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(source.positions,3));geometry.setIndex(source.indices);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:.8,metalness:0,wireframe:!!batch.guide});
  const mesh=new THREE.InstancedMesh(geometry,material,batch.objects.length);mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.userData.batch=batch;batch.mesh=mesh;
  const matrix=new THREE.Matrix4();batch.objects.forEach((object,i)=>mesh.setMatrixAt(i,matrix.fromArray(object.matrix)));mesh.instanceMatrix.needsUpdate=true;mesh.updateMatrixWorld(true);batches.push(batch);
 }
 return batches;
}
function updateModelBatches(batches,{visible,selectedId,highlight,cutaway,height=1.5}){
 const matrix=new THREE.Matrix4(),color=new THREE.Color();
 for(const batch of batches){
  batch.objects.forEach((o,i)=>{matrix.fromArray(o.matrix);if(!visible(o.itemId,o.occurrenceId))matrix.scale(new THREE.Vector3(0,0,0));batch.mesh.setMatrixAt(i,matrix);
   color.setRGB(...o.rgb.map(c=>c/255),THREE.SRGBColorSpace);if(o.itemId===selectedId)color.set(highlight);batch.mesh.setColorAt(i,color);
  });batch.mesh.instanceMatrix.needsUpdate=true;batch.mesh.instanceColor.needsUpdate=true;
  batch.mesh.material.clippingPlanes=cutaway&&batch.architectural?[new THREE.Plane(new THREE.Vector3(0,0,-1),height)]:[];
  batch.mesh.material.needsUpdate=true;
 }
}
function pickedItem(ray,batches,{visible,cutaway,height=1.5}){
 const hit=ray.intersectObjects(batches.map(b=>b.mesh)).find(h=>{const b=h.object.userData.batch,o=b.objects[h.instanceId];return visible(o.itemId,o.occurrenceId)&&(!b.architectural||!cutaway||h.point.z<=height+1e-5)});
 return hit?hit.object.userData.batch.objects[hit.instanceId].itemId:null;
}

return {createModelBatches,updateModelBatches,pickedItem};
}

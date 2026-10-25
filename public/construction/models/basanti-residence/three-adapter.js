// The same Three.js geometries feed WebGL, picking, exports and the labelled SVG fallback.
export function createBuildingAdapter(THREE){
 const colors={wall:0xcbd5db,column:0x6b829b,beam:0x708a9c,'tie beam':0x6f7f94,'strap beam':0x8b7f78,slab:0xc3cbd0,door:0xc39a70,'sliding door':0xa6c4d4,window:0x77bfd0,vent:0x96bac7,stair:0x9aaeb4,railing:0x455568,footing:0x9a8d77};
 function create(project,wallPanels){
  const root=new THREE.Group(),groups=new Map();
  for(const c of project.components){const group=new THREE.Group();group.userData={component:c};groups.set(c.id,group);root.add(group);const g=c.geometry,color=c.status==='assumed'?0xb49b74:(colors[c.kind]??0x899cab),material=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:0,side:THREE.DoubleSide,transparent:c.kind==='window'||c.kind==='vent',opacity:c.kind==='window'||c.kind==='vent'?.4:1});
   function mesh(geometry,mat=material){const m=new THREE.Mesh(geometry,mat);m.userData.componentId=c.id;group.add(m);return m;}
   function box(v){const m=mesh(new THREE.BoxGeometry(v.width,v.depth,v.height));m.position.set(v.x,v.y,v.z+v.height/2);m.rotation.z=(v.rotation??0)*Math.PI/180;return m;}
   function line(points,closed=false){const pts=points.map(p=>new THREE.Vector3(...p));if(closed)pts.push(pts[0]);const o=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color}));o.userData.componentId=c.id;group.add(o);return o;}
   if(g.type==='wall')wallPanels(c).forEach(box);
   if(g.type==='box'){if(g.height==null)line([[g.x-g.width/2,g.y-g.depth/2,g.z],[g.x+g.width/2,g.y-g.depth/2,g.z],[g.x+g.width/2,g.y+g.depth/2,g.z],[g.x-g.width/2,g.y+g.depth/2,g.z]],true);else box(g);}
   if(g.type==='opening'){const m=box({x:g.x,y:g.y,z:g.z,width:g.width,depth:Math.min(g.thickness,.035),height:g.height,rotation:g.rotation});m.userData.displayOnlyLeaf=true;}
   if(g.type==='polygon'){const shape=new THREE.Shape(g.points.map(p=>new THREE.Vector2(...p)));for(const hole of g.holes??[])shape.holes.push(new THREE.Path(hole.map(p=>new THREE.Vector2(...p))));const m=mesh(new THREE.ExtrudeGeometry(shape,{depth:g.height,bevelEnabled:false,curveSegments:12}));m.position.z=g.z;}
   if(g.type==='segment'){const a=new THREE.Vector3(...g.a),b=new THREE.Vector3(...g.b),d=b.clone().sub(a),center=a.clone().add(b).multiplyScalar(.5);box({x:center.x,y:center.y,z:center.z-g.height,width:d.length(),depth:g.width,height:g.height,rotation:Math.atan2(d.y,d.x)*180/Math.PI});}
   if(g.type==='stair'){const n1=9,n2=g.riser_count-n1,rise=g.height/g.riser_count;for(let i=0;i<n1;i++)box({x:g.x+(i+.5)*g.tread,y:g.y+g.flight_width/2,z:g.z+i*rise,width:g.tread,depth:g.flight_width,height:rise});box({x:g.x+n1*g.tread+g.flight_width/2,y:g.y+g.flight_width,z:g.z+n1*rise-g.waist,width:g.flight_width,depth:g.flight_width*2,height:g.waist});for(let i=0;i<n2;i++)box({x:g.x+(n1-i-.5)*g.tread,y:g.y+g.flight_width*1.5,z:g.z+(n1+i)*rise,width:g.tread,depth:g.flight_width,height:rise});}
   if(g.type==='railing'){for(const h of [.15,.45,.75,g.height])line(g.points.map(([x,y])=>[x,y,g.z+h]));for(const [x,y]of g.points)line([[x,y,g.z],[x,y,g.z+g.height]]);}
  }
  root.updateMatrixWorld(true);return {root,groups};
 }
 function update(model,visibleIds,selectedId,cutaway=false,cutZ=1.2){for(const [id,group]of model.groups){group.visible=visibleIds.has(id);group.traverse(o=>{if(o.material){if(!o.userData.originalColor)o.userData.originalColor=o.material.color.clone();o.material.color.copy(id===selectedId?new THREE.Color(0xd59d35):o.userData.originalColor);o.material.clippingPlanes=cutaway?[new THREE.Plane(new THREE.Vector3(0,0,-1),cutZ)]:[];}});}model.root.updateMatrixWorld(true);}
 function faces(model){const result=[];model.root.traverse(obj=>{if((!obj.isMesh&&!obj.isLine)||!obj.parent.visible)return;const pos=obj.geometry.attributes.position,index=obj.geometry.index,mat=obj.material,indices=index?index.array:null,count=indices?indices.length:pos.count;if(obj.isLine){const points=[];for(let i=0;i<count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(obj.matrixWorld);points.push([v.x,v.y,v.z]);}result.push({id:obj.userData.componentId,points,line:true,color:'#'+mat.color.getHexString(),opacity:1});return;}for(let i=0;i<count;i+=3){const points=[];for(let j=0;j<3;j++){const v=new THREE.Vector3().fromBufferAttribute(pos,indices?indices[i+j]:i+j).applyMatrix4(obj.matrixWorld);points.push([v.x,v.y,v.z]);}result.push({id:obj.userData.componentId,points,color:'#'+mat.color.getHexString(),opacity:mat.opacity});}});return result;}
 return {create,update,faces};
}

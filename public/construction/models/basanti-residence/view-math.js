export const cameraDirections={iso:[1.1,-1.4,1],top:[0,0,1],front:[0,-1,0],side:[1,0,0]};
export function createViewMath(THREE){
function boundsForGroups(model,ids){const bounds=new THREE.Box3();for(const [id,group]of model.groups)if(ids.has(id)&&group.children.length)bounds.union(new THREE.Box3().setFromObject(group));return bounds;}
function fitOrthographic(camera,bounds,aspect,preset='iso'){
 if(bounds.isEmpty())return null;const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),direction=new THREE.Vector3(...cameraDirections[preset]).normalize(),up=preset==='top'?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1),right=up.clone().cross(direction).normalize(),screenUp=direction.clone().cross(right).normalize(),corners=[];
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(x,y,z).sub(center));const width=Math.max(...corners.map(p=>p.dot(right)))-Math.min(...corners.map(p=>p.dot(right))),height=Math.max(...corners.map(p=>p.dot(screenUp)))-Math.min(...corners.map(p=>p.dot(screenUp))),viewHeight=Math.max(height,width/Math.max(.1,aspect),.5)*1.18;
 camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.near=.01;camera.far=Math.max(100,size.length()*12);camera.zoom=1;camera.up.copy(up);camera.position.copy(center).addScaledVector(direction,Math.max(5,size.length()*3));camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return {center,viewHeight,width,height};
}
function clipLineAtZ(points,z){const result=[];for(let i=1;i<points.length;i++){let a=points[i-1],b=points[i];if(a[2]>z&&b[2]>z)continue;if((a[2]>z)!==(b[2]>z)){const t=(z-a[2])/(b[2]-a[2]),p=a.map((n,j)=>n+t*(b[j]-n));if(a[2]>z)a=p;else b=p;}result.push([a,b]);}return result;}
function faceTowardCamera(points,camera){if(points.length<3)return false;const a=new THREE.Vector3(...points[0]),u=new THREE.Vector3(...points[1]).sub(a),v=new THREE.Vector3(...points[2]).sub(a),normal=u.cross(v),view=camera.getWorldDirection(new THREE.Vector3()).negate();return normal.dot(view)>1e-9;}
function projectPoint(point,camera,width,height){const p=new THREE.Vector3(...point).project(camera);return [(p.x+1)*width/2,(1-p.y)*height/2,p.z];}

return {boundsForGroups,fitOrthographic,clipLineAtZ,faceTowardCamera,projectPoint};
}

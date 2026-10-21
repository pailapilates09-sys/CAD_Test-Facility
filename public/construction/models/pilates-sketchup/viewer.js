import * as THREE from '../../../vendor/three.module.min.js';
import {OrbitControls} from '../../../vendor/OrbitControls.js';
const $=id=>document.getElementById(id),canvas=$('plan'),ctx=canvas.getContext('2d');
let data=null,objects=[],selected=null,renderer=null,world,cam,controls,group,planBounds;
const ID=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const matrix=a=>new THREE.Matrix4().fromArray(a),vec=(p,m)=>new THREE.Vector3(...p).applyMatrix4(m);
const validMatrix=a=>Array.isArray(a)&&a.length===16&&a.every(Number.isFinite);
const safe=s=>String(s??'');
function inspect(scene){
 if(scene.schema_version!=='paila-scene-1.0'||scene.units!=='m'||!scene.root||!Array.isArray(scene.definitions))throw new Error('Expected paila-scene-1.0 with units m');
 const defs=new Map(scene.definitions.map(x=>[x.id,x])),result=[];let triangles=0;
 function walk(container,parent,m,ancestors,visible){
  if(!Array.isArray(container.faces)||!Array.isArray(container.children))throw new Error('Invalid geometry container');
  const positions=[],colors=[];
  for(const f of container.faces){
   if((!visible||f.visible===false)&&!$('show-hidden').checked)continue;
   if(!Array.isArray(f.positions)||!Array.isArray(f.polygons))throw new Error('Invalid face');
   const rgb=f.rgb??[180,195,190];
   for(const poly of f.polygons){
    if(poly.length!==3)throw new Error('Only triangulated face meshes are supported; export must be reviewed');
    if(++triangles>2000000)throw new Error('Preview limit: 2 million triangles. Export a selected model partition; no partial model is presented.');
    for(const index of poly){const p=f.positions[index];if(!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite))throw new Error('Invalid vertex');positions.push(...p);colors.push(...rgb.map(c=>c/255))}
   }
  }
  if(positions.length)result.push({path:parent,definition_id:container.id,name:container.name||parent,matrix:m,positions,colors});
  for(const child of container.children){
   if(!validMatrix(child.matrix_m))throw new Error('Invalid instance transform');
   if(ancestors.includes(child.definition_id))throw new Error('Recursive component definition');
   const def=defs.get(child.definition_id);if(!def)throw new Error('Missing component definition '+child.definition_id);
   walk(def,parent+'/'+child.id,m.clone().multiply(matrix(child.matrix_m)),[...ancestors,child.definition_id],visible&&child.visible!==false);
  }
 }
 walk(scene.root,'root',matrix(ID),[],true);return {objects:result,triangles};
}
function init3D(){
 if(renderer)return;
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 $('three-view').appendChild(renderer.domElement);world=new THREE.Scene();world.background=new THREE.Color('#edf3f4');cam=new THREE.PerspectiveCamera(45,1,.01,10000);cam.up.set(0,0,1);controls=new OrbitControls(cam,renderer.domElement);controls.enableDamping=true;
 world.add(new THREE.HemisphereLight(0xffffff,0x687d7d,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(10,-10,20);world.add(light);
 group=new THREE.Group();world.add(group);
 renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.dataset.x=e.clientX;renderer.domElement.dataset.y=e.clientY});
 renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-Number(renderer.domElement.dataset.x),e.clientY-Number(renderer.domElement.dataset.y))>5)return;const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),cam);const hits=ray.intersectObjects(group.children);if(hits[0])select(hits[0].object.userData.path)});
 function frame(){requestAnimationFrame(frame);controls.update();renderer.render(world,cam)}frame();
}
function fit(){
 if(!objects.length)return;
 const box=new THREE.Box3();objects.forEach(o=>{for(let i=0;i<o.positions.length;i+=3)box.expandByPoint(vec(o.positions.slice(i,i+3),o.matrix))});
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z,.1);planBounds={min:box.min,max:box.max};
 if(renderer){cam.position.copy(center).add(new THREE.Vector3(span,-span,span*.8));cam.near=Math.max(span/10000,.001);cam.far=span*100;cam.updateProjectionMatrix();controls.target.copy(center);controls.update()}drawPlan();
}
function drawPlan(){
 const r=canvas.parentElement.getBoundingClientRect();canvas.width=r.width*devicePixelRatio;canvas.height=r.height*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.clearRect(0,0,r.width,r.height);
 if(!planBounds)return;const {min,max}=planBounds,scale=Math.min((r.width-40)/Math.max(max.x-min.x,.01),(r.height-60)/Math.max(max.y-min.y,.01)),ox=(r.width-(max.x-min.x)*scale)/2,oy=(r.height-(max.y-min.y)*scale)/2;
 const project=v=>[ox+(v.x-min.x)*scale,r.height-oy-(v.y-min.y)*scale];
 objects.forEach(o=>{o.hitBox=[Infinity,Infinity,-Infinity,-Infinity];ctx.strokeStyle=o.path===selected?'#d16425':'#597b7c55';ctx.lineWidth=o.path===selected?1.5:.5;ctx.beginPath();for(let i=0;i<o.positions.length;i+=9){const points=[0,3,6].map(k=>project(vec(o.positions.slice(i+k,i+k+3),o.matrix)));points.forEach((p,j)=>{o.hitBox[0]=Math.min(o.hitBox[0],p[0]);o.hitBox[1]=Math.min(o.hitBox[1],p[1]);o.hitBox[2]=Math.max(o.hitBox[2],p[0]);o.hitBox[3]=Math.max(o.hitBox[3],p[1]);j?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.closePath()}ctx.stroke()});
 ctx.fillStyle='#172c34';ctx.font='11px Arial';ctx.fillText(`XY extent ${(max.x-min.x).toFixed(3)} × ${(max.y-min.y).toFixed(3)} m`,14,r.height-12);
}
function select(path){selected=path;const o=objects.find(x=>x.path===path);$('selection').textContent=o?`${o.name} · path ${o.path} · definition ${o.definition_id}`:'No component selected';if(group)group.children.forEach(mesh=>{mesh.material.emissive.set(mesh.userData.path===path?'#6b3d0b':'#000000')});$('element-list').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.path===path)));drawPlan()}
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const hit=objects.filter(o=>o.hitBox&&x>=o.hitBox[0]&&x<=o.hitBox[2]&&y>=o.hitBox[1]&&y<=o.hitBox[3]).sort((a,b)=>(a.hitBox[2]-a.hitBox[0])*(a.hitBox[3]-a.hitBox[1])-(b.hitBox[2]-b.hitBox[0])*(b.hitBox[3]-b.hitBox[1]));if(hit[0])select(hit[0].path)});
function load(){
 const parsed=inspect(data);objects=parsed.objects;selected=null;
 if(!objects.length)throw new Error('No visible face geometry found. Try Include hidden geometry.');
 let webgl='';try{init3D();for(const m of [...group.children]){group.remove(m);m.geometry.dispose();m.material.dispose()}objects.forEach(o=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o.positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(o.colors,3));g.computeVertexNormals();const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.8}));mesh.applyMatrix4(o.matrix);mesh.userData.path=o.path;group.add(mesh)});$('three-empty').hidden=true}catch(error){webgl=' 3D unavailable: '+error.message;}
 $('plan-empty').hidden=true;$('model-status').textContent=`Loaded ${safe(data.source?.name||'exported model')} · ${objects.length} geometry occurrences · ${parsed.triangles.toLocaleString('en-IN')} triangles. ${safe(data.source?.scope||'Local exported scene.')}${webgl}`;
 $('element-list').replaceChildren();for(const o of objects.slice(0,500)){const b=document.createElement('button');b.textContent=o.name+' · '+o.path;b.dataset.path=o.path;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(o.path));$('element-list').appendChild(b)}
 if(objects.length>500){const p=document.createElement('p');p.textContent='List shows the first 500 occurrences; all geometry remains in the views.';$('element-list').appendChild(p)}
 const repeats=new Map();objects.forEach(o=>{const key=o.definition_id+'|'+o.matrix.elements.map((n,i)=>n.toFixed([12,13,14].includes(i)?6:9)).join(',');if(!repeats.has(key))repeats.set(key,[]);repeats.get(key).push(o.path)});const duplicates=[...repeats.values()].filter(x=>x.length>1);$('duplicate-list').textContent=duplicates.length?`${duplicates.length} coincident geometry occurrence groups need review: `+duplicates.slice(0,30).map(x=>x.join(' / ')).join('; '):'No coincident same-definition geometry occurrences detected in this loaded view. This does not rule out duplicate layouts or equal geometry in different definitions. Use the Python inspector for the full hierarchy report.';fit();resize();
}
function resize(){if(renderer){const r=$('three-view').getBoundingClientRect();renderer.setSize(r.width,r.height);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}drawPlan()}
$('scene-file').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>268435456)throw new Error('JSON exceeds 256 MiB; export a smaller partition');data=JSON.parse(await file.text());load()}catch(error){$('model-status').textContent='Model not loaded: '+error.message}});
$('fit').addEventListener('click',fit);$('show-hidden').addEventListener('change',()=>{if(data)try{load()}catch(error){$('model-status').textContent=error.message}});new ResizeObserver(resize).observe($('three-view'));resize();
async function loadPublishedPartition(){
 try{const response=await fetch('./architectural-base.scene.json');if(!response.ok)throw new Error('Published partition is unavailable');const published=await response.json();if(data)return;data=published;load()}catch(error){$('model-status').textContent='Published partition could not load: '+error.message+'. You can still open an exported scene.json.'}
}
loadPublishedPartition();

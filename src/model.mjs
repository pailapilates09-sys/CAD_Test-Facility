import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import {spec as S, colors, fmt, braceLength} from './spec.mjs';

export function createViewer(stage, onSelect) {
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(38, 1, .1, 2000);
 const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.setClearColor(0xffffff,0);
 stage.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Rotatable formwork model; use view buttons for alternative camera positions');
 const controls = new OrbitControls(camera, renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=65;controls.maxDistance=600;controls.target.set(0,43,0);controls.maxPolarAngle=Math.PI*.91;
 scene.add(new THREE.HemisphereLight(0xffffff,0x98adb0,2.8));
 const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(80,160,95);scene.add(light);
 const groups=Object.fromEntries(['ply','studs','collars','braces','base','nails','joints','core'].map(k=>[k,new THREE.Group()]));
 Object.values(groups).forEach(g=>scene.add(g));
 const parts=[],faceGroups=[];
 function box(parent,kind,size,pos,info,color=colors[kind]){
  const material=new THREE.MeshStandardMaterial({color,roughness:.75,transparent:kind==='core',opacity:kind==='core'?.32:1});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...pos);mesh.userData={...info,kind};parent.add(mesh);parts.push(mesh);
  if(kind!=='nails'){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:0x314958,transparent:true,opacity:.26}));mesh.add(edge);}
  return mesh;
 }
 function face(kind,axis,sign){const g=new THREE.Group();g.userData={axis,sign};groups[kind].add(g);faceGroups.push(g);return g;}
 const t=S.ply,H=S.height,q=S.clear;
 box(groups.core,'core',[q,H,q],[0,H/2,0],{title:'Concrete size reference',size:'16 in x 16 in clear; 96 in high',note:'This transparent block shows the clear column opening. Reinforcement is omitted.'});
 for(const sign of [-1,1]){
  const pA=face('ply','x',sign),sA=face('studs','x',sign),nA=face('nails','x',sign);
  box(pA,'ply',[t,H,q],[sign*(8+t/2),H/2,0],{title:'A · narrow plywood face',size:`16 x 96 x ${fmt(t,4)} in · 2 pieces`,note:'The B panels cover both cut ends of A. Keep the inside opening 16 in.'},colors.A);
  for(const z of [-7,0,7]){
   box(sA,'studs',[3,H,2],[sign*(8+t+1.5),H/2,z],{title:'S1 · A-panel vertical batten',size:'2 x 3 in section; 96 in long',note:'Centres at 1 / 8 / 15 in from the ply edge. Outer battens are flush to the two long edges.'});
   for(const y of S.nailPositions)box(nA,'nails',[.08,.2,.2],[sign*7.96,y,z],{title:'N1 · plywood-retaining nail',size:`${fmt(S.nailLength)} in length as drawn`,note:'Nail from the smooth plywood face into the batten centre. 1.969 in end offset; approximately 5.905 in maximum pitch. These nails do not close the collars.'});
  }
  const pB=face('ply','z',sign),sB=face('studs','z',sign),nB=face('nails','z',sign);
  box(pB,'ply',[q+2*t,H,t],[0,H/2,sign*(8+t/2)],{title:'B · overlapping plywood face',size:`${fmt(q+2*t)} x 96 x ${fmt(t,4)} in · 2 pieces`,note:'Width equals the 16 in clear opening plus two actual plywood thicknesses. B covers the A panel ends.'},colors.B);
  for(const x of [-7-t,0,7+t]){
   box(sB,'studs',[2,H,3],[x,H/2,sign*(8+t+1.5)],{title:'S1 · B-panel vertical batten',size:'2 x 3 in section; 96 in long',note:'Centres at 1 / 8.472 / 15.945 in from the ply edge. The 2 in face bears against the plywood.'});
   for(const y of S.nailPositions)box(nB,'nails',[.2,.2,.08],[x,y,sign*7.96],{title:'N1 · plywood-retaining nail',size:`${fmt(S.nailLength)} in long; about 1.496 in penetration`,note:'17 nails on each of three lines = 51 per face. Keep heads flush with the concrete-contact surface.'});
  }
 }
 const railCentre=8+t+3+1;
 for(const [i,d] of S.collarDatums.entries()){
  for(const sign of [-1,1]){
   box(groups.collars,'collars',[30,3,2],[0,d-1.5,sign*railCentre],{title:`Y${i+1} · lower collar rail`,size:'30 in long; 2 x 3 in section',note:`Band datum ${d} in above base. Rails are staggered at corners. The closure fixing detail is still pending.`});
   box(groups.collars,'collars',[2,3,30],[sign*railCentre,d+1.5,0],{title:`Y${i+1} · upper collar rail`,size:'30 in long; 2 x 3 in section',note:'Four rails make one collar. Use a designed corner connection; ply-retaining nails are not its connection schedule.'});
  }
  for(const x of [-railCentre,railCentre])for(const z of [-railCentre,railCentre]){
   const m=new THREE.Mesh(new THREE.TorusGeometry(.52,.11,8,18),new THREE.MeshStandardMaterial({color:colors.joints}));m.rotation.x=-Math.PI/2;m.position.set(x,d+3.13,z);m.userData={title:'C1 · collar joint location',size:'Symbol only; connection not designed',note:'The ring marks a joint to be detailed. It is not a specified bolt, clamp or nail.',kind:'joints'};groups.joints.add(m);parts.push(m);
  }
 }
 for(const axis of ['x','z'])for(const sign of [-1,1]){
  const a=axis==='x'?[sign*S.braceHeadOffset,75,0]:[0,75,sign*S.braceHeadOffset];
  const b=axis==='x'?[sign*S.braceFootOffset,0,0]:[0,0,sign*S.braceFootOffset];
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);
  const m=box(groups.braces,'braces',[2,braceLength,3],av.clone().add(bv).multiplyScalar(.5).toArray(),{title:'R1 · diagonal stability brace',size:`${fmt(braceLength)} in geometric length; 2 x 3 in section`,note:'Four braces on two perpendicular axes. Head at 75 in; foot location 74.803 in from column centre. Final joint allowances and capacity need verification.'});
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
  const anchor=new THREE.Mesh(new THREE.TorusGeometry(1.2,.15,8,24),new THREE.MeshStandardMaterial({color:0x17394b}));anchor.rotation.x=-Math.PI/2;anchor.position.set(b[0],.12,b[2]);anchor.userData={title:'Brace anchorage location',size:'Location symbol; anchor sizes pending',note:'Fix to a verified slab or ground anchorage. The circle is a location marker, not an additional timber block.',kind:'braces'};groups.braces.add(anchor);parts.push(anchor);
  for(const y of [1.5,4.5])box(groups.base,'base',axis==='x'?[2,3,S.blockLength]:[S.blockLength,3,2],axis==='x'?[sign*(railCentre+2),y,0]:[0,y,sign*(railCentre+2)],{title:'L1 · base-stop block',size:`${fmt(S.blockLength)} in long; 2 x 3 in section`,note:'Two stacked blocks at each of four faces: eight pieces. Positive attachment to the substrate is still required.'});
 }
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(235,235),new THREE.MeshStandardMaterial({color:0xf0f4f1,roughness:1,side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=-.21;scene.add(floor);
 const grid=new THREE.GridHelper(220,22,0xb9ccca,0xdce6e0);grid.position.y=-.19;grid.material.transparent=true;grid.material.opacity=.7;scene.add(grid);
 function label(str,pos,width){const cv=document.createElement('canvas');cv.width=560;cv.height=80;const ctx=cv.getContext('2d');ctx.fillStyle='#ffffffef';ctx.fillRect(0,0,560,80);ctx.fillStyle='#17394b';ctx.font='600 31px Arial';ctx.textAlign='center';ctx.fillText(str,280,51);const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(width,width/7,1);sprite.position.set(...pos);scene.add(sprite);}
 label('96 in high',[-28,98,0],29);label('16 in x 16 in clear',[1,108,0],39);
 let scheduled=false,selected=null;
 function requestRender(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;controls.update();renderer.render(scene,camera);});}
 controls.addEventListener('change',requestRender);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();requestRender();}
 const observer=new ResizeObserver(resize);observer.observe(stage);
 function setView(view){const poses={iso:[150,132,172],front:[0,58,245],top:[0,260,.001]};camera.position.set(...poses[view]||poses.iso);controls.target.set(0,view==='top'?0:43,0);controls.update();requestRender();}
 function setLayer(k,visible){groups[k].visible=visible;requestRender();}
 function setExplode(amount){faceGroups.forEach(g=>g.position[g.userData.axis]=g.userData.sign*amount);requestRender();}
 const raycaster=new THREE.Raycaster();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
 renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
  const hit=raycaster.intersectObjects(parts,false).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});
  if(selected)selected.material.emissive.setHex(0);selected=hit?.object||null;
  if(selected){selected.material.emissive.setHex(0x324947);onSelect(selected.userData);requestRender();}
 });
 setView('iso');resize();
 return {scene,camera,renderer,groups,parts,controls,setLayer,setView,setExplode,
  snapshot(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
  dispose(){observer.disconnect();controls.dispose();renderer.dispose();}
 };
}

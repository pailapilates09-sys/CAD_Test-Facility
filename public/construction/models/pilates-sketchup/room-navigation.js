// A source-linked overlay: names, approximate navigation zones and original camera presets.
// Native definitions, placements and geometry remain in studio-room.scene.json.
const categories=new Set(['Equipment','Fittings','Furniture','Lighting','Plants','Room geometry']);
const finiteBox=b=>b?.min?.length===3&&b.max?.length===3&&[...b.min,...b.max].every(Number.isFinite);
const box=()=>({min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]});
function merge(a,b){if(finiteBox(b))for(let n=0;n<3;n++){a.min[n]=Math.min(a.min[n],b.min[n]);a.max[n]=Math.max(a.max[n],b.max[n])}return a}
export function validateNavigation(n,model){
 if(n?.schema_version!=='paila-room-navigation-1.0'||n.source_sha256!==model.source.sha256)throw Error('Navigation source does not match the room');
 if(!Array.isArray(n.zones)||!n.zones.length||!Array.isArray(n.views)||!n.labels)throw Error('Incomplete room navigation');
 const zones=new Set(['all']),ids=new Set(model.items.map(i=>i.id));
 for(const z of n.zones){
  if(!/^[a-z][a-z0-9-]*$/.test(z.id)||zones.has(z.id)||!z.name||!z.rectangles?.length)throw Error('Invalid room zone');zones.add(z.id);
  for(const r of z.rectangles)if(r.length!==4||!r.every(Number.isFinite)||r[0]>=r[2]||r[1]>=r[3])throw Error('Invalid zone rectangle');
 }
 for(const [id,label]of Object.entries(n.labels))if(!ids.has(id)||!label.name?.trim()||!categories.has(label.category)||!['source-label','nested-label','suggested','unresolved'].includes(label.status)||!label.evidence)throw Error('Invalid room label '+id);
 const views=new Set(['overview','zone-overview','top']);
 for(const v of n.views){
  if(!/^[a-z][a-z0-9-]*$/.test(v.id)||views.has(v.id)||!zones.has(v.zone_id)||!v.name||!v.source_camera_name||v.source_coordinate_unit!=='inch'||v.fov<20||v.fov>100||!Number.isFinite(v.fov))throw Error('Invalid saved viewpoint');views.add(v.id);
  if(![v.eye_m,v.target_m].every(p=>p?.length===3&&p.every(Number.isFinite))||Math.hypot(...v.eye_m.map((x,i)=>x-v.target_m[i]))<.001)throw Error('Invalid saved camera coordinates');
 }
 return n;
}
export function annotateRoomModel(model,n){
 validateNavigation(n,model);
 for(const item of model.items){const label=n.labels[item.id];if(label){item.name=label.name;item.category=label.category;item.labelStatus=label.status;item.labelEvidence=label.evidence}item.searchNames=[item.sourceName,...(label?.aliases??[])];}
 model.items.sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name,undefined,{numeric:true}));
 model.navigation=n;return model;
}
function overlaps(occurrence,rect){
 const b=occurrence.bounds;
 if(!finiteBox(b)){const [x,y]=occurrence.origin;return x>=rect[0]&&x<=rect[2]&&y>=rect[1]&&y<=rect[3]}
 // Components touching a boundary are included as shared context; large assemblies may span zones.
 return b.max[0]>=rect[0]-.001&&b.min[0]<=rect[2]+.001&&b.max[1]>=rect[1]-.001&&b.min[1]<=rect[3]+.001;
}
export function roomSlice(model,zoneId='all'){
 const zone=model.navigation?.zones.find(z=>z.id===zoneId);if(zoneId!=='all'&&!zone)throw Error('Unknown room zone');
 const occurrenceIds=new Set(),items=[];
 for(const item of model.items){
  const occurrences=item.occurrences.filter(o=>!zone||zone.rectangles.some(r=>overlaps(o,r)));if(!occurrences.length)continue;
  const bounds=box();for(const o of occurrences)merge(bounds,finiteBox(o.bounds)?o.bounds:{min:o.origin,max:o.origin});
  const sizes=occurrences.filter(o=>finiteBox(o.bounds)).map(o=>o.bounds.max.map((v,i)=>v-o.bounds.min[i]));
  for(const o of occurrences)occurrenceIds.add(o.id);
  items.push({...item,totalQuantity:item.quantity,quantity:occurrences.length,occurrences,bounds,sizeRanges:[0,1,2].map(i=>sizes.length?[Math.min(...sizes.map(s=>s[i])),Math.max(...sizes.map(s=>s[i]))]:null)});
 }
 return {zoneId,zone,occurrenceIds,items};
}
export function boundsForZone(model,zoneId='all'){
 if(zoneId==='all')return model.bounds;
 const zone=model.navigation?.zones.find(z=>z.id===zoneId);if(!zone)throw Error('Unknown room zone');
 const b=box();for(const r of zone.rectangles)merge(b,{min:[r[0],r[1],0],max:[r[2],r[3],Math.max(3,model.bounds.max[2])]});return b;
}
export function cameraForView(model,viewId='overview',zoneId='all'){
 const saved=model.navigation?.views.find(v=>v.id===viewId);
 // A source camera retains the whole room as context, including objects across a zone boundary.
 if(saved)return {eye:[...saved.eye_m],target:[...saved.target_m],fov:saved.fov,zoneId:'all',focusZoneId:saved.zone_id,cutaway:false,interior:true};
 if(!['overview','zone-overview','top'].includes(viewId))throw Error('Unknown viewpoint');
 const b=boundsForZone(model,viewId==='overview'?'all':zoneId),target=b.min.map((v,i)=>(v+b.max[i])/2),span=Math.max(...b.max.map((v,i)=>v-b.min[i]),.3);
 return {eye:target.map((v,i)=>v+(viewId==='top'?[.001,-.001,span*1.8]:[span,-span,span*.8])[i]),target,fov:42,zoneId:viewId==='overview'?'all':zoneId,cutaway:true,interior:false};
}
export function navigationFromSearch(search,n){
 const p=new URLSearchParams(search),view=p.get('view')??(p.has('zone')?'zone-overview':'overview'),zone=p.get('zone')??'all';
 const validView=['overview','zone-overview','top',...n.views.map(v=>v.id)].includes(view)?view:'zone-overview';
 const saved=n.views.find(v=>v.id===validView);
 return {viewId:validView,zoneId:saved||validView==='overview'?'all':n.zones.some(z=>z.id===zone)?zone:'all'};
}

export const DISCIPLINES={structure:'Structure',architecture:'Architecture',mep:'MEP',interior:'Interior',shared:'Shared'};
export const BASIS={source:'Source',model:'Model',scenario:'Scenario',proposal:'Proposed',study:'Study only',pending:'Pending',reference:'Reference'};
export const FLOORS={all:'All floors',foundation:'Foundation',ground:'Ground',first:'First',second:'Second',roof:'Roof',site:'Site'};
export function taskDiscipline(t){
 if(t.phase==='preparation')return t.measure==='grids'?'structure':'shared';
 if(t.phase==='handover')return t.id==='commission'?'mep':'shared';
 if(['electrical','plumbing','septic'].includes(t.measure)||t.phase==='services')return 'mep';
 if(['foundation','plinth','frame'].includes(t.phase))return 'structure';
 if(t.phase==='masonry')return /^(steel-|sill-concrete|lintel-concrete)/.test(t.measure)?'structure':'architecture';
 if(t.phase==='external')return 'architecture';
 return ['windows','doors','railing','waterproof'].includes(t.measure)?'architecture':'interior';
}
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const floorFor=(r,t,byId)=>{const levels=[...new Set((r.component_ids??[]).map(id=>(byId.get(id)??byId.get(id.replace(/^room-floor-/,'')))?.level).filter(Boolean))];return levels.length===1?levels[0]:r.id==='roof-waterproof'?'roof':t.scope;};
export function createQuantityRegister(packages,mep,components=[]){
 const byId=new Map(components.map(c=>[c.id,c])),items=[],omitted=[];
 const addGroup=(groups,key,row,meta)=>{let group=groups.get(key);if(!group){group={...meta,lines:[]};groups.set(key,group);}if(row.value!==null&&(!Number.isFinite(row.value)||row.value<0))throw Error('Invalid quantity: '+row.id);group.lines.push({...row});};
 for(const {task,rows} of packages){
  if(taskDiscipline(task)==='mep'){omitted.push({task:task.id,reason:'The v7 route/fixture register replaces legacy schematic service quantities; original work package remains available.'});continue;}
  const groups=new Map();
  for(const r of rows.filter(r=>r.sum!==false)){
   const c=byId.get(r.component_ids?.[0]),floor=floorFor(r,task,byId);
   let reference='';
   if(task.id==='formation')reference='Reference to the excavation envelope, not a second excavation bill quantity. Formation preparation is not separately measured.';
   if(task.measure==='grids')reference='Setting-out grid reference, not a construction material quantity.';
   if(/^wall-.*-layout$/.test(task.id))reference='Opening layout reference; installed opening instances are listed under Doors and Windows.';
   if(task.id==='primer')reference='Legacy paint-coat scenario repeated for primer; separate primer coverage/coats have not been specified.';
   if(task.measure==='fixtures'&&c?.kind==='sanitary fixture'){omitted.push({task:task.id,line:r.id,reason:'Source-linked v7 fixture register is shown instead.'});continue;}
   if(task.measure==='fixtures'&&['worktop','appliance'].includes(c?.kind))reference=c.kind==='worktop'?'Worktop instance reference; its area is listed under Granite.':'Appliance reference; the same proposed item is listed under Furniture.';
   const basis=reference?'reference':r.value===null?'pending':r.status==='Unmeasured'?'pending':slug(r.status),key=[floor,r.unit,basis,r.value===null?'unknown':'known'].join('|');
   addGroup(groups,key,r,{discipline:taskDiscipline(task),task_id:task.id,code:task.code,label:task.label,floor,unit:r.unit,basis,reference,origin:'building',source_path:'../v6/?work='+encodeURIComponent(task.id)+'#measurement-tables'});
  }
  for(const [index,g]of [...groups.values()].entries())items.push({...g,id:'B-'+task.id+'-'+(index+1),quantity:g.lines.some(r=>r.value===null)?null:g.lines.reduce((n,r)=>n+r.value,0)});
 }
 const routes=new Map();
 for(const r of mep.runs){const key=[r.system,r.size,r.level,r.task_id].join('|');addGroup(routes,key,{id:r.id,label:r.id+' · '+r.size,value:r.length_m,unit:'m',formula:r.takeoff_basis,status:'Proposal',pages:[],component_ids:[r.id],note:r.note},{discipline:'mep',task_id:r.task_id,code:r.task_id,label:(mep.system_names?.[r.system]??r.system)+' · '+r.size,floor:r.level,unit:'m',basis:'proposal',origin:'mep',system:r.system,source_path:'../v7/?system='+encodeURIComponent(r.system)+'&level='+encodeURIComponent(r.level)+'&run='+encodeURIComponent(r.id)+'#four-views'});}
 for(const [index,g]of [...routes.values()].entries())items.push({...g,id:'M-route-'+(index+1),quantity:g.lines.reduce((n,r)=>n+r.value,0)});
 for(const f of mep.fixtures)items.push({id:'M-fixture-'+f.id,code:f.id,label:f.label,discipline:'mep',floor:f.level,unit:'No.',quantity:1,basis:'model',origin:'mep',task_id:null,source_path:'../v7/#locations',lines:[{id:f.id,label:f.label,value:1,unit:'No.',status:'Model',formula:'One fixture record in the v7 model; not an installed-site count.',note:f.position_status+' · '+f.evidence,pages:[],component_ids:[f.id]}]});
 for(const equipment of mep.equipment)items.push({id:'M-equipment-'+equipment.id,code:equipment.id,label:equipment.label,discipline:'mep',floor:'all',unit:'—',quantity:null,basis:'pending',origin:'mep',task_id:null,source_path:'../v7/#calculations',lines:[{id:equipment.id,label:equipment.label,value:null,unit:'—',status:'Unmeasured',formula:equipment.detail,note:equipment.status,pages:[],component_ids:[]}]});
 const order=['structure','architecture','mep','interior','shared'];items.sort((a,b)=>order.indexOf(a.discipline)-order.indexOf(b.discipline)||a.code.localeCompare(b.code,undefined,{numeric:true})||a.id.localeCompare(b.id));
 if(new Set(items.map(i=>i.id)).size!==items.length)throw Error('Duplicate BOQ item ID');
 return {items,omitted,scope:'Unpriced quantity register; source/model/scenario/proposal quantities remain distinct. Study and reference rows are not procurement totals.',no_grand_quantity_total:true};
}
export function filterItems(items,{discipline='all',floor='all',query='',basis='all'}={}){
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return items.filter(r=>(discipline==='all'||r.discipline===discipline)&&(floor==='all'||r.floor===floor||r.floor==='all')&&(basis==='all'||(basis==='quantified'?r.quantity!==null&&!['reference','study'].includes(r.basis):r.basis===basis))&&words.every(w=>[r.code,r.task_id,r.label,r.floor,r.discipline,r.unit,...r.lines.map(l=>l.label+' '+l.id)].join(' ').toLowerCase().includes(w)));
}
export function workspaceState(params){
 const valid=(key,values,fallback)=>values.includes(params.get(key))?params.get(key):fallback;
 return {panel:valid('panel',['overview','views','boq','gantt','sources'],'overview'),discipline:valid('discipline',['all',...Object.keys(DISCIPLINES)],'all'),floor:valid('floor',Object.keys(FLOORS),'all'),query:params.get('q')??'',basis:valid('basis',['all','quantified',...Object.keys(BASIS)],'all'),programme:valid('programme',['building','mep'],'building'),item:params.get('item'),task:params.get('task')};
}
export function groupProgramme(schedule,filters={}){
 const words=(filters.query??'').trim().toLowerCase().split(/\s+/).filter(Boolean),rows=schedule.tasks.filter(t=>(!filters.discipline||filters.discipline==='all'||t.discipline===filters.discipline)&&(!filters.floor||filters.floor==='all'||t.scope==='all'||t.scope===filters.floor)&&words.every(w=>[t.code,t.id,t.label,t.phase].join(' ').toLowerCase().includes(w))),groups=new Map();
 for(const t of rows){if(!groups.has(t.phase))groups.set(t.phase,{id:t.phase,start:t.start,finish:t.finish,tasks:[]});const g=groups.get(t.phase);g.start=Math.min(g.start,t.start);g.finish=Math.max(g.finish,t.finish);g.tasks.push(t);}
 return [...groups.values()];
}
export const csv=rows=>rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';

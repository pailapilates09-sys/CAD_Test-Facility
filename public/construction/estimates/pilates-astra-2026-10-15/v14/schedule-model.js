// Original deterministic, day-slot resource scheduler. No external scheduler code.
export const phases={preparation:'01 · Measure & approve',procurement:'02 · Supply & fabricate',firstfix:'03 · Frames & concealed services',finishes:'04 · Boards, putty & fixed finishes',secondfix:'05 · Paint & service fittings',flooring:'06 · Flooring',furnishing:'07 · Furniture & dressing',handover:'08 · Test, clean & hand over'};
const finite=(n,label,min=0,max=100000)=>{if(!Number.isFinite(n)||n<min||n>max)throw Error('Invalid '+label);return n;};
const whole=(n,label,min=0,max=365)=>{finite(n,label,min,max);if(!Number.isInteger(n))throw Error(label+' must be a whole number');return n;};
export function validateScenario(rules,input={}){
 if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['mode','start_date','floor_area_m2','floor_reserve_days','capacities'].includes(k)))throw Error('Unknown or invalid planning scenario');
 const closed=rules.calendar.closed_weekdays;if(!Array.isArray(closed)||closed.length>6||new Set(closed).size!==closed.length||closed.some(n=>!Number.isInteger(n)||n<0||n>6))throw Error('Invalid working calendar');
 const ids=new Set();for(const p of rules.profiles){if(ids.has(p.id))throw Error('Duplicate productivity profile');ids.add(p.id);for(const key of ['low','base','high'])finite(p.output_per_crew_day[key],'daily output',.00001);if(p.output_per_crew_day.low>p.output_per_crew_day.base||p.output_per_crew_day.base>p.output_per_crew_day.high)throw Error('Invalid output sensitivity order');whole(p.lead_calendar_days,'supplier lead');}

 const s={mode:'base',start_date:'',floor_area_m2:null,floor_reserve_days:rules.allowances.flooring_reserve_workdays,capacities:Object.fromEntries(rules.resources.map(r=>[r.id,r.capacity])),...input};
 s.capacities={...Object.fromEntries(rules.resources.map(r=>[r.id,r.capacity])),...input.capacities};
 if(!['low','base','high'].includes(s.mode))throw Error('Unknown productivity case');
 if(s.start_date&&(!/^\d{4}-\d{2}-\d{2}$/.test(s.start_date)||!Number.isFinite(Date.parse(s.start_date+'T00:00:00Z'))||new Date(s.start_date+'T00:00:00Z').toISOString().slice(0,10)!==s.start_date))throw Error('Invalid start date');
 whole(s.floor_reserve_days,'Flooring reserve',1,30);if(s.floor_area_m2!=null)finite(s.floor_area_m2,'measured flooring area',.01,10000);
 for(const [id,n]of Object.entries(s.capacities)){if(!rules.resources.some(r=>r.id===id))throw Error('Unknown resource '+id);whole(n,id+' capacity',1,30);}
 return s;
}
export function isWorkingDay(day,scenario,rules){const start=scenario.start_date?new Date(scenario.start_date+'T00:00:00Z').getUTCDay():0;return !rules.calendar.closed_weekdays.includes((start+day)%7)&&!rules.calendar.holidays.includes(dateAt(day,scenario));}
export function dateAt(day,scenario){if(!scenario.start_date)return 'Day '+(day+1);const d=new Date(scenario.start_date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+day);return d.toISOString().slice(0,10);}
export function productionDuration(quantity,profile,mode='base',fraction=1){finite(quantity,'work quantity');finite(fraction,'work fraction',0,1);const output=profile.output_per_crew_day[mode];finite(output,'daily production',.00001);return {crew_days:quantity*fraction/output,workdays:quantity===0?0:Math.max(1,Math.ceil(quantity*fraction/output-1e-10)),output,formula:`${quantity.toFixed(4)} ${profile.unit} × ${fraction} ÷ ${output.toFixed(4)} ${profile.unit}/crew-day; round up occupied workdays`};}
export function makeActivities(inputs,rules,scenario){
 const tasks=[],workRows=[],profileById=new Map(rules.profiles.map(p=>[p.id,p]));
 const add=(id,label,phase,depends,{work=null,crew={},workdays=0,elapsed_days=0,quantity=null,unit=null,basis='Explicit planning allowance; confirm with contractor',source_ids=[],crew_days=null,conditional=false,note=''}={})=>{const t={id,label,phase,depends:[...new Set(depends)],work_id:work?.id??null,area:work?.area??'project',crew,workdays,elapsed_days,quantity,unit,basis,source_ids,crew_days,conditional,note};tasks.push(t);return id;};
 const wait=(id,label,phase,depends,days,note)=>add(id,label,phase,depends,{elapsed_days:days,basis:'Elapsed calendar-day planning allowance',note,conditional:true});
 const produce=(w,id,label,phase,depends,profile,fraction=1)=>{const d=productionDuration(w.quantity_si,profile,scenario.mode,fraction);return add(id,label,phase,depends,{work:w,crew:profile.crew,workdays:d.workdays,quantity:w.quantity_si,unit:profile.unit,basis:d.formula,source_ids:profile.source_ids,crew_days:d.crew_days,conditional:profile.evidence!=='direct_norm',note:profile.qualification});};
 const approvals=add('measure-approve','Measure, coordinate scope & approve shop drawings','preparation',[],{crew:{coordinator:1},workdays:2,conditional:true,note:'Confirm actual opening sizes, cabinet depths, ceiling heights, substrate dryness, flooring area, circuits and service routes. No source quantity is invented.'});
 const protect=add('site-protection','Protect access, retained finishes & studio equipment','preparation',[approvals],{crew:{helper:2},workdays:1,conditional:true});
 const supply=new Map();
 for(const p of rules.profiles)if(inputs.works.some(w=>w.profile_id===p.id&&!w.held&&w.quantity_si>0))supply.set(p.id,wait('supply-'+p.id,p.label+' · measure, order & supplier lead','procurement',[approvals],p.lead_calendar_days,'Supplier lead is an unquoted planning allowance, not confirmed stock or a delivery promise.'));
 const active=inputs.works.filter(w=>!w.held&&w.quantity_si>0),frames=[],boardWorks=[];
 for(const w of active.filter(w=>['partition','ceiling'].includes(w.profile_id))){const p=profileById.get(w.profile_id);frames.push(produce(w,w.id+'-frame',w.title+' · framing','firstfix',[protect,supply.get(p.id)],p,.35));boardWorks.push(w);}
 const rough=add('electrical-first-fix','Electrical allowance · concealed routes & first fix','firstfix',frames.length?frames:[protect],{crew:{electrician:1,assistant:1},workdays:rules.allowances.electrical_first_fix_days,conditional:true,note:'Original electrical allowance has no circuit lengths or point schedule. This is a visible reserved slot; detailed scope may change it. Quoted final fixtures are scheduled separately.'});
 const pipe=add('plumbing-first-fix','Sink supply, waste & AC condensate route check','firstfix',frames.length?frames:[protect],{crew:{plumber:1,assistant:1},workdays:1,conditional:true,note:'Only a quoted kitchen sink/tap is measured; concealed pipe lengths and condensate routes are unmeasured.'});
 const hvac=add('hvac-first-fix','AC sleeves, drains, brackets & first fix','firstfix',frames.length?frames:[protect],{crew:{hvac:2,assistant:1},workdays:2,conditional:true});
 const inspect=add('first-fix-inspection','Inspect concealed services before board closure','firstfix',[rough,pipe,hvac],{crew:{coordinator:1},workdays:1,conditional:true,note:'Inspection and acceptance control closure; reaching a planned date does not release it.'});
 const boards=boardWorks.map(w=>produce(w,w.id+'-close',w.title+' · boarding & joints','finishes',[inspect],profileById.get(w.profile_id),.65));
 const dry=wait('board-dry','Board joints · drying and acceptance','finishes',boards.length?boards:[inspect],1,'One overnight planning buffer. Use the selected joint compound data and site conditions; no generic masonry curing period is implied.');
 const baseReady=[],paintWorks=[];
 for(const w of active.filter(w=>['paint','putty'].includes(w.profile_id))){
  const prep=produce(w,w.id+'-putty',w.title+' · preparation & putty','finishes',[dry,supply.get(w.profile_id)],profileById.get('putty'));
  const dryPutty=wait(w.id+'-putty-dry',w.title+' · putty drying','finishes',[prep],1,'Asian Paints Nepal example system specifies 6–8 h between putty stages at 25°C / 50% RH; reserve an overnight slot. Product and substrate must be accepted.');tasks.at(-1).work_id=w.id;tasks.at(-1).area=w.area;tasks.at(-1).source_ids=['ASIAN_PAINTS_NEPAL'];
  if(w.profile_id==='paint'){baseReady.push(produce(w,w.id+'-basecoat',w.title+' · primer & first coat','finishes',[dryPutty],profileById.get('paint-base')));paintWorks.push(w);}else baseReady.push(dryPutty);
 }
 const base=add('base-finish-ready','Dry base finishes accepted for fixed installations','finishes',[dry,...baseReady]);
 const fixed=[],final=[];
 for(const w of active.filter(w=>!['partition','ceiling','paint','putty'].includes(w.profile_id))){
  const p=profileById.get(w.profile_id);let deps=[base,supply.get(p.id)];
  if(['joinery','rack'].includes(p.id)){
   const shop=produce(w,w.id+'-shop',w.title+' · workshop fabrication','procurement',[approvals,supply.get(p.id),...frames],profileById.get('joinery-shop'));
   fixed.push(produce(w,w.id+'-install',w.title+' · site installation','finishes',[base,shop],p));
  }else if(['stone','framed-panels','surface-panel','rattan','skirting','glass-door'].includes(p.id)){
   if(p.id==='stone')deps.push(...active.filter(x=>x.area===w.area&&['joinery','rack'].includes(x.profile_id)).map(x=>x.id+'-install'));
   fixed.push(produce(w,w.id+'-install',w.title+' · fix and finish','finishes',deps,p));
  }else final.push({w,p,deps});
 }
 const fixedDone=add('fixed-finishes-ready','Fixed joinery, panels & stone complete','finishes',[base,...fixed]);
 const finalPaint=[];
 for(const w of paintWorks){const dryBase=wait(w.id+'-base-dry',w.title+' · recoat / protection check','secondfix',[w.id+'-basecoat',fixedDone],1,'Nepal example emulsion system requires 4–6 h between coats at stated conditions. Reserve an overnight interval and check surface dryness.');tasks.at(-1).work_id=w.id;tasks.at(-1).area=w.area;tasks.at(-1).source_ids=['ASIAN_PAINTS_NEPAL'];finalPaint.push(produce(w,w.id+'-finalcoat',w.title+' · final paint coat','secondfix',[dryBase],profileById.get('paint-final')));}
 const paintDone=add('paint-ready','Paint dry; dusty fixed work complete','secondfix',[fixedDone,...finalPaint]);
 const overhead=[],dress=[];
 for(const x of final){if(['wiring','lights','hanging-lights','ceiling-points','ac','plumbing','sign'].includes(x.p.id)){const deps=[paintDone,...x.deps];if(x.p.id==='plumbing')deps.push(...fixed);overhead.push(produce(x.w,x.w.id+'-fit',x.w.title+' · final fitting','secondfix',deps,x.p));}else dress.push(x);}
 const test=add('services-test','Electrical safety, water / drain and AC function tests','secondfix',[paintDone,...overhead],{crew:{electrician:1,plumber:1,coordinator:1},workdays:1,conditional:true,note:'Recorded tests and defects must be accepted. This is a planning slot, not a test result or engineering approval.'});
 const floorSupply=wait('supply-flooring','Flooring selection, measure & procurement reserve','procurement',[approvals],profileById.get('flooring').lead_calendar_days,'Unmeasured allowance; supplier lead is conditional and must be replaced by a real measured order and product readiness.');
 let floor;
 if(scenario.floor_area_m2!=null){const p=profileById.get('flooring'),d=productionDuration(scenario.floor_area_m2,p,scenario.mode);floor=add('flooring-allowance','Laminate flooring · measured session scenario','flooring',[test,floorSupply],{crew:p.crew,workdays:d.workdays,quantity:scenario.floor_area_m2,unit:'m2',crew_days:d.crew_days,basis:d.formula,conditional:true,note:'Owner-entered measured-area scenario; original flooring allowance remains unmeasured and unchanged.'});}
 else floor=add('flooring-allowance','Laminate flooring · UNMEASURED reserved slot','flooring',[test,floorSupply],{crew:profileById.get('flooring').crew,workdays:scenario.floor_reserve_days,conditional:true,note:'No area is recorded in v0–v13. The explicit '+scenario.floor_reserve_days+'-workday reserve allows a conditional sequence; actual installation duration and material lead remain unknown.'});
 const furnished=[];
 for(const {w,p,deps}of dress)furnished.push(produce(w,w.id+'-fit',w.title+' · deliver, fix & protect','furnishing',[floor,...deps],p));
 const snag=add('snags','Inspect, correct minor damage & close defects','handover',[floor,...overhead,...furnished],{crew:{painter:1,helper:1},workdays:2,conditional:true});
 const clean=add('clean','Final cleaning, protection removal & waste clearance','handover',[snag],{crew:{helper:2},workdays:1,conditional:true});
 const accept=add('handover','Owner review, manuals, warranties & handover','handover',[clean],{crew:{coordinator:1},workdays:1,conditional:true,note:'Opening remains subject to approved scope, all held/allowance decisions, test acceptance and applicable approvals.'});
 add('opening-review','Conditional opening review · no automatic release','handover',[accept]);
 for(const w of inputs.works){const p=profileById.get(w.profile_id);if(!p)throw Error('Missing profile '+w.profile_id);workRows.push({...w,state:w.held?'on_hold':w.quantity_si===0?'zero_quantity':'planned',activity_ids:tasks.filter(t=>t.work_id===w.id).map(t=>t.id)});}
 // Enforce a project-wide concurrent site headcount in addition to trade capacity.
 for(const t of tasks)if(t.phase!=='procurement'&&Object.keys(t.crew).length)t.crew={...t.crew,site_space:Object.entries(t.crew).reduce((n,[id,count])=>n+(id==='coordinator'?0:count),0)};
 const counts={};for(const t of tasks){const index=Object.keys(phases).indexOf(t.phase)+1;counts[t.phase]=(counts[t.phase]??0)+1;t.code=String(index).padStart(2,'0')+'.'+String(counts[t.phase]).padStart(2,'0');}return {tasks,works:workRows};
}
export function validateActivities(tasks,capacities){
 const map=new Map();for(const t of tasks){if(!/^[a-z][a-z0-9-]*$/.test(t.id)||map.has(t.id))throw Error('Duplicate or invalid activity ID');map.set(t.id,t);whole(t.workdays,'workdays');whole(t.elapsed_days,'elapsed days');if(t.workdays&&t.elapsed_days)throw Error('Activity cannot mix elapsed and productive time');if(new Set(t.depends).size!==t.depends.length)throw Error('Duplicate predecessor');for(const [id,n]of Object.entries(t.crew)){whole(n,'crew demand',0,30);if(!(id in capacities)||n>capacities[id])throw Error(t.label+' needs '+n+' '+id+'; available '+capacities[id]);}}
 const visited=new Set(),stack=new Set(),order=[];function visit(id){if(visited.has(id))return;if(stack.has(id))throw Error('Cyclic work dependencies');const t=map.get(id);if(!t)throw Error('Missing predecessor '+id);stack.add(id);t.depends.forEach(visit);stack.delete(id);visited.add(id);order.push(t);}tasks.forEach(t=>visit(t.id));return order;
}
function allocation(t,start,scenario,rules){if(t.elapsed_days)return {start,finish:start+t.elapsed_days,days:[]};if(!t.workdays)return {start,finish:start,days:[]};const days=[];let d=start;while(days.length<t.workdays&&d<3000){if(isWorkingDay(d,scenario,rules))days.push(d);d++;}if(days.length!==t.workdays)throw Error('Programme exceeds planning horizon');return {start:days[0],finish:days.at(-1)+1,days};}
export function scheduleActivities(tasks,rules,scenario,{level=true}={}){
 const order=validateActivities(tasks,scenario.capacities),map=new Map(order.map(t=>[t.id,t])),tail=new Map();
 function length(id){if(tail.has(id))return tail.get(id);const t=map.get(id),n=t.workdays+t.elapsed_days+Math.max(0,...tasks.filter(s=>s.depends.includes(id)).map(s=>length(s.id)));tail.set(id,n);return n;}order.forEach(t=>length(t.id));
 const done=new Map(),usage=[];
 while(done.size<tasks.length){const ready=order.filter(t=>!done.has(t.id)&&t.depends.every(id=>done.has(id))).sort((a,b)=>length(b.id)-length(a.id)||a.id.localeCompare(b.id));if(!ready.length)throw Error('No ready activities');const t=ready[0],earliest=Math.max(0,...t.depends.map(id=>done.get(id).finish));let result=null,capacityReason=new Set();
  for(let candidate=earliest;candidate<3000;candidate++){const slot=allocation(t,candidate,scenario,rules);const failed=slot.days.flatMap(day=>Object.entries(t.crew).filter(([id,n])=>level&&(usage[day]?.[id]??0)+n>scenario.capacities[id]).map(([id])=>id));if(failed.length){failed.forEach(id=>capacityReason.add(id));continue;}result={...t,...slot,dependency_ready:earliest,resource_wait_days:Math.max(0,slot.start-allocation(t,earliest,scenario,rules).start),resource_wait_for:[...capacityReason]};break;}
  if(!result)throw Error('No feasible crew slot inside planning horizon');for(const day of result.days){usage[day]??={};for(const [id,n]of Object.entries(t.crew))usage[day][id]=(usage[day][id]??0)+n;}done.set(t.id,result);
 }
 return {tasks:tasks.map(t=>done.get(t.id)),duration:Math.max(...[...done.values()].map(t=>t.finish)),usage};
}
export function auditSchedule(plan,rules,scenario){const byId=new Map(plan.tasks.map(t=>[t.id,t]));for(const t of plan.tasks){if(!Number.isFinite(t.start)||t.finish<t.start||t.depends.some(id=>byId.get(id).finish>t.start))throw Error('Precedence violation');if(t.days.some(d=>!isWorkingDay(d,scenario,rules)))throw Error('Closed-day crew booking');for(const [id,n]of Object.entries(t.crew))for(const d of t.days)if(plan.usage[d][id]>scenario.capacities[id])throw Error('Resource overload');}return true;}
export function buildProgramme(inputs,rules,input={}){
 const scenario=validateScenario(rules,input),model=makeActivities(inputs,rules,scenario),baseline=scheduleActivities(model.tasks,rules,scenario,{level:false}),levelled=scheduleActivities(model.tasks,rules,scenario),bm=new Map(baseline.tasks.map(t=>[t.id,t]));
 for(const t of levelled.tasks){t.baseline_start=bm.get(t.id).start;t.baseline_finish=bm.get(t.id).finish;}
 const works=model.works.map(w=>{const ts=levelled.tasks.filter(t=>t.work_id===w.id);return {...w,start:ts.length?Math.min(...ts.map(t=>t.start)):null,finish:ts.length?Math.max(...ts.map(t=>t.finish)):null,productive_crew_days:ts.length?ts.reduce((n,t)=>n+(t.crew_days??0),0):null};});
 const plan={...levelled,works,scenario,baseline_duration:baseline.duration,capacity_extension_days:levelled.duration-baseline.duration,checks:{precedence_valid:true,calendar_valid:true,capacities_valid:true},release:'CONDITIONAL_PLANNING_ONLY',full_project_completion_confirmed:false};auditSchedule(plan,rules,scenario);return plan;
}

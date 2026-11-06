import {auditSchedule,scheduleActivities} from '../public/construction/estimates/pilates-astra-2026-10-15/v14/schedule-model.js';

const trade={
 board:'Gypsum crew',paint:'Paint crew',shop:'Joinery workshop',joinery:'Site joinery crew',
 stone:'Stone crew',glass:'Glazing crew',floor:'Flooring crew',check:'Site coordination'
};
const m2PerSqFt=.09290304;
const fmt=new Intl.NumberFormat('en-IN',{maximumFractionDigits:2});
const e=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const daySpan=(start,finish)=>start+1===finish?'Day '+finish:'Days '+(start+1)+'–'+finish;
const itemAnchor=id=>'selected-work-'+String(id).padStart(2,'0');

export function buildSelectedProgramme(items,astraRules,{paintCrews=1}={}){
 if(![1,2].includes(paintCrews))throw Error("Use one or two separate paint crews");
 const byId=new Map(items.map(w=>[w.id,w]));
 if(items.length!==12||Array.from({length:12},(_,i)=>i+1).some(id=>byId.get(id)?.unit!=='sq ft'))throw Error('Review the programme mapping for the changed selected scope');
 const profiles=new Map(astraRules.profiles.map(p=>[p.id,p]));
 const output=id=>{
  const p=profiles.get(id),n=p?.output_per_crew_day.base;
  if(p?.unit!=='m2'||!Number.isFinite(n)||n<=0)throw Error('Missing area output assumption: '+id);
  return n;
 };
 const calendar={calendar:{closed_weekdays:[],holidays:[]}};
 const scenario={start_date:'',capacities:Object.fromEntries(Object.keys(trade).map(id=>[id,id==='paint'?paintCrews:1]))};
 const activities=[];
 const add=(id,label,lane,depends,{days,resource,kind='work',basis,note=''})=>{
  activities.push({id,label,lane,depends,kind,workdays:days,elapsed_days:0,crew:resource?{[resource]:1}:{},basis,note});
  return id;
 };
 const work=(workId,suffix,label,depends,resource,profile,fraction=1,note='')=>{
  const area=Number(byId.get(workId).qty)*m2PerSqFt*fraction,rate=output(profile);
  return add('w'+workId+'-'+suffix,label,'w'+workId,depends,{
   days:Math.max(1,Math.ceil(area/rate)),resource,
   basis:fmt.format(area)+' m² ÷ '+fmt.format(rate)+' m² per crew-day, rounded up',note
  });
 };
 const slot=(id,label,lane,depends,days,note)=>add(id,label,lane,depends,{
  days,kind:'allowance',basis:days+' working-day slot'+(days===1?'':'s')+' reserved',note
 });
 const check=(id,label,depends,days,note)=>add(id,label,id,depends,{
  days,resource:'check',kind:'check',basis:'Planning check · '+days+' working day'+(days===1?'':'s'),note
 });
 const setup=check('start-check','Measure, approve and protect',[],2,'Confirm stock, dimensions, both granite scopes, the quoted gypsum build-up, access, work areas and fixed floor interfaces. Site start needs approval.');
 const frames=[5,12].map(id=>work(id,'frame','Set out and frame',[setup],'board','partition',.35));
 const closure=check('closure-check','Check framing and concealed work',frames,1,'Any services supplied by others need sign-off before the partitions are closed. Their installation is outside this extract.');
 const boardReady=new Map([5,12].map(id=>{
  const board=work(id,'board','Board and joint',[closure],'board','partition',.65);
  return [id,slot('w'+id+'-joint-dry','Joint compound drying','w'+id,[board],1,'Confirm the compound and site conditions before decorating.')];
 }));
 const readyPaint=new Map([4,6,10,11].map(id=>{
  const base=id===4?boardReady.get(5):id===11?boardReady.get(12):setup;
  const prep=work(id,'putty','Prepare, apply putty and sand',[base],'paint','putty',1,'The area output is a planning proxy for the quoted preparation and putty scope.');
  const dry=slot('w'+id+'-putty-dry','Putty drying','w'+id,[prep],1,'Use the selected product’s drying instructions.');
  const coat=work(id,'coat-one','First paint coat',[dry],'paint','paint-final');
  const recoat=slot('w'+id+'-recoat','Recoat interval','w'+id,[coat],1,'The second coat waits for the first coat to be ready.');
  const finish=work(id,'coat-two','Second paint coat',[recoat],'paint','paint-final');
  return [id,slot('w'+id+'-paint-ready','Paint ready for fittings','w'+id,[finish],1,'Confirm surface readiness before adjoining work.')];
 }));
 const counter=new Map([[2,4],[8,10]].map(([id,paint])=>{
  const shop=work(id,'shop','Workshop fabrication',[setup],'shop','joinery-shop',1,'Off-site work can overlap site finishing. Confirm dimensions and workshop capacity first.');
  return [id,work(id,'fit','Fit plywood table',[shop,readyPaint.get(paint)],'joinery','joinery')];
 }));
 const granite=[3,9].map(id=>{
  const bases=id===3?[counter.get(2),counter.get(8)]:[counter.get(8)];
  const measure=add('w'+id+'-template','Template and confirm scope','w'+id,bases,{
   days:1,resource:'stone',basis:'One crew-day allowed for templating',note:'Works 03 and 09 may overlap. Confirm the surfaces and release both scopes before cutting.'
  });
  const cut=slot('w'+id+'-cut','Stone cutting and polishing','w'+id,[measure],2,'Provisional supplier slot. Confirm both the fabrication date and whether these are distinct tops.');
  const install=work(id,'fit','Fit and finish granite',[cut],'stone','stone',1,'Astra stone output is a conservative proxy, not a rate measured for these tops.');
  return slot('w'+id+'-set','Adhesive set and acceptance','w'+id,[install],1,'Confirm adhesive and surface readiness before adjoining flooring.');
 });
 const measure=add('w7-measure','Measure glazing opening','w7',[boardReady.get(12)],{
  days:1,resource:'glass',basis:'One crew-day allowed for measurement',note:'Confirm 8 mm glass system, supports, hardware, track and finished floor clearance with the installer.'
 });
 const glassLead=slot('w7-lead','Glazing supplier lead','w7',[measure],10,'Ten working-day slots are reserved for supply. Confirm the supplier’s actual lead before dating this plan.');
 const glazing=work(7,'fit','Fit sliding glass partition',[glassLead,readyPaint.get(6),readyPaint.get(11)],'glass','glass-door',1,'The Astra glass-door productivity is a proxy for this larger partition. Confirm assembly and crew output.');
 const floorReady=check('floor-check','Release flooring area',[...granite,glazing,...readyPaint.values()],2,'Confirm substrate and product readiness, floor/track interface and required acclimation. This plan assumes the fixed tracks and joinery can precede laminate.');
 const floor=work(1,'lay','Install laminate and underlay',[floorReady],'floor','flooring');
 check('finish-check','Selected works walkthrough',[floor],1,'Check the finished surfaces and sliding door clearance; log snags. This milestone covers these 12 works only.');

 const plan=scheduleActivities(activities,calendar,scenario);
 auditSchedule(plan,calendar,scenario);
 const lanes=[...items.map(item=>{
  const id='w'+item.id;
  return {id,workId:item.id,label:item.title,area:item.area,tone:({1:'floor',2:'joinery',3:'stone',4:'paint',5:'board',6:'paint',7:'glass',8:'joinery',9:'stone',10:'paint',11:'paint',12:'board'})[item.id]};
 }),...activities.filter(x=>x.kind==='check').map(x=>({id:x.id,label:x.label,area:'Planning check',tone:'check'}))].map(lane=>{
  const tasks=plan.tasks.filter(x=>x.lane===lane.id).sort((a,b)=>a.start-b.start);
  return {...lane,tasks,start:tasks[0].start,finish:Math.max(...tasks.map(x=>x.finish)),
   crewDays:tasks.filter(x=>x.kind==='work').reduce((sum,x)=>sum+x.workdays,0)};
 }).sort((a,b)=>a.start-b.start||a.finish-b.finish);
 return {
  schema:'cad-buildera-2-programme-1',source:'selection.json',status:'illustrative',calendar:'Relative working days',
  duration:plan.duration,paintCrews,lanes,
  profiles:Object.fromEntries(['partition','putty','paint-final','joinery-shop','joinery','stone','glass-door','flooring'].map(id=>[id,output(id)])),
  activities:plan.tasks.map(t=>({...t,startDay:t.start+1,finishDay:t.finish}))
 };
}

export function selectedProgrammeCsv(plan){
 const rows=[['activity_id','work_id','activity','kind','first_working_day','last_working_day','slots','crew','predecessor_ids','basis','note'],
  ...plan.activities.map(a=>[a.id,a.lane.startsWith('w')?a.lane.slice(1):'',a.label,a.kind,a.startDay,a.finishDay,a.workdays,Object.keys(a.crew).map(id=>trade[id]).join('; '),a.depends.join('; '),a.basis,a.note])];
 return '\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}

export function renderSelectedProgramme(plan){
 const names=new Map(plan.activities.map(a=>[a.id,a.label]));
 const interval=Math.ceil(plan.duration/6/5)*5;
 const ticks=[1,...Array.from({length:Math.floor((plan.duration-3)/interval)},(_,i)=>(i+1)*interval),plan.duration];
 const pct=day=>(100*day/plan.duration).toFixed(4)+'%';
 const descriptions=lane=>lane.tasks.map(t=>t.label+': '+daySpan(t.start,t.finish)).join('; ');
 return `<section class="swx-section swx-programme" aria-labelledby="work-programme">
  <h2 id="work-programme">Work programme</h2>
  <div class="swx-plan-head"><p><strong>Illustrative finish: working day ${plan.duration}.</strong> The chart covers the 12 selected works, with separate readiness checks. Day 1 begins after access is agreed; calendar dates and supplier commitments are open.${plan.parallelPaintFinish?` If a second paint crew can work in separate areas, the same model finishes on working day ${plan.parallelPaintFinish}.`:""}</p>
  <a href="programme.csv" download>Export programme CSV</a></div>
  <div class="swx-gantt" aria-label="Selected works Gantt chart">
   <ul class="swx-legend" aria-label="Gantt key"><li><i aria-hidden="true"></i>Planned crew work</li><li><i data-kind="allowance" aria-hidden="true"></i>Supply or drying slot</li><li><i data-kind="check" aria-hidden="true"></i>Readiness check</li></ul>
   <div class="swx-gantt-head"><span>Work / planned window</span><div class="swx-axis" aria-hidden="true">${ticks.map((d,i)=>`<span style="--swx-x:${pct(i===0?0:i===ticks.length-1?plan.duration:d-.5)}">${d}</span>`).join('')}</div></div>
   <ol class="swx-lanes">${plan.lanes.map(lane=>`<li class="swx-lane" data-trade="${lane.tone}">
    <div class="swx-lane-label">${lane.workId?`<a href="#${itemAnchor(lane.workId)}">Work ${String(lane.workId).padStart(2,'0')} · ${e(lane.label)}</a>`:`<strong>${e(lane.label)}</strong>`}
    <small>${daySpan(lane.start,lane.finish)} · ${e(lane.area)}${lane.workId?' · '+lane.crewDays+' crew '+(lane.crewDays===1?'day':'days'):''}</small></div>
    <div class="swx-track" role="img" aria-label="${e(lane.label+': '+descriptions(lane))}">
    ${ticks.slice(1,-1).map(d=>`<i class="swx-gridline" aria-hidden="true" style="--swx-x:${pct(d-.5)}"></i>`).join('')}
    ${lane.tasks.map(t=>`<span class="swx-task" data-kind="${t.kind}" style="--swx-x:${pct(t.start)};--swx-span:${pct(t.finish-t.start)}" title="${e(t.label+' · '+daySpan(t.start,t.finish))}" aria-hidden="true"></span>`).join('')}
    </div></li>`).join('')}</ol>

  </div>
  <p class="swx-plan-note"><strong>Before ordering:</strong> confirm whether granite works 03 and 09 cover distinct surfaces. Confirm the gypsum build-up, measured glass opening, and how the glass track and laminate meet before releasing those works.</p>
  <details class="swx-plan-details"><summary>Planning basis, dependencies and crew bookings</summary>
   <p>Allow one crew per trade and a separate joinery workshop. Crews can work at the same time in different areas. The schedule uses the <a href="../pilates-astra-2026-10-15/v14/">Astra v14 planning outputs</a> as productivity assumptions and converts BuildEra 2 quantities with 1 sq ft = 0.09290304 m². Blank portions of a row are gaps between activities. Use the actual working calendar when assigning dates. Supplier, drying and acceptance slots need contractor confirmation; prices and amounts are kept separate.</p>
   <p>Laminate follows dry finishes, fixed joinery, granite and glazing in this sequence. This assumes clear floor access and a compatible track detail. The chart does not include other quoted or unquoted trades.</p>
   <ul class="swx-plan-steps">${plan.activities.slice().sort((a,b)=>a.start-b.start).map(t=>`<li><strong>${e(t.label)}</strong> · ${daySpan(t.start,t.finish)}${t.lane.startsWith('w')?' · Work '+t.lane.slice(1):''}<small>${e(t.basis)}${t.depends.length?' · After '+t.depends.map(id=>e(names.get(id))).join(', '):''}${t.note?' · '+e(t.note):''}</small></li>`).join('')}</ul>
  </details>
 </section>`;
}

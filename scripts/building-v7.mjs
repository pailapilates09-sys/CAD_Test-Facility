import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createMEP,SYSTEMS} from '../public/construction/models/basanti-workbench/v7/mep-model.js';
import {drawPlan,draw3D,drawProfile,drawConnection,drawGantt,drawSLD,esc} from '../public/construction/models/basanti-workbench/v7/mep-drawings.js';
const csv=rows=>rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
const put=(root,path,value)=>writeFile(new URL(path,root),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
export async function buildBuildingV7(root,dist){
 const base=new URL('construction/models/basanti-workbench/v7/',dist),sourceBase=new URL('public/construction/models/basanti-workbench/v7/',root),project=JSON.parse(await readFile(new URL('construction/models/basanti-residence/data/project.json',dist))),references=JSON.parse(await readFile(new URL('references.json',base))),model=createMEP(project);
 await mkdir(new URL('data/',base),{recursive:true});await mkdir(new URL('drawings/',base),{recursive:true});
 const hash=createHash('sha256');for(const path of ['mep-model.js','mep-drawings.js','v7.js','v7.css','index.html','references.json'])hash.update(await readFile(new URL(path,sourceBase)));hash.update(project.source_sha256);const revision=hash.digest('hex').slice(0,16);
 const header={schema:model.schema,revision,based_on:'v6',release:model.release,source_sha256:project.source_sha256,generated_from:'v7/mep-model.js; original building model remains unchanged',date:'2026-10-29'};
 await put(base,'data/mep.json',{...header,...model});await put(base,'data/calculations.json',{...header,...model.calculations});await put(base,'data/connections.json',{...header,details:model.connections});await put(base,'data/checks.json',{...header,routes:model.runs.length,nodes:model.nodes.length,fixtures:model.fixtures.length,circuits:model.circuits.length,tasks:model.schedule.tasks.length,workdays:model.schedule.working_days,engineering_release:false,local_bylaw_verified:false});
 await put(base,'data/routes.csv',csv([['route_id','service','size','level','from','to','route_m','route_ft','task','status','basis','note'],...model.runs.map(r=>[r.id,SYSTEMS[r.system].name,r.size,r.level,r.from,r.to,r.length_m,r.length_m/.3048,r.task_id,r.status,r.takeoff_basis,r.note])]));
 await put(base,'data/circuits.csv',csv([['circuit','description','phase','watts','PF','Ib_A','breaker_A','Cu_mm2','PE_mm2','conduit_mm','Iz_conditional_A','total_drop_percent','thermal_screen_pass','drop_screen_pass','rcbo','release'],...model.calculations.electrical.circuits.map(c=>[c.id,c.label,c.phase,c.watts,c.pf,c.current_a,c.breaker_a,c.copper_mm2,c.cpc_mm2,c.conduit_mm,c.conditional_iz_a,c.total_drop_percent,c.thermal_pass,c.drop_pass,c.rcbo,'PRELIMINARY; FAULT / UTILITY / PRODUCT CHECKS PENDING'])]));
 await put(base,'data/programme.csv',csv([['task_id','task','system','phase','start_workday','finish_workday','duration_workdays','crew','predecessors','gate'],...model.schedule.tasks.map(t=>[t.id,t.label,t.system,t.phase,t.start,t.finish,t.days,t.crew,t.after.join(' '),t.gate])]));
 const drawings=[];async function drawing(path,body,label){await put(base,'drawings/'+path,body);drawings.push({path:'../drawings/'+path,label});}
 for(const level of ['ground','first','second','roof'])await drawing('mep-'+level+'.svg',drawPlan(model,project,{system:level==='roof'?'rain':'all',level,labels:'selected'}),level+' MEP plan');
 await drawing('mep-3d.svg',draw3D(model,project,{system:'all',level:'all'}),'All-service 3D');await drawing('mep-gantt.svg',drawGantt(model,{system:'all'}),'Full MEP Gantt');await drawing('electrical-sld.svg',drawSLD(model),'Electrical single line');
 for(const detail of model.connections)await drawing(detail.id+'.svg',drawConnection(detail,model),detail.label);
 for(const route of model.runs)await drawing(route.id+'-profile.svg',drawProfile(model,route.id),route.id+' dimensioned route profile');
 await put(base,'data/drawing-register.json',{...header,drawings});
 let html=await readFile(new URL('index.html',base),'utf8');
 const state={system:'cold',level:'ground',selected:'CW-G-B',labels:'selected'};
 const renderedRefs=references.sources.map(r=>`<details id="ref-${r.id}"><summary>${r.id} · ${esc(r.title)}</summary><p><strong>${esc(r.publisher)}</strong> · ${esc(r.locator)}</p><p>${esc(r.application)}</p><p><em>Scope:</em> ${esc(r.limitations)}</p><p class="small-note">${esc(r.verification)}</p><a href="${esc(r.url)}">Open source →</a></details>`).join('');
 html=html.replace('<!-- MEP_STATS -->',[[model.runs.length,'service routes'],[model.circuits.length,'final circuits'],['600 L/day','6-person demand scenario'],[model.schedule.working_days+' workdays','conditional MEP sequence']].map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join('')).replace('<!-- MEP_PLAN -->',drawPlan(model,project,state)).replace('<!-- MEP_3D -->',draw3D(model,project,state)).replace('<!-- MEP_GANTT -->',drawGantt(model,{system:'all'})).replace('<!-- MEP_SLD -->',drawSLD(model)).replace('<!-- MEP_ISSUES -->',model.issues.map(i=>`<details><summary>${esc(i.id+' · '+i.status+' · '+i.label)}</summary><p>${esc(i.detail)} <a href="#ref-${i.ref}">[${i.ref}]</a></p></details>`).join('')).replace('<!-- MEP_REFERENCES -->',renderedRefs).replaceAll('MEP_REVISION',revision);
 await put(base,'index.html',html);
 // Scope cache revisions to new modules only; never rewrite prior-version scripts.
 for(const file of ['mep-model.js','mep-drawings.js','v7.js']){let text=await readFile(new URL(file,sourceBase),'utf8');text=text.replaceAll('MEP_REVISION',revision).replace(/from\s*(['"])(\.\/[^'"]+\.js)\1/g,(_,q,path)=>`from ${q}${path}?v=${revision}${q}`);await put(base,file,text);}
 console.log(`Basanti v7: ${model.runs.length} routes, ${model.circuits.length} circuits, ${drawings.length} drawing sheets; source ${project.source_sha256.slice(0,12)} preserved.`);
 return header;
}

import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {relative,dirname} from 'node:path';

const label='14_Basanti Poudel Baral';
export const historicalScript=(text,revision)=>text.replaceAll('../basanti-residence/data/project.json','__FROZEN_PROJECT__').replaceAll('../basanti-residence/source/','__ORIGINAL_SOURCE__/').replaceAll('../basanti-residence/','./building/').replaceAll('__FROZEN_PROJECT__','./building/data/project.json').replaceAll('__ORIGINAL_SOURCE__/','../../basanti-residence/source/').replaceAll('../../../vendor/','../../../../vendor/').replaceAll('WORKBENCH_REVISION',revision);
const navigation=prefix=>`<nav class="project-nav" aria-label="Workbench versions"><a href="${prefix}v1/">Version 1 · original workbench</a><a href="${prefix}changes/">v1 → v2 · change report</a><a href="${prefix}v2/">Version 2 · improved workbench</a></nav>`;
const csv=rows=>rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';

export async function buildBuildingHistory(root,dist){
 const base=new URL('construction/models/basanti-workbench/',dist),manifest=JSON.parse(await readFile(new URL('versions.json',base)));
 const archive=await readFile(new URL('history/v1-source.json.gz',base));
 if(createHash('sha256').update(archive).digest('hex')!==manifest.versions[0].archive_sha256)throw Error('Frozen v1 archive checksum differs');
 const frozen=JSON.parse(gunzipSync(archive));
 if(frozen.commit!==manifest.versions[0].commit)throw Error('Frozen v1 commit differs');
 const old=new URL('v1/',base);await mkdir(old,{recursive:true});
 for(const [name,original]of Object.entries(frozen.files)){
  if(!/^(?:[a-z-]+\.(?:js|css|html)|building\/(?:[a-z-]+\.js|data\/project\.json))$/.test(name))throw Error('Unexpected snapshot path');
  let text=original;
  if(name.endsWith('.js'))text=historicalScript(original,manifest.versions[0].archive_sha256.slice(0,16));
  if(name==='index.html')text=text.replaceAll('../../../','../../../../').replaceAll('../basanti-residence/data/project.json','./building/data/project.json').replaceAll('../basanti-residence/','../../basanti-residence/').replace('<main class="container workbench" id="main">','<main class="container workbench" id="main">'+navigation('../')+'<p class="view-note">Frozen version 1 · before the five-project QA. Its historical calculation and interaction limits are retained for comparison. Use version 2 for the maintained workbench.</p>').replaceAll('Basanti Residence',label+' · v1').replace('ONE BUILDING · FOUR LINKED PANELS',label+' · WORKBENCH V1').replace('<h1>Construction Workbench</h1>','<h1>Construction Workbench · v1</h1>');
  const file=new URL(name,old);await mkdir(new URL('./',file),{recursive:true});await writeFile(file,text);
 }
 const {createWorkContext,packageForTask}=await import(pathToFileURL(fileURLToPath(new URL('work-model.js',old))).href);
 const {scheduleTasks}=await import(pathToFileURL(fileURLToPath(new URL('work-packages.js',old))).href);
 const project=JSON.parse(frozen.files['building/data/project.json']),ctx=createWorkContext(project),schedule=scheduleTasks(ctx.tasks),packages=ctx.tasks.map(t=>({...t,rows:packageForTask(ctx,t).rows}));
 await mkdir(new URL('data/',old),{recursive:true});
 await writeFile(new URL('data/work-packages.json',old),JSON.stringify({frozen_commit:frozen.commit,tasks:packages},null,2)+'\n');
 await writeFile(new URL('data/quantities.csv',old),csv([['work_id','part_id','quantity','unit','basis'],...packages.flatMap(t=>t.rows.map(r=>[t.id,r.id,r.value,r.unit,r.formula]))]));
 await writeFile(new URL('data/programme.csv',old),csv([['work_id','work','start_day','finish_day','calendar_days'],...schedule.tasks.map(t=>[t.id,t.label,t.start,t.finish,t.duration])]));
 await writeFile(new URL('data/calculation-checks.json',old),JSON.stringify({frozen_commit:frozen.commit,work_packages:packages.length,quantity_rows:packages.reduce((n,t)=>n+t.rows.length,0),programme_calendar_days:schedule.duration,release:'HISTORICAL_PLANNING_SNAPSHOT'},null,2)+'\n');
 // V2 is an alias of the maintained page; its relative resources use the existing URL.
 const current=new URL('index.html',base);let html=await readFile(current,'utf8');
 html=html.replace('<main class="container workbench" id="main">','<main class="container workbench" id="main">'+navigation('./')+'<p class="view-note">Version 2 · five-project QA baseline. Original drawings and the shared building data remain linked.</p>');
 await writeFile(current,html);await mkdir(new URL('v2/',base),{recursive:true});const alias=new URL('v2/index.html',base);const rebased=html.replace(/(href|src)="([^"]+)"/g,(all,attribute,value)=>{if(/^(?:https?:|#|data:|mailto:)/.test(value))return all;const target=new URL(value,current);return attribute+'="'+relative(dirname(fileURLToPath(alias)),fileURLToPath(target))+(target.pathname.endsWith('/')?'/':'')+target.search+target.hash+'"';});await writeFile(alias,rebased);
 await mkdir(new URL('changes/',base),{recursive:true});
 const changes=[['Input validation','Blank durations could become zero; incomplete or nonfinite inputs could reach calculations.','Whole-day durations, complete SI scenarios and valid dimensions are checked before recalculation.'],['Linked inspection','An orbit drag could also select; context and isolation lost the prior camera.','Dragging orbits without selecting; clear/Escape and camera restoration keep inspection predictable.'],['Programme','Shortened labels and scaled text made some work hard to read.','All 112 full work names, fixed labels, zoom, milestones and predecessor/successor navigation.'],['IFC exchange','Schema checks and representative shapes.','Independent SI-unit, metre-bounds and gross-volume checks; 145 solids pass, 12 volumes remain withheld.'],['Preserved evidence','133 base elements, 21 source sheets, 707 quantity rows and default 241-calendar-day planning scenario.','The same source facts and default quantities; no final fabrication or structural approval inferred.']];
 const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${label} · v1 to v2</title><link rel="stylesheet" href="../../../../workspace.css"></head><body><header class="workspace-head"><a class="wordmark" href="../../../../">CAD TEST FACILITY</a><nav aria-label="Workspace"></nav></header><main class="container" id="main"><p class="eyebrow">${label}</p><h1>Version 1 → Version 2</h1>${navigation('../')}<p>Version 1 preserves commit <code>${frozen.commit}</code>. Version 2 records the improvements introduced at <code>${manifest.versions[1].baseline_commit}</code>. The existing workbench URL and v2 use one maintained page.</p><section class="block"><h2>What changed</h2><div class="table-scroll"><table><thead><tr><th>Area</th><th>Version 1</th><th>Version 2</th></tr></thead><tbody>${changes.map(r=>'<tr>'+r.map((x,i)=>`<${i?'td':'th'}>${x}</${i?'td':'th'}>`).join('')+'</tr>').join('')}</tbody></table></div></section><p>Reviewed: IfcOpenShell, That Open Engine, xeokit, FreeCAD and OpenProject. No upstream code was copied and no new runtime dependency was added.</p><p><a href="../open-source-review.json">Pinned source references · JSON</a> · <a href="../QA_REVIEW_2026-10-26.md">Detailed QA report</a> · <a href="../versions.json">Version record</a></p><p>Two stair meshes still need closure coordination. Covers, laps, anchorage, final cutting lengths, structural and MEP approvals remain unresolved. Hardware WebGL and native Revit import are untested in the cloud QA browser.</p></main></body></html>`;
 await writeFile(new URL('changes/index.html',base),page);
 return {v1_commit:frozen.commit,v1_sha256:manifest.versions[0].archive_sha256,v2_source:manifest.versions[1].baseline_commit};
}

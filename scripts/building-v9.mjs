import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {escapeHTML as e} from '../public/construction/models/basanti-residence/building-model.js';

export async function buildBuildingV9(root,dist){
  const source=new URL('public/construction/models/basanti-workbench/v9/',root);
  const base=new URL('construction/models/basanti-workbench/v9/',dist);
  const previous=new URL('../v8/',base);
  await mkdir(new URL('data/',base),{recursive:true});
  const workspace=JSON.parse(await readFile(new URL('data/workspace.json',previous)));
  const references=JSON.parse(await readFile(new URL('references.json',source)));
  if(references.open_source_projects.length!==10)throw Error('V9 requires ten reviewed open-source projects');
  const files=['index.html','v9.js','v9.css','workspace-model.js','model-viewer.js','drawings.js','references.json'];
  const hash=createHash('sha256').update(JSON.stringify(workspace));
  for(const file of files)hash.update(await readFile(new URL(file,source)));
  const revision=hash.digest('hex').slice(0,16);
  const header={schema:'basanti-workspace-9.0',revision,date:'2026-10-31',release:'USER_EXPERIENCE_REVIEW',source_sha256:workspace.source_sha256};
  const put=(name,value)=>writeFile(new URL(name,base),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
  await put('data/workspace.json',{...workspace,...header,references,based_on:['v8 quantity register and separate programmes','v6 structural interpretation','v7 MEP geometry']});
  for(const file of ['boq.csv','quantity-lines.json','programme-building.csv','programme-mep.csv','gantt-building.svg','gantt-mep.svg','steel.json'])await cp(new URL('data/'+file,previous),new URL('data/'+file,base));
  const scene=JSON.parse(await readFile(new URL('data/scene.json',previous)));
  await put('data/scene.json',{...scene,...header});
  const checks=JSON.parse(await readFile(new URL('data/checks.json',previous)));
  await put('data/checks.json',{...checks,...header,quantity_register_identical_to_v8:true,source_model_identical_to_v8:true,reviewed_open_source_projects:10});
  let html=await readFile(new URL('index.html',source),'utf8');
  const review=`<details class="v9-disclosure"><summary>Open-source review · 10 projects</summary><p class="v9-note">Official project documentation reviewed 31 October 2026. These patterns inform the interface; Basanti data and calculations retain their original sources.</p><div class="v9-table-wrap"><table class="v9-table v9-detail-table"><thead><tr><th>Project</th><th>Pattern</th><th>Applied in v9</th></tr></thead><tbody>${references.open_source_projects.map(project=>`<tr><th scope="row"><a href="${e(project.url)}">${e(project.title)} ↗</a><small><a href="${e(project.repository)}">Source repository ↗</a></small></th><td>${e(project.pattern)}</td><td>${e(project.application)}</td></tr>`).join('')}</tbody></table></div></details>`;
  html=html.replace('<!-- V9_OPEN_SOURCE_REVIEW -->',review).replaceAll('V9_REVISION',revision);
  await put('index.html',html);
  for(const file of ['v9.js','workspace-model.js','model-viewer.js','drawings.js'])await put(file,(await readFile(new URL(file,source),'utf8')).replaceAll('V9_REVISION',revision).replace(/(from\s*['"])(\.{1,2}\/[^'"?]+\.js)(['"])/g,`$1$2?v=${revision}$3`));
  console.log(`Basanti v9: preserved ${workspace.items.length} BOQ records and ${workspace.schedules.building.tasks.length}/${workspace.schedules.mep.tasks.length} programme tasks; ten open-source UX references.`);
  return header;
}

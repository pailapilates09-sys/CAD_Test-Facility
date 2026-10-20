import {cp,mkdir,rm,writeFile,readFile,readdir} from 'node:fs/promises';
import {spec,materials,sources,braceLength} from '../src/spec.mjs';
import {renderDrawings,drawingInfo} from '../src/drawings.mjs';
import {renderRecovery} from './render-progress-recovery.mjs';
import {buildConstructionStatus,renderConstructionStatus} from './render-construction-progress.mjs';
import {buildV8,renderIndex,renderWork,pageFromTemplate} from './material-v8.mjs';
import {applySiteExperience} from './site-experience.mjs';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {renderComparisons,renderGraphs,renderImages,renderComponents,renderSource} from './linked-estimate-views.mjs';
import {contractorData,renderContractorIndex,contractorPage} from './contractor-v10.mjs';
import {renderInlineMaterials} from './material-inline-v11.mjs';
import {renderMemoryPosters} from './memory-posters.mjs';
import {renderVersionRegister} from './linked-estimate-views.mjs';
import {checkSite} from './check-site.mjs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),dist=new URL('dist/',root);
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await cp(new URL('public/',root),dist,{recursive:true});
// The dated recovery record is the single source for the current four-lane view.
const recoveryRoot=new URL('progress/recovery/',root);
const currentRecovery=JSON.parse(await readFile(new URL('current.json',recoveryRoot),'utf8'));
const recoveryStatus=await readFile(new URL(currentRecovery.path,recoveryRoot),'utf8');
const recoveryReport=await readFile(new URL(currentRecovery.report,recoveryRoot),'utf8');
const progressPage=new URL('progress/index.html',dist);
const progressTemplate=await readFile(progressPage,'utf8');
if(!progressTemplate.includes('<!-- CURRENT_PROGRESS -->'))throw new Error('Missing current progress template marker');
if(!progressTemplate.includes('<!-- CONSTRUCTION_PROGRESS -->'))throw new Error('Missing construction progress template marker');
const estimatePath='construction/estimates/pilates-astra-2026-10-15/';
const readJSON=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const registry=await readJSON('public/'+estimatePath+'v9/register.json');
const sourceHash=createHash('sha256').update(JSON.stringify(registry));
for(const path of ['shared/source-model.js','shared/material-model.js','v8/quantity-models.js','v8/calculations.js','v10/contractor-model.js'])sourceHash.update(await readFile(new URL('public/'+estimatePath+path,root)));
const sourceRevision=sourceHash.digest('hex').slice(0,16);
const inlineHash=createHash('sha256').update(sourceRevision);
for(const path of ['v11/v11.js','v11/v11.css'])inlineHash.update(await readFile(new URL('public/'+estimatePath+path,root)));
const inlineRevision=inlineHash.digest('hex').slice(0,16);
const views=deriveViews(registry),{original,comparison,components,images}=views;
const [versions,model,debt]=await Promise.all([
 readJSON('public/'+estimatePath+'versions.json'),readJSON('public/construction/models/pilates-sketchup/source-register.json'),
 readJSON('public/'+estimatePath+'v7/debt-review.json')
]);
const posterCollection=await readJSON('public/memory-posters/posters.json');
const memoryHash=createHash('sha256').update(sourceRevision).update(JSON.stringify(posterCollection));
for(const path of ['wall.css','wall.js'])memoryHash.update(await readFile(new URL('public/memory-posters/'+path,root)));
const memoryRevision=memoryHash.digest('hex').slice(0,16),memoryPage=new URL('memory-posters/index.html',dist);
await writeFile(memoryPage,(await readFile(memoryPage,'utf8')).replace('<!-- MEMORY_POSTERS -->',renderMemoryPosters(posterCollection,contractorData(views))).replace('<head>','<head><meta name="memory-source-revision" content="'+sourceRevision+'">').replaceAll('MEMORY_REVISION',memoryRevision));
const milestonePage=new URL(estimatePath+'milestone.html',dist);
await writeFile(milestonePage,(await readFile(milestonePage,'utf8')).replace('<!-- VERSION_REGISTER -->',renderVersionRegister(versions)));
const home=new URL('index.html',dist);
await writeFile(home,(await readFile(home,'utf8')).replace(/(<span data-estimate-count>)\d+(<\/span>)/g,'$1'+versions.versions.length+'$2'));
const constructionStatus=buildConstructionStatus({original,comparison,components,images,versions,model,debt,drawingCount:drawingInfo.length});
await writeFile(progressPage,progressTemplate.replace('<!-- CURRENT_PROGRESS -->',renderRecovery(JSON.parse(recoveryStatus))).replace('<!-- CONSTRUCTION_PROGRESS -->',renderConstructionStatus(constructionStatus)));
await writeFile(new URL('progress/construction-status.json',dist),JSON.stringify(constructionStatus,null,2)+'\n');
// Current views and compatibility exports are derived from the one v9 source register.
for(const [version,render] of [['v5',()=>renderComparisons(views)],['v5.1',()=>renderGraphs(views)],['v6',()=>renderImages(views)],['v7',()=>renderComponents(views)],['v9',()=>renderSource(registry,views)],['v10',()=>renderContractorIndex(contractorData(views))],['v11',()=>renderInlineMaterials(contractorData(views))]]){
 const file=new URL(estimatePath+version+'/index.html',dist),template=await readFile(file,'utf8');
 if(!template.includes('<!-- LINKED_VIEW -->'))throw Error('Missing linked view template '+version);
 await writeFile(file,template.replace('<!-- LINKED_VIEW -->',render()));
}
const generated={
 'v5/comparison.json':comparison,'v7/component-rates.json':components,'v6/image-register.json':images,
 'v8/material-catalog.json':registry.materials
};
for(const [path,data] of Object.entries(generated))await writeFile(new URL(estimatePath+path,dist),JSON.stringify({...data,derivation:{source:'../v9/register.json',revision:sourceRevision,generated:true}},null,2)+'\n');
await writeFile(new URL(estimatePath+'v5/comparison.jsonl',dist),comparison.items.map(x=>JSON.stringify(x)).join('\n')+'\n');
await writeFile(new URL(estimatePath+'v7/component-items.jsonl',dist),components.items.map(x=>JSON.stringify(x)).join('\n')+'\n');
const v8Data=views.materials;
const v8Dir=new URL(estimatePath+'v8/',dist),v8Template=await readFile(new URL('index.html',v8Dir),'utf8');
if(!v8Template.includes('<!-- V8_CONTENT -->'))throw new Error('Missing V8 content marker');
await writeFile(new URL('index.html',v8Dir),pageFromTemplate(v8Template,renderIndex(v8Data),'Materials by work'));
await writeFile(new URL('material-takeoff.json',v8Dir),JSON.stringify({...v8Data,derivation:{source:'../v9/register.json',revision:sourceRevision,generated:true}},null,2)+'\n');
for(const item of v8Data.items)await writeFile(new URL(item.id+'.html',v8Dir),pageFromTemplate(v8Template,renderWork(item,v8Data),item.title));
const v8Script=new URL('v8.js',v8Dir);
await writeFile(v8Script,(await readFile(v8Script,'utf8')).replaceAll('revision=quantity-2','source='+sourceRevision).replace("'./quantity-models.js'","'./quantity-models.js?source="+sourceRevision+"'"));
const quantityScript=new URL('quantity-models.js',v8Dir);
await writeFile(quantityScript,(await readFile(quantityScript,'utf8')).replace("'./calculations.js'","'./calculations.js?source="+sourceRevision+"'"));
const v10Data=contractorData(views),v10Dir=new URL(estimatePath+'v10/',dist);
await writeFile(new URL('contractor-data.json',v10Dir),JSON.stringify({...v10Data,derivation:{source:'../v9/register.json',revision:sourceRevision,generated:true}},null,2)+'\n');
for(const work of v10Data.items)await writeFile(new URL(work.id+'.html',v10Dir),contractorPage(work,v10Data));
for(const name of ['v10.js','contractor-model.js']){
 const file=new URL(name,v10Dir);await writeFile(file,(await readFile(file,'utf8')).replaceAll('SOURCE_REVISION',sourceRevision));
}
const inlineScript=new URL(estimatePath+'v11/v11.js',dist);
await writeFile(inlineScript,(await readFile(inlineScript,'utf8')).replaceAll('SOURCE_REVISION',sourceRevision));
for(const version of ['v5','v5.1','v6','v7','v8','v9','v10','v11']){
 const folder=new URL(estimatePath+version+'/',dist);
 for(const entry of await readdir(folder))if(entry.endsWith('.html')){
  const file=new URL(entry,folder),html=await readFile(file,'utf8');
  await writeFile(file,html.replace('<head>','<head><meta name="estimate-source-revision" content="'+sourceRevision+'">').replace('v8.js?revision=quantity-2','v8.js?source='+sourceRevision).replaceAll('SOURCE_REVISION',sourceRevision).replaceAll('V11_REVISION',inlineRevision));
 }
}
await mkdir(new URL('progress/recovery/',dist),{recursive:true});
await writeFile(new URL('progress/recovery/status.json',dist),recoveryStatus);
await writeFile(new URL('progress/recovery/report.md',dist),recoveryReport);
// Construction evidence is isolated from the CAD model and A9 progress datasets.
for(const folder of ['data','source'])await cp(new URL(estimatePath+folder+'/',root),new URL(estimatePath+folder+'/',dist),{recursive:true});
await cp(new URL('src/',root),new URL('assets/',dist),{recursive:true});
await cp(new URL('vendor/',root),new URL('vendor/',dist),{recursive:true});
await mkdir(new URL('downloads/',dist),{recursive:true});
const drawings=renderDrawings();
for(const d of drawingInfo)await writeFile(new URL('downloads/'+d.filename,dist),drawings[d.id]);
const quote=s=>'"'+String(s).replaceAll('"','""')+'"';
const csv=[['ID','Material','Quantity','Dimensions (inches)','Stock','Notes'],...materials.map(m=>[m.id,m.name,m.qty,m.size,m.stock,m.note])].map(r=>r.map(quote).join(',')).join('\n');
await writeFile(new URL('downloads/Material_Quantities.csv',dist),csv+'\n');
await writeFile(new URL('downloads/Column_Formwork_Specification.json',dist),JSON.stringify({...spec,braceLength,materials},null,2));
await writeFile(new URL('downloads/Open_Source_Review.json',dist),JSON.stringify(sources,null,2));
await writeFile(new URL('.nojekyll',dist),'');
await readFile(new URL('downloads/Column_Formwork_Inches_Only.pdf',dist));
const themedPages=await applySiteExperience(fileURLToPath(dist));
await checkSite(fileURLToPath(dist));
console.log(`Built ${themedPages} pages with shared light/dark themes and companion. CAD includes 5 SVG sheets, PDF and CSV.`);

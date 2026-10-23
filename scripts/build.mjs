import {cp,mkdir,rm,writeFile,readFile,readdir} from 'node:fs/promises';
import {spec,materials,sources,braceLength} from '../src/spec.mjs';
import {renderDrawings,drawingInfo} from '../src/drawings.mjs';
import {renderRecovery} from './render-progress-recovery.mjs';
import {buildExtractionView} from './render-extraction-explorer.mjs';
import {buildConstructionStatus} from './render-construction-progress.mjs';
import {buildV8,renderIndex,renderWork,pageFromTemplate} from './material-v8.mjs';
import {applySiteExperience} from './site-experience.mjs';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {renderComparisons,renderGraphs,renderImages,renderComponents,renderSource,viewPage,versionLinks,esc} from './linked-estimate-views.mjs';
import {renderOriginal,renderScope,renderSI,renderMarket,deriveHierarchy} from './source-views.mjs';
import {renderProcurement} from './procurement-v12.mjs';
import {deriveSavings,renderSavings} from './savings-v13.mjs';
import {contractorData,renderContractorIndex,contractorPage} from './contractor-v10.mjs';
import {renderInlineMaterials} from './material-inline-v11.mjs';
import {renderMemoryPosters} from './memory-posters.mjs';
import {renderVersionRegister} from './linked-estimate-views.mjs';
import {checkSite} from './check-site.mjs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {renderModelItems,renderRoomScope,renderRoomNavigation} from './render-model-workspace.mjs';
import {buildRoomModel} from '../public/construction/models/pilates-sketchup/room-model.js';
import {renderModelBoq} from './render-model-boq.mjs';
import {reusableComponents} from './layout-designer-assets.mjs';
import {CATALOG} from '../public/construction/models/layout-designer/design-model.js';
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
const extractionHash=createHash('sha256');
for(const path of ['extraction-explorer.css','extraction-explorer.js'])extractionHash.update(await readFile(new URL('public/progress/'+path,root)));
const extractionRevision=extractionHash.digest('hex').slice(0,16);
if(!progressTemplate.includes('<!-- CURRENT_PROGRESS -->'))throw new Error('Missing current progress template marker');
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
const modelPath='construction/models/pilates-sketchup/';
const roomScene=await readJSON('public/'+modelPath+'studio-room.scene.json');
const roomNavigation=await readJSON('public/'+modelPath+'room-navigation.json');
const designerPath='construction/models/layout-designer/',designerPage=new URL(designerPath+'index.html',dist);
await writeFile(new URL(designerPath+'reusable-components.json',dist),JSON.stringify(reusableComponents(roomScene,roomNavigation))+'\n');
await writeFile(designerPage,(await readFile(designerPage,'utf8')).replace('<!-- DESIGN_CATALOG -->',CATALOG.map(item=>'<option value="'+item.kind+'"'+(item.asset_id?' data-source disabled':'')+'>'+esc(item.name)+'</option>').join('')));
const modelBoqLinks=await readJSON('public/'+modelPath+'model-boq-links.json'),sharedContractorData=contractorData(views);
const modelPage=new URL(modelPath+'index.html',dist);
await writeFile(modelPage,(await readFile(modelPage,'utf8')).replace('<head>','<head><meta name="estimate-source-revision" content="'+sourceRevision+'">').replace('<!-- ROOM_ITEMS -->',renderModelItems(roomScene,roomNavigation)).replace('<!-- ROOM_NAVIGATION -->',renderRoomNavigation(roomNavigation)).replace('<!-- ROOM_BOQ -->',renderModelBoq(buildRoomModel(roomScene,roomNavigation),sharedContractorData,modelBoqLinks)).replace('<!-- ROOM_SCOPE -->',renderRoomScope(roomScene)));
for(const name of ['viewer.js','boq-model.js','boq-controller.js']){const file=new URL(modelPath+name,dist);await writeFile(file,(await readFile(file,'utf8')).replaceAll('BOQ_SOURCE_REVISION',sourceRevision));}
await cp(new URL('tools/sketchup/extract-vff-stream.py',root),new URL(modelPath+'extract-vff-stream.py',dist));
const procurement=await readJSON('public/'+estimatePath+'v12/procurement.json');
const decisionHash=createHash('sha256').update(sourceRevision).update(JSON.stringify(procurement));
for(const path of ['v12.js','v12.css'])decisionHash.update(await readFile(new URL('public/'+estimatePath+'v12/'+path,root)));
const decisionRevision=decisionHash.digest('hex').slice(0,16);
const savings=deriveSavings(registry,procurement,views);
const savingsHash=createHash('sha256').update(sourceRevision).update(decisionRevision);
for(const path of ['savings-model.js','v13.js','v13.css'])savingsHash.update(await readFile(new URL('public/'+estimatePath+'v13/'+path,root)));
const savingsRevision=savingsHash.digest('hex').slice(0,16);
savings.derivation={source:'../v9/register.json',responsibilities:'../v12/procurement.json',source_revision:sourceRevision,responsibility_revision:decisionRevision,view_revision:savingsRevision,generated:true};
await writeFile(new URL(estimatePath+'v13/budget-view.json',dist),JSON.stringify(savings,null,2)+'\n');
const savingsScript=new URL(estimatePath+'v13/v13.js',dist);
await writeFile(savingsScript,(await readFile(savingsScript,'utf8')).replaceAll('V13_REVISION',savingsRevision));
const posterCollection=await readJSON('public/memory-posters/posters.json');
const memoryHash=createHash('sha256').update(sourceRevision).update(JSON.stringify(posterCollection));
for(const path of ['wall.css','wall.js'])memoryHash.update(await readFile(new URL('public/memory-posters/'+path,root)));
const memoryRevision=memoryHash.digest('hex').slice(0,16),memoryPage=new URL('memory-posters/index.html',dist);
await writeFile(memoryPage,(await readFile(memoryPage,'utf8')).replace('<!-- MEMORY_POSTERS -->',renderMemoryPosters(posterCollection,contractorData(views))).replace('<head>','<head><meta name="memory-source-revision" content="'+sourceRevision+'">').replaceAll('MEMORY_REVISION',memoryRevision));
const milestonePage=new URL(estimatePath+'milestone.html',dist);
await writeFile(milestonePage,(await readFile(milestonePage,'utf8')).replace('<!-- VERSION_REGISTER -->',renderVersionRegister(versions)));
const home=new URL('index.html',dist);
await writeFile(home,(await readFile(home,'utf8')).replace(/(<span data-estimate-count>)\d+(<\/span>)/g,'$1'+versions.versions.length+'$2').replace(/<div class="version-tokens">[\s\S]*?<\/div>/,'<div class="version-tokens">'+versions.versions.map(view=>'<span'+(view.id===versions.latest_version?' class="latest-token"':'')+'>'+esc(view.id==='original'?'Original':view.id)+'</span>').join('')+'</div>'));
const constructionStatus=buildConstructionStatus({original,comparison,components,images,versions,model,debt,drawingCount:drawingInfo.length});
await writeFile(progressPage,progressTemplate.replace('<!-- CURRENT_PROGRESS -->',renderRecovery(JSON.parse(recoveryStatus))).replaceAll('EXTRACTION_REVISION',extractionRevision));
await writeFile(new URL('progress/extraction-view.json',dist),JSON.stringify(buildExtractionView(JSON.parse(recoveryStatus)),null,2)+'\n');
await writeFile(new URL('progress/construction-status.json',dist),JSON.stringify(constructionStatus,null,2)+'\n');
// Current views and compatibility exports are derived from the one v9 source register.
for(const [version,render] of [['original',()=>renderOriginal(registry,views)],['v2',()=>renderScope(registry)],['v3',()=>renderSI(registry,views)],['v4',()=>renderMarket(registry,views)]]){
 await writeFile(new URL(estimatePath+(version==='original'?'':version+'/')+'index.html',dist),viewPage(version,render()));
}
await writeFile(new URL(estimatePath+'shared/quote-view.json',dist),JSON.stringify({...original,derivation:{source:'../v9/register.json',revision:sourceRevision,generated:true}},null,2)+'\n');
const hierarchy=deriveHierarchy(views,await readJSON('public/'+estimatePath+'v2/hierarchy.json'));
hierarchy.derivation={source:'../v9/register.json',revision:sourceRevision,generated:true};
await writeFile(new URL(estimatePath+'v2/hierarchy.json',dist),JSON.stringify(hierarchy,null,2)+'\n');
const scopeScript=new URL(estimatePath+'v2/v2.js',dist);
await writeFile(scopeScript,(await readFile(scopeScript,'utf8')).replaceAll('SOURCE_REVISION',sourceRevision));
await writeFile(new URL(estimatePath+'v3/estimate-si.json',dist),JSON.stringify({...views.si,source_pdf_sha256:original.source.sha256,derivation:{source:'../v9/register.json',revision:sourceRevision,generated:true}},null,2)+'\n');
await writeFile(new URL(estimatePath+'v3/line-items-si.jsonl',dist),views.si.line_items.map(work=>JSON.stringify(work)).join('\n')+'\n');
for(const [version,render] of [['v5',()=>renderComparisons(views)],['v5.1',()=>renderGraphs(views)],['v6',()=>renderImages(views)],['v7',()=>renderComponents(views)],['v9',()=>renderSource(registry,views)],['v10',()=>renderContractorIndex(contractorData(views))],['v11',()=>renderInlineMaterials(contractorData(views))],['v12',()=>renderProcurement(procurement,registry,views)],['v13',()=>renderSavings(savings,procurement)]]){
 const file=new URL(estimatePath+version+'/index.html',dist),template=await readFile(file,'utf8');
 if(!template.includes('<!-- LINKED_VIEW -->'))throw Error('Missing linked view template '+version);
 await writeFile(file,viewPage(version,render()));
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
const v10Data=sharedContractorData,v10Dir=new URL(estimatePath+'v10/',dist);
await writeFile(new URL('contractor-data.json',v10Dir),JSON.stringify({...v10Data,derivation:{source:'../v9/register.json',revision:sourceRevision,generated:true}},null,2)+'\n');
for(const work of v10Data.items)await writeFile(new URL(work.id+'.html',v10Dir),contractorPage(work,v10Data));
for(const name of ['v10.js','contractor-model.js']){
 const file=new URL(name,v10Dir);await writeFile(file,(await readFile(file,'utf8')).replaceAll('SOURCE_REVISION',sourceRevision));
}
const inlineScript=new URL(estimatePath+'v11/v11.js',dist);
await writeFile(inlineScript,(await readFile(inlineScript,'utf8')).replaceAll('SOURCE_REVISION',sourceRevision));
for(const version of ['original','v2','v3','v4','v5','v5.1','v6','v7','v8','v9','v10','v11','v12','v13']){
 const folder=new URL(estimatePath+(version==='original'?'':version+'/'),dist);
 for(const entry of await readdir(folder))if(entry.endsWith('.html')){
  if(version==='original'&&entry!=='index.html')continue;
  const file=new URL(entry,folder),html=await readFile(file,'utf8');
  const navigation=html.replace(/<nav class="view-links"[^>]*>[\s\S]*?<\/nav>/g,versionLinks(version));
  await writeFile(file,navigation.replace('<head>','<head><meta name="estimate-source-revision" content="'+sourceRevision+'">').replace('v8.js?revision=quantity-2','v8.js?source='+sourceRevision).replaceAll('SOURCE_REVISION',sourceRevision).replaceAll('V11_REVISION',inlineRevision).replaceAll('V12_REVISION',decisionRevision).replaceAll('V13_REVISION',savingsRevision));
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

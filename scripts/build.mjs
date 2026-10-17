import {cp,mkdir,rm,writeFile,readFile} from 'node:fs/promises';
import {spec,materials,sources,braceLength} from '../src/spec.mjs';
import {renderDrawings,drawingInfo} from '../src/drawings.mjs';
import {renderRecovery} from './render-progress-recovery.mjs';
import {buildConstructionStatus,renderConstructionStatus} from './render-construction-progress.mjs';
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
const [original,comparison,components,images,versions,model,debt]=await Promise.all([
 readJSON(estimatePath+'data/estimate.json'),readJSON('public/'+estimatePath+'v5/comparison.json'),
 readJSON('public/'+estimatePath+'v7/component-rates.json'),readJSON('public/'+estimatePath+'v6/image-register.json'),
 readJSON('public/'+estimatePath+'versions.json'),readJSON('public/construction/models/pilates-sketchup/source-register.json'),
 readJSON('public/'+estimatePath+'v7/debt-review.json')
]);
const constructionStatus=buildConstructionStatus({original,comparison,components,images,versions,model,debt,drawingCount:drawingInfo.length});
await writeFile(progressPage,progressTemplate.replace('<!-- CURRENT_PROGRESS -->',renderRecovery(JSON.parse(recoveryStatus))).replace('<!-- CONSTRUCTION_PROGRESS -->',renderConstructionStatus(constructionStatus)));
await writeFile(new URL('progress/construction-status.json',dist),JSON.stringify(constructionStatus,null,2)+'\n');
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
console.log('Built workspace home, preserved CAD subpage and verified project-progress subpage. CAD includes 5 SVG sheets, PDF and CSV.');

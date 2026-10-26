import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateProject,componentDimensions,escapeHTML} from '../public/construction/models/basanti-residence/building-model.js';
import {buildConstructionModel,barSchedule,constructionSteps} from '../public/construction/models/basanti-residence/construction-model.js';
import {detailSVG,drawingDocument,dimensionedPlanMarkup} from '../public/construction/models/basanti-residence/shop-drawings.js';
import {renderRegister} from '../public/construction/models/basanti-residence/register-view.js';
import {buildWorkbench} from './building-workbench.mjs';
import {buildBuildingIFC} from './building-ifc.mjs';
// PDF zero-width strokes are device hairlines; SVG zero-width strokes disappear.
// Keep the archived exporter output unchanged and adapt only browser presentation.
export const pdfSVGForBrowser=svg=>svg.replace(/stroke-width="0(?:\.0+)?"/g,'stroke-width="0.65" vector-effect="non-scaling-stroke"');
export function versionBuildingAssets(sources){
 const hash=createHash('sha256');for(const name of Object.keys(sources).sort())hash.update(name+'\0').update(sources[name]);const revision=hash.digest('hex').slice(0,16);
 const scripts=Object.fromEntries(Object.entries(sources).filter(([name])=>name.endsWith('.js')).map(([name,text])=>[name,text.replace(/(from\s*['"])(\.\/[a-z0-9-]+\.js)(['"])/g,`$1$2?v=${revision}$3`)]));return {revision,scripts};
}
export async function buildBuildingProject(root,dist){
 const path='construction/models/basanti-residence/',base=new URL(path,dist),source=new URL('source/',base),data=new URL('data/',base),project=validateProject(JSON.parse(await readFile(new URL('project.json',data),'utf8'))),manifest=JSON.parse(await readFile(new URL('original-parts.json',source),'utf8'));
 const parts=[];for(const item of manifest.parts){const bytes=await readFile(new URL(item.path,source));if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('PDF part changed '+item.path);parts.push(bytes)}
 const pdf=Buffer.concat(parts);if(pdf.length!==manifest.bytes||createHash('sha256').update(pdf).digest('hex')!==manifest.sha256||manifest.sha256!==project.source_sha256)throw Error('Original building PDF mismatch');await writeFile(new URL('original.pdf',source),pdf);
 await mkdir(new URL('sheets/',base),{recursive:true});for(const name of await readdir(source))if(/^sheet-\d\d\.svg\.gz$/.test(name))await writeFile(new URL('sheets/'+name.replace('.gz',''),base),pdfSVGForBrowser(gunzipSync(await readFile(new URL(name,source))).toString()));
 const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"',csv=(headers,rows)=>[headers,...rows].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
 await writeFile(new URL('model-elements.csv',data),csv(['id','label','kind','level','dimensions_m','status','source_page','notes'],project.components.map(c=>[c.id,c.label,c.kind,c.level,componentDimensions(c),c.status,c.source.page,c.note])));
 await writeFile(new URL('rooms.csv',data),csv(['id','room','level','written_width_m','written_depth_m','calculated_rectangle_area_m2','source_page'],project.rooms.map(r=>[r.id,r.label,r.level,r.written_width_m,r.written_depth_m,r.rectangle_area_m2,r.evidence.page])));
 await writeFile(new URL('facts.csv',data),csv(['id','label','value','unit','status','source_page','notes'],project.facts.map(f=>[f.id,f.label,f.value,f.unit,f.status,f.evidence.page,f.note])));
 await writeFile(new URL('model-elements.jsonl',data),project.components.map(r=>JSON.stringify(r)).join('\n')+'\n');
 const observations=gunzipSync(await readFile(new URL('numeric-observations.jsonl.gz',source))).toString().trim().split('\n').filter(Boolean).map(JSON.parse);
 await writeFile(new URL('source-observations.json',data),JSON.stringify(observations)+'\n');
 const construction=buildConstructionModel(project),bars=barSchedule(construction);
 const baseIds=new Set(project.components.map(c=>c.id));
 await writeFile(new URL('construction-model.json',data),JSON.stringify({schema:'paila-construction-studies-1.0',base_model:'./project.json',source_sha256:project.source_sha256,units:'m',base_component_count:project.components.length,components:construction.components.filter(c=>!baseIds.has(c.id)),reinforcement_set_ids:construction.reinforcement_sets.map(c=>c.id),construction_steps:constructionSteps})+'\n');
 await writeFile(new URL('bar-schedule.csv',data),csv(['study_id','host_id','member','level','source_recipe','source_pages','display_path_count_not_order_quantity','max_display_path_m_not_cut_length','final_cut_length_mm','procurement_quantity','release_status','notes'],bars.map(r=>[r.id,r.host_id,r.member,r.level,r.recipe,r.source_pages.join(','),r.display_path_count,r.display_max_path_m,r.final_cut_length_mm,r.procurement_quantity,r.release_status,r.note])));
 await writeFile(new URL('construction-steps.csv',data),csv(['step_id','step','scope','source_pages','source_checks','required_before_execution'],constructionSteps.map(s=>[s.id,s.title,s.scope,s.pages.join(','),s.check,s.hold])));
 await mkdir(new URL('drawings/',base),{recursive:true});const drawings=[];
 for(const level of ['foundation','ground','first','second','roof']){const name=level+'-plan.svg';await writeFile(new URL('drawings/'+name,base),drawingDocument(dimensionedPlanMarkup(construction,project.components.filter(c=>c.level===level)),level+' dimensioned source-study plan','-1.4 -4.95 14.2 7.6'));drawings.push({file:name,scope:level,type:'dimensioned plan',units:'m',release:'source review'});}
 for(const type of ['C1','C2'])for(const level of ['ground','first','second']){const c=project.components.find(c=>c.kind==='column'&&c.column_type===type&&c.level===level),name=type+'-'+level+'-section.svg';await writeFile(new URL('drawings/'+name,base),detailSVG(construction,c));drawings.push({file:name,scope:level,type:'column section',source_pages:[8,20],units:'mm',release:'not for fabrication'});}
 const band=construction.band_studies[0];await writeFile(new URL('drawings/band-section.svg',base),detailSVG(construction,band));drawings.push({file:'band-section.svg',type:'band section study',source_pages:[19],units:'mm',release:'not for fabrication'});await writeFile(new URL('drawings/index.json',base),JSON.stringify(drawings,null,2)+'\n');
 execFileSync('python3',[fileURLToPath(new URL('tools/building/export_database.py',root)),fileURLToPath(new URL('project.json',data)),fileURLToPath(new URL('extraction.sqlite.gz',source)),fileURLToPath(data),'--construction',fileURLToPath(new URL('construction-model.json',data))],{stdio:'pipe',encoding:'utf8'});
 await buildBuildingIFC(root,data,construction);
 const assetNames=['building.js','building-model.js','three-adapter.js','construction-model.js','view-math.js','shop-drawings.js','register-view.js','stair-model.js','geometry-checks.js','building.css','data/project.json'],inputs=Object.fromEntries(await Promise.all(assetNames.map(async name=>[name,await readFile(new URL(name,base),'utf8')])));
 for(const path of ['scripts/building-project.mjs','scripts/building-ifc.mjs','tools/building/export_ifc.py','tools/building/export_database.py','tools/building/requirements-ifc.txt','scripts/building-workbench.mjs'])inputs['$build/'+path]=await readFile(new URL(path,root),'utf8');
 for(const name of await readdir(new URL('construction/models/basanti-workbench/',dist)))if(/\.(js|css|html)$/.test(name))inputs['$workbench/'+name]=await readFile(new URL('construction/models/basanti-workbench/'+name,dist),'utf8');
 const assets=versionBuildingAssets(inputs);
 for(const [name,text]of Object.entries(assets.scripts).filter(([name])=>assetNames.includes(name)))await writeFile(new URL(name,base),text);
 const page=new URL('index.html',base);let html=(await readFile(page,'utf8')).replace('src="./building.js"',`src="./building.js?v=${assets.revision}"`).replace('href="./building.css"',`href="./building.css?v=${assets.revision}"`).replace(/href="(\.\/data\/[^"?#]+)"/g,`href="$1?v=${assets.revision}"`);
 const rows=renderRegister(construction,project.components).html;
 html=html.replace('<!-- BUILDING_ROWS -->',rows).replace('<!-- FLOOR_OPTIONS -->',project.levels.map(l=>`<option value="${l.id}">${escapeHTML(l.label)} · +${l.elevation_m} m</option>`).join('')).replace('<!-- BUILDING_DATA -->',JSON.stringify(project).replaceAll('<','\\u003c'));
 await writeFile(page,html);await buildWorkbench(dist,project,assets.revision);return {components:project.components.length,pages:21,source:manifest.sha256};
}

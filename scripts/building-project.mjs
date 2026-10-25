import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateProject,componentDimensions,escapeHTML} from '../public/construction/models/basanti-residence/building-model.js';
// PDF zero-width strokes are device hairlines; SVG zero-width strokes disappear.
// Keep the archived exporter output unchanged and adapt only browser presentation.
export const pdfSVGForBrowser=svg=>svg.replace(/stroke-width="0(?:\.0+)?"/g,'stroke-width="0.65" vector-effect="non-scaling-stroke"');
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
 execFileSync('python3',[fileURLToPath(new URL('tools/building/export_database.py',root)),fileURLToPath(new URL('project.json',data)),fileURLToPath(new URL('extraction.sqlite.gz',source)),fileURLToPath(data)],{stdio:'pipe',encoding:'utf8'});
 const page=new URL('index.html',base);let html=await readFile(page,'utf8');
 const rows=project.components.map(c=>`<tr data-component-row="${c.id}"><th scope="row"><button type="button" data-pick="${c.id}" aria-pressed="false">${escapeHTML(c.label)}</button><small>${escapeHTML(c.kind)} · ${escapeHTML(c.level)}</small></th><td>${escapeHTML(componentDimensions(c))}</td><td><span class="evidence-badge ${c.status}">${escapeHTML(c.status)}</span></td><td><button type="button" data-sheet="${c.source.page}">Sheet ${c.source.page}</button></td></tr>`).join('');
 html=html.replace('<!-- BUILDING_ROWS -->',rows).replace('<!-- FLOOR_OPTIONS -->',project.levels.map(l=>`<option value="${l.id}">${escapeHTML(l.label)} · +${l.elevation_m} m</option>`).join('')).replace('<!-- BUILDING_DATA -->',JSON.stringify(project).replaceAll('<','\\u003c'));
 await writeFile(page,html);return {components:project.components.length,pages:21,source:manifest.sha256};
}

import {readFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {siteHref} from './workspace-organization.mjs';
import {escapeHTML as e} from '../public/construction/models/basanti-residence/building-model.js';
const residence='construction/models/basanti-residence/',workbench='construction/models/basanti-workbench/';
export const disciplines=[['architecture','Architecture',residence,'Plans & openings'],['structure','Structure',workbench+'v6/','Members & reinforcement'],['mep','MEP',workbench+'v7/','Services & sizing'],['interior','Interior & Furniture',residence+'interior.html','Rooms & source dimensions']];
export function disciplineForPage(page){return page===residence+'interior.html'?'interior':page===residence+'index.html'?'architecture':page.startsWith(workbench)?(page.startsWith(workbench+'v7/')?'mep':'structure'):null;}
export function disciplineNavigation(page){const active=disciplineForPage(page);return `<div class="bd-project-heading"><span>Basanti Residence</span><a href="${siteHref(page,residence+'milestone.html')}">Overview &amp; versions ↗</a><a href="${siteHref(page,'library/?project=basanti')}">Source files ↗</a></div><nav class="bd-discipline-tabs" aria-label="Basanti disciplines">${disciplines.map(([id,label,path,note],i)=>`<a href="${siteHref(page,path)}"${id===active?' aria-current="page"':''}><span class="bd-tab-number" aria-hidden="true">0${i+1}</span><span><strong>${label}</strong><small>${note}</small></span></a>`).join('')}</nav>`;}
export function groupStructureControls(html){
 const match=html.match(/(<section class="v3-controls block"[^>]*>[\s\S]*?<h2[^>]*>)[\s\S]*?(<\/h2>)<div class="v3-control-grid">([\s\S]*?)<\/div><div class="v3-checks">/);
 if(!match)throw Error('Basanti structure control layout changed');
 const labels=[...match[3].matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/g)].map(m=>m[0]),advanced=['annotation-layer','pair-select','panel-layout','bar-role'];
 if(labels.length!==9)throw Error('Expected all nine original structure controls');
 const isAdvanced=label=>advanced.some(id=>label.includes(`id="${id}"`));
 return html.replace(match[0],`${match[1]}Choose structural work${match[2]}<p class="bd-help">Choose a stage, floor and work type, then a package and member. Drawing labels and layout are grouped below.</p><div class="v3-control-grid bd-primary-filters">${labels.filter(l=>!isAdvanced(l)).join('')}</div><details class="bd-secondary-controls"><summary>Drawing labels, panel layout &amp; bar filters</summary><div class="v3-control-grid">${labels.filter(isAdvanced).join('')}</div></details><div class="v3-checks">`);
}
export function groupMEPScenario(html){
 return html.replace(/(<form id="scenario-form"[^>]*>)([\s\S]*?)(<button type="submit">)/,(_,start,content,button)=>{
  const labels=[...content.matchAll(/<label>[\s\S]*?<\/label>/g)].map(m=>m[0]);if(labels.length!==6)throw Error('Expected all six original MEP scenario inputs');
  const group=(title,keys)=>`<fieldset><legend>${title}</legend><div class="bd-filter-grid">${labels.filter(l=>keys.some(k=>l.includes(`name="${k}"`))).join('')}</div></fieldset>`;
  return start+group('Water demand & pressure',['occupants','residual_kpa','pump_head_m'])+group('Roof drainage',['rain_mm_h','parapet_m'])+group('Electrical sizing',['derating'])+'<div class="bd-actions">'+button;
 }).replace(/(<button type="button" id="reset-scenario">[\s\S]*?<\/button>)(<p id="scenario-note")/,'$1</div>$2');
}
export async function prepareBasantiInterface(dist){
 const read=p=>readFile(join(dist,p),'utf8'),put=(p,s)=>writeFile(join(dist,p),s);
 const project=JSON.parse(await read(residence+'data/project.json'));
 const assetRevision=(await read(residence+'index.html')).match(/src="\.\/building\.js\?v=([a-f0-9]+)"/)?.[1];if(!assetRevision)throw Error('Basanti asset revision missing');
 let interior=await read(residence+'interior.html');
 interior=interior.replace('src="./interior.js"',`src="./interior.js?v=${assetRevision}"`).replace('<!-- INTERIOR_DATA -->',JSON.stringify({rooms:project.rooms,source_sha256:project.source_sha256}).replaceAll('<','\\u003c')).replace('<!-- ROOM_CARDS -->',project.rooms.map(r=>`<article class="bd-room-card"><h3>${e(r.label)}</h3><p>${e(r.level)} · ${r.written_width_m} × ${r.written_depth_m} m · source sheet ${r.evidence.page}</p></article>`).join(''));
 await put(residence+'interior.html',interior);
 let structure=groupStructureControls(await read(workbench+'v6/index.html'));
 structure=structure.replace(/(<nav class="project-nav"[^>]*>[\s\S]*?<\/nav>)/,'<details class="bd-secondary-controls bd-version-history"><summary>Structural versions &amp; change reports</summary>$1</details>');
 // Start with the working controls; retain the complete design-basis panel beside the later source review.
 const decisions=structure.match(/<section class="block notes v5-intro" id="v6-decisions">[\s\S]*?<\/section>/);
 if(decisions){const basis=decisions[0].match(/<label>Drawing basis[\s\S]*?<\/label>/);let notes=decisions[0];if(basis){structure=structure.replace('<summary>Drawing labels, panel layout &amp; bar filters</summary><div class="v3-control-grid">','<summary>Drawing basis, labels &amp; bar filters</summary><div class="v3-control-grid">'+basis[0]);notes=notes.replace(basis[0],'');}structure=structure.replace(decisions[0],'').replace('<section class="block notes" id="source-review">',notes+'<section class="block notes" id="source-review">');}
 structure=structure.replace(/<details class="v4-mobile-fold" open><summary>Versions and project hub<\/summary>([\s\S]*?<\/nav><\/details>)<\/details>/,'$1').replace(/<details class="v4-mobile-fold" open><summary>Page contents<\/summary>(<nav[\s\S]*?<\/nav>)<\/details>/,'$1');
 // The inherited mobile controller may set .open on this ID. A div keeps primary filters visible at every width.
 structure=structure.replace('<details class="v4-filter-disclosure" id="v4-filter-disclosure" open><summary>Choose work, member and labels</summary>','<div class="bd-work-selection" id="v4-filter-disclosure">').replace('</details><section class="work-focus">','</div><section class="work-focus">');
 await put(workbench+'v6/index.html',structure);
 let mep=groupMEPScenario(await read(workbench+'v7/index.html'));
 const locations=mep.match(/<section class="mep-section" id="locations">[\s\S]*?<\/section>/);
 if(!locations)throw Error('MEP room source context missing');
 mep=mep.replace(locations[0],'').replace(/(<section\b[^>]*id="calculations"[^>]*>)/,locations[0]+'$1');
 mep=mep.replace('class="mep-controls"','class="mep-controls" aria-label="Filter MEP routes"').replace('</form><div class="toolbar" aria-label="Jump to a view">','<button type="button" id="reset-mep-filters">Reset filters</button></form><div class="toolbar" aria-label="Jump to a view">');
 await put(workbench+'v7/index.html',mep);
}
export async function applyBasantiInterface(dist){
 const css=await readFile(join(dist,residence+'discipline-ui.css'),'utf8'),revision=createHash('sha256').update(css).digest('hex').slice(0,12);
 async function visit(folder){for(const item of await readdir(join(dist,folder),{withFileTypes:true})){const path=folder+item.name;if(item.isDirectory())await visit(path+'/');else if(item.name.endsWith('.html')){
  let html=await readFile(join(dist,path),'utf8');const active=disciplineForPage(path);
  html=html.replace(/(<body[^>]*class=")([^"]*)"/,`$1$2 basanti-discipline${active?' bd-'+active:''}"`).replace(/<nav class="org-project-links"[^>]*>[\s\S]*?<\/nav>/,disciplineNavigation(path));
  html=html.replace('</head>',`<link rel="stylesheet" href="${siteHref(path,residence+'discipline-ui.css')}?v=${revision}"></head>`);
  // Legacy project links remain reachable without duplicating the main discipline tabs.
  html=html.replace(/(<nav class="basanti-project-tabs"[^>]*>[\s\S]*?<\/nav>)/,'<details class="bd-secondary-controls bd-source-tools"><summary>Original building tools &amp; source archive</summary>$1</details>');
  await writeFile(join(dist,path),html);
 }}}
 await visit(residence);await visit(workbench);
}

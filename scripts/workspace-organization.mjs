import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,relative,dirname,posix} from 'node:path';
import {createHash} from 'node:crypto';
import {GROUPS,PROJECTS,PAGE_KINDS,pageKind,classifyPage,normalisePath} from '../public/organization/site-model.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&[a-z0-9#]+;/gi,' ').replace(/\s+/g,' ').trim();
export const organizationVersion='workspace-categories-2026-10-31';

export function siteHref(page,target='') {
  if(/^(?:https?:|mailto:|#)/.test(target))return target;
  const [,pathname,suffix]=target.match(/^([^?#]*)(.*)$/);
  let path=posix.relative(posix.dirname(page),pathname||'.')||'.';
  if(!pathname||pathname.endsWith('/'))path+='/';
  return path+suffix;
}

const icons={home:'M3 11 12 3l9 8M5 10v11h5v-6h4v6h5V10',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',studio:'M3 3h18v18H3zM3 12h18M12 3v18',building:'M5 21V7h10v14M15 12h4v9M3 21h18M8 10h3M8 14h3M8 18h3',layers:'m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5',ruler:'m3 17 14-14 4 4L7 21l-4-4ZM12 8l4 4M8 12l3 3',layout:'M3 3h18v18H3zM3 10h18M13 10v11',folder:'M3 7V4h7l2 3h9v14H3V7Z',chart:'M3 3v18h18M7 16v-4M12 16V7M17 16v-7',book:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4ZM12 6v16',compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 8l-3 5-5 3 3-5 5-3Z',arrow:'M5 12h14m-6-6 6 6-6 6',menu:'M4 6h16M4 12h16M4 18h16'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name]??icons.layers}"/></svg>`;
export function organizationNavigation(page) {
  const active=classifyPage(page).active;
  return GROUPS.map(group=>`<section class="org-nav-group" aria-labelledby="org-nav-${group.id}"><h2 id="org-nav-${group.id}">${esc(group.label)}</h2><ul>${group.items.map(item=>`<li><a href="${esc(siteHref(page,item.path))}"${item.id===active?' aria-current="location"':''}>${icon(item.icon)}<span>${esc(item.label)}${item.note?`<small>${esc(item.note)}</small>`:''}</span></a></li>`).join('')}</ul></section>`).join('');
}

async function walk(root) {
  const files=[];
  for(const e of await readdir(root,{withFileTypes:true})) {
    const path=resolve(root,e.name);
    if(e.isDirectory())files.push(...await walk(path));else files.push(path);
  }
  return files;
}

const action=(page,target,label,primary=false)=>`<a class="org-button${primary?' org-button-primary':''}" href="${esc(siteHref(page,target))}">${esc(label)}${icon('arrow')}</a>`;
const card=(page,{label,title,copy,path,icon:which='layers',image,links=[]})=>`<article class="org-card">${image?`<a class="org-card-image" href="${esc(siteHref(page,path))}" tabindex="-1" aria-hidden="true"><img src="${esc(siteHref(page,image))}" alt="" loading="lazy"></a>`:''}<div class="org-card-body"><p class="org-kicker">${icon(which)}${esc(label)}</p><h3><a href="${esc(siteHref(page,path))}">${esc(title)}</a></h3><p>${esc(copy)}</p><div class="org-card-links">${action(page,path,'Open '+(label==='PROJECT 14'?'project':'workspace'))}${links.map(([p,l])=>`<a href="${esc(siteHref(page,p))}">${esc(l)} →</a>`).join('')}</div></div></article>`;
const sectionHead=(n,title,copy='',anchor='')=>`<div class="org-section-head"><span>${esc(n)}</span><div><h2${anchor?` id="${esc(anchor)}"`:""}>${esc(title)}</h2>${copy?`<p>${esc(copy)}</p>`:''}</div></div>`;
function pageShell(title,body,description='') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><title>${esc(title)} | CAD Test Facility</title><link rel="stylesheet" href="WORKSPACE_CSS"><link rel="icon" href="FAVICON"></head><body class="org-landing"><a class="skip" href="#main">Skip to content</a><nav aria-label="Workspace"></nav><main class="container" id="main">${body}</main></body></html>`;
}
const intro=(eyebrow,title,description)=>`<div class="org-intro"><p class="org-kicker">${esc(eyebrow)}</p><h1>${title}</h1><p>${esc(description)}</p></div>`;

function homePage(manifests) {
  const page='index.html',latest=manifests.basanti.current_version,latestPath='construction/models/basanti-workbench/'+latest+'/';
  return pageShell('Project workspace',`<section class="org-home-hero"><div>${intro('CAD TEST FACILITY / PROJECT WORKSPACE','Every project.<br><em>A clearer view.</em>','Choose a project for its plans, quotations and versions. Reusable drawing tools, extraction progress and learning pages have their own groups.')}<div class="org-hero-actions">${action(page,'#org-projects','Explore projects',true)}${action(page,'directory/','Find a page')}</div></div><aside class="org-start-panel"><span class="org-small-label">A QUICK WAY IN</span><h2>What do you need?</h2><a href="${siteHref(page,'cad/')}">${icon('ruler')}<span>Column formwork drawings<small>2D sheets · 3D assembly · cutting plans</small></span>${icon('arrow')}</a><a href="${siteHref(page,'projects/paila-pilates/#quotations')}">${icon('folder')}<span>Studio quotations<small>Astra and Hamro, kept separately</small></span>${icon('arrow')}</a><a href="${siteHref(page,latestPath)}">${icon('layers')}<span>Basanti workspace · ${esc(latest)}<small>BOQ · plans · quantities · programme</small></span>${icon('arrow')}</a></aside></section>
  <div class="org-fact-strip"><span><i></i>2 project hubs</span><span>${manifests.basanti.versions.length} Basanti versions</span><span>${manifests.estimate.versions.length} Astra estimate views</span><span>Original sources retained</span></div>
  <section class="org-section" id="org-projects">${sectionHead('01','Choose a project','Each project owns its models, quotations, materials, programmes and version history.')}<div class="org-project-grid">${card(page,{label:'STUDIO INTERIOR',title:'Sumita Gurung · Paila Pilates',copy:'Astra and Hamro quotations, the studio SketchUp model, material details, procurement choices and the construction programme.',path:'projects/paila-pilates/',icon:'studio',links:[['construction/models/pilates-sketchup/','Studio model'],['construction/estimates/pilates-astra-2026-10-15/milestone.html','Astra versions'],['construction/estimates/pilates-hamro-2026-10-28/','Hamro quotation']]})}${card(page,{label:'PROJECT 14',title:'Basanti Poudel Baral',copy:'Building plans, structural and reinforcement studies, MEP coordination, the BOQ and the linked construction programme.',path:'construction/models/basanti-residence/milestone.html',icon:'building',links:[[latestPath,'BOQ & programme · '+latest],['construction/models/basanti-workbench/v6/','Structure v6'],['construction/models/basanti-workbench/v7/','MEP v7']]})}</div></section>
  <section class="org-section" id="org-tools">${sectionHead('02','Drawings & tools','Reusable drawing studies and design tools. Studio and residence models stay with their projects.','section-draw-measure-and-explore')}<div class="org-project-grid">${card(page,{label:'CAD & CUTTING',title:'Column formwork',copy:'Five drawing sheets, assembly model, nail positions, cutting plans and material quantities.',path:'cad/',icon:'ruler',image:'downloads/Column_Formwork_Overview.png'})}${card(page,{label:'DESIGN TOOL',title:'Layout Designer',copy:'Arrange a new room concept, edit dimensions and export the design.',path:'construction/models/layout-designer/',icon:'layout'})}</div><p><a href="${siteHref(page,'construction/')}">Browse the complete drawing library →</a></p></section>
  <section class="org-section" id="org-records">${sectionHead('03','Progress & source files','Track extraction work and find original evidence or machine-readable exports.','section-records-progress-and-learning')}<div class="org-link-grid"><a href="${siteHref(page,'progress/')}">${icon('chart')}<span><strong>Extraction progress</strong><small>Four-project checkpoints and remaining extraction work; separate from physical site progress.</small></span>${icon('arrow')}</a><a href="${siteHref(page,'library/')}">${icon('folder')}<span><strong>Sources & exports</strong><small>Original PDFs, drawings, JSON, CSV, IFC and compressed database archives.</small></span>${icon('arrow')}</a></div></section>
  <section class="org-section" id="org-learning">${sectionHead('04','Learning & guides','Reusable explanations and website help, separate from project records.')}<div class="org-link-grid"><a href="${siteHref(page,'memory-posters/')}">${icon('book')}<span><strong>Memory Posters</strong><small>Visual reminders, source explanations and prompts to reuse.</small></span>${icon('arrow')}</a><a href="${siteHref(page,'guide/organization/')}">${icon('compass')}<span><strong>Website guide & references</strong><small>Page categories, navigation help and the existing product review.</small></span>${icon('arrow')}</a></div></section>`, 'Project hubs, construction drawings, source documents, quantities and programmes in one organised workspace.').replace('</body>', '<script>if(["#model","#drawings","#materials","#learn","#sources","#downloads"].includes(location.hash))location.replace("./cad/"+location.hash);</script></body>');
}

function pailaPage() {
  const page='projects/paila-pilates/index.html',base='construction/estimates/pilates-astra-2026-10-15/';
  return pageShell('Paila Pilates · project hub',intro('PROJECT / STUDIO INTERIOR','Sumita Gurung<br><em>Paila Pilates Studio Interior</em>','Start with the quotation you want to understand, or choose a drawing, material or planning task. The two quotations retain their own scope, quantities and prices.')+
  `<section class="org-section" id="quotations">${sectionHead('01','Understand the quotations','Separate source documents for the same studio. The scopes are not assumed to match.')}<div class="org-project-grid">${card(page,{label:'ASTRA / EXISTING ESTIMATE',title:'Astra quotation & versions',copy:'Original quoted works and the full sequence of concise, SI, rate, material and programme views.',path:base+'milestone.html',icon:'folder',links:[[base,'Original quotation'],[base+'v11/','Materials on one page']]})}${card(page,{label:'HAMRO / ANOTHER SUPPLIER',title:'Hamro Construction',copy:'The separate 19-item quotation with simple explanations, illustrations and metric/imperial rates.',path:'construction/estimates/pilates-hamro-2026-10-28/',icon:'folder',links:[['construction/estimates/pilates-hamro-2026-10-28/#quoted-works','Work items']]})}</div></section>
  <section class="org-section" id="studio-drawings">${sectionHead('02','Explore the studio','View the source model or create a separate room concept.')}<div class="org-project-grid">${card(page,{label:'SOURCE-LINKED MODEL',title:'2D, 3D and room quantities',copy:'Pilates SketchUp extraction, room scope and its reviewed BOQ comparison.',path:'construction/models/pilates-sketchup/',icon:'layers'})}${card(page,{label:'CONCEPT DESIGN',title:'Layout Designer',copy:'Edit room dimensions and rearrange elements in a separate design tool.',path:'construction/models/layout-designer/',icon:'layout'})}</div></section>
  <section class="org-section" id="materials-decisions">${sectionHead('03','Materials and decisions','Choose the view that answers your question.')}<div class="org-link-grid">${[[base+'v8/','Materials by work','Open an individual work and inspect its materials.'],[base+'v11/','All materials on one page','Area groups with work and material tables.'],[base+'v12/','Who manages each work?','Professional supervision and owner-managed options.'],[base+'v13/','Budget and savings','Review original budgets and conditional comparisons.']].map(([p,t,c])=>`<a href="${siteHref(page,p)}">${icon('layers')}<span><strong>${esc(t)}</strong><small>${esc(c)}</small></span>${icon('arrow')}</a>`).join('')}</div></section>
  <section class="org-section" id="studio-programme">${sectionHead('04','Plan the work','The existing programme stays linked to its quoted work packages.')}<div class="org-feature-banner"><div><span class="org-kicker">ASTRA V14 / CONSTRUCTION PROGRAMME</span><h3>Activities, crews and dependencies</h3><p>Inspect the linked Gantt, resource loading, scenario assumptions and exports. The schedule retains its existing conditions and held works.</p></div>${action(page,base+'v14/','Open programme',true)}</div></section>
  <section class="org-section" id="studio-records">${sectionHead('05','Versions and source records')}<div class="org-link-grid"><a href="${siteHref(page,base+'milestone.html')}">${icon('book')}<span><strong>Full Astra version directory</strong><small>Every existing estimate view remains available.</small></span>${icon('arrow')}</a><a href="${siteHref(page,'library/?project=paila')}">${icon('folder')}<span><strong>Paila source files & exports</strong><small>Filter original documents, drawings, data and reports.</small></span>${icon('arrow')}</a></div></section>`);
}

function drawingLibrary() {
 const page='construction/index.html';
 return pageShell('Drawing library',intro('DRAWINGS & DESIGN','Find the right<br><em>drawing workspace.</em>','Building plans, studio models and reusable formwork drawings are grouped by their subject. Each workspace retains its detailed controls and downloads.')+
 `<section class="org-section" id="column-formwork">${sectionHead('01','Column formwork CAD','The original CAD drawing workspace has a permanent place here.')}<div class="org-formwork-card"><img src="${siteHref(page,'downloads/Column_Formwork_Overview.png')}" alt="Existing column formwork assembly and dimension drawing" loading="lazy"><div><span class="org-kicker">REUSABLE CONSTRUCTION STUDY</span><h3>Assembly, cutting and fixing details</h3><p>Open the five 2D sheets, 3D assembly, nail positions, timber and plywood cutting plans, material quantities and source downloads.</p>${action(page,'cad/','Open column formwork CAD',true)}</div></div></section>
 <section class="org-section" id="building-drawings">${sectionHead('02','Basanti residence','Source building drawings and separate structural and MEP studies.')}<div class="org-project-grid">${card(page,{label:'BUILDING PLANS',title:'Plans and building register',copy:'Original architectural and structural source with linked floor views.',path:'construction/models/basanti-residence/',icon:'building'})}${card(page,{label:'STRUCTURE / V6',title:'Structural connections',copy:'The preserved beam-piece and column-connection coordination studies.',path:'construction/models/basanti-workbench/v6/',icon:'ruler'})}${card(page,{label:'SERVICES / V7',title:'MEP coordination',copy:'Water, drainage, electrical and ventilation routes in four linked views.',path:'construction/models/basanti-workbench/v7/',icon:'layers'})}${card(page,{label:'BOQ & PROGRAMME / V9',title:'Quantities and work plan',copy:'The current linked building workspace with BOQ quantities, drawings and programme.',path:'construction/models/basanti-workbench/v9/',icon:'chart'})}</div></section>
 <section class="org-section" id="studio-models">${sectionHead('03','Studio and concept models')}<div class="org-project-grid">${card(page,{label:'PILATES MODEL',title:'Source studio workspace',copy:'The extracted SketchUp room, 2D/3D views, quantities and BOQ comparison.',path:'construction/models/pilates-sketchup/',icon:'studio'})}${card(page,{label:'LAYOUT TOOL',title:'Layout Designer',copy:'An editable concept workspace for rooms, furniture and components.',path:'construction/models/layout-designer/',icon:'layout'})}</div></section>`);
}

function guidePage(review) {
 const page='guide/organization/index.html';
 return pageShell('Website guide & product review',intro('WEBSITE GUIDE / DESIGN REVIEW','A place for everything.<br><em>A reason for each choice.</em>','How to navigate this workspace, how its pages relate, and what we learned from fifteen comparable products.')+
 `<section class="org-section" id="site-structure">${sectionHead('01','The site structure','Projects own their versions, drawings, quantities and programmes. Shared tools and evidence are separate.')}<div class="org-structure-grid">${GROUPS.map(g=>`<article><h3>${esc(g.label)}</h3><ul>${g.items.map(i=>`<li><a href="${siteHref(page,i.path)}">${esc(i.label)}</a>${i.note?`<small>${esc(i.note)}</small>`:''}</li>`).join('')}</ul></article>`).join('')}</div><p class="org-note">This is a navigation hierarchy. Existing files and version addresses are retained; the drawings, prices and calculation sources are not relocated.</p></section>
 <section class="org-section" id="navigation-guide">${sectionHead('02','How to find your way')}<div class="org-guide-grid"><article><h3>Start with the project</h3><p>Choose Paila Pilates or Basanti. The hub explains the available tasks and the differences between versions.</p></article><article><h3>Use contents within a page</h3><p>The contents list jumps to named sections. On a phone, open Contents when you need it; drawings scroll inside their own panels.</p></article><article><h3>Search across pages</h3><p>The search button or Ctrl/⌘ K finds pages by title, project, path and section headings. Use All pages for the complete searchable directory.</p></article><article><h3>Trace the source</h3><p>Sources & exports groups original PDFs, drawing files and data by project and file format. Existing engineering references remain on their original pages.</p></article></div></section>
 <section class="org-section" id="design-decisions">${sectionHead('03','What changed, and why')}<div class="table-scroll"><table><thead><tr><th>Before</th><th>Now</th><th>Review basis</th></tr></thead><tbody><tr><td>Projects and tools mixed in one long top menu</td><td>Project hubs, drawing tools and records have separate navigation groups</td><td><a href="#review-R01">R01</a>, <a href="#review-R07">R07</a>, <a href="#review-R14">R14</a></td></tr><tr><td>Version numbers were the main way to choose a view</td><td>Task shortcuts explain quotations, drawings, materials and programmes</td><td><a href="#review-R05">R05</a>, <a href="#review-R08">R08</a>, <a href="#review-R12">R12</a></td></tr><tr><td>Older pages and exports required several clicks to locate</td><td>Searchable page directory and a separate source/export library</td><td><a href="#review-R02">R02</a>, <a href="#review-R04">R04</a>, <a href="#review-R14">R14</a></td></tr><tr><td>Page contents and global links varied between pages</td><td>Shared breadcrumbs, consistent local contents and related-page links</td><td><a href="#review-R10">R10</a>, <a href="#review-R15">R15</a></td></tr><tr><td>Shared presentation could be confused with model changes</td><td>One separate organisation layer, with source/file preservation checks</td><td><a href="#review-R09">R09</a>, <a href="#review-R11">R11</a></td></tr></tbody></table></div></section>
 <section class="org-section" id="product-review">${sectionHead('04','Literature & product review · 15 products','Official product documentation and repositories, reviewed on 29 October 2026.')}<p class="org-note">${esc(review.method)}</p><div class="org-review-grid">${review.products.map(r=>`<article class="org-review-card" id="review-${r.id}"><div class="org-review-heading"><span>${r.id}</span><small>${esc(r.category)}</small></div><h3>${esc(r.product)}</h3><dl><dt>What the source shows</dt><dd>${esc(r.observed)}</dd><dt>Our application</dt><dd>${esc(r.application)}</dd><dt>Where to see it</dt><dd>${esc(r.where)}</dd><dt>Scope</dt><dd>${esc(r.limit)}</dd></dl><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.publisher)} · ${esc(r.title)} ↗</a></article>`).join('')}</div></section>
 <section class="org-section" id="category-update-2026-10-31">${sectionHead("05","Page categories · 31 October 2026")}<p>Projects own their quotations, studio/building models and version history. Drawings & tools contains reusable CAD and concept tools. Progress & source files contains extraction checkpoints and exports; Learning & guides contains Memory Posters and website help.</p><p>The page directory starts with main pages. Its Page type filter also opens original quotations, versioned workspaces, individual work details, drawings/tools or reference pages. Searching from the global search includes all page types. V9 remains the Astra technical data register, not another quotation.</p><p>Sources & exports includes compressed SQL, JSON and SQLite archives with a gzip format label. Existing file addresses, quoted values and engineering data are preserved.</p><p><a href="${siteHref(page,'organization/QA_2026-10-31.md')}">Read the navigation and QA record →</a></p></section>
 <section class="org-section" id="safe-updates">${sectionHead('06','How future updates stay organised')}<ol class="org-steps"><li><strong>Name the project and task.</strong> Identify the owning hub, page and shared data before editing.</li><li><strong>Use a focused branch.</strong> Review its changed files and the pages that depend on them.</li><li><strong>Keep one source.</strong> Derive drawings, tables and schedules from the owning model.</li><li><strong>Check the whole site.</strong> Verify original data, section links, responsive layouts and affected interactions.</li><li><strong>Publish and read back.</strong> Actions builds the site; Pages serves the tested output.</li></ol><p><a href="${siteHref(page,'construction/models/basanti-workbench/v7/#change-guide')}">Read the detailed version-control guide and reusable prompt →</a></p><p><a href="${siteHref(page,'organization/preservation-report.json')}">File preservation report</a> · <a href="${siteHref(page,'organization/QA_2026-10-29.md')}">Redesign QA record</a> · <a href="${siteHref(page,'organization/references.json')}">Machine-readable reference register</a></p></section>`);
}

function fileProject(path) {
 if(path.startsWith('downloads/'))return 'formwork';
 return classifyPage(path).project;
}
const supported=/\.(?:pdf|svg|csv|json|jsonl|sql|sqlite|db|txt|md|ifc|dxf|skp|zip|png|jpe?g|webp)(?:\.gz)?$/i;
const formats={pdf:'PDF',svg:'SVG drawing',csv:'CSV',json:'JSON',jsonl:'JSONL',sql:'SQL',sqlite:'SQLite',db:'Database',txt:'Text',md:'Report',ifc:'IFC',dxf:'DXF',skp:'SketchUp',zip:'Archive',png:'Image',jpg:'Image',jpeg:'Image',webp:'Image'};
export function libraryRecords(files,dist) {
 return files.map(file=>relative(dist,file).split('\\').join('/')).filter(path=>supported.test(path)&&!path.startsWith('organization/')&&!path.startsWith('theme/')&&!path.startsWith('vendor/')&&!path.startsWith('assets/')).map(path=>{
  const compressed=/\.gz$/i.test(path),ext=path.replace(/\.gz$/i,'').split('.').at(-1).toLowerCase(),project=fileProject(path),filename=path.split('/').at(-1);
  return {path,title:filename,project,project_label:PROJECTS[project].label,format:formats[ext]+(compressed?' (gzip)':''),category:path.includes('/source/')?'Original source':path.includes('/drawings/')||ext==='svg'?'Drawing':/QA|REVIEW|README|report|handoff/i.test(path)?'Report / notes':ext==='pdf'?'Document':'Data / export',description:path};
 }).sort((a,b)=>a.project_label.localeCompare(b.project_label)||a.path.localeCompare(b.path));
}
const filterBar=(kind,records)=>`<div class="org-filter-bar"><label><span>Find ${kind==='pages'?'a page':'a file'}</span><input type="search" data-org-filter-query placeholder="${kind==='pages'?'Try: column formwork, rain, materials…':'Search file name or path…'}" autocomplete="off"></label><label><span>Project</span><select data-org-filter-project><option value="">All projects & tools</option>${Object.values(PROJECTS).map(p=>`<option value="${p.id}">${esc(p.label)}</option>`).join('')}</select></label>${kind==='files'?`<label><span>Format</span><select data-org-filter-format><option value="">All formats</option>${[...new Set(records.map(r=>r.format))].sort().map(f=>`<option>${esc(f)}</option>`).join('')}</select></label>`:`<label><span>Page type</span><select data-org-filter-kind><option value="main" selected>Main pages</option><option value="all">All pages</option>${Object.entries(PAGE_KINDS).map(([k,label])=>`<option value="${k}">${esc(label)}</option>`).join('')}</select></label>`}<button type="button" data-org-filter-reset hidden>Reset filters</button></div><p class="org-results-count" data-org-result-count role="status">${records.length} ${kind} · complete published catalogue</p>`;
export function directoryPage(records) {
  const page='directory/index.html';
  return pageShell('All pages',intro('WORKSPACE / PAGE DIRECTORY','Find a page.<br><em>Keep the context.</em>','Choose a project and page type. Main pages brings hubs, quotations, drawings and versioned views together; individual work details remain available in the same directory.')+`<section class="org-catalogue" data-org-catalogue="pages">${filterBar('pages',records)}<p class="org-catalogue-help">Main pages omits only individual work-detail pages. Choose All pages or Individual work details to include them. Every existing page is listed below when JavaScript is unavailable.</p><div class="org-directory-list">${records.map((r,i)=>`<a class="org-directory-row" data-org-record="${i}" data-org-kind="${r.kind}" href="${esc(siteHref(page,r.path))}"><span class="org-row-icon">${icon(r.project==='basanti'?'building':r.project==='paila'?'studio':'layers')}</span><span><strong>${esc(r.title)}</strong><small>${esc(r.project_label)} · ${esc(r.category)}</small><span class="org-row-description">${esc(r.description)}</span></span>${icon('arrow')}</a>`).join('')}</div><p class="org-empty" data-org-no-results hidden>No matching pages. Try fewer words, choose another project, or set Page type to All pages.</p><script type="application/json" data-org-catalogue-data>${JSON.stringify(records).replace(/</g,'\\u003c')}</script></section>`);
}

function libraryPage(records) {
 const page='library/index.html';
 return pageShell('Sources & exports',intro('WORKSPACE / SOURCES & EXPORTS','Follow the evidence.<br><em>Take the files with you.</em>','Original documents, drawing files and machine-readable exports are grouped by their owning project. Files open at their existing published addresses.')+`<section class="org-catalogue" data-org-catalogue="files">${filterBar('files',records)}<div class="org-directory-list">${records.map((r,i)=>`<a class="org-directory-row org-file-row" data-org-record="${i}" href="${esc(siteHref(page,r.path))}"><span class="org-format">${esc(r.format)}</span><span><strong>${esc(r.title)}</strong><small>${esc(r.project_label)} · ${esc(r.category)}</small><code>${esc(r.path)}</code></span>${icon('arrow')}</a>`).join('')}</div><p class="org-empty" data-org-no-results hidden>No matching files. Try another name, project or format.</p><script type="application/json" data-org-catalogue-data>${JSON.stringify(records).replace(/</g,'\\u003c')}</script></section>`);
}

function projectTaskLinks(page) {
 const {project}=classifyPage(page);
 if(project==='paila')return [['projects/paila-pilates/','Project hub'],['construction/estimates/pilates-astra-2026-10-15/milestone.html','Astra versions'],['construction/estimates/pilates-hamro-2026-10-28/','Hamro quotation'],['construction/models/pilates-sketchup/','Studio model'],['construction/estimates/pilates-astra-2026-10-15/v14/','Programme'],['library/?project=paila','Source files']];
 if(project==='basanti')return [['construction/models/basanti-workbench/v9/','Workspace v9'],['construction/models/basanti-workbench/v9/?panel=boq#boq','BOQ'],['construction/models/basanti-workbench/v9/?panel=gantt#gantt','Gantt'],['construction/models/basanti-residence/','Architecture'],['construction/models/basanti-workbench/v6/','Structure v6'],['construction/models/basanti-workbench/v7/','MEP v7'],['construction/models/basanti-residence/interior.html','Interior & Furniture'],['construction/models/basanti-residence/milestone.html','Versions'],['library/?project=basanti','Source files']];
 if(project==='formwork')return [['construction/','Drawing library'],['cad/#model','3D assembly'],['cad/#drawings','2D sheets'],['cad/#materials','Materials'],['cad/#downloads','Downloads']];
 return [];
}
function taskJumpSection(page) {
 const links=projectTaskLinks(page);
 return `<section class="org-task-section" id="org-project-tasks"><span class="org-small-label">CHOOSE BY TASK</span><h2>Go straight to the work you need</h2><div class="org-task-links">${links.map(([p,l])=>`<a href="${esc(siteHref(page,p))}">${esc(l)}${icon('arrow')}</a>`).join('')}</div></section>`;
}

export function addHeadingAnchors(html) {
 let body=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
 if(!body)return {html,headings:[]};
 const used=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1])),headings=[];
 const main=body[1].replace(/<svg\b[\s\S]*?<\/svg>|<script\b[\s\S]*?<\/script>|<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,(whole,attrs,content)=>{
  if(attrs===undefined)return whole;
  const label=plain(content);
  if(!label||/^(?:on this page|contents|table of contents)$/i.test(label))return whole;
  let id=attrs.match(/\bid="([^"]+)"/)?.[1];
  if(!id){
   const stem='section-'+label.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'section-content';
   id=stem;let i=2;while(used.has(id))id=stem+'-'+(i++);
   attrs+=` id="${id}"`;used.add(id);
  }
  headings.push({id,text:label});
  return `<h2${attrs}>${content}</h2>`;
 });
 return {html:html.slice(0,body.index)+body[0].replace(body[1],main)+html.slice(body.index+body[0].length),headings};
}

const pageTitle=html=>plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]??html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]??'Workspace page');
function recordFor(page,html,headings) {
 const c=classifyPage(page);
 const description=plain(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]??html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]??headings.slice(0,3).map(h=>h.text).join(' · '));
 return {path:page,title:pageTitle(html),project:c.project,project_label:PROJECTS[c.project].label,kind:pageKind(page),category:c.category,description:description.slice(0,260),headings};
}

export async function prepareWorkspaceOrganization(root,dist) {
 const base=resolve(dist),source=resolve(root),read=async path=>JSON.parse(await readFile(resolve(source,path),'utf8'));
 const [basanti,estimate,review]=await Promise.all([read('public/construction/models/basanti-workbench/versions.json'),read('public/construction/estimates/pilates-astra-2026-10-15/versions.json'),read('public/organization/references.json')]);
 if(review.products.length!==15||new Set(review.products.map(r=>r.product)).size!==15)throw Error('Organisation review requires fifteen distinct products');
 const newPages=new Map([['index.html',homePage({basanti,estimate})],['construction/index.html',drawingLibrary()],['projects/paila-pilates/index.html',pailaPage()],['guide/organization/index.html',guidePage(review)]]);
 const save=async (page,html)=>{
  await mkdir(dirname(resolve(base,page)),{recursive:true});
  await writeFile(resolve(base,page),html.replace('WORKSPACE_CSS',siteHref(page,'workspace.css')).replace('FAVICON',siteHref(page,'favicon.svg')));
 };
 for(const [page,html]of newPages)await save(page,html);
 // Ten historical worksheets linked to a quantity-model panel that is deliberately
 // absent for held/unresolved works. Keep their destination page and lead to its scope.
 const worksheets=(await walk(resolve(base,'construction/estimates/pilates-astra-2026-10-15/v10'))).filter(p=>p.endsWith('.html'));
 for(const file of worksheets){
  let html=await readFile(file,'utf8');
  const links=[...html.matchAll(/href="(\.\.\/v8\/[^"#]+\.html)#quantity-model-title">Quantity model and assumptions<\/a>/g)];
  for(const match of links){
   const target=await readFile(resolve(dirname(file),match[1]),'utf8');
   if(!target.includes('id="quantity-model-title"'))html=html.replace(match[0],`href="${match[1]}#work-detail">Scope and required inputs</a>`);
  }
  await writeFile(file,html);
 }
 for(const page of ['construction/models/basanti-residence/milestone.html','construction/estimates/pilates-astra-2026-10-15/milestone.html']){
  const path=resolve(base,page);let html=await readFile(path,'utf8');
  html=html.replace(/<section\b/,taskJumpSection(page)+'<section');await writeFile(path,html);
 }
 const files=await walk(base),exports=libraryRecords(files,base);
 await save('library/index.html',libraryPage(exports));
 // The directory is generated after all other pages; it contains its own entry as well.
 await save('directory/index.html',pageShell('All pages',intro('PAGE DIRECTORY','All pages','Search the complete website.')));
 const pages=(await walk(base)).filter(p=>p.endsWith('.html')).sort(),records=[];
 for(const path of pages){const page=relative(base,path).split('\\').join('/'),r=addHeadingAnchors(await readFile(path,'utf8'));await writeFile(path,r.html);records.push(recordFor(page,r.html,r.headings));}
 records.sort((a,b)=>a.project_label.localeCompare(b.project_label)||a.category.localeCompare(b.category)||a.title.localeCompare(b.title));
 await save('directory/index.html',directoryPage(records));
 const dir=addHeadingAnchors(await readFile(resolve(base,'directory/index.html'),'utf8'));await writeFile(resolve(base,'directory/index.html'),dir.html);
 await writeFile(resolve(base,'organization/page-index.json'),JSON.stringify({schema:'cad-site-page-index-1',version:organizationVersion,pages:records},null,2)+'\n');
 await writeFile(resolve(base,'organization/file-index.json'),JSON.stringify({schema:'cad-site-file-index-1',files:exports},null,2)+'\n');
 await writeFile(resolve(base,'organization/site-map.json'),JSON.stringify({schema:'cad-site-information-architecture-1',date:'2026-10-31',page_kinds:PAGE_KINDS,groups:GROUPS,projects:PROJECTS,existing_urls:'retained',reference_count:review.products.length},null,2)+'\n');
 console.log(`Workspace catalogue: ${records.length} pages, ${exports.length} source/export files and ${review.products.length} product references.`);
 return {records,exports,review};
}

function footer(page,review) {
 return `<footer class="org-footer" id="org-footer"><div class="org-footer-top"><div><span class="org-kicker">CAD TEST FACILITY</span><p>Projects, drawings and evidence.<br>Organised for the next decision.</p></div><div class="org-footer-links"><a href="${siteHref(page,'directory/')}">All pages</a><a href="${siteHref(page,'library/')}">Sources & exports</a><a href="${siteHref(page,'guide/organization/')}">Website guide</a><a href="https://github.com/pailapilates09-sys/CAD_Test-Facility" target="_blank" rel="noopener">GitHub source ↗</a><a href="#main">Back to top ↑</a></div></div><section class="org-footer-references" aria-labelledby="org-reference-title"><div><h2 id="org-reference-title">Design references · 15 products</h2><p>Official documentation reviewed on 29 October 2026. <a href="${siteHref(page,'guide/organization/#product-review')}">Read the review and applications →</a></p></div><ol>${review.products.map(r=>`<li><span>${r.id.slice(1)}</span><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.product)} ↗</a></li>`).join('')}</ol></section><p class="org-footer-scope">These references inform navigation and presentation. Engineering sources and project-specific qualifications remain on their original pages.</p></footer>`;
}

export function decorateOrganization(html,page,review,revision) {
 if(html.includes('data-org-version='))throw Error('Organisation shell already applied to '+page);
 const c=classifyPage(page),project=PROJECTS[c.project],headings=addHeadingAnchors(html).headings;
 const links=projectTaskLinks(page);
 const currentHub=normalisePath(page)===normalisePath(project.path);
 const crumbs=`<nav class="org-breadcrumbs" aria-label="Breadcrumb"><a href="${siteHref(page,'')}">Workspace</a>${project.id!=='workspace'?`<span aria-hidden="true">/</span><a href="${siteHref(page,project.path)}">${esc(project.label)}</a>`:''}<span aria-hidden="true">/</span><span aria-current="page">${esc(c.project!=='workspace'&&currentHub?'Project hub':c.category)}</span></nav>`;
 const top=`<header class="org-topbar"><a class="org-brand" href="${siteHref(page,'')}"><span class="org-brand-mark">C<span>F</span></span><span>CAD Test Facility<small>PROJECT WORKSPACE</small></span></a><div class="org-top-actions"><a class="org-search-trigger" aria-label="Find a page" data-org-search href="${siteHref(page,'directory/')}">${icon('search')}<span>Find a page</span><kbd>⌘ K</kbd></a><a class="org-menu-trigger" href="#org-workspace-nav" role="button" aria-controls="org-workspace-nav" aria-expanded="false" data-org-menu>${icon('menu')}<span>Menu</span></a></div></header>
 <aside class="org-sidebar" id="org-workspace-nav"><div class="org-sidebar-heading"><span class="org-small-label">EXPLORE THE WORKSPACE</span><button type="button" data-org-menu-close hidden aria-label="Close workspace menu">×</button></div><nav aria-label="Workspace">${organizationNavigation(page)}</nav><div class="org-sidebar-foot"><span class="org-status-dot"></span>Sources stay with their projects<a href="${siteHref(page,'guide/organization/#navigation-guide')}">How to use this site →</a></div></aside><button type="button" class="org-menu-scrim" data-org-menu-close hidden aria-label="Close workspace menu"></button>`;
 const context=`<div class="org-context">${crumbs}${links.length?`<nav class="org-project-links" aria-label="Related project pages">${links.map(([p,l])=>`<a href="${siteHref(page,p)}"${normalisePath(p)===normalisePath(page)?' aria-current="page"':''}>${esc(l)}</a>`).join('')}</nav>`:''}</div>`;
 // Retain all local drawing controls; only the duplicated global header/navigation is replaced.
 html=html.replace(/<header\b[^>]*class="[^"]*\bworkspace-head\b[^"]*"[^>]*>[\s\S]*?<\/header>/gi,'').replace(/<nav\b[^>]*aria-label="Workspace"[^>]*>[\s\S]*?<\/nav>/gi,'');
 html=html.replace(/<footer\b([^>]*)>([\s\S]*?)<\/footer>/gi,(_,attrs,content)=>`<div class="org-legacy-footer">${content}</div>`);
 html=html.replace(/<body([^>]*)>/i,(_,attrs)=>{
  const next=/\bclass="/.test(attrs)?attrs.replace(/class="([^"]*)"/,(_,cl)=>`class="${cl} org-site"`):attrs+' class="org-site"';
  return `<body${next} data-org-version="${organizationVersion}" data-org-project="${c.project}">${top}${context}`;
 });
 const existing=html.match(/<nav\b[^>]*class="[^"]*\bproject-contents\b[^"]*"[^>]*>[\s\S]*?<\/nav>/i);
 if(existing){
  const changed=existing[0].replace('class="','class="org-contents ').replace(/<ol>/,'<button type="button" class="org-toc-toggle" data-org-toc-toggle hidden aria-expanded="true">Contents <span>−</span></button><ol data-org-toc-list>');
  html=html.replace(existing[0],changed);
 }else if(headings.length>=3&&page!=='index.html'){
  const toc=`<nav class="org-contents" aria-label="On this page"><div class="org-toc-heading"><span class="org-small-label">ON THIS PAGE</span><span>${headings.length} sections</span></div><button type="button" class="org-toc-toggle" data-org-toc-toggle hidden aria-expanded="true">Contents <span>−</span></button><ol data-org-toc-list>${headings.map(h=>`<li><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`).join('')}</ol></nav>`;
  html=html.replace(/(<main\b[^>]*>)/i,'$1'+toc);
 }
 const search=`<dialog class="org-search-dialog" data-org-search-dialog aria-labelledby="org-search-title"><div class="org-search-head"><h2 id="org-search-title">Find a page</h2><button type="button" data-org-search-close aria-label="Close search">×</button></div><label class="org-search-field">${icon('search')}<span class="org-sr-only">Search pages</span><input type="search" data-org-search-input placeholder="Project, work, drawing or section…" autocomplete="off"></label><p class="org-search-status" data-org-search-status role="status">Search page titles, projects and section headings.</p><div class="org-search-results" data-org-search-results></div><a class="org-search-all" data-org-search-all href="${siteHref(page,'directory/')}">Browse all pages →</a></dialog>`;
 html=html.replace(/<\/head>/i,`<link rel="stylesheet" href="${siteHref(page,'organization/interface.css')}?v=${revision}"></head>`).replace(/<\/body>/i,`${footer(page,review)}${search}<script type="module" src="${siteHref(page,'organization/interface.js')}?v=${revision}" data-org-root="${siteHref(page,'')}"></script></body>`);
 return html;
}

export async function applyWorkspaceOrganization(root,dist) {
 const base=resolve(dist),review=JSON.parse(await readFile(resolve(root,'public/organization/references.json'),'utf8'));
 const hash=createHash('sha256');
 for(const p of ['public/organization/interface.css','public/organization/interface.js','public/organization/site-model.js','scripts/workspace-organization.mjs','public/organization/references.json'])hash.update(await readFile(resolve(root,p)));
 const revision=hash.digest('hex').slice(0,16),pages=(await walk(base)).filter(p=>p.endsWith('.html'));
 for(const file of pages)await writeFile(file,decorateOrganization(await readFile(file,'utf8'),relative(base,file).split('\\').join('/'),review,revision));
  const modulePath=resolve(base,'organization/interface.js'),module=await readFile(modulePath,'utf8');
  if(!module.includes("from './site-model.js'"))throw Error('Missing unversioned organisation model import');
  await writeFile(modulePath,module.replace("from './site-model.js'",`from './site-model.js?v=${revision}'`));
 return {pages:pages.length,revision};
}

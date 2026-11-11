import {readFile,writeFile} from 'node:fs/promises';
import {SAUGAT_STORE_PATH,PROJECTS} from '../public/organization/site-model.js';
import {validateProject,escapeHTML as e} from '../public/construction/models/basanti-residence/building-model.js';
import {buildConstructionModel} from '../public/construction/models/basanti-residence/construction-model.js';
import {buildingSections,contents} from './building-navigation.mjs';
import {renderBuildingViewer} from './building-viewer.mjs';

export async function buildSaugatVirtualStore(dist,revision){
 const base=new URL(SAUGAT_STORE_PATH,dist),evidence='../basanti-residence/';
 const project=validateProject(JSON.parse(await readFile(new URL('data/project.json',base),'utf8')));
 const basis=project.lineage;
 if(project.title!==PROJECTS.saugat.label||project.id!==SAUGAT_STORE_PATH.split('/').at(-2)||!/^[a-f0-9]{40}$/.test(basis?.source_commit??'')||basis.source_project_id!=='basanti-residence')throw Error('Store model identity or baseline missing');
 const data=JSON.stringify(project).replaceAll('<','\\u003c');
 const asset=name=>evidence+name+'?v='+revision;
 const originalModel='https://github.com/pailapilates09-sys/CAD_Test-Facility/blob/'+basis.source_commit+'/'+basis.source_model_path;
 const title=e(project.title);
 const html=`<!doctype html>
<html lang="en">
<head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${title} | CAD Test Facility</title>
 <meta name="description" content="Explore the linked 2D plans, 3D model and dimensions for Saugat Paneru Virtual Store, using a separate copy of the Basanti reference layout.">
 <link rel="icon" href="../../../favicon.svg"><link rel="stylesheet" href="../../../workspace.css">
 <link rel="stylesheet" href="${asset('building.css')}"><link rel="stylesheet" href="${asset('project.css')}"><link rel="stylesheet" href="${asset('discipline-ui.css')}">
</head>
<body class="basanti-page basanti-discipline bd-architecture">
<main class="container building-workspace" id="main">
 <header class="page-title"><div><p class="eyebrow">NEW PROJECT / REFERENCE LAYOUT</p><h1>${title}</h1><p>Explore the linked 2D floor plans and 3D model. This project starts with the same dimensions and geometry as <a href="${evidence}">Basanti Poudel Baral</a>.</p></div></header>
 <p class="drawing-release"><strong>Reference layout</strong> · The original floors, openings and structural details are kept as a starting point. Store-specific measurements have yet to be supplied.</p>
 ${contents(buildingSections)}
 ${renderBuildingViewer(project,buildConstructionModel(project),evidence)}
 <details class="bd-secondary-controls" id="building-facts"><summary>Reference floor levels &amp; areas</summary><section class="level-strip" id="levels-list" aria-label="Reference levels"></section></details>
 <section id="building-confirmation" class="building-panel interpretation-panel"><div class="panel-title"><h2>Inherited source checks</h2></div><p class="panel-intro">These notes describe the original Basanti drawings and apply to the reference geometry shown here.</p><div id="issues-list"></div></section>
 <section id="building-downloads" class="building-downloads"><div><p class="eyebrow">PROJECT MODEL &amp; SOURCE</p><h2>Continue from this layout</h2><p>Both views and the register use this store project's own model file. The original Basanti plans remain available as evidence for the starting layout.</p></div><div class="download-links"><a href="./data/project.json" download>Store model · JSON</a><a href="${evidence}source/original.pdf">Basanti drawing set · PDF</a><a href="${evidence}data/basanti-review.ifc" download>Basanti reference model · IFC4</a><a href="${e(originalModel)}">Baseline model revision ↗</a></div></section>
</main>
<script id="building-data" type="application/json" data-evidence-base="${evidence}">${data}</script>
<script type="module" src="${asset('building.js')}"></script>
</body></html>
`;
 await writeFile(new URL('index.html',base),html);
}

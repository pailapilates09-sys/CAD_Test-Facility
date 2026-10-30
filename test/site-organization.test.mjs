import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {addHeadingAnchors,siteHref,organizationNavigation,decorateOrganization} from '../scripts/workspace-organization.mjs';
import {classifyPage,searchRecords} from '../public/organization/site-model.js';

const review=JSON.parse(await readFile(new URL('../public/organization/references.json',import.meta.url)));

test('project ownership keeps both studio quotations together, separates Basanti MEP and retains standalone formwork',()=>{
 assert.equal(classifyPage('construction/estimates/pilates-hamro-2026-10-28/index.html').project,'paila');
 assert.equal(classifyPage('construction/estimates/pilates-astra-2026-10-15/v11/index.html').project,'paila');
 assert.equal(classifyPage('construction/models/basanti-workbench/v7/index.html').category,'MEP coordination');
 assert.equal(classifyPage('cad/index.html').project,'formwork');
 assert.equal(classifyPage('progress/index.html').project,'workspace');
 assert.equal(siteHref('construction/models/basanti-workbench/v7/index.html','cad/#drawings'),'../../../../cad/#drawings');
 assert.equal(siteHref('directory/index.html','library/?project=paila'),'../library/?project=paila');
 assert.equal(siteHref('index.html',''),'./');
});

test('contents anchors preserve existing IDs, avoid collisions and ignore markup stored inside scripts and SVG',()=>{
 const original='<html><head></head><body><main id="main"><section id="source"><h2 id="kept">Source data</h2><h2>Roof &amp; rain</h2><h2>Roof &amp; rain</h2><script>let t="<h2>Fake</h2>"</script><svg><foreignObject><h2>Graphic</h2></foreignObject></svg><table><tr><td>3,748,684.96</td></tr></table></section></main></body></html>';
 const a=addHeadingAnchors(original);
 assert.deepEqual(a.headings.map(h=>h.id),['kept','section-roof-rain','section-roof-rain-2']);
 assert.ok(a.html.includes('id="source"'));assert.ok(a.html.includes('<td>3,748,684.96</td>'));
 assert.ok(a.html.includes('let t="<h2>Fake</h2>"'));assert.deepEqual(addHeadingAnchors(a.html),a);
});

test('page search matches project, path and section words together and combines project/format filters',()=>{
 const rows=[{title:'Water services',path:'v7/',project:'basanti',project_label:'Basanti',headings:[{text:'Roof rainwater'}],format:'CSV'},{title:'Formwork',path:'cad/',project:'formwork',format:'PDF'},{title:'Material quantities',path:'v11/',project:'paila',format:'CSV'}];
 assert.deepEqual(searchRecords(rows,'basanti rain'),[rows[0]]);
 assert.deepEqual(searchRecords(rows,'',{project:'paila',format:'CSV'}),[rows[2]]);
 assert.deepEqual(searchRecords(rows,'rain',{project:'paila'}),[]);
 assert.equal(searchRecords(rows,'',{limit:2}).length,2);
 assert.deepEqual(searchRecords(rows,'does not exist'),[]);
});

test('shared shell preserves a working drawing and its controllers while placing all fifteen references in the footer',()=>{
 assert.equal(review.products.length,15);assert.equal(new Set(review.products.map(r=>r.product)).size,15);
 const source='<html><head><script src="./controller.js"></script></head><body class="original"><header class="workspace-head"><nav aria-label="Workspace">Old global navigation</nav></header><header class="header"><nav aria-label="Drawing tools"><a href="#source">Original tools</a></nav></header><main id="main"><section id="source"><h2>Source</h2><table><tr><td>100 mm</td></tr></table></section></main></body></html>';
 const decorated=decorateOrganization(source,'cad/index.html',review,'test');
 assert.equal((decorated.match(/aria-label="Workspace"/g)??[]).length,1);
 assert.ok(decorated.includes('aria-label="Drawing tools"'));assert.ok(decorated.includes('<td>100 mm</td>'));
 assert.ok(decorated.includes('src="./controller.js"'));assert.ok(decorated.includes('class="original org-site"'));
 const footer=decorated.match(/<footer class="org-footer"[\s\S]*?<\/footer>/)[0];
 for(const r of review.products)assert.ok(footer.includes(r.url));
 assert.ok(organizationNavigation('cad/index.html').includes('aria-current="location"'));
 assert.throws(()=>decorateOrganization(decorated,'cad/index.html',review,'test'),/already applied/);
});

test('category groups keep the two projects distinct and give formwork a direct drawing-tool link',async()=>{
 const {GROUPS}=await import('../public/organization/site-model.js');
 assert.deepEqual(GROUPS.map(g=>g.id),['workspace','projects','tools','records','learning']);
 assert.deepEqual(GROUPS.find(g=>g.id==='projects').items.map(i=>i.id),['paila','basanti']);
 assert.equal(GROUPS.find(g=>g.id==='tools').items[0].path,'cad/');
 assert.deepEqual(GROUPS.find(g=>g.id==='records').items.map(i=>i.id),['sources','progress']);
 assert.deepEqual(GROUPS.find(g=>g.id==='learning').items.map(i=>i.id),['memory','guide']);
 const links=GROUPS.flatMap(g=>g.items.map(i=>i.path));assert.equal(new Set(links).size,links.length);
});

test('page types separate original offers, technical versions and individual material worksheets',async()=>{
 const {pageKind}=await import('../public/organization/site-model.js');
 const a='construction/estimates/pilates-astra-2026-10-15/';
 for(const p of [a+'v8/item-01.html',a+'v10/work-01.html'])assert.equal(pageKind(p),'work-detail');
 for(const p of [a+'v8/index.html',a+'v9/index.html',a+'v5.1/index.html','construction/models/basanti-workbench/v8/index.html'])assert.equal(pageKind(p),'version');
 assert.equal(pageKind(a+'index.html'),'quotation');
 assert.equal(pageKind('construction/estimates/pilates-hamro-2026-10-28/index.html'),'quotation');
 assert.equal(pageKind(a+'milestone.html'),'overview');
 assert.equal(pageKind('construction/models/pilates-sketchup/index.html'),'model');
 assert.equal(classifyPage(a+'v9/index.html').category,'Technical source register');
});

test('main-page filtering retains all offers and version views, while all/detail filters recover every individual work',()=>{
 const rows=[{title:'Astra',project:'paila',kind:'quotation'},{title:'Materials v11',project:'paila',kind:'version'},{title:'Plywood material work',project:'paila',kind:'work-detail'},{title:'Formwork',project:'formwork',kind:'model'}];
 assert.deepEqual(searchRecords(rows,'',{kind:'main'}),[rows[0],rows[1],rows[3]]);
 assert.deepEqual(searchRecords(rows,'',{kind:'all'}),rows);
 assert.deepEqual(searchRecords(rows,'plywood',{project:'paila',kind:'work-detail'}),[rows[2]]);
 assert.deepEqual(searchRecords(rows,'',{project:'paila',kind:'quotation'}),[rows[0]]);
});

test('the source library exposes compressed database, SQL and JSON archives without mislabelling or moving them',async()=>{
 const {libraryRecords}=await import('../scripts/workspace-organization.mjs');
 const paths=['construction/models/basanti-residence/data/building.sqlite.gz','construction/models/basanti-residence/data/building.sql.gz','construction/models/basanti-workbench/history/v1-source.json.gz','downloads/Material_Quantities.csv','organization/page-index.json','assets/spec.mjs'];
 const rows=libraryRecords(paths.map(p=>'/site/'+p),'/site');
 assert.equal(rows.length,4);
 assert.equal(rows.find(r=>r.path===paths[0]).format,'SQLite (gzip)');
 assert.equal(rows.find(r=>r.path===paths[1]).format,'SQL (gzip)');
 assert.equal(rows.find(r=>r.path===paths[2]).format,'JSON (gzip)');
 assert.equal(rows.find(r=>r.path===paths[0]).project,'basanti');
 assert.deepEqual(searchRecords(rows,'sqlite gzip'),[rows.find(r=>r.path===paths[0])]);
 assert.equal(rows.find(r=>r.path===paths[3]).project,'formwork');
});

test('directory JSON preserves literal markup safely, and all work records remain available without JavaScript',async()=>{
 const {directoryPage}=await import('../scripts/workspace-organization.mjs');
 const record={title:'Plywood </script> source',description:'<b>original wording</b>',path:'work.html',project:'paila',project_label:'Paila Pilates',kind:'work-detail',category:'Materials',headings:[]};
 const html=directoryPage([record]);
 const payload=html.match(/<script type="application\/json" data-org-catalogue-data>([\s\S]*?)<\/script>/)[1];
 assert.deepEqual(JSON.parse(payload),[record]);
 assert.doesNotMatch(payload,/<\/script>/);
 assert.match(html,/data-org-record="0"/);assert.match(html,/Page type/);assert.match(html,/value="all"/);
});

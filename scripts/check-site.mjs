import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {workspaceSections} from './site-experience.mjs';
import {organizationNavigation} from './workspace-organization.mjs';
import {fileURLToPath,pathToFileURL} from 'node:url';

export async function checkSite(directory){
 const root=resolve(directory),files=[],revisions=new Set();
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
 await walk(root);const pages=files.filter(x=>x.endsWith('.html'));let links=0,imports=0;
 for(const file of pages){
  const text=await readFile(file,'utf8');
  const mainContent=text.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??text;
  const navigation=[...text.matchAll(/<nav\b[^>]*aria-label="Workspace"[^>]*>([\s\S]*?)<\/nav>/g)];
  if(navigation.length!==1||navigation[0][1]!==organizationNavigation(relative(root,file).split('\\').join('/')))throw Error('Workspace navigation differs in '+relative(root,file));
  if(file.includes('/pilates-astra-2026-10-15/')&&(/\/v(?:2|3|4|5|5\.1|6|7|8|9|10|11|12|13|14)\/[^/]+\.html$/.test(file)||file.endsWith('/pilates-astra-2026-10-15/index.html'))){
   const revision=text.match(/name="estimate-source-revision" content="([a-f0-9]{16})"/);
   if(!revision)throw Error('Missing shared source revision in '+file);revisions.add(revision[1]);
   if(file.includes('/v10/')&&!text.includes('v10.js?source='+revision[1]))throw Error('Contractor page script cache key differs from its source in '+file);
   if(file.includes('/v8/')&&!text.includes('v8.js?source='+revision[1]))throw Error('Material page script cache key differs from its source in '+file);
  }
  if(/v(?:5|5\.1|6|7|9|10|11)\/index.html$/.test(file)){
   const ids=[...text.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);if(ids.length!==new Set(ids).size)throw Error('Duplicate HTML id in '+file);
  }
  if(file.includes('/v10/')){
   for(const head of text.matchAll(/<thead>(.*?)<\/thead>/gs))if((head[1].match(/<th /g)??[]).length>5)throw Error('V10 table exceeds five columns');
   if(/schema_version|created_at|modified_at/.test(text))throw Error('Database metadata appeared in contractor tables');
  }
  if(file.endsWith('/v11/index.html')){
   for(const head of text.matchAll(/<thead>(.*?)<\/thead>/gs))if((head[1].match(/<th /g)??[]).length>4)throw Error('V11 table exceeds four columns');
   if(/<details|<dialog|<iframe|SOURCE_REVISION|V11_REVISION|schema_version|created_at|modified_at/.test(mainContent))throw Error('V11 contains hidden work panels, unresolved assets or database metadata');
   if((text.match(/data-inline-work=/g)??[]).length!==51||(text.match(/data-inline-material=/g)??[]).length!==261)throw Error('V11 omitted a work or material line');
   const css=text.match(/v11\.css\?v=([a-f0-9]{16})/),script=text.match(/v11\.js\?v=([a-f0-9]{16})/);
   if(!css||!script||css[1]!==script[1])throw Error('V11 asset revisions differ');
  }
  if(file.endsWith('/v12/index.html')){
   if((text.match(/<table\b/g)??[]).length!==2||(text.match(/data-decision-subject=/g)??[]).length!==55)throw Error('V12 must have exactly two tables and complete responsibility coverage');
   if((text.match(/data-subject-type="work"/g)??[]).length!==51||(text.match(/data-subject-type="allowance"/g)??[]).length!==2||(text.match(/data-subject-type="option"/g)??[]).length!==2)throw Error('V12 lost a work, allowance or new option');
   if((text.match(/ON HOLD · route only; no order/g)??[]).length!==6)throw Error('V12 released a held work');
   for(const head of text.matchAll(/<thead>(.*?)<\/thead>/gs))if((head[1].match(/<th /g)??[]).length!==4)throw Error('V12 responsibility tables must have four columns');
   const ids=[...text.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);if(ids.length!==new Set(ids).size)throw Error('V12 has duplicate anchors');
   if(/V12_REVISION|SOURCE_REVISION/.test(text))throw Error('Unresolved V12 cache revision');
   const css=text.match(/v12\.css\?v=([a-f0-9]{16})/),script=text.match(/v12\.js\?v=([a-f0-9]{16})/);if(!css||!script||css[1]!==script[1])throw Error('V12 assets use different cache revisions');
  }
  if(file.endsWith('/v13/index.html')){
   if((text.match(/<table\b/g)??[]).length!==3||(text.match(/data-savings-work=/g)??[]).length!==51)throw Error('V13 must have two complete work tables and one comparison');
   if((text.match(/ON HOLD · original budget retained/g)??[]).length!==6)throw Error('V13 lost a held original budget');
   for(const head of text.matchAll(/<thead>(.*?)<\/thead>/gs))if((head[1].match(/<th /g)??[]).length!==4)throw Error('V13 budget tables must have four columns');
   const ids=[...text.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);if(ids.length!==new Set(ids).size)throw Error('V13 has duplicate anchors');
   if(/V13_REVISION|SOURCE_REVISION/.test(text)||!text.includes('Savings are not established yet.'))throw Error('V13 has unresolved assets or an unsupported initial saving');
   const css=text.match(/v13\.css\?v=([a-f0-9]{16})/),script=text.match(/v13\.js\?v=([a-f0-9]{16})/);if(!css||!script||css[1]!==script[1])throw Error('V13 assets use different cache revisions');
  }
  for(const match of text.matchAll(/\s(?:href|src)="([^"]+)"/g)){
   const url=match[1].replaceAll('&amp;','&');if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url))continue;
   const pathname=decodeURIComponent(url.split(/[?#]/)[0]);if(!pathname)continue;
   let target=pathname.startsWith('/CAD_Test-Facility/')?resolve(root,pathname.slice(19)):pathname.startsWith('/')?resolve(root,pathname.slice(1)):resolve(dirname(file),pathname);
   try{if((await stat(target)).isDirectory())target=resolve(target,'index.html');if(!(await stat(target)).isFile())throw Error('not a file');}catch{throw Error('Missing local link: '+relative(root,file)+' -> '+url);}
   links++;
  }
 }
 // In-page and cross-page Basanti contents must land on a real, unique panel.
 const basantiPages=pages.filter(file=>/\/construction\/models\/basanti-(?:residence|workbench)\//.test(file)),anchorCache=new Map();let sectionLinks=0;
 const pageAnchors=async file=>{if(!anchorCache.has(file)){const html=await readFile(file,'utf8'),ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('Duplicate Basanti section ID in '+relative(root,file));anchorCache.set(file,new Set(ids));}return anchorCache.get(file);};
 for(const file of basantiPages){await pageAnchors(file);const html=await readFile(file,'utf8');for(const [,value]of html.matchAll(/\shref="([^"]*#[^"]+)"/g)){if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value))continue;const url=new URL(value.replaceAll('&amp;','&'),pathToFileURL(file));if(!url.hash||/^#page=/.test(url.hash))continue;url.search='';const fragment=decodeURIComponent(url.hash.slice(1));url.hash='';let target=fileURLToPath(url);if(!target.endsWith('.html'))target=resolve(target,'index.html');if(!(await pageAnchors(target)).has(fragment))throw Error('Missing Basanti section: '+relative(root,file)+' -> '+value);sectionLinks++;}}
 console.log('Basanti navigation: '+sectionLinks+' section links resolve to unique panel IDs.');
 for(const file of files.filter(x=>x.endsWith('.js'))){
  const text=await readFile(file,'utf8');for(const m of text.matchAll(/(?:from\s*|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g)){
   const path=resolve(dirname(file),m[2].split(/[?#]/)[0]);try{if(!(await stat(path)).isFile())throw Error('not a file');}catch{throw Error('Missing module import: '+relative(root,file)+' -> '+m[2]);}imports++;
  }
 }
 if(revisions.size!==1)throw Error('Current views use different source revisions');
 const revision=[...revisions][0];
 const projectRoot=resolve(root,'construction/estimates/pilates-astra-2026-10-15');
 const quote=JSON.parse(await readFile(resolve(projectRoot,'shared/quote-view.json'),'utf8')),hierarchy=JSON.parse(await readFile(resolve(projectRoot,'v2/hierarchy.json'),'utf8'));
 if(quote.derivation.revision!==revision||hierarchy.derivation.revision!==revision)throw Error('Early views have stale source projections');
 const scopeScript=await readFile(resolve(projectRoot,'v2/v2.js'),'utf8');if(!scopeScript.includes('quote-view.json?source='+revision)||scopeScript.includes("fetchJSON('../data/estimate.json')"))throw Error('V2 reads an independent historical estimate');
 for(const version of ['v3','v4']){const html=await readFile(resolve(projectRoot,version+'/index.html'),'utf8');if(/id="chart"|id="chart-root"|id="total"|src="\.\/v[34]\.js"/.test(html))throw Error('SI/research view repeated the full estimate hierarchy')}
 const versions=JSON.parse(await readFile(resolve(root,'construction/estimates/pilates-astra-2026-10-15/versions.json'),'utf8'));
 if(JSON.stringify(versions.workspace_navigation.primary_sections)!==JSON.stringify(workspaceSections.map(section=>section.label)))throw Error('Workspace section register differs from navigation');
 const homeHTML=await readFile(resolve(root,'index.html'),'utf8'),constructionHTML=await readFile(resolve(root,'construction/index.html'),'utf8'),progressHTML=await readFile(resolve(root,'progress/index.html'),'utf8');
 if(!homeHTML.includes('id="org-projects"')||!homeHTML.includes('href="projects/paila-pilates/"')||!homeHTML.includes('href="cad/"'))throw Error('Home must expose its project hubs and column formwork');
 if(!constructionHTML.includes('id="column-formwork"')||!constructionHTML.includes('href="../cad/"'))throw Error('Drawing library omitted the existing column formwork workspace');
 if(/id="construction-status"|href="[^"]*#construction-status"|CONSTRUCTION_PROGRESS/.test(progressHTML)||!progressHTML.includes('id="extraction-roadmap"'))throw Error('Progress must retain extraction progress without the duplicate website-status summary');
 const savings=JSON.parse(await readFile(resolve(projectRoot,'v13/budget-view.json'),'utf8')),savingsScript=await readFile(resolve(projectRoot,'v13/v13.js'),'utf8'),savingsHTML=await readFile(resolve(projectRoot,'v13/index.html'),'utf8');
 if(savings.derivation.source_revision!==revision||savings.derivation.responsibility_revision!== (await readFile(resolve(projectRoot,'v12/index.html'),'utf8')).match(/v12\.js\?v=([a-f0-9]{16})/)[1])throw Error('V13 financial/responsibility sources differ from current views');
 if(!savingsScript.includes('budget-view.json?v='+savings.derivation.view_revision)||!savingsScript.includes('savings-model.js?v='+savings.derivation.view_revision)||!savingsHTML.includes('v13.js?v='+savings.derivation.view_revision))throw Error('V13 data and scripts use different cache revisions');
 const savingsIds=savings.groups.flatMap(group=>group.rows.map(work=>work.id));if(savingsIds.length!==51||new Set(savingsIds).size!==51)throw Error('V13 duplicates or omits a quoted work');
 if(savings.groups.reduce((sum,group)=>sum+BigInt(group.original_minor),0n)+BigInt(savings.allowances_minor)!==BigInt(savings.pre_vat_minor))throw Error('V13 original budget does not reconcile');
 const memory=await readFile(resolve(root,'memory-posters/index.html'),'utf8');
 if(!memory.includes('name="memory-source-revision" content="'+revision+'"')||/MEMORY_REVISION|<details|<dialog|\{\{/.test(memory.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??memory))throw Error('Memory Posters has a stale source, hidden content or an unresolved placeholder');
 const posterIds=[...memory.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);if(posterIds.length!==new Set(posterIds).size)throw Error('Duplicate Memory Poster id');
 for(const target of memory.matchAll(/data-copy-prompt="([^"]+)"/g))if(!posterIds.includes(target[1]))throw Error('Missing copyable prompt: '+target[1]);
 const posterCollection=JSON.parse(await readFile(resolve(root,'memory-posters/posters.json'),'utf8'));
 if((memory.match(/data-poster data-category=/g)??[]).length!==posterCollection.posters.length)throw Error('Memory Poster coverage differs');

 const contractorRoot=resolve(root,'construction/estimates/pilates-astra-2026-10-15/v10');
 const contractor=await readFile(resolve(contractorRoot,'v10.js'),'utf8'),contractorModel=await readFile(resolve(contractorRoot,'contractor-model.js'),'utf8');
 if(!contractor.includes('contractor-data.json?source='+revision)||!contractor.includes('contractor-model.js?source='+revision)||!contractorModel.includes('calculations.js?source='+revision))throw Error('Contractor data/model cache keys differ from the view source');
 const data=JSON.parse(await readFile(resolve(contractorRoot,'contractor-data.json'),'utf8'));
 if(data.derivation.revision!==revision||data.items.length!==51)throw Error('Contractor projection does not match current source');
 for(const work of data.items){const html=await readFile(resolve(contractorRoot,work.id+'.html'),'utf8');if((html.match(/data-order-row=/g)||[]).length!==work.rows.length)throw Error('Contractor material coverage differs: '+work.id);}
 const inline=await readFile(resolve(root,'construction/estimates/pilates-astra-2026-10-15/v11/v11.js'),'utf8');
 if(!inline.includes('../v10/contractor-data.json?source='+revision)||!inline.includes('../v10/contractor-model.js?source='+revision))throw Error('V11 must use the current v10 projection and calculations');

 const script=await readFile(resolve(root,'construction/estimates/pilates-astra-2026-10-15/v8/v8.js'),'utf8');
 if(!script.includes('material-takeoff.json?source='+revision)||!script.includes('quantity-models.js?source='+revision))throw Error('Material data/model cache keys differ from the view source');
 console.log(`Verified ${pages.length} HTML pages, ${links} local links/assets and ${imports} module imports; current views share source ${revision}.`);
 return {pages:pages.length,links,imports};
}

import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {organizationNavigation} from './workspace-organization.mjs';
import {PAGE_KINDS,pageKind} from '../public/organization/site-model.js';

const sha=data=>createHash('sha256').update(data).digest('hex');
const ids=html=>[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
async function walk(root){const a=[];for(const e of await readdir(root,{withFileTypes:true})){const p=resolve(root,e.name);if(e.isDirectory())a.push(...await walk(p));else a.push(p);}return a;}

export async function verifyWorkspaceOrganization(dist,root,{preserveBaseline=false}={}) {
 const base=resolve(dist),source=resolve(root),baseline=JSON.parse(await readFile(resolve(source,'public/organization/preservation-baseline.json'),'utf8'));
 const files=await walk(base),pages=files.filter(f=>f.endsWith('.html')),cache=new Map();let anchors=0,contents=0;
 const getPage=async file=>{
  if(!cache.has(file)){
   const html=await readFile(file,'utf8'),all=ids(html);
   if(new Set(all).size!==all.length)throw Error('Duplicate HTML anchor in '+relative(base,file));
   cache.set(file,{html,ids:new Set(all)});
  }
  return cache.get(file);
 };
 const review=JSON.parse(await readFile(resolve(base,'organization/references.json'),'utf8'));
 const interfaceModule=await readFile(resolve(base,'organization/interface.js'),'utf8'),modelRevision=interfaceModule.match(/from '\.\/site-model\.js\?v=([a-f0-9]{16})'/)?.[1];
 if(!modelRevision)throw Error('Organisation model dependency has no build revision');
 if(review.products.length!==15||new Set(review.products.map(p=>p.product)).size!==15||new Set(review.products.map(p=>p.url)).size!==15)throw Error('Expected fifteen independently referenced products');
 for(const file of pages){
  const {html}=await getPage(file),page=relative(base,file).split('\\').join('/');
  if(!html.includes('organization/interface.js?v='+modelRevision))throw Error('Organisation page and model cache revisions differ: '+page);
  const nav=[...html.matchAll(/<nav\b[^>]*aria-label="Workspace"[^>]*>([\s\S]*?)<\/nav>/g)];
  if(nav.length!==1||nav[0][1]!==organizationNavigation(page))throw Error('Shared navigation mismatch: '+page);
  const foot=html.match(/<footer class="org-footer"[\s\S]*?<\/footer>/)?.[0];
  if(!foot||review.products.some(r=>!foot.includes(r.url)))throw Error('Footer omits a product reference: '+page);
  if(!html.includes('aria-label="Breadcrumb"')||!html.includes('data-org-root='))throw Error('Page lacks workspace context: '+page);
  if(html.includes('class="org-contents'))contents++;
  for(const [,raw]of html.matchAll(/\shref="([^"]*#[^"]*)"/g)){
   if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)||!raw.split('#')[1]||/^#page=/.test(raw.slice(raw.indexOf('#'))))continue;
   const url=new URL(raw.replaceAll('&amp;','&'),pathToFileURL(file));
   const fragment=decodeURIComponent(url.hash.slice(1));url.hash='';url.search='';
   let target=fileURLToPath(url);
   if((await stat(target)).isDirectory())target=resolve(target,'index.html');
   if(!target.endsWith('.html'))continue;
   if(!(await getPage(target)).ids.has(fragment))throw Error('Missing section: '+page+' -> '+raw);
   anchors++;
  }
 }
 const missingPages=[],missingIds=[],changedTables=[];
 for(const [page,previous]of Object.entries(baseline.pages)){
  const file=resolve(base,page);let current;
  try{current=await getPage(file);}catch{missingPages.push(page);continue;}
  for(const id of previous.ids)if(!current.ids.has(id))missingIds.push(page+'#'+id);
  if(!baseline.presentation_rebuilt.includes(page)){
   const main=current.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??'';
   if((main.match(/<table\b/g)??[]).length!==previous.tables)changedTables.push(page);
  }
 }
 if(missingPages.length||missingIds.length||changedTables.length)throw Error('Existing content preservation failed: '+JSON.stringify({missingPages,missingIds,changedTables}));
 const changedSource=[],changedPublished=[],missingPublished=[];let checkedSource=0,checkedBytes=0;
 for(const [path,hash]of Object.entries(baseline.protected_source_files)){
  const data=await readFile(resolve(source,path));checkedSource++;if(sha(data)!==hash)changedSource.push(path);
 }
 for(const [path,hash]of Object.entries(baseline.published_files)){
  let data;try{data=await readFile(resolve(base,path));}catch{missingPublished.push(path);continue;}
  if(!path.endsWith('.html')){checkedBytes++;if(sha(data)!==hash)changedPublished.push(path);}
 }
 if(missingPublished.length)throw Error('Published files removed: '+missingPublished.join(', '));
 if(preserveBaseline&&(changedSource.length||changedPublished.length))throw Error('Makeover changed original data/assets: '+JSON.stringify({changedSource,changedPublished}));
 const index=JSON.parse(await readFile(resolve(base,'organization/page-index.json'),'utf8'));
 const expected=pages.map(p=>relative(base,p).split('\\').join('/')).sort(),indexed=index.pages.map(p=>p.path).sort();
 if(JSON.stringify(expected)!==JSON.stringify(indexed))throw Error('Page directory does not cover every published HTML page');
 for(const record of index.pages){
  if(!Object.hasOwn(PAGE_KINDS,record.kind)||record.kind!==pageKind(record.path))throw Error('Incorrect page type: '+record.path);
  const p=await getPage(resolve(base,record.path));for(const h of record.headings)if(!p.ids.has(h.id))throw Error('Stale search heading: '+record.path+'#'+h.id);
 }
 const report={schema:'cad-site-organization-preservation-report-1',date:'2026-10-29',base_commit:baseline.base_commit,status:'VERIFIED website structure and dated preservation comparison',original_page_addresses:baseline.pages?Object.keys(baseline.pages).length:0,current_pages:pages.length,original_published_files:Object.keys(baseline.published_files).length,retained_original_files:Object.keys(baseline.published_files).length-missingPublished.length,protected_source_files_checked:checkedSource,unchanged_source_files:checkedSource-changedSource.length,non_html_outputs_checked:checkedBytes,unchanged_non_html_outputs:checkedBytes-changedPublished.length,changed_source_files:changedSource,changed_non_html_outputs:changedPublished,removed_pages:missingPages,removed_section_ids:missingIds,changed_project_table_counts:changedTables,checked_section_links:anchors,pages_with_contents:contents,reference_products:review.products.length,policy:'Dated comparison for this redesign. Later authorised project-data changes should be documented in a new comparison rather than treated as presentation-only changes.'};
 await writeFile(resolve(base,'organization/preservation-report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`Organisation QA: ${pages.length} pages, ${anchors} section links, ${contents} contents lists; ${checkedSource-changedSource.length}/${checkedSource} source files and ${checkedBytes-changedPublished.length}/${checkedBytes} original non-HTML outputs unchanged.`);
 return report;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../',import.meta.url));
 await verifyWorkspaceOrganization(resolve(root,'dist'),root,{preserveBaseline:process.argv.includes('--preserve-baseline')});
}

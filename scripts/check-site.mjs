import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';

export async function checkSite(directory){
 const root=resolve(directory),files=[],revisions=new Set();
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
 await walk(root);const pages=files.filter(x=>x.endsWith('.html'));let links=0,imports=0;
 for(const file of pages){
  const text=await readFile(file,'utf8');
  if(/\/v(?:5|5\.1|6|7|8|9|10)\/[^/]+\.html$/.test(file)){
   const revision=text.match(/name="estimate-source-revision" content="([a-f0-9]{16})"/);
   if(!revision)throw Error('Missing shared source revision in '+file);revisions.add(revision[1]);
   if(file.includes('/v10/')&&!text.includes('v10.js?source='+revision[1]))throw Error('Contractor page script cache key differs from its source in '+file);
   if(file.includes('/v8/')&&!text.includes('v8.js?source='+revision[1]))throw Error('Material page script cache key differs from its source in '+file);
  }
  if(/v(?:5|5\.1|6|7|9|10)\/index.html$/.test(file)){
   const ids=[...text.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);if(ids.length!==new Set(ids).size)throw Error('Duplicate HTML id in '+file);
  }
  if(file.includes('/v10/')){
   for(const head of text.matchAll(/<thead>(.*?)<\/thead>/gs))if((head[1].match(/<th /g)??[]).length>5)throw Error('V10 table exceeds five columns');
   if(/schema_version|created_at|modified_at/.test(text))throw Error('Database metadata appeared in contractor tables');
  }
  for(const match of text.matchAll(/\s(?:href|src)="([^"]+)"/g)){
   const url=match[1].replaceAll('&amp;','&');if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url))continue;
   const pathname=decodeURIComponent(url.split(/[?#]/)[0]);if(!pathname)continue;
   let target=pathname.startsWith('/CAD_Test-Facility/')?resolve(root,pathname.slice(19)):pathname.startsWith('/')?resolve(root,pathname.slice(1)):resolve(dirname(file),pathname);
   try{if((await stat(target)).isDirectory())target=resolve(target,'index.html');if(!(await stat(target)).isFile())throw Error('not a file');}catch{throw Error('Missing local link: '+relative(root,file)+' -> '+url);}
   links++;
  }
 }
 for(const file of files.filter(x=>x.endsWith('.js'))){
  const text=await readFile(file,'utf8');for(const m of text.matchAll(/(?:from\s*|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g)){
   const path=resolve(dirname(file),m[2].split(/[?#]/)[0]);try{if(!(await stat(path)).isFile())throw Error('not a file');}catch{throw Error('Missing module import: '+relative(root,file)+' -> '+m[2]);}imports++;
  }
 }
 if(revisions.size!==1)throw Error('Current views use different source revisions');
 const revision=[...revisions][0];
 const contractorRoot=resolve(root,'construction/estimates/pilates-astra-2026-10-15/v10');
 const contractor=await readFile(resolve(contractorRoot,'v10.js'),'utf8'),contractorModel=await readFile(resolve(contractorRoot,'contractor-model.js'),'utf8');
 if(!contractor.includes('contractor-data.json?source='+revision)||!contractor.includes('contractor-model.js?source='+revision)||!contractorModel.includes('calculations.js?source='+revision))throw Error('Contractor data/model cache keys differ from the view source');
 const data=JSON.parse(await readFile(resolve(contractorRoot,'contractor-data.json'),'utf8'));
 if(data.derivation.revision!==revision||data.items.length!==51)throw Error('Contractor projection does not match current source');
 for(const work of data.items){const html=await readFile(resolve(contractorRoot,work.id+'.html'),'utf8');if((html.match(/data-order-row=/g)||[]).length!==work.rows.length)throw Error('Contractor material coverage differs: '+work.id);}

 const script=await readFile(resolve(root,'construction/estimates/pilates-astra-2026-10-15/v8/v8.js'),'utf8');
 if(!script.includes('material-takeoff.json?source='+revision)||!script.includes('quantity-models.js?source='+revision))throw Error('Material data/model cache keys differ from the view source');
 console.log(`Verified ${pages.length} HTML pages, ${links} local links/assets and ${imports} module imports; current views share source ${revision}.`);
 return {pages:pages.length,links,imports};
}

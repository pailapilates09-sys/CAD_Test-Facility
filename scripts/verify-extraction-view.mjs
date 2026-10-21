import {readFile,writeFile,appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildExtractionView} from './render-extraction-explorer.mjs';

const root=new URL('../',import.meta.url),recoveryRoot=new URL('progress/recovery/',root);
const pointer=JSON.parse(await readFile(new URL('current.json',recoveryRoot),'utf8'));
const rawStatus=await readFile(new URL(pointer.path,recoveryRoot),'utf8');
const status=JSON.parse(rawStatus),expected=buildExtractionView(status);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const live=process.argv.indexOf('--live');
const fileNames=['progress/extraction-view.json','progress/recovery/status.json','progress/extraction-explorer.css','progress/extraction-explorer.js'];

function checkHTML(html){
 assert.ok(html.includes('data-extraction-view="extraction-visual-view.v1"'),'Visual view marker missing');
 for(const lane of expected.lanes){
  assert.ok(html.includes('data-lane-tab="'+lane.id+'"'),'Missing lane tab '+lane.id);
  assert.ok(html.includes('data-lane-panel="'+lane.id+'"'),'Missing lane panel '+lane.id);
  assert.ok(html.includes(lane.checkpoint),'Checkpoint missing '+lane.id);
 }
 for(const f of expected.formats)assert.ok(html.includes('data-format="'+f.id+'"'),'Missing format '+f.id);
 assert.ok(html.includes('proposed products, not completed findings.'),'Readiness boundary missing');
 assert.ok(html.includes('Stages show readiness, not equal percentages.'),'Stage denominator note missing');
 assert.ok(!html.includes('EXTRACTION_REVISION'),'Unresolved asset version');
 const section=html.split('data-extraction-view=')[1]?.split('</section></details>')[0]??'';
 assert.ok(!/download_url|[?&]sig=|@gmail\.com|drive\.google\.com\/file/.test(section),'Private source material exposed');
}

const expectedFiles={
 'progress/extraction-view.json':Buffer.from(JSON.stringify(expected,null,2)+'\n'),
 'progress/recovery/status.json':Buffer.from(rawStatus),
 'progress/extraction-explorer.css':await readFile(new URL('public/progress/extraction-explorer.css',root)),
 'progress/extraction-explorer.js':await readFile(new URL('public/progress/extraction-explorer.js',root))
};
let proof;
if(live!==-1){
 const base=process.argv[live+1];if(!base)throw Error('--live requires the deployed Pages URL');
 const url=new URL(base.endsWith('/')?base:base+'/');
 if(url.protocol!=='https:'||url.hostname!=='pailapilates09-sys.github.io'||url.pathname!=='/CAD_Test-Facility/')throw Error('Unexpected Pages destination');
 let lastError;
 for(let attempt=0;attempt<8;attempt++){
  try{
   const results=await Promise.all(fileNames.map(async name=>{
    const response=await fetch(new URL(name+'?verify='+Date.now(),url),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
    assert.equal(response.status,200,'HTTP '+name);const bytes=Buffer.from(await response.arrayBuffer());assert.ok(bytes.equals(expectedFiles[name]),'Live bytes differ: '+name);return {file:name,sha256:sha(bytes),exact:true};
   }));
   const response=await fetch(new URL('progress/?verify='+Date.now(),url),{signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);checkHTML(await response.text());
   proof={mode:'live',checks:results,html:'lane/format/readiness markers verified'};lastError=null;break;
  }catch(error){lastError=error;if(attempt<7)await new Promise(resolve=>setTimeout(resolve,10000));}
 }
 if(lastError)throw lastError;
}else{
 const dist=new URL('dist/',root);const checks=[];
 for(const name of fileNames){const bytes=await readFile(new URL(name,dist));assert.ok(bytes.equals(expectedFiles[name]),'Built bytes differ: '+name);checks.push({file:name,sha256:sha(bytes),exact:true});}
 checkHTML(await readFile(new URL('progress/index.html',dist),'utf8'));
 proof={mode:'build',checks,html:'lane/format/readiness markers verified'};
 await writeFile(new URL('progress/extraction-proof.json',dist),JSON.stringify({schema:'extraction-view-proof.v1',sourceStatusSha256:sha(rawStatus),sourceCheckpoints:expected.sourceCheckpoints,...proof},null,2)+'\n');
}
console.log(JSON.stringify({sourceCheckpoints:expected.sourceCheckpoints,...proof},null,2));
if(process.env.GITHUB_STEP_SUMMARY){
 const rows=expected.lanes.map(lane=>`| ${lane.id} | ${lane.checkpoint} | ${lane.sync.local}/${lane.sync.main} | ${lane.short} |`).join('\n');
 await appendFile(process.env.GITHUB_STEP_SUMMARY,`## Extraction dashboard · ${proof.mode} verification passed\n\n| Lane | Saved checkpoint | Local/Main | Stage |\n| --- | --- | --- | --- |\n${rows}\n\n${expected.inventory.fileOccurrences.toLocaleString('en-IN')} catalogued file occurrences across ${expected.inventory.collections} collections; AEC is counted separately. This is not a content-completion percentage.\n\nAll four public data/style/script files matched; lane and format markers verified.\n`);
}

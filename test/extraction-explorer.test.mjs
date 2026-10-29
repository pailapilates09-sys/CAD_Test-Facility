import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {buildExtractionView,renderExtractionExplorer} from '../scripts/render-extraction-explorer.mjs';
const root=new URL('../',import.meta.url);
const pointer=JSON.parse(await readFile(new URL('progress/recovery/current.json',root),'utf8'));
const status=JSON.parse(await readFile(new URL('progress/recovery/'+pointer.path,root),'utf8'));

test('visual counts derive from the current inventories and keep unknown or different denominators separate',()=>{
 const view=buildExtractionView(status),inventories=status.lanes.filter(l=>l.inventory);
 assert.equal(view.inventory.fileOccurrences,inventories.reduce((n,l)=>n+l.inventory.files,0));
 assert.equal(view.inventory.folderOccurrences,inventories.reduce((n,l)=>n+l.inventory.folders,0));
 assert.equal(view.inventory.collections,3);
 assert.equal(view.inventory.deduplicatedAcrossCollections,false);
 assert.equal(view.inventory.aecCountedSeparately,true);
 assert.equal(view.overallCompletionPercent,null);
 const sourceHashMetric=status.lanes.find(l=>l.id==='MSCS').metric;assert.deepEqual(view.hashed,{lane:'MSCS',done:sourceHashMetric.done,total:sourceHashMetric.total});
 const changed=structuredClone(status),hydro=changed.lanes.find(l=>l.id==='MSCH');hydro.inventory.files+=17;hydro.inventory.rows+=17;hydro.inventory.pendingFolders-=1;hydro.checkpoint='CP-NEXT';
 const next=buildExtractionView(changed);assert.equal(next.inventory.fileOccurrences,view.inventory.fileOccurrences+17);assert.equal(next.pendingFolders.count,view.pendingFolders.count-1);assert.equal(next.sourceCheckpoints.MSCH,'CP-NEXT');
});

test('the view exposes four lane paths, clear content boundaries and conditional outputs without a stale AEC access claim',()=>{
 const html=renderExtractionExplorer(status),view=buildExtractionView(status);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
 for(const lane of view.lanes){assert.ok(html.includes('data-lane-tab="'+lane.id+'"'));assert.ok(html.includes(lane.checkpoint));assert.equal(lane.stages.length,5);assert.equal(lane.outputs.length,2);}
 assert.equal((html.match(/proposed products, not completed findings/g)??[]).length,4);
 assert.ok(html.includes(status.lanes.find(l=>l.id==='AEC').evidence.g076RecoveryReissued?'G076 PART1 recovery closure verified':'G076 terminal reconciliation required'));
 assert.ok(!html.includes('original terminal checkpoint is unavailable'));
 assert.ok(html.includes('Full corpus total is unknown'));
 assert.ok(html.includes('Stages show readiness, not equal percentages'));
 assert.ok(!/drive\.google\.com|@gmail\.com|download_url|NaN|undefined/.test(html));
});

test('project tabs, keyboard navigation, format choices and evidence links update only their intended controls',async()=>{
 class El{
  constructor(dataset={}){this.dataset=dataset;this.attrs={};this.handlers={};this.hidden=false;this.tabIndex=0;}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,fn){this.handlers[k]=fn;}
  focus(){this.focused=true;}
 }
 const tabs=['MSCH','MSCS','LSA','AEC'].map(laneTab=>new El({laneTab})),panels=tabs.map(t=>new El({lanePanel:t.dataset.laneTab}));
 const formats=['jsonl','json','sqlite','sheets','markdown','recovery'].map(format=>new El({format})),formatPanels=formats.map(t=>new El({formatPanel:t.dataset.format}));
 const link=new El(),details={open:false};
 const lists={'[data-lane-tab]':tabs,'[data-lane-panel]':panels,'[data-format]':formats,'[data-format-panel]':formatPanels};
 const explorer={querySelectorAll:selector=>lists[selector]};
 const document={querySelector:selector=>selector==='.extraction-explorer'?explorer:details,querySelectorAll:()=>[link]};
 vm.runInNewContext(await readFile(new URL('public/progress/extraction-explorer.js',root),'utf8'),{document});
 tabs[3].handlers.click();assert.equal(tabs[3].attrs['aria-selected'],'true');assert.equal(panels[3].hidden,false);assert.equal(panels[0].hidden,true);assert.equal(tabs[0].tabIndex,-1);
 let prevented=false;tabs[3].handlers.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(tabs[0].focused,true);assert.equal(panels[0].hidden,false);
 tabs[0].handlers.keydown({key:'End',preventDefault(){}});assert.equal(panels[3].hidden,false);
 formats[2].handlers.click();assert.equal(formats[2].attrs['aria-pressed'],'true');assert.equal(formatPanels[2].hidden,false);assert.equal(formatPanels[0].hidden,true);assert.equal(panels[3].hidden,false);
 link.handlers.click();assert.equal(details.open,true);
});

test('Actions verifies the built view before upload and the live Pages result before dependent releases',async()=>{
 const workflow=await readFile(new URL('.github/workflows/pages.yml',root),'utf8');
 assert.ok(workflow.indexOf('Verify extraction dashboard')<workflow.indexOf('Upload website'));
 assert.ok(workflow.indexOf('Verify published extraction')>workflow.indexOf('uses: actions/deploy-pages@v4'));
 assert.match(workflow,/node scripts\/verify-extraction-view\.mjs --live/);
 assert.match(workflow,/release-estimate-milestone:[\s\S]*needs: deploy/);
 assert.match(workflow,/ref: \$\{\{ github.sha \}\}/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {onboarding as d} from '../src/progress-data.mjs';

test('phase ratios retain their own denominators and unknown project totals remain unknown',()=>{
 const byId=new Map(d.projects.map(p=>[p.id,p]));
 assert.equal(byId.get('MSCS').metric.done+byId.get('MSCS').metric.remaining,byId.get('MSCS').metric.total);
 assert.equal(byId.get('LSA').metric.done+byId.get('LSA').metric.remaining,byId.get('LSA').metric.total);
 assert.equal(byId.get('AEC').metric,null);
 assert.equal(byId.get('MSCH').metric,null);
 assert.ok(byId.get('JP Cost').stages.some(s=>s.state==='pending'));
 assert.ok(byId.get('JP Cost').stages.some(s=>s.state==='not-authorized'));
 assert.ok(!Object.hasOwn(d,'overallCompletionPercent'));
});
test('all progress, debt and proof records resolve to reviewed evidence',()=>{
 const ids=new Set(d.sources.map(s=>s.id));
 for(const row of [...d.projects,...d.debts,...d.tests,...d.capabilities])assert.ok(ids.has(row.source));
 assert.equal(d.proof.accessibleDriveIds+d.proof.unavailableDriveIds,d.proof.uniqueDriveIds);
 assert.equal(d.tree.nodes.filter(n=>n.status==='blocked').length,d.proof.unavailableDriveIds);
 assert.equal(new Set(d.tree.nodes.map(n=>n.id)).size,d.tree.nodes.length);
 const nodeIds=new Set(d.tree.nodes.map(n=>n.id));
 for(const n of d.tree.nodes)for(const p of n.parents)assert.ok(nodeIds.has(p));
});
test('public projection excludes exposed source links, credentials, personal emails and untested write success',()=>{
 for(const n of d.tree.nodes)if(n.restricted){assert.equal(n.driveId,null);assert.equal(n.url,null);}
 const text=JSON.stringify(d);
 assert.ok(!/@gmail\.com|download_url|[?&]sig=|b64_string|npr_per_kg|siwc_bypass/i.test(text));
 assert.equal(d.sync.find(s=>s.scope==='MSCH').sourceId,null);
 assert.equal(d.sync.find(s=>s.scope==='MSCH').sourceUrl,null);
 assert.equal(d.capabilities.find(c=>c.area==='Raw upload').status,'Available · untested');
 assert.equal(d.capabilities.find(c=>c.area==='Raw same-ID update').status,'Available · untested');
});
test('aligned cursors and freshness debt remain distinct',()=>{
 const aec=d.sync.find(s=>s.scope==='AEC');assert.equal(aec.local-aec.main,1);
 assert.equal(d.sync.filter(s=>s.local===s.main).length,3);
 assert.ok(d.debts.some(x=>x.scope==='MSCS'&&x.title.includes('Registrar')));
 assert.equal(d.verdict,'CROSS_ACCOUNT_ACCESS_PARTIAL');
});

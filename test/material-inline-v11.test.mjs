import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {contractorData} from '../scripts/contractor-v10.mjs';
import {renderInlineMaterials,renderInlineWork} from '../scripts/material-inline-v11.mjs';
import {worksheet} from '../public/construction/estimates/pilates-astra-2026-10-15/v10/contractor-model.js';
import {esc} from '../scripts/linked-estimate-views.mjs';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const register=JSON.parse(await readFile(new URL('v9/register.json',base),'utf8'));
const data=contractorData(deriveViews(register));

test('v11 renders all 51 works and 261 material lines visibly on one page with four-column tables',()=>{
 const before=JSON.stringify(data),html=renderInlineMaterials(data);
 assert.equal((html.match(/data-inline-work=/g)||[]).length,51);assert.equal((html.match(/data-inline-material=/g)||[]).length,261);
 assert.equal((html.match(/data-inline-area=/g)||[]).length,6);assert.doesNotMatch(html,/<details|<dialog|<iframe|href="(?!https?:|#)[^"]*\.html/);
 for(const work of data.items){
  assert.equal((html.match(new RegExp('data-inline-work="'+work.id+'"','g'))||[]).length,1);
  const panel=renderInlineWork(work,data);assert.ok(panel.includes(esc(work.title)));assert.ok(panel.includes('href="../#work-'+work.id+'"'));
  for(const row of work.rows){assert.ok(panel.includes('data-inline-material="'+row.id+'"'));assert.ok(panel.includes(esc(row.name)));assert.ok(panel.includes(esc(row.unit)));}
  assert.doesNotMatch(panel.match(/<section[^>]+>/)[0],/\shidden(?:\s|>)/);
 }
 for(const head of html.matchAll(/<thead>(.*?)<\/thead>/gs))assert.ok((head[1].match(/<th /g)||[]).length<=4);
 assert.equal(JSON.stringify(data),before);assert.doesNotMatch(html,/undefined|NaN|schema_version|created_at|modified_at/);
});

test('v11 keeps zero, unknown rows, six locked holds and both original allowances explicit',()=>{
 assert.equal(data.items.filter(work=>work.held).length,6);
 const zero=renderInlineWork(data.items.find(work=>work.id==='reception-006'),data);assert.match(zero,/data-quantity>0<\/span>/);
 for(const work of data.items.filter(work=>work.held)){
  const html=renderInlineWork(work,data);assert.match(html,/ON HOLD/);assert.match(html,/data-subtotal class="value-money">On hold/);
  for(const row of work.rows){assert.equal(row.quantity,null);assert.equal(row.rate_low,null);assert.equal(worksheet(work).material.low,null);}
 }
 const html=renderInlineMaterials(data);assert.match(html,/Unknown/);assert.match(html,/Not priced/);assert.match(html,/5,50,000.00/);assert.match(html,/2,80,057.43/);assert.match(html,/unspecified currency/);
});

test('v11 derives fresh quantities and material prices from v10 without maintaining a second source',()=>{
 const changed=structuredClone(register);changed.works[0].title='Updated shared storage';changed.works[0].quantity='44.86';
 changed.materials.materials.find(material=>material.id==='ply18').rate_low=7777.77;changed.materials.materials.find(material=>material.id==='ply18').rate_high=7777.77;
 const next=contractorData(deriveViews(changed)),work=next.items[0],row=work.rows.find(row=>row.material_id==='ply18'),html=renderInlineWork(work,next);
 assert.ok(row.quantity>data.items[0].rows.find(row=>row.material_id==='ply18').quantity);assert.match(html,/Updated shared storage/);assert.match(html,/7,777.77/);
 const amount=(row.quantity*7777.77).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});assert.ok(html.includes(amount));
});

test('inline material text is escaped and the client shares v10 calculation, draft keys and source revision',async()=>{
 const changed=structuredClone(data);changed.items[0].title='<script>bad</script>';changed.items[0].rows[0].name='<img onerror=bad>';
 const html=renderInlineMaterials(changed);assert.doesNotMatch(html,/<script>bad|<img onerror/);assert.match(html,/&lt;script&gt;/);
 const script=await readFile(new URL('v11/v11.js',base),'utf8'),v10=await readFile(new URL('v10/v10.js',base),'utf8');
 assert.match(script,/\.\.\/v10\/contractor-data.json\?source=SOURCE_REVISION/);assert.match(script,/\.\.\/v10\/contractor-model.js\?source=SOURCE_REVISION/);assert.match(script,/readDraft\(storage,revision,work.id\)/);assert.match(script,/draftKey\(revision,work.id\)/);
 for(const source of [script,v10]){assert.match(source,/addEventListener\('storage'/);assert.match(source,/addEventListener\('pageshow'/);}
});

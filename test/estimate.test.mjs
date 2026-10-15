import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const d=JSON.parse(await readFile(new URL('data/estimate.json',root),'utf8'));
const jsonl=async file=>(await readFile(new URL('data/'+file,root),'utf8')).trim().split('\n').map(JSON.parse);
const hundredths=s=>{assert.match(s,/^\d+\.\d{2}$/);return BigInt(s.replace('.',''))};

test('every normalized item traces to the original raw cell row and page',async()=>{
 const tables=await jsonl('tables.jsonl'),pages=await jsonl('pages.jsonl');
 assert.equal(pages.length,8);assert.equal(d.line_items.length,51);
 assert.deepEqual(pages.map(p=>p.page),[1,2,3,4,5,6,7,8]);
 assert.equal(new Set(d.line_items.map(x=>x.id)).size,51);
 let rawItems=0;
 for(const t of tables.filter(t=>t.page>1))for(const r of t.rows)if(/^\d+$/.test(r[0]??'')&&r[1])rawItems++;
 assert.equal(rawItems,51);
 for(const item of d.line_items){
  const t=tables.find(t=>t.page===item.source.page&&t.table===item.source.table);
  assert.deepEqual(t.rows[item.source.row-1],item.source.cells);
  assert.equal(item.description_raw,item.source.cells[1]);
  assert.equal(hundredths(item.amount),BigInt(item.amount_minor));
 }
 assert.deepEqual(await jsonl('line-items.jsonl'),d.line_items);
});
test('summary reconciles exactly without counting allowances twice',()=>{
 assert.equal(d.sections.length,8);
 const total=d.sections.reduce((a,s)=>a+hundredths(s.summary_amount),0n);
 assert.equal(total,hundredths(d.summary.subtotal));
 assert.equal(total+hundredths(d.summary.vat_amount),hundredths(d.summary.grand_total));
 for(const section of d.sections){
  const items=d.line_items.filter(x=>x.section_id===section.id);
  assert.equal(items.length,section.item_count);
  if(items.length)assert.equal(items.reduce((a,x)=>a+BigInt(x.amount_minor),0n),hundredths(section.summary_amount));
  else {assert.equal(section.detail_state,'summary_only');assert.equal(section.line_sum,null);assert.equal(section.detail_total,null)}
 }
 assert.equal(d.validation.all_line_products_match_at_two_decimals,true);
});
test('source ambiguities and exact precision survive the derivation',()=>{
 assert.equal(d.currency,null);assert.equal(d.estimate_date,null);
 assert.equal(d.line_items.filter(x=>x.section_id==='reception'&&x.source_sn==='10').length,2);
 assert.equal(d.line_items.find(x=>x.id==='reception-015').unit_raw,null);
 assert.equal(d.line_items.find(x=>x.id==='reception-006').quantity,'0.00');
 const coffee=d.line_items.find(x=>x.id==='coffee-lounge-009');
 assert.equal(coffee.quantity,'84.8125');assert.equal(coffee.calculated_amount_unrounded,'12721.875000');
 assert.equal(coffee.amount,'12721.88');
 assert.equal(d.sections.find(s=>s.id==='coffee-lounge').detail_total_raw,'591770.9');
 assert.equal(d.sections.find(s=>s.id==='studio').detail_total_raw,'1964709');
});
test('source PDF and every preserved derivative agree with the hash manifest',async()=>{
 const manifest=JSON.parse(await readFile(new URL('data/manifest.json',root),'utf8'));
 for(const entry of manifest.files){
  const content=await readFile(new URL(entry.path,root));
  assert.equal(content.length,entry.bytes,entry.path);
  assert.equal(createHash('sha256').update(content).digest('hex'),entry.sha256,entry.path);
 }
 const source=await readFile(new URL('source/pilates-estimate-astra.pdf',root));
 assert.equal(createHash('sha256').update(source).digest('hex'),d.source.sha256);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {money,quantity} from '../public/construction/estimates/pilates-astra-2026-10-15/v2/v2.js';
import {renderVersionRegister} from '../scripts/linked-estimate-views.mjs';
const root=new URL('../',import.meta.url),base='public/construction/estimates/pilates-astra-2026-10-15/v2/';
const g=JSON.parse(await readFile(new URL(base+'hierarchy.json',root)));
const d=JSON.parse(await readFile(new URL('construction/estimates/pilates-astra-2026-10-15/data/estimate.json',root)));
test('v2 formats lakh/crore, zero and exact source quantity precision',()=>{
 assert.equal(money(d.summary.grand_total),'66,45,762.90');
 assert.equal(money('10000000.25'),'1,00,00,000.25');
 assert.equal(money('0.00'),'0.00');
 assert.equal(quantity('84.8125'),'84.8125');
 assert.equal(quantity('100000.00'),'1,00,000');
});
test('v2 hierarchy is an acyclic complete cost tree with no duplicated costs',()=>{
 assert.equal(g.nodes.length,62);assert.equal(g.edges.length,61);
 const nodes=new Map(g.nodes.map(n=>[n.id,n]));assert.equal(nodes.size,62);
 const reached=new Set();
 function visit(id){assert.ok(!reached.has(id),'No cycle or duplicate child: '+id);reached.add(id);for(const e of g.edges.filter(e=>e.source===id)){assert.equal(e.relation,'includes');assert.ok(nodes.has(e.target));visit(e.target)}}
 visit('grand-total');assert.equal(reached.size,62);
 const cents=n=>BigInt(n.amount.replace('.',''));
 for(const n of g.nodes){
  assert.ok(n.title.split(/\s+/).length>=3&&n.title.split(/\s+/).length<=5,n.id);
  const children=g.edges.filter(e=>e.source===n.id).map(e=>nodes.get(e.target));
  if(children.length)assert.equal(children.reduce((s,c)=>s+cents(c),0n),cents(n),n.id);
 }
 for(const x of d.line_items){assert.equal(nodes.get(x.id).amount,x.amount);assert.ok(g.edges.some(e=>e.source===x.section_id&&e.target===x.id))}
 for(const s of d.sections.filter(s=>!s.item_count))assert.equal(g.edges.filter(e=>e.source===s.id).length,0);
});
test('v2 retains access to original evidence and links through the original page and version register',async()=>{
 const html=await readFile(new URL(base+'index.html',root),'utf8');
 const original=await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/index.html',root),'utf8');
 const hub=await readFile(new URL('public/construction/index.html',root),'utf8');
 const register=renderVersionRegister(JSON.parse(await readFile(new URL('public/construction/estimates/pilates-astra-2026-10-15/versions.json',root),'utf8')));assert.match(original,/href="\.\/v2\/"/);assert.match(hub,/pilates-astra-2026-10-15\/milestone\.html/);assert.match(register,/href="\.\/v2\/"/);
 assert.match(html,/<dialog[^>]+aria-labelledby="detail-title"/);
 assert.match(html,/href="\.\.\/data\/estimate.json"/);
 assert.match(html,/href="\.\/hierarchy.json"/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const p=new URL('../public/construction/estimates/pilates-astra-2026-10-15/v4/',import.meta.url);
const r=JSON.parse(await readFile(new URL('market-rates.json',p)));
const d=JSON.parse(await readFile(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url)));
test('rate research covers every original item without adopting a mismatched public rate',()=>{
 assert.deepEqual(r.items.map(x=>x.item_id),d.line_items.map(x=>x.id));
 const obs=new Map(r.observations.map(x=>[x.id,x])),sources=new Map(r.sources.map(x=>[x.id,x]));
 for(const x of r.items){const o=d.line_items.find(o=>o.id===x.item_id);assert.equal(x.original.amount,o.amount);assert.equal(x.original.rate,o.rate);assert.equal(x.original.unit,o.unit_raw);assert.equal(x.accepted_market_rate,null);assert.equal(x.exact_scope_verified,false);for(const id of x.reference_ids)assert.ok(obs.has(id))}
 for(const o of r.observations){assert.ok(sources.has(o.source_id));assert.equal(o.currency,'NPR');assert.equal(o.vat_status,'not_stated');if(o.normalized_si){const f=Number(o.normalized_si.factor);assert.ok(Math.abs(Number(o.normalized_si.low)*f-Number(o.low))<.005);if(o.high!==null)assert.ok(Math.abs(Number(o.normalized_si.high)*f-Number(o.high))<.005)}}
 assert.equal(r.coverage.items_with_numeric_reference,45);assert.equal(r.coverage.items_without_numeric_reference,6);assert.equal(r.coverage.exact_scope_quotes,0);
 assert.equal(r.observations.filter(o=>o.source_id==='S17').length,0);
 assert.ok(r.observations.some(o=>o.availability==='out_of_stock'));
 assert.equal(r.observations.find(o=>o.id==='R19').normalized_si,null);
});
test('rate SQLite restores from SQL and retains item/reference relationships',()=>{
 const script=`import sqlite3,json,pathlib\np=pathlib.Path(${JSON.stringify(p.pathname)})\na=sqlite3.connect(p/'rates.sqlite');b=sqlite3.connect(':memory:');b.executescript((p/'rates.sql').read_text())\nfor table in ['sources','observations','items','item_references']:\n assert a.execute('SELECT * FROM '+table).fetchall()==b.execute('SELECT * FROM '+table).fetchall()\nassert a.execute('SELECT COUNT(*) FROM items WHERE accepted_market_rate IS NOT NULL').fetchone()[0]==0\nprint('SQL round trip verified')`;
 assert.match(execFileSync('python',['-c',script],{encoding:'utf8'}),/verified/);
});

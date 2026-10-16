import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveSI} from '../construction/estimates/pilates-astra-2026-10-15/derive-si.mjs';
const original=JSON.parse(await readFile(new URL('../construction/estimates/pilates-astra-2026-10-15/data/estimate.json',import.meta.url)));
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/v3/',import.meta.url);
const si=JSON.parse(await readFile(new URL('estimate-si.json',base)));
const fraction=s=>{const [a,b='']=s.split('.');return [BigInt(a+b),10n**BigInt(b.length)]};
test('SI quantities convert exactly and inverse rates preserve every printed line amount',()=>{
 assert.deepEqual(si,deriveSI(original));
 assert.deepEqual(si.conversion_counts,{area:28,length:5,count:16,point:1,missing:1});
 for(const row of si.line_items){
  const source=original.line_items.find(x=>x.id===row.id);
  const [q,qd]=fraction(row.quantity),[sq,sqd]=fraction(source.quantity),[factor,fd]=fraction(row.conversion.quantity_factor);
  assert.equal(q*sqd*fd,sq*factor*qd,row.id+' exact quantity');
  const [sr,srd]=fraction(source.rate),rn=BigInt(row.conversion.rate_exact_fraction.numerator),rd=BigInt(row.conversion.rate_exact_fraction.denominator);
  assert.equal(rn*srd*factor,sr*fd*rd,row.id+' inverse rate');
  const [mult,md]=fraction(row.no),n=q*rn*mult*100n,den=qd*rd*md;
  assert.equal((n*2n+den)/(den*2n),BigInt(row.amount_minor),row.id+' rounded line amount');
  assert.equal(row.amount,source.amount);
 }
 assert.deepEqual(si.summary,original.summary);assert.deepEqual(si.sections,original.sections);
 assert.equal(si.line_items.find(x=>x.id==='locker-space-008').quantity,'13.4112');
 assert.equal(si.line_items.find(x=>x.id==='studio-008').quantity,'18.1160928');
 assert.equal(si.line_items.find(x=>x.id==='reception-006').quantity,'0');
});
test('SI derivation retains unknown units and original evidence; counts are not reinterpreted as lengths',async()=>{
 const missing=si.line_items.find(x=>x.id==='reception-015');assert.equal(missing.unit_raw,null);assert.equal(missing.conversion.status,'missing_unit');
 const point=si.line_items.find(x=>x.id==='reception-014');assert.equal(point.unit_code,'point');assert.equal(point.quantity,'5');
 for(const row of si.line_items.filter(x=>x.original.unit_code==='each')){assert.equal(row.unit_raw,'each');assert.equal(row.quantity,row.original.quantity);assert.equal(row.rate,row.original.rate)}
 const jsonl=(await readFile(new URL('line-items-si.jsonl',base),'utf8')).trim().split('\n').map(JSON.parse);assert.deepEqual(jsonl,si.line_items);
 assert.equal(si.source_pdf_sha256,original.source.sha256);assert.equal(si.currency,null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {worksheet,materialLine,readDraft,draftKey,materialCSV,workBasis} from '../public/construction/estimates/pilates-astra-2026-10-15/v10/contractor-model.js';

const row={id:'a',name:'Plywood',note:'18 mm',quantity:3,unit:'sheet',rate_low:10,rate_high:20,currency:'NPR',whole_units:true,held:false,quantity_basis:'Measured cut list'};
const item={id:'work',title:'Cupboard',si:{quantity:'10',unit:'m2',unit_label:'m²'},original:{amount:'500.00'},rows:[row],held:false};

test('material build-up keeps a public range and derives a work-unit material rate',()=>{
 const total=worksheet(item);
 assert.deepEqual(total.material,{low:30,high:60,priced_rows:1,missing_rows:0});
 assert.deepEqual(total.material_rate,{low:3,high:6});assert.equal(total.labour.amount,null);assert.equal(total.other.amount,null);assert.equal(total.total.low,null);
 assert.deepEqual(worksheet(item,{labour:'2',other:'0'}).total,{low:50,high:80});
});
test('supplier quote overrides the reference on that worksheet without mutating published data',()=>{
 const before=structuredClone(item),draft={labour:'2',other:'0',rows:{a:{quantity:'4',price:'12.5',selection:'Approved supplier grade'}}};
 const total=worksheet(item,draft);assert.deepEqual(total.material_rate,{low:5,high:5});assert.equal(total.material.low,50);assert.equal(total.labour.amount,20);assert.equal(total.total.low,70);assert.deepEqual(item,before);
 assert.equal(materialLine(row,draft.rows.a).contractor_price,true);
});
test('missing prices, incomplete material rows and invalid quantities never become a full total',()=>{
 const missing={...row,id:'b',quantity:null,rate_low:null,rate_high:null};
 const total=worksheet({...item,rows:[row,missing]},{labour:'2',other:'0'});
 assert.equal(total.material.low,30);assert.equal(total.material.missing_rows,1);assert.equal(total.total.low,null);
 for(const input of [{quantity:'1.5'},{quantity:'-1'},{price:'-1'},{quantity:'Infinity'},{price:'abc'}]){const cost=materialLine(row,input);assert.equal(cost.invalid,true);assert.equal(cost.amount_low,null);}
 assert.equal(materialLine(row,{quantity:''}).amount_low,null);
 assert.equal(worksheet(item,{labour:'-2',other:'0'}).total.low,null);
});
test('zero is retained explicitly and no per-unit amount is divided by zero',()=>{
 const zero=worksheet({...item,si:{...item.si,quantity:'0'},rows:[{...row,quantity:0}]},{labour:'0',other:'0'});
 assert.equal(zero.material.low,0);assert.equal(zero.material_rate.low,null);assert.equal(zero.labour.amount,0);assert.equal(zero.total.low,0);
 assert.equal(materialLine(row,{quantity:'0',price:'0'}).amount_low,0);
});
test('held work is locked against contractor allocations and source splits are never inferred',()=>{
 const held={...item,held:true,rows:[{...row,held:true,quantity:null,rate_low:null,rate_high:null}]};
 const total=worksheet(held,{labour:'200',other:'0',rows:{a:{quantity:'8',price:'100'}}});
 assert.equal(total.material.low,null);assert.equal(total.labour.amount,null);assert.equal(total.total.low,null);assert.equal(item.original.amount,'500.00');
});
test('an unspecified measurement unit uses an explicit whole-work cost input',()=>{
 const unknown={...item,si:{quantity:'2',unit:null,unit_label:'unspecified unit'}};
 assert.equal(workBasis(unknown).perUnit,false);const total=worksheet(unknown,{labour:'100',other:'0'});
 assert.equal(total.labour.amount,100);assert.equal(total.material_rate.low,null);assert.equal(total.total.low,130);
});
test('saved drafts only apply to their work and shared source revision, with safe storage fallback',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)};
 values.set(draftKey('r1','work'),JSON.stringify({source_revision:'r1',work_id:'work',inputs:{labour:'10',rows:{a:{quantity:'3',price:'0',selection:'Brand A'}}}}));
 assert.equal(readDraft(storage,'r1','work').rows.a.price,'0');assert.deepEqual(readDraft(storage,'r2','work'),{});assert.deepEqual(readDraft(storage,'r1','other'),{});
 assert.deepEqual(readDraft({getItem(){throw Error();}},'r1','work'),{});
 values.set(draftKey('r1','work'),'{bad');assert.deepEqual(readDraft(storage,'r1','work'),{});
});
test('material CSV preserves purchase units, original currency and partial unknowns',()=>{
 const csv=materialCSV(item,{rows:{a:{price:'12.5',selection:'Brand "A", 18 mm'}},labour:'2',other:'0'});
 assert.ok(csv.includes('Brand ""A"", 18 mm'));assert.match(csv,/Purchase unit/);assert.match(csv,/sheet/);assert.match(csv,/planning reference|Contractor worksheet input/);assert.match(csv,/currency unspecified/);assert.match(csv,/confirm specifications/);
 const unpriced=materialCSV({...item,rows:[{...row,rate_low:null,rate_high:null}]});assert.doesNotMatch(unpriced,/NaN|undefined/);
});

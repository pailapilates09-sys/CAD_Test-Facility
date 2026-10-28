// One source quotation, separate from the Astra register. International foot, exactly.
export const METRES_PER_FOOT=0.3048;
export const SQUARE_METRES_PER_SQFT=0.09290304;
const decimal=/^\d+\.\d{2}$/;
export const money=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
export const quantity=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
export const minor=s=>{if(!decimal.test(String(s)))throw Error('Expected a nonnegative two-decimal source value');return BigInt(String(s).replace('.',''));};
export function scaledString(value,places=2){const sign=value<0n?'-':'';let s=(value<0n?-value:value).toString().padStart(places+1,'0');return sign+s.slice(0,-places)+'.'+s.slice(-places);}
export function validateQuotation(q){
 if(q.schema!=='pilates-supplier-quotation-1.0'||q.items?.length!==19)throw Error('Expected the complete19-work Hamro quotation');
 if(q.source.sha256!=='12ab232266fbd943170ffabe0c38860eaf809b0937fce80f2021fb5600f4defc'||q.source.pages!==4)throw Error('Quotation source identity changed');
 const ids=new Set();q.items.forEach((r,i)=>{if(r.number!==i+1||r.id!=='hamro-'+String(i+1).padStart(2,'0')||ids.has(r.id))throw Error('Missing/duplicate/out-of-order work');ids.add(r.id);if(!['SQM','RM','LS','Set'].includes(r.unit)||!r.source_description||!r.source_title)throw Error('Incomplete source scope');for(const k of ['rate','quantity','amount'])minor(r[k]);if(Number(r.quantity)<=0||Number(r.rate)<=0)throw Error('Nonpositive quotation input');if(['Set','LS'].includes(r.unit)&&!Number.isInteger(Number(r.quantity)))throw Error('Count must be whole');});minor(q.printed_total);return q;
}
export function convertRow(r){
 const q=Number(r.quantity),rate=Number(r.rate),factor=r.unit==='SQM'?SQUARE_METRES_PER_SQFT:r.unit==='RM'?METRES_PER_FOOT:1;
 return {metric_quantity:q,metric_unit:r.unit==='SQM'?'m²':r.unit==='RM'?'running m':r.unit==='LS'?'package':'sets',imperial_quantity:q/factor,imperial_unit:r.unit==='SQM'?'sq ft':r.unit==='RM'?'running ft':r.unit==='LS'?'package':'sets',source_rate:rate,imperial_rate:rate*factor,rate_unit_metric:r.unit==='SQM'?'m²':r.unit==='RM'?'running m':r.unit==='LS'?'package':'set',rate_unit_imperial:r.unit==='SQM'?'sq ft':r.unit==='RM'?'running ft':r.unit==='LS'?'package':'set',convertible:['SQM','RM'].includes(r.unit)};
}
export function rowArithmetic(r){const product=minor(r.rate)*minor(r.quantity),amount=minor(r.amount)*100n;return {displayed_product_4dp:scaledString(product,4),quoted_minus_displayed_product_4dp:scaledString(amount-product,4),matches_displayed_product:amount===product};}
export function deriveQuotation(q,notes){
 validateQuotation(q);const index=new Map(notes.items.map(n=>[n.id,n]));if(index.size!==19||q.items.some(r=>!index.has(r.id)))throw Error('Client notes do not match the quote one-to-one');
 for(const note of notes.items)if(['rate','quantity','amount','unit','source_title','source_description','page','number'].some(k=>Object.hasOwn(note,k)))throw Error('Client notes cannot override source quotation fields');
 const items=q.items.map(r=>({...r,...index.get(r.id),conversion:convertRow(r),arithmetic:rowArithmetic(r)})),sum=q.items.reduce((n,r)=>n+minor(r.amount),0n),products=q.items.reduce((n,r)=>n+minor(r.rate)*minor(r.quantity),0n);
 return {...q,items,categories:notes.categories,arithmetic:{printed_total:q.printed_total,sum_printed_lines:scaledString(sum),printed_total_minus_lines:scaledString(minor(q.printed_total)-sum),sum_displayed_products_4dp:scaledString(products,4),printed_total_minus_displayed_products_4dp:scaledString(minor(q.printed_total)*100n-products,4),line_mismatch_count:items.filter(r=>!r.arithmetic.matches_displayed_product).length},conversion_basis:{foot_m:METRES_PER_FOOT,sqft_m2:SQUARE_METRES_PER_SQFT,source:'https://www.nist.gov/pml/us-surveyfoot/revised-unit-conversion-factors',rule:'Quantity divides by the factor; rate multiplies by the same factor. Printed amounts remain unchanged.'}};
}
export function referenceBlocks(r,system='imperial'){
 const c=convertRow(r),area=r.unit==='SQM',length=r.unit==='RM',isMetric=system==='metric',value=isMetric?c.metric_quantity:c.imperial_quantity,block=area?(isMetric?10:100):length?(isMetric?1:5):1,full=Math.floor(value/block+1e-12),fraction=(value-full*block)/block;
 return {kind:area?'area':length?'length':r.unit==='Set'?'sets':'package',value,unit:isMetric?c.metric_unit:c.imperial_unit,block,full,fraction:fraction<1e-10?0:fraction,blocks:Array.from({length:full+(fraction>1e-10?1:0)},(_,i)=>i<full?1:fraction),label:area?(isMetric?'10 m²':'100 sq ft'):length?(isMetric?'1 running m':'5 running ft'):r.unit==='Set'?'1 set':'1 package'};
}

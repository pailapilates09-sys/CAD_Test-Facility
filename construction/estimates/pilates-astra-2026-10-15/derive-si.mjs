import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const gcd=(a,b)=>b?gcd(b,a%b):a;
const rational=s=>{const [a,b='']=s.split('.');return {n:BigInt(a+b),d:10n**BigInt(b.length)}};
const simplify=(n,d)=>{const common=gcd(n,d);return {numerator:String(n/common),denominator:String(d/common)}};
const decimal=(n,d,places)=>{const scale=10n**BigInt(places);const scaled=(n*scale*2n+d)/(d*2n);const raw=String(scaled).padStart(places+1,'0');return places?(raw.slice(0,-places)+'.'+raw.slice(-places)).replace(/\.?0+$/,''):raw};
export function deriveSI(source){
 const factors={ft2:{unit:'m²',code:'m2',factor:'0.09290304',places:8},ft:{unit:'m',code:'m',factor:'0.3048',places:4}};
 const items=source.line_items.map(x=>{
  const f=factors[x.unit_code],q=rational(x.quantity),r=rational(x.rate);
  let quantity=x.quantity,rate=x.rate,unit=x.unit_code==='each'?'each':x.unit_raw,unitCode=x.unit_code,factor='1',fraction=simplify(r.n,r.d),status=x.unit_code==='each'?'count_retained':x.unit_code==='point'?'source_point_retained':'missing_unit';
  if(f){
   const k=rational(f.factor);quantity=decimal(q.n*k.n,q.d*k.d,(x.quantity.split('.')[1]?.length??0)+f.places);
   rate=decimal(r.n*k.d,r.d*k.n,12);unit=f.unit;unitCode=f.code;factor=f.factor;fraction=simplify(r.n*k.d,r.d*k.n);status='converted';
  }
  return {id:x.id,section_id:x.section_id,section_name:x.section_name,description:x.description,source_page:x.source.page,source_sn:x.source_sn,no:x.no,quantity,unit_raw:unit,unit_code:unitCode,rate,amount:x.amount,amount_minor:x.amount_minor,conversion:{status,quantity_factor:factor,rate_exact_fraction:fraction},original:{quantity:x.quantity,unit_raw:x.unit_raw,unit_code:x.unit_code,rate:x.rate,amount:x.amount}};
 });
 return {schema_version:'si-view-1.0.0',document_id:source.document_id+'-si',source_document_id:source.document_id,source_pdf_sha256:source.source.sha256,source_data:'../data/estimate.json',currency:source.currency,summary:source.summary,sections:source.sections,conventions:{length:'1 ft = 0.3048 m exactly; running feet are length.',area:'1 ft² = 0.09290304 m² exactly.',rate:'Converted rate = original rate ÷ quantity factor. Exact rational rate is authoritative; decimal rate is rounded to 12 places.',display:'Web quantities round to 4 decimals and rates to 2. Original printed line amounts and totals remain authoritative; display rounding can change a manually multiplied result.',counts:'Counts are shown as each. Source point and missing units are retained without dimensional conversion.',capacity:'Source AC ton / MT notation remains verbatim; its meaning is not confirmed, so no W or kg conversion is asserted.'},conversion_counts:{area:items.filter(x=>x.original.unit_code==='ft2').length,length:items.filter(x=>x.original.unit_code==='ft').length,count:items.filter(x=>x.original.unit_code==='each').length,point:items.filter(x=>x.original.unit_code==='point').length,missing:items.filter(x=>x.original.unit_code===null).length},line_items:items};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const folder=new URL('../../../public/construction/estimates/pilates-astra-2026-10-15/v3/',import.meta.url);
 const source=JSON.parse(await readFile(new URL('data/estimate.json',import.meta.url),'utf8'));
 const si=deriveSI(source);await mkdir(folder,{recursive:true});
 await writeFile(new URL('estimate-si.json',folder),JSON.stringify(si,null,2)+'\n');
 await writeFile(new URL('line-items-si.jsonl',folder),si.line_items.map(x=>JSON.stringify(x)).join('\n')+'\n');
 console.log('Derived SI view:',JSON.stringify(si.conversion_counts));
}

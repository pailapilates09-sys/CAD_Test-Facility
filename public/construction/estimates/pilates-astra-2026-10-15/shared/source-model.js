import {buildComparison,displayUnit} from '../v5/comparison-model.js';
import {buildV8,recipes} from './material-model.js';

const copy=x=>structuredClone(x);
function normalizePrice(o){const factor=o.unit==='ft2'?'0.09290304':o.unit==='ft'?'0.3048':'1';return {unit:o.unit==='ft2'?'m2':o.unit==='ft'?'m':o.unit,low:o.low==null?null:(Number(o.low)/Number(factor)).toFixed(2),high:o.high==null?null:(Number(o.high)/Number(factor)).toFixed(2),factor};}
const unique=(rows,key,label)=>{const ids=new Set();for(const x of rows){if(!x[key]||ids.has(x[key]))throw Error('Duplicate or missing '+label+': '+x[key]);ids.add(x[key]);}return ids;};
export function validateRegister(r){
 if(r.schema_version!=='linked-estimate-register-1.0.0'||r.version!=='v9')throw Error('Unsupported source register');
 const areas=unique(r.areas,'id','area'),works=unique(r.works,'id','work');
 for(const w of r.works)if(!areas.has(w.section_id))throw Error('Unknown work area '+w.id);
 for(const group of ['market','components','images']){
  const links=r[group].work_links;unique(links,'item_id',group+' work link');
  if(links.length!==works.size||links.some(x=>!works.has(x.item_id)))throw Error('Incomplete '+group+' work links');
 }
 const marketObs=unique(r.market.observations,'id','market observation'),marketSources=unique(r.market.sources,'id','market source');
 for(const o of r.market.observations)if(!marketSources.has(o.source_id))throw Error('Unknown market source '+o.source_id);
 for(const link of r.market.work_links)for(const id of link.reference_ids)if(!marketObs.has(id))throw Error('Unknown rate reference '+id);
 const componentObs=unique(r.components.observations,'id','component observation'),componentSources=unique(r.components.sources,'id','component source');
 for(const s of r.components.sources)if(s.market_source_id&&!marketSources.has(s.market_source_id))throw Error('Unknown source alias '+s.id);
 for(const o of r.components.observations){if(o.market_observation_id){if(!marketObs.has(o.market_observation_id))throw Error('Unknown observation alias '+o.id);}else if(!componentSources.has(o.source_id))throw Error('Unknown component source '+o.id);}
 for(const link of r.components.work_links)for(const kind of ['labour','material','combined'])for(const id of link[kind+'_reference_ids'])if(!componentObs.has(id))throw Error('Unknown component link '+id);
 const assets=unique(r.images.assets,'id','image');for(const link of r.images.work_links)if(!assets.has(link.image_id))throw Error('Unknown image '+link.image_id);
 const materials=unique(r.materials.materials,'id','material'),sources=unique(r.materials.sources,'id','material source');
 for(const m of r.materials.materials)if(m.source_id&&!sources.has(m.source_id))throw Error('Unknown material source '+m.source_id);
 if(r.work_materials){unique(r.work_materials,'id','work material');for(const x of r.work_materials)if(!works.has(x.work_id)||!materials.has(x.material_id))throw Error('Unknown material relationship '+x.id);}
 if(r.model_parameters){unique(r.model_parameters,'id','model parameter');for(const x of r.model_parameters)if(!works.has(x.work_id))throw Error('Unknown model work '+x.work_id);}
 return r;
}

const decimal=s=>{const [a,b='']=String(s).split('.');return [BigInt(a+b),10n**BigInt(b.length)];};
const gcd=(a,b)=>b?gcd(b,a%b):a;
function multiply(a,b){const [x,d]=decimal(a),[y,e]=decimal(b),n=x*y,scale=(d*e).toString().length-1;if(!scale)return String(n);const s=n.toString().padStart(scale+1,'0');return (s.slice(0,-scale)+'.'+s.slice(-scale)).replace(/0+$/,'').replace(/\.$/,'');}
export function deriveSI(original){
 const line_items=original.line_items.map(x=>{
  const factor=x.unit_code==='ft2'?'0.09290304':x.unit_code==='ft'?'0.3048':'1',unit=x.unit_code==='ft2'?'m2':x.unit_code==='ft'?'m':x.unit_code;
  const [rate,rd]=decimal(x.rate),[f,fd]=decimal(factor),n=rate*fd,d=rd*f,g=gcd(n,d);
  return {...x,quantity:multiply(x.quantity,factor),rate:factor==='1'?x.rate:String(Number(x.rate)/Number(factor)),unit_code:unit,unit_raw:unit?displayUnit(unit):null,
   source_page:x.source.page,conversion:{status:factor!=='1'?'converted':unit?'retained_count':'missing_unit',quantity_factor:factor,rate_exact_fraction:{numerator:String(n/g),denominator:String(d/g)}},
   original:{quantity:x.quantity,unit_raw:x.unit_raw,unit_code:x.unit_code,rate:x.rate,amount:x.amount}};
 });
 return {schema_version:'si-view-1.0.0',source_document_id:original.document_id,currency:original.currency,summary:original.summary,sections:original.sections,line_items};
}

export function deriveViews(input){
 const r=validateRegister(input),areas=new Map(r.areas.map(x=>[x.id,x]));
 const original={...copy(r.project),sections:copy(r.areas),line_items:r.works.map(({title,...w})=>({...copy(w),document_id:r.project.document_id,section_name:areas.get(w.section_id).name}))};
 const si=deriveSI(original),works=new Map(original.line_items.map(x=>[x.id,x]));
 const research={...copy(r.market),items:r.market.work_links.map(link=>{const w=works.get(link.item_id);return {...copy(link),title:r.works.find(x=>x.id===w.id).title,section_id:w.section_id,section_name:w.section_name,description:w.description,source_page:w.source.page,original:{quantity:w.quantity,unit:w.unit_raw,rate:w.rate,amount:w.amount,currency:original.currency}};})};
 delete research.work_links;
 research.observations=research.observations.map(o=>({...o,normalized_si:['ft','ft2'].includes(o.unit)?normalizePrice(o):null}));
 research.coverage={items_with_numeric_reference:research.items.filter(x=>x.reference_ids.length).length,items_without_numeric_reference:research.items.filter(x=>!x.reference_ids.length).length,source_count:research.sources.length};
 const comparison=buildComparison(original,si,research),cmap=new Map(comparison.items.map(x=>[x.id,x]));
 comparison.based_on='v9';
 comparison.policy.currency='Original currency is unspecified. V5.1 shows original markers permanently under an explicit NPR assumption where measurement units match.';
 delete comparison.policy.stop;
 const componentSources=r.components.sources.map(s=>s.market_source_id?{...copy(r.market.sources.find(x=>x.id===s.market_source_id)),id:s.id}:copy(s));
 const componentObservations=r.components.observations.map(o=>{
  if(!o.market_observation_id)return {...copy(o),normalized:normalizePrice(o)};
  const m=copy(r.market.observations.find(x=>x.id===o.market_observation_id));
  return {...m,id:o.id,component:o.component,source_id:'V4-'+m.source_id,normalized:normalizePrice(m),exact_scope_verified:false,carried_from:o.market_observation_id};
 });
 const components={...copy(r.components),summary:copy(original.summary),sources:componentSources,observations:componentObservations,
  items:r.components.work_links.map(link=>{const c=cmap.get(link.item_id);const item={...copy(link),section_id:c.section_id,section_name:c.section_name,title:c.title,original:c.original,si:c.si,original_unallocated_rate:c.si.rate};for(const kind of ['labour','material'])item['same_unit_'+kind+'_ids']=item[kind+'_reference_ids'].filter(id=>componentObservations.find(x=>x.id===id).normalized.unit===c.si.unit&&c.si.unit!==null);return item;}),
  allowances:r.components.allowances.map(link=>({...copy(link),name:areas.get(link.section_id).name,original_amount:areas.get(link.section_id).summary_amount}))};
 delete components.work_links;
 components.based_on='v9';
 components.coverage={work_items:components.items.length,both_component_reference_items:components.items.filter(x=>x.labour_reference_ids.length&&x.material_reference_ids.length).length,accepted_original_splits:components.items.filter(x=>x.accepted_split).length};
 const images={...copy(r.images),items:r.images.work_links.map(link=>{const c=cmap.get(link.item_id);return {...copy(link),title:c.title,section_id:c.section_id,original_status:c.status,original_values_retained:true};})};delete images.work_links;
 images.based_on='v9';
 images.coverage={mapped_items:images.items.length,unique_assets:images.assets.length,project_photographs:images.items.filter(x=>x.project_photo).length};
 const assemblies=r.work_materials?Object.fromEntries(r.works.map(w=>[w.id,r.work_materials.filter(x=>x.work_id===w.id).map(x=>({material_id:x.material_id,rule:x.rule,note:x.note}))])):recipes;
 const modelParameters={};for(const p of r.model_parameters??[])(modelParameters[p.work_id]??={})[p.key]=p.value;
 const materials=buildV8({original,components,images,catalog:r.materials,assemblies,modelParameters});
 materials.based_on='v9';
 return {original,si,research,comparison,components,images,materials};
}

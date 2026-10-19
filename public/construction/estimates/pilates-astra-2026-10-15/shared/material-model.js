import {M2_PER_FT2,quantityFor,subtotal,moneyRound,quantityRound} from '../v8/calculations.js';
import {createQuantityModel,deriveQuantities} from '../v8/quantity-models.js';
const r=(id,rule='manual',note='')=>({material_id:id,rule,note});
const cabinets=[r('ply18'),r('ply12'),r('laminate'),r('glue'),r('hinge'),r('hardware'),r('edges'),r('screws'),r('finish')];
const marble=[r('marble','surface10'),r('stoneglue'),r('stonefinish')];
const panel=[r('pvc','surface10'),r('frame'),r('trim'),r('panelglue'),r('screws')];
const strip=[r('strip','length'),r('driver'),r('channel','length'),r('cable'),r('electrical')];
const ac=mat=>[r(mat,'count'),r('copper'),r('drain'),r('acmount','count'),r('cable'),r('electrical')];
const lights=mat=>[r(mat,'count'),r('bulbs'),r('cable'),r('electrical'),r('screws')];
const paint=withPaint=>[r('putty','putty'),...(withPaint?[r('primer'),r('paint','paint')]:[]),r('abrasives')];
const ceiling=[r('gypsum','surface10'),r('metalframe'),r('hangers'),r('joint'),r('screws'),r('cable'),r('electrical')];
const sign=[r('sign','count'),r('screws'),r('cable','manual','Only if illuminated; design not supplied.')];
const curtain=mat=>[r(mat),r('rod'),r('rings'),r('screws')];
const partition=[r('cementboard'),r('aluminium'),r('screws'),r('joint')];
export const recipes={
 'reception-001':cabinets,'reception-002':marble,'reception-003':[r('wpc'),...cabinets.filter(x=>!['laminate','finish'].includes(x.material_id))],
 'reception-004':cabinets,'reception-005':[r('heldRattan'),r('frame'),r('screws')],
 'reception-006':[r('glass','surface'),r('doorhardware'),r('screws'),r('panelglue')],
 'reception-007':ac('ac15'),'reception-008':strip,'reception-009':lights('panelLight'),'reception-010':lights('chandelier'),
 'reception-011':paint(true),'reception-012':ceiling,'reception-013':sign,'reception-014':ceiling,
 'reception-015':[r('sofa'),r('ply18'),r('foam'),r('fabric'),r('upholstery'),r('finish')],
 'reception-016':[r('heldGranite'),r('screws')],
 'coffee-lounge-001':[r('sofa'),r('ply18'),r('foam'),r('fabric'),r('upholstery'),r('finish')],
 'coffee-lounge-002':marble,'coffee-lounge-003':cabinets,'coffee-lounge-004':[r('trim'),r('panelglue'),r('screws')],
 'coffee-lounge-005':panel,'coffee-lounge-006':lights('panelLight'),'coffee-lounge-007':paint(true),'coffee-lounge-008':ac('ac1'),
 'coffee-lounge-009':ceiling,'coffee-lounge-010':[r('heldGlassTable'),r('heldStool'),r('screws')],'coffee-lounge-011':strip,
 'coffee-lounge-012':lights('pendant'),'coffee-lounge-013':[r('sink','count'),r('tap','count'),r('waste','count'),r('plumbing'),r('panelglue')],
 'locker-space-001':cabinets,'locker-space-002':cabinets,'locker-space-003':panel,'locker-space-004':lights('pendant'),
 'locker-space-005':paint(false),'locker-space-006':ac('ac1'),'locker-space-007':ceiling,'locker-space-008':strip,
 'locker-space-009':sign,'locker-space-010':[r('heldSliding'),r('frame'),r('screws')],
 'studio-001':cabinets,'studio-002':[r('mirror','surface'),r('woodframe'),r('laminate'),r('mirrorfix'),r('screws')],
 'studio-003':curtain('sheer'),'studio-004':panel,'studio-005':paint(true),'studio-006':strip,'studio-007':ac('ac15'),
 'studio-008':partition,'changing-room-001':partition,'changing-room-002':curtain('curtain'),
 'washroom-001':[r('decorMirror','count'),r('mirrorfix'),r('screws')],
 'washroom-002':[r('heldDecor'),r('screws')]
};
const basis={
 count:'Source work count × one purchased unit/set. Product equivalence and any bundled accessories remain provisional.',
 length:'Source running feet × 0.3048. Net run only; reel/stock rounding and waste are not included.',
 surface:'Source ft² × 0.09290304. Net single surface; openings and cut layout unverified.',
 surface10:'Source ft² × 0.09290304 × 1.10. Provisional single layer / surface with 10% cutting allowance; not a measured cut list.',
 putty:'ceil(source ft² × 2 coats ÷ 20 ft²/kg/coat × 1.10 ÷ 40 kg/bag). Uses manufacturer S07 and a 10% planning allowance.',
 paint:'ceil(source ft² ÷ 50 ft²/L for two coats × 1.10). Rounded to 1 L packs. General S09 coverage, not verified for selected product.',
 manual:'Take-off needed. Source work quantity alone does not establish this material quantity.'
};
export function buildV8({original,components,images,catalog,assemblies=recipes,modelParameters={}}) {
 const materials=new Map(catalog.materials.map(m=>[m.id,m]));
 const items=original.line_items.map(item=>{
  const c=components.items.find(x=>x.item_id===item.id),image=images.items.find(x=>x.item_id===item.id);
  const asset=images.assets.find(x=>x.id===image.image_id),held=c.status==='on_hold_original_retained';
  if(!assemblies[item.id])throw Error('Missing assembly '+item.id);
  const quantityModel=held?null:createQuantityModel(item,assemblies[item.id]);
  if(quantityModel)for(const [key,value] of Object.entries(modelParameters[item.id]??{})){if(!quantityModel.parameters[key])throw Error('Unknown quantity model parameter '+key);quantityModel.parameters[key].value=value;}
  const derived=deriveQuantities(quantityModel);
  const rows=assemblies[item.id].map((recipe,i)=>{
   const mat=materials.get(recipe.material_id);if(!mat)throw Error('Unknown material');
   const conversion=mat.rate_conversion;
   const low=conversion?moneyRound(conversion.low_ft2/M2_PER_FT2):mat.rate_low??null;
   const high=conversion?moneyRound(conversion.high_ft2/M2_PER_FT2):mat.rate_high??null;
   const modelled=derived.valid?derived.quantities[mat.id]:null;
   const rawQuantity=held?null:modelled?modelled.quantity:quantityFor(recipe.rule,item);
   const quantity=quantityRound(rawQuantity,mat.whole_units);
   return {id:item.id+'-m'+String(i+1).padStart(2,'0'),material_id:mat.id,name:mat.name,unit:mat.unit,whole_units:mat.whole_units??false,cut_sheet:mat.cut_sheet??false,
    quantity,quantity_rule:held?'held':modelled?'planning_model':recipe.rule,quantity_basis:held?'User hold; no new quantity or material price allocated.':modelled?modelled.basis:basis[recipe.rule],
    quantity_classification:held?'held':modelled?'planning_model':rawQuantity===null?'needs_input':recipe.rule==='count'?'source_count':'source_consumption_or_conversion',
    quantity_sources:recipe.rule==='putty'?['S07']:recipe.rule==='paint'?['S09']:[],
    rate_low:held?null:low,rate_high:held?null:high,currency:'NPR',vat_status:mat.vat_status??'not_stated',
    source_id:held?null:mat.source_id??null,note:held?'Material specification deferred while this item remains on hold.':mat.note+(recipe.note?' '+recipe.note:''),held};
  });
  return {id:item.id,title:c.title,section_id:item.section_id,section_name:item.section_name,description:item.description,source_page:item.source.page,
   original:{quantity:item.quantity,unit:item.unit_raw,unit_code:item.unit_code,rate:item.rate,amount:item.amount,currency:original.currency},
   si:c.si,held,quantity_model:quantityModel,quantity_model_result:derived,rows,subtotal:subtotal(rows),complete_material_takeoff:false,
   image:{path:'../v6/'+asset.local_path.replace(/^\.\//,''),alt:image.alt,scope_note:image.scope_note,source_page:asset.source_page,author:asset.author,license:asset.license,license_url:asset.license_url},
   gaps:[...(held?['User hold; original rate and amount retained.']:[]),...c.gaps,'Materials shown are a specification-led checklist, not an approved complete procurement schedule. Quantities, grades, delivery and taxes require confirmation.']};
 });
 const sources=catalog.sources.map(s=>({...s,url:s.id==='S19'?'../v7/component-rates.json':s.url}));
 return {schema_version:'material-takeoff-1.0.0',version:'v8',based_on:'v7',researched_date:catalog.researched_date,currency:'NPR',estimate_currency:original.currency,
  original_summary:original.summary,policy:catalog.price_policy,
  quantity_policy:'Source measurements feed explicit editable geometry and consumption scenarios. Assumed dimensions, routes and coefficients are not surveyed or verified design data. Physical quantities round up to three decimals; whole purchase units round up. Converted rates round to two decimals so amounts reproduce from displayed inputs. Six held items are locked. Unknown is null, never zero. No complete project material total is inferred.',
  coverage:{work_items:items.length,areas:new Set(items.map(x=>x.section_id)).size,held_items:items.filter(x=>x.held).length,material_rows:items.reduce((s,x)=>s+x.rows.length,0),quantity_rows:items.reduce((s,x)=>s+x.rows.filter(r=>r.quantity!==null).length,0),modelled_quantity_rows:items.reduce((s,x)=>s+x.rows.filter(r=>r.quantity_rule==='planning_model').length,0),priced_rows:items.reduce((s,x)=>s+x.subtotal.priced_rows,0),items_with_priced_rows:items.filter(x=>x.subtotal.priced_rows>0).length,complete_takeoffs:0},sources,items,
  allowances:components.allowances};
}

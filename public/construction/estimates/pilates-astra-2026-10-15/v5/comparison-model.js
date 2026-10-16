export const displayUnit=u=>({m2:'m²',ft2:'ft²',ft:'ft',m:'m',each:'each',point:'point',fabric_m:'linear metre of fabric'}[u]??u??'unspecified unit');
export function buildComparison(original,si,research){
 const obs=new Map(research.observations.map(o=>[o.id,o])),sources=new Map(research.sources.map(s=>[s.id,s])),metric=new Map(si.line_items.map(x=>[x.id,x]));
 const items=research.items.map(r=>{
  const x=original.line_items.find(x=>x.id===r.item_id),m=metric.get(x.id),held=!r.reference_ids.length;
  const refs=r.reference_ids.map(id=>{
   const o=obs.get(id),s=sources.get(o.source_id),n=o.normalized_si;
   const unit=n?n.unit:o.unit;
   return {id:o.id,source_id:s.id,publisher:s.publisher,url:s.url,label:o.label,low:n?n.low:o.low,high:n?n.high:o.high,unit,unit_label:displayUnit(unit),currency:o.currency,basis:o.basis,qualifier:o.price_qualifier,availability:o.availability,source_access:s.access_status,published_date:s.published_date,retrieved_date:s.retrieved_date,qualification:o.qualification,source_note:s.note,unit_matches_estimate:unit===m.unit_code&&m.unit_code!==null,scope_verified:false};
  });
  return {id:x.id,section_id:x.section_id,section_name:x.section_name,title:r.title,source_page:x.source.page,status:held?'on_hold_original_retained':'reference_comparison',hold_reason:held?'User instruction on 2026-10-17: keep original values and leave rate research on hold.':null,original:{quantity:x.quantity,unit:x.unit_raw,rate:x.rate,amount:x.amount,amount_minor:x.amount_minor,currency:original.currency},si:{quantity:m.quantity,unit:m.unit_code,unit_label:displayUnit(m.unit_code),rate:m.rate},working_amount:x.amount,working_amount_minor:x.amount_minor,working_rate:m.rate,replacement_rate:null,reference_ids:r.reference_ids,references:refs,research_state:r.research_state,qualification:r.qualification};
 });
 const held=items.filter(x=>x.status==='on_hold_original_retained');
 return {schema_version:'comparison-1.0.0',version:'v5',created_date:'2026-10-17',reference_snapshot_date:research.as_of,original_document_id:original.document_id,source_pdf_sha256:original.source.sha256,policy:{six_items:'On hold; original amounts and rates retained.',currency:'Unconfirmed. Estimate is not plotted on the NPR axis unless the reader explicitly enables the NPR assumption.',scope:'Unit compatibility is checked; scope equivalence is unverified. Reference ranges are published ranges, not confidence intervals.',replacement_rates:'None assigned. No midpoint, market total, saving, percentage difference or financial conclusion is calculated.',model:'SKP extraction and duplicate analysis deferred with the existing download blocker.',stop:'V5 only. V6 images not started.'},coverage:{all_items:items.length,held_items:held.length,reference_items:items.length-held.length,unit_compatible_items:items.filter(x=>x.references.some(r=>r.unit_matches_estimate)).length,exact_scope_quotes:0,held_original_amount_minor:held.reduce((n,x)=>n+x.original.amount_minor,0)},summary:original.summary,sections:original.sections,items};
}
export function chartRows(item,assumeNPR=false){
 return item.references.map(r=>({...r,estimate_rate:assumeNPR&&r.unit_matches_estimate?item.si.rate:null,estimate_currency_assumed:assumeNPR&&r.unit_matches_estimate,axis_currency:'NPR'}));
}

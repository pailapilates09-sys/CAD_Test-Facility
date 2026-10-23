import {materialLine,worksheet} from '../../estimates/pilates-astra-2026-10-15/v10/contractor-model.js?source=BOQ_SOURCE_REVISION';
import {roomSlice} from './room-navigation.js';

export const BOQ_BASE='../../estimates/pilates-astra-2026-10-15/';
export const fmt=(value,digits=2)=>Number(value).toLocaleString('en-IN',{minimumFractionDigits:digits===2?2:0,maximumFractionDigits:digits});
export const range=(a,b)=>a===null?null:a===b?fmt(a):fmt(a)+' – '+fmt(b);
export const materialSubtotal=(work,draft={})=>worksheet(work,draft).material;
const readableName=name=>name&&!/^(?:Group\s*#?\d+|Component\s*#?\d+(?:#\d+)?|Untitled|mesh[- ]?\d+|[0-9]+$|[a-f0-9]{8}-|Enscape\.)/i.test(name);
export function reviewBoqWork({work,link,modelItems}){
 const named=modelItems.some(i=>!i.locationUnconfirmed&&['source-label','nested-label'].includes(i.labelStatus)&&[i.sourceName,...i.searchNames].some(readableName));
 const renderingOnly=modelItems.length>0&&modelItems.every(i=>/^Enscape\./i.test(i.sourceName));
 const status=!modelItems.length?'unidentified':link.kind==='surface_context'||renderingOnly?'context':named?'named':'possible';
 const label={unidentified:'Not identified',context:'Finish / context only',named:'Named candidate',possible:'Possible assembly'}[status];
 const countComparable=['each'].includes(work.original.unit_code)&&status==='named'&&modelItems.every(i=>!i.locationUnconfirmed);
 const modelCount=modelItems.reduce((n,i)=>n+i.quantity,0),quotedCount=Number(work.original.quantity);
 const count=countComparable&&Number.isFinite(quotedCount)?{model:modelCount,quoted:quotedCount,difference:modelCount-quotedCount}:null;
 const evidence=modelItems.map(i=>({id:i.id,sourceName:i.sourceName,nestedNames:i.searchNames.filter(readableName).slice(0,4),finishes:i.finishes.filter(f=>/marble|mirror/i.test(f)),locationUnconfirmed:i.locationUnconfirmed}));
 return {status,label,count,evidence};
}
export function materialDisplay(row,input={}){
 const cost=materialLine(row,input),quantityDraft=Object.hasOwn(input,'quantity'),priceDraft=cost.contractor_price;
 return {cost,quantity:row.held?'On hold':cost.invalid?'Check input':cost.quantity===null?'Measure first':fmt(cost.quantity,3),
  quantityNote:row.held?'Original hold retained':quantityDraft?'Contractor quantity · this browser':row.quantity_classification==='planning_model'?'Planning quantity':cost.quantity===null?'Take-off input needed':'Source-based planning quantity',
  rate:row.held?'On hold':cost.invalid?'Check input':range(cost.rate_low,cost.rate_high)??'Price needed',
  amount:row.held?'On hold':cost.invalid?'Check input':range(cost.amount_low,cost.amount_high)??'Incomplete',
  rateNote:priceDraft?'Contractor price · this browser':'V11 published reference',selection:typeof input.selection==='string'?input.selection:''};
}
export function buildBoqBridge(model,data,links){
 if(links?.schema_version!=='paila-model-boq-links-1.0'||links.source_sha256!==model.source.sha256)throw Error('Model/BOQ source mismatch');
 if(links.boq_register!==BOQ_BASE+'v9/register.json'||links.boq_view!==BOQ_BASE+'v11/')throw Error('Unexpected BOQ source');
 if(data?.schema_version!=='material-takeoff-1.0.0'||!Array.isArray(data.items)||!links.work_links||!links.boq_areas_by_zone)throw Error('Missing BOQ material source');
 const workIds=new Set(data.items.map(w=>w.id)),modelIds=new Set(model.items.map(i=>i.id)),areas=new Set(data.items.map(w=>w.section_id));
 if(workIds.size!==data.items.length||Object.keys(links.work_links).some(id=>!workIds.has(id)))throw Error('Unknown or duplicate BOQ work relationships');
 const materialIds=new Set(),linkedModelIds=new Set(),records=[];
 for(const work of data.items){
  const link=links.work_links[work.id]??{model_ids:[],kind:'unidentified',note:'No model association is recorded for this BOQ work yet.'};
  if(!link||Object.keys(link).some(key=>!['model_ids','kind','note'].includes(key))||!Array.isArray(link.model_ids)||new Set(link.model_ids).size!==link.model_ids.length||!link.note?.trim())throw Error('Invalid BOQ relationship '+work.id);
  if(!['assembly_candidate','surface_context','unidentified'].includes(link.kind)||(link.kind==='unidentified')!==(link.model_ids.length===0))throw Error('Invalid model-link status '+work.id);
  for(const id of link.model_ids){if(!modelIds.has(id))throw Error('Unknown model definition '+id);linkedModelIds.add(id)}
  for(const row of work.rows){if(materialIds.has(row.id))throw Error('Duplicate material row '+row.id);materialIds.add(row.id)}
  const scopeZoneId=Object.keys(links.boq_areas_by_zone).find(id=>links.boq_areas_by_zone[id].includes(work.section_id));
  const scope=scopeZoneId?roomSlice(model,scopeZoneId):null;
  const modelItems=link.model_ids.map(id=>{const original=model.items.find(i=>i.id===id),local=scope?.items.find(i=>i.id===id);return {...(local??original),globalQuantity:original.quantity,scopeZoneId:local?scopeZoneId:null,scopeName:local?scope.zone.name:null,locationUnconfirmed:!local}});
  const record={work,link,modelItems,occurrenceIds:new Set(modelItems.flatMap(i=>i.occurrences.map(o=>o.id)))};record.review=reviewBoqWork(record);records.push(record);
 }
 for(const [zone,ids]of Object.entries(links.boq_areas_by_zone))if(!model.navigation?.zones.some(z=>z.id===zone)||!Array.isArray(ids)||ids.some(id=>!areas.has(id)))throw Error('Unknown model/BOQ area link');
 return {records,unlinkedModelItems:model.items.filter(i=>!linkedModelIds.has(i.id)),linkedModelIds,materialIds,data,links,model};
}
export function filterBoqBridge(bridge,{zoneId='all',selectedId=null,followSelection=true,visibleItemIds,visibleOccurrenceIds,modelSearch='',isolated=false,query='',mode='works'}={}){
 const slice=roomSlice(bridge.model,zoneId);visibleItemIds??=new Set(slice.items.map(i=>i.id));visibleOccurrenceIds??=slice.occurrenceIds;
 const q=query.trim().toLocaleLowerCase(),areas=bridge.links.boq_areas_by_zone[zoneId]??[],following=followSelection&&selectedId;
 const records=bridge.records.filter(({work,link,modelItems,occurrenceIds,review})=>{
  if(mode==='model-only'||mode==='linked'&&!['named','possible'].includes(review.status)||mode==='context'&&review.status!=='context'||mode==='boq-only'&&link.model_ids.length)return false;
  const inArea=zoneId==='all'||areas.includes(work.section_id)||link.kind==='assembly_candidate'&&[...occurrenceIds].some(id=>visibleOccurrenceIds.has(id));
  if(!inArea)return false;
  if(following&&!link.model_ids.includes(selectedId))return false;
  if(!following&&(modelSearch.trim()||isolated)&&!link.model_ids.some(id=>visibleItemIds.has(id)))return false;
  return !q||[work.id,work.title,work.section_name,work.description,...modelItems.flatMap(i=>[i.name,i.sourceName,...i.searchNames])].join(' ').toLocaleLowerCase().includes(q);
 });
 const unlinkedModelItems=!['all','model-only'].includes(mode)&&!(mode==='works'&&following)?[]:bridge.unlinkedModelItems.filter(i=>visibleItemIds.has(i.id)&&(!following||i.id===selectedId)&&(!q||[i.name,i.sourceName,...i.searchNames].join(' ').toLocaleLowerCase().includes(q)));
 return {records,unlinkedModelItems,materialCount:records.reduce((n,r)=>n+r.work.rows.length,0)};
}
export function referenceHref(source){
 const url=source?.url;if(!url)return null;
 if(/^https?:\/\//i.test(url))return url;
 return /^[a-z]+:|^\/\//i.test(url)?null:BOQ_BASE+'v10/'+url;
}

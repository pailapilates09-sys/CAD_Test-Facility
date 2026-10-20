import {worksheet,materialLine,readDraft,draftKey,materialCSV} from './contractor-model.js?source=SOURCE_REVISION';
const fmt=(n,d=2)=>n===null||n===undefined?'Not supplied':Number(n).toLocaleString('en-IN',{minimumFractionDigits:d===2?2:0,maximumFractionDigits:d});
const range=(a,b)=>a===null?'Not priced':a===b?fmt(a):fmt(a)+' – '+fmt(b);
const text=(node,value)=>{if(node&&node.textContent!==String(value))node.textContent=String(value);};
const revision=document.querySelector('meta[name="estimate-source-revision"]')?.content;
let storage;try{storage=window.localStorage;}catch{}
const find=document.querySelector('#contractor-search'),area=document.querySelector('#contractor-area');
if(find&&area){
 find.disabled=false;area.disabled=false;
 const filter=()=>{
  let count=0;for(const row of document.querySelectorAll('[data-contractor-work]')){row.hidden=!(row.dataset.search.includes(find.value.toLowerCase().trim())&&(!area.value||row.dataset.area===area.value));if(!row.hidden)count++;}
  for(const group of document.querySelectorAll('[id^="area-"]'))group.hidden=![...group.querySelectorAll('[data-contractor-work]')].some(row=>!row.hidden);
  text(document.querySelector('#contractor-filter-status'),count+' works shown');
 };
 find.addEventListener('input',filter);area.addEventListener('change',filter);
}
document.querySelector('#print-contractor')?.addEventListener('click',()=>window.print());
async function init(){
 const response=await fetch('./contractor-data.json?source=SOURCE_REVISION',{cache:'no-cache'});if(!response.ok)throw Error('Worksheet source unavailable');
 const data=await response.json();if(data.derivation?.revision!==revision)throw Error('Worksheet source changed; reload the page');
 const detail=document.querySelector('#contractor-work');
 if(!detail){
  const updateIndex=()=>{
   let changed=0;
   for(const item of data.items){
    const row=document.querySelector('[data-contractor-work="'+item.id+'"]');if(!row)continue;
    const draft=readDraft(storage,revision,item.id),total=worksheet(item,draft),saved=Object.keys(draft).length>0;if(saved)changed++;
    const labour=total.labour.rate;
    row.querySelector('[data-labour-summary]').className=labour===null?'value-missing':'value-money';
    row.querySelector('[data-material-rate]').className=total.material_rate.low===null?'value-missing':'value-money';
    text(row.querySelector('[data-labour-summary]'),labour===null?(item.held?'On hold':'Split not supplied'):fmt(labour)+(total.basis.perUnit?' / '+total.basis.unit:' for whole work')+' · contractor input');
    text(row.querySelector('[data-material-rate]'),item.held?'On hold':total.material_rate.low===null?(total.basis.quantity===0?'Zero work quantity':'Unit rate unavailable'):range(total.material_rate.low,total.material_rate.high)+' / '+total.basis.unit);
    text(row.querySelector('[data-material-total]'),'Subtotal '+range(total.material.low,total.material.high));
    text(row.querySelector('[data-material-coverage]'),total.material.priced_rows+'/'+item.rows.length+' lines priced · partial');
    text(row.querySelector('[data-work-draft]'),saved?'Saved contractor worksheet':'' );
   }
   text(document.querySelector('#contractor-draft-note'),changed?changed+' works show contractor inputs saved on this browser. Published source values remain separate.':'Published planning values shown. Open a work to enter contractor quantities and prices.');
  };
  updateIndex();window.addEventListener('pageshow',updateIndex);window.addEventListener('storage',event=>{if(event.key===null||event.key.startsWith('paila-contractor:'+revision+':'))updateIndex();});return;
 }
 const item=data.items.find(w=>w.id===detail.dataset.workId);if(!item)throw Error('Work unavailable');
 let draft=item.held?{}:readDraft(storage,revision,item.id),saved=Object.keys(draft).length>0,saveFailed=false;
 const rows=new Map([...detail.querySelectorAll('[data-order-row]')].map(row=>[row.dataset.orderRow,row]));
 for(const [id,row] of rows){const values=draft.rows?.[id]??{};for(const control of row.querySelectorAll('[data-material-field]')){const key=control.dataset.materialField;if(Object.hasOwn(values,key))control.value=values[key];control.disabled=item.held;}}
 for(const control of detail.querySelectorAll('[data-cost-field]')){control.value=draft[control.dataset.costField]??'';control.disabled=item.held;}
 document.querySelector('#export-contractor').disabled=false;document.querySelector('#reset-contractor').disabled=item.held;
 const update=()=>{
  const total=worksheet(item,draft);
  for(const row of item.rows){
   const tr=rows.get(row.id),values=draft.rows?.[row.id]??{},line=materialLine(row,values);
   text(tr.querySelector('[data-selection-print]'),values.selection??'Not selected');
   text(tr.querySelector('[data-material-amount]'),range(line.amount_low,line.amount_high));
   text(tr.querySelector('[data-material-error]'),line.invalid?'Use non-negative numbers, whole packs where required, and valid prices.':'');
   for(const control of tr.querySelectorAll('input'))control.setAttribute('aria-invalid',String(line.invalid));
   text(tr.querySelector('[data-price-state]'),line.contractor_price?'Contractor supplier-price input · confirm quote.':'Reference price used where available; confirm current quote.');
   if(Object.hasOwn(values,'quantity')){text(tr.querySelector('[data-quantity-state]'),'Contractor quantity input · measure and confirm');text(tr.querySelector('[data-quantity-basis]'),'Contractor quantity overrides the published planning quantity of '+(row.quantity??'unknown')+' '+row.unit+'. Published basis: '+row.quantity_basis);}
   else{text(tr.querySelector('[data-quantity-state]'),row.held?'On hold':row.quantity===null?'Measurement needed':row.quantity_classification==='planning_model'?'Planning model · confirm dimensions':'Source-based estimate · confirm take-off');text(tr.querySelector('[data-quantity-basis]'),row.quantity_basis);}
  }
  for(const key of ['labour','other']){text(detail.querySelector('[data-'+key+'-amount]'),total[key].amount===null?'Not supplied':fmt(total[key].amount));text(detail.querySelector('[data-cost-error="'+key+'"]'),total[key].invalid?'Use a non-negative number.':'');detail.querySelector('[data-cost-field="'+key+'"]').setAttribute('aria-invalid',String(total[key].invalid));}
  text(detail.querySelector('[data-detail-material-rate]'),item.held?'On hold':total.material_rate.low===null?'Unit rate unavailable':range(total.material_rate.low,total.material_rate.high));
  for(const selector of ['[data-detail-material-total]','[data-order-subtotal]'])text(detail.querySelector(selector),range(total.material.low,total.material.high));
  const coverage=total.material.priced_rows+' of '+item.rows.length+' lines priced; '+total.material.missing_rows+' incomplete. Partial material subtotal.';
  text(detail.querySelector('[data-detail-coverage]'),coverage);text(detail.querySelector('[data-order-coverage]'),coverage);
  text(detail.querySelector('[data-worksheet-total]'),total.total.low===null?'Pending inputs':range(total.total.low,total.total.high));
  text(document.querySelector('#contractor-status'),item.held?'ON HOLD — original values retained; no new quantities or prices allocated.':saveFailed?'Worksheet edits are active, but this browser cannot save them. Download the CSV to keep the current worksheet.':saved?'Contractor inputs saved on this browser for this source revision. Confirm take-off and specifications before ordering.':'Published planning values. Enter confirmed quantities and supplier quotes; no contractor split has been accepted.');
 };
 const save=()=>{
  saved=true;try{if(!storage)throw Error('Storage unavailable');storage.setItem(draftKey(revision,item.id),JSON.stringify({source_revision:revision,work_id:item.id,accepted:false,inputs:draft}));saveFailed=false;}catch{saveFailed=true;}
 };
 detail.addEventListener('input',event=>{
  if(item.held)return;
  const control=event.target;
  if(control.dataset.costField){draft[control.dataset.costField]=control.value;}
  else if(control.dataset.materialField){const id=control.closest('[data-order-row]')?.dataset.orderRow;if(!id)return;draft.rows??={};draft.rows[id]??={};draft.rows[id][control.dataset.materialField]=control.value;}
  else return;
  save();update();
 });
 document.querySelector('#reset-contractor').addEventListener('click',()=>{
  if(item.held)return;draft={};saved=false;saveFailed=false;
  try{storage?.removeItem(draftKey(revision,item.id));}catch{saveFailed=true;}
  for(const row of item.rows)for(const control of rows.get(row.id).querySelectorAll('[data-material-field]'))control.value=control.dataset.materialField==='quantity'?row.quantity??'':'';
  for(const control of detail.querySelectorAll('[data-cost-field]'))control.value='';update();
 });
 document.querySelector('#export-contractor').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob(['\uFEFF'+materialCSV(item,draft)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=item.id+'-contractor-materials.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 const refreshSharedDraft=()=>{
  if(!storage||saveFailed)return;
  draft=item.held?{}:readDraft(storage,revision,item.id);saved=Object.keys(draft).length>0;
  for(const row of item.rows){const values=draft.rows?.[row.id]??{};for(const control of rows.get(row.id).querySelectorAll('[data-material-field]')){const field=control.dataset.materialField;control.value=Object.hasOwn(values,field)?values[field]:field==='quantity'?row.quantity??'':'';}}
  for(const control of detail.querySelectorAll('[data-cost-field]'))control.value=draft[control.dataset.costField]??'';
  update();
 };
 window.addEventListener('pageshow',refreshSharedDraft);
 window.addEventListener('storage',event=>{if(event.key===null||event.key===draftKey(revision,item.id))refreshSharedDraft();});
 update();
}
init().catch(()=>{
 const status=document.querySelector('#contractor-status')??document.querySelector('#contractor-draft-note');
 text(status,'Published tables are available. Worksheet controls could not load; reload to try again.');
 for(const control of document.querySelectorAll('#contractor-work input,#contractor-work textarea,#export-contractor,#reset-contractor'))control.disabled=true;
});

import {worksheet,materialLine,readDraft,draftKey} from '../v10/contractor-model.js?source=SOURCE_REVISION';

const fmt=(value,digits=2)=>Number(value).toLocaleString('en-IN',{minimumFractionDigits:digits===2?2:0,maximumFractionDigits:digits});
const range=(low,high)=>low===null?'Not priced':low===high?fmt(low):fmt(low)+' – '+fmt(high);
const text=(node,value)=>{if(node&&node.textContent!==String(value))node.textContent=String(value);};
const revision=document.querySelector('meta[name="estimate-source-revision"]')?.content;
const search=document.querySelector('#inline-search'),area=document.querySelector('#inline-area'),jump=document.querySelector('#inline-jump');
const panels=[...document.querySelectorAll('[data-inline-work]')],byId=new Map(panels.map(panel=>[panel.dataset.inlineWork,panel]));
const filter=()=>{
 let works=0,materials=0;
 for(const panel of panels){panel.hidden=!(panel.dataset.search.includes(search.value.toLowerCase().trim())&&(!area.value||panel.dataset.area===area.value));if(!panel.hidden){works++;materials+=Number(panel.dataset.materialCount);}}
 for(const group of document.querySelectorAll('[data-inline-area]'))group.hidden=![...group.querySelectorAll('[data-inline-work]')].some(panel=>!panel.hidden);
 text(document.querySelector('#inline-count'),works+' works · '+materials+' material lines');
};
for(const control of [search,area,jump,document.querySelector('#inline-show-all'),document.querySelector('#inline-print')])control.disabled=false;
search.addEventListener('input',filter);area.addEventListener('change',filter);
document.querySelector('#inline-show-all').addEventListener('click',()=>{search.value='';area.value='';jump.value='';filter();});
jump.addEventListener('change',()=>{if(!jump.value)return;search.value='';area.value='';filter();location.hash='work-'+encodeURIComponent(jump.value);});
document.querySelector('#inline-print').addEventListener('click',()=>window.print());
let storage;try{storage=window.localStorage;}catch{}
async function init(){
 // Reuse v10's generated projection and calculation rules; no separate v11 data copy.
 const response=await fetch('../v10/contractor-data.json?source=SOURCE_REVISION',{cache:'no-cache'});if(!response.ok)throw Error('Material source unavailable');
 const data=await response.json();if(data.derivation?.revision!==revision)throw Error('Source revision changed');
 const drafts=new Map(),saveErrors=new Set(),works=new Map(data.items.map(work=>[work.id,work]));
 const rows=new Map([...document.querySelectorAll('[data-inline-material]')].map(row=>[row.dataset.inlineMaterial,row]));
 const status=document.querySelector('#inline-status');
 const updateStatus=()=>{
  const count=[...drafts.values()].filter(draft=>Object.keys(draft).length).length;
  text(status,saveErrors.size?'Edits are active, but this browser could not save some inputs. Keep this page open or use Print shown works to retain them.':count?count+' works show contractor inputs shared with v10 on this browser. Published source values remain separate.':'Published planning values. Use Edit quantities and rates to enter contractor inputs on this page.');
 };
 const refreshWork=(work,restoreControls=false)=>{
  const draft=drafts.get(work.id)??{},panel=byId.get(work.id),total=worksheet(work,draft);
  if(!panel)return;
  for(const row of work.rows){
   const tr=rows.get(row.id),input=draft.rows?.[row.id]??{},cost=materialLine(row,input),qty=tr.querySelector('[data-quantity]');
   text(qty,work.held?'On hold':cost.quantity===null?'Unknown':fmt(cost.quantity,3));qty.className=cost.quantity===null?'value-missing':'value-number';
   text(tr.querySelector('[data-price]'),work.held?'On hold':range(cost.rate_low,cost.rate_high));
   text(tr.querySelector('[data-amount]'),work.held?'On hold':range(cost.amount_low,cost.amount_high));
   text(tr.querySelector('[data-row-error]'),cost.invalid?'Use non-negative values and whole purchase units where required.':'');
   text(tr.querySelector('[data-selection]'),input.selection?'Selected: '+input.selection:'');
   text(tr.querySelector('[data-quantity-state]'),work.held?'On hold':Object.hasOwn(input,'quantity')?'Contractor quantity · confirm take-off':row.quantity===null?'Measure first':row.quantity_classification==='planning_model'?'Planning model · confirm dimensions':'Source-based estimate · confirm take-off');
   const origin=tr.querySelector('[data-price-origin]'),source=data.sources.find(source=>source.id===row.source_id);
   if(cost.contractor_price)text(origin,'Contractor input');
   else if(source){if(!origin.querySelector('a')){const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener';a.textContent='Reference price';origin.replaceChildren(a);}}
   else text(origin,'Supplier price needed');
   for(const control of tr.querySelectorAll('[data-material-field]')){
    const field=control.dataset.materialField;control.disabled=work.held;
    if(restoreControls)control.value=Object.hasOwn(input,field)?input[field]:field==='quantity'?row.quantity??'':'';
    if(control.type==='number')control.setAttribute('aria-invalid',String(cost.invalid));
   }
  }
  const labour=total.labour.rate;
  text(panel.querySelector('[data-labour]'),work.held?'On hold':labour===null?'Split not supplied':fmt(labour)+(total.basis.perUnit?' / '+total.basis.unit:' for whole work')+' · NPR contractor input');
  const labourInput=panel.querySelector('[data-cost-field="labour"]');labourInput.disabled=work.held;labourInput.setAttribute('aria-invalid',String(total.labour.invalid));if(restoreControls)labourInput.value=draft.labour??'';
  text(panel.querySelector('[data-material-rate]'),work.held?'On hold':total.material_rate.low===null?'Unavailable':range(total.material_rate.low,total.material_rate.high)+' / '+total.basis.unit);
  text(panel.querySelector('[data-subtotal]'),work.held?'On hold':range(total.material.low,total.material.high));
  text(panel.querySelector('[data-coverage]'),work.held?'On hold — original values retained; no new allocation.':total.material.priced_rows+' of '+work.rows.length+' lines priced; '+total.material.missing_rows+' incomplete. Partial subtotal; confirm take-off, specifications, taxes and delivery.');
  text(panel.querySelector('[data-work-draft]'),Object.keys(draft).length?'Contractor inputs · shared with v10':'');
  panel.querySelector('[data-reset-work]').disabled=work.held;
 };
 for(const work of data.items){drafts.set(work.id,work.held?{}:readDraft(storage,revision,work.id));refreshWork(work,true);}
 const toggle=document.querySelector('#inline-edit-toggle');toggle.disabled=false;
 toggle.addEventListener('click',()=>{
  const editing=toggle.getAttribute('aria-pressed')!=='true';toggle.setAttribute('aria-pressed',String(editing));text(toggle,editing?'Finish editing':'Edit quantities and rates');
  for(const control of document.querySelectorAll('[data-inline-edit]'))control.hidden=!editing;
 });
 document.addEventListener('input',event=>{
  const control=event.target,panel=control.closest('[data-inline-work]');if(!panel)return;
  const work=works.get(panel.dataset.inlineWork);if(!work||work.held)return;
  const draft=drafts.get(work.id)??{};
  if(control.dataset.materialField){const id=control.closest('[data-inline-material]')?.dataset.inlineMaterial;if(!id)return;draft.rows??={};draft.rows[id]??={};draft.rows[id][control.dataset.materialField]=control.value;}
  else if(control.dataset.costField)draft[control.dataset.costField]=control.value;
  else return;
  drafts.set(work.id,draft);
  try{if(!storage)throw Error('Storage unavailable');storage.setItem(draftKey(revision,work.id),JSON.stringify({source_revision:revision,work_id:work.id,accepted:false,inputs:draft}));saveErrors.delete(work.id);}catch{saveErrors.add(work.id);}
  refreshWork(work);updateStatus();
 });
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-reset-work]');if(!button)return;
  const work=works.get(button.closest('[data-inline-work]').dataset.inlineWork);if(!work||work.held)return;
  drafts.set(work.id,{});
  try{storage?.removeItem(draftKey(revision,work.id));saveErrors.delete(work.id);}catch{saveErrors.add(work.id);}
  refreshWork(work,true);updateStatus();
 });
 const reloadWork=id=>{const work=works.get(id);if(!work||work.held||saveErrors.has(id))return;drafts.set(id,readDraft(storage,revision,id));refreshWork(work,true);};
 window.addEventListener('pageshow',()=>{if(!storage)return;for(const work of data.items)reloadWork(work.id);updateStatus();});
 window.addEventListener('storage',event=>{for(const work of data.items)if(event.key===null||event.key===draftKey(revision,work.id))reloadWork(work.id);updateStatus();});
 updateStatus();
}
init().catch(()=>text(document.querySelector('#inline-status'),'All published tables remain visible. Contractor editing could not load; reload to try again.'));

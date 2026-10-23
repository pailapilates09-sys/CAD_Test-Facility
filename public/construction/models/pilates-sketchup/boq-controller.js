import {buildBoqBridge,filterBoqBridge,materialDisplay,materialSubtotal,range,BOQ_BASE} from './boq-model.js?source=BOQ_SOURCE_REVISION';
import {readDraft,draftKey} from '../../estimates/pilates-astra-2026-10-15/v10/contractor-model.js?source=BOQ_SOURCE_REVISION';

export function initBoqDisclosures(panel=document.getElementById('model-boq')){
 if(!panel||panel.dataset.disclosuresReady)return;
 const doc=panel.ownerDocument;
 function setOpen(id,open,restoreFocus=false){
  const button=panel.querySelector(`[data-boq-toggle="${id}"]`),row=doc.getElementById('boq-detail-row-'+id);if(!button||!row)return;
  row.hidden=!open;button.setAttribute('aria-expanded',String(open));button.querySelector('[aria-hidden]').textContent=open?' −':' +';if(restoreFocus)button.focus();
 }
 panel.addEventListener('click',event=>{const opener=event.target.closest('[data-boq-toggle]'),closer=event.target.closest('[data-boq-close]');if(opener)setOpen(opener.dataset.boqToggle,opener.getAttribute('aria-expanded')!=='true');else if(closer)setOpen(closer.dataset.boqClose,false,true)});
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){const group=event.target.closest('[data-boq-work-id]');if(group&&group.querySelector('[aria-expanded="true"]')){event.preventDefault();setOpen(group.dataset.boqWorkId,false,true)}}});
 panel.dataset.disclosuresReady='true';
}

export async function connectBoq({model,onSelect}){
 const panel=document.getElementById('model-boq'),$=id=>document.getElementById(id),revision=document.querySelector('meta[name="estimate-source-revision"]')?.content;
 const responses=await Promise.all([fetch(BOQ_BASE+'v10/contractor-data.json?source='+encodeURIComponent(revision),{cache:'no-cache'}),fetch('./model-boq-links.json')]);
 if(responses.some(r=>!r.ok))throw Error('BOQ source request failed');
 const [data,links]=await Promise.all(responses.map(r=>r.json()));if(!revision||data.derivation?.revision!==revision)throw Error('BOQ source revision mismatch');
 const bridge=buildBoqBridge(model,data,links),linkByWork=new Map(bridge.records.map(r=>[r.work.id,r.link])),workGroups=new Map([...panel.querySelectorAll('[data-boq-work-id]')].map(el=>[el.dataset.boqWorkId,el])),modelGroups=new Map([...panel.querySelectorAll('[data-boq-model-only-id]')].map(el=>[el.dataset.boqModelOnlyId,el]));
 let context={zoneId:'all',selectedId:null,visibleItemIds:new Set(model.items.map(i=>i.id)),sliceItems:model.items},storage;
 try{storage=window.localStorage}catch{}
 const rows=new Map([...panel.querySelectorAll('[data-boq-material-id]')].map(el=>[el.dataset.boqMaterialId,el]));
 function updateCosts(){
  let priced=0,draftWorks=0;
  for(const {work}of bridge.records){const draft=readDraft(storage,revision,work.id);if(Object.values(draft.rows??{}).some(row=>Object.keys(row).length))draftWorks++;
   for(const row of work.rows){const el=rows.get(row.id);if(!el)throw Error('Missing rendered BOQ material '+row.id);const display=materialDisplay(row,draft.rows?.[row.id]);
    for(const [selector,text]of [['[data-boq-quantity]',display.quantity],['[data-boq-quantity-note]',display.quantityNote],['[data-boq-rate]',display.rate],['[data-boq-price-note]',display.rateNote],['[data-boq-amount]',display.amount],['[data-boq-selection]',display.selection?'Selected: '+display.selection:'']])el.querySelector(selector).textContent=text;
    el.classList.toggle('boq-held',row.held);el.classList.toggle('boq-incomplete',display.cost.amount_low===null);if(display.cost.amount_low!==null)priced++;
   }
   const subtotal=materialSubtotal(work,draft),group=workGroups.get(work.id);
   group.querySelector('[data-boq-material-total]').textContent=work.held?'On hold':range(subtotal.low,subtotal.high)??'Incomplete';
   group.querySelector('[data-boq-work-coverage]').textContent=`${subtotal.priced_rows} / ${work.rows.length} lines priced. Planning quantities require a confirmed takeoff.`;
  }
  $('boq-data-status').textContent=`Original quoted values retain their unstated currency. ${draftWorks?'V11 contractor drafts from this browser':'Published v11 planning values'} appear inside each work’s panel. ${priced} / ${bridge.materialIds.size} material lines have quantity and price; references date from 16–18 October 2026. ${data.allowances.length} summary allowances remain unsplit. ${bridge.unlinkedModelItems.length} model types have no recorded BOQ work association.`;
 }
 function update(next=context){
  context=next;
  const result=filterBoqBridge(bridge,{...context,followSelection:$('boq-follow').checked,query:$('boq-search').value,mode:$('boq-mode').value});
  const shownWorks=new Set(result.records.map(r=>r.work.id)),shownModels=new Set(result.unlinkedModelItems.map(i=>i.id)),slice=new Map(context.sliceItems.map(i=>[i.id,i]));
  for(const [id,group]of workGroups){group.hidden=!shownWorks.has(id);group.classList.toggle('boq-related',!!context.selectedId&&linkByWork.get(id).model_ids.includes(context.selectedId))}
  for(const [id,group]of modelGroups)group.hidden=!shownModels.has(id);
  for(const button of panel.querySelectorAll('[data-boq-model-id]'))button.setAttribute('aria-pressed',String(button.dataset.boqModelId===context.selectedId));
  for(const el of panel.querySelectorAll('[data-boq-model-only-id] [data-boq-model-count]')){const item=slice.get(el.dataset.boqModelCount);el.textContent=item?`${item.quantity} model ${item.quantity===1?'placement':'placements'}${item.totalQuantity&&item.totalQuantity!==item.quantity?' of '+item.totalQuantity:''}`:'Outside selected area · click to view'}
  $('boq-count').textContent=`${result.records.length} / ${data.items.length} BOQ works${result.unlinkedModelItems.length?' · '+result.unlinkedModelItems.length+' model types without a BOQ work link':''} · open a work for scope and materials`;
  $('boq-no-results').hidden=result.records.length+result.unlinkedModelItems.length>0;
  document.documentElement.dataset.boqVisibleWorks=String(result.records.length);
 }
 panel.addEventListener('click',event=>{const button=event.target.closest('[data-boq-model-id]');if(button)onSelect(button.dataset.boqModelId,button.dataset.boqZoneId)});
 for(const id of ['boq-search','boq-mode','boq-follow']){$(id).disabled=false;$(id).addEventListener(id==='boq-search'?'input':'change',()=>update())}
 window.addEventListener('pageshow',()=>{updateCosts();update()});
 window.addEventListener('storage',event=>{if(event.key===null||bridge.records.some(r=>event.key===draftKey(revision,r.work.id))){updateCosts();update()}});
 updateCosts();update();document.documentElement.dataset.boqReady='true';return {update};
}

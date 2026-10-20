import {compareBudget,formatMinor,readScenario,scenarioKey} from './savings-model.js?v=V13_REVISION';

export function updateComparison(doc,data){
 const input=doc.getElementById('owner-active-cost'),result=compareBudget(data,input.value);
 input.setAttribute('aria-invalid',String(result.invalid));doc.getElementById('owner-cost-error').hidden=!result.invalid;
 const proposed={owner:result.owner_proposed_minor,professional:result.professional_proposed_minor,works:result.works_proposed_minor,project:result.pre_vat_proposed_minor};
 for(const cell of doc.querySelectorAll('[data-proposed]'))cell.textContent=formatMinor(proposed[cell.dataset.proposed]);
 for(const cell of doc.querySelectorAll('[data-saving]')){const amount=cell.dataset.saving==='professional'?'0':result.saving_minor;cell.textContent=formatMinor(amount);cell.classList.toggle('value-held',amount!==null&&BigInt(amount)<0n);cell.classList.toggle('value-missing',amount===null);}
 const status=doc.getElementById('savings-result');
 status.textContent=result.invalid?'The alternative cost is invalid. No saving has been calculated.':result.saving_minor===null?'A complete alternative cost is needed to calculate the saving. None is recorded in the published evidence.':BigInt(result.saving_minor)<0n?'Scenario overrun before VAT: NPR '+formatMinor(-BigInt(result.saving_minor))+'. This is a browser input comparison, not a verified quote.':BigInt(result.saving_minor)===0n?'Scenario breaks even before VAT. This is a browser input comparison, not a verified quote.':'Scenario saving before VAT: NPR '+formatMinor(result.saving_minor)+'. This depends on the complete cost entered and matching the original scope; it is not a verified saving.';
 return result;
}

export async function startSavings(doc=globalThis.document,fetcher=globalThis.fetch,win=globalThis.window){
 const status=doc.getElementById('savings-draft-status');let data;
 try{const response=await fetcher('./budget-view.json?v=V13_REVISION');if(!response.ok)throw Error('Budget data unavailable');data=await response.json();if(data.derivation?.source_revision!==doc.querySelector('meta[name="estimate-source-revision"]')?.content||data.derivation?.view_revision!=='V13_REVISION')throw Error('Budget source revision differs');}
 catch{status.textContent='Comparison unavailable: the budget data could not be loaded consistently. The original tables remain available. Reload to try again.';return null;}
 const input=doc.getElementById('owner-active-cost'),clear=doc.getElementById('savings-clear'),print=doc.getElementById('savings-print');
 let storage;try{storage=win.localStorage;}catch{storage=null;}
 const restore=()=>{input.value=readScenario(storage,data);updateComparison(doc,data);};
 restore();input.disabled=false;clear.disabled=false;print.disabled=false;
 const save=()=>{
  updateComparison(doc,data);
  try{if(!storage)throw Error('Storage unavailable');if(!input.value.trim())storage.removeItem(scenarioKey(data));else storage.setItem(scenarioKey(data),JSON.stringify({source_revision:data.derivation.source_revision,responsibility_revision:data.derivation.responsibility_revision,owner_active_cost:input.value}));status.textContent='Comparison input saved on this browser only; published rates and v10/v11 worksheets are unchanged.';}
  catch{status.textContent='Comparison works in this tab. Browser storage is unavailable, so this input will not persist.';}
 };
 input.addEventListener('input',save);clear.addEventListener('click',()=>{input.value='';save();input.focus();});print.addEventListener('click',()=>win.print());
 doc.getElementById('savings-form').addEventListener('submit',event=>event.preventDefault());
 win.addEventListener('storage',event=>{if(event.key===null||event.key===scenarioKey(data))restore();});win.addEventListener('pageshow',event=>{if(event.persisted)restore();});
 return data;
}
if(typeof document!=='undefined')startSavings();

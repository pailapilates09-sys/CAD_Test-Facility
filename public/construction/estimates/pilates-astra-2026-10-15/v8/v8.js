import {calculateRow,subtotal,sheetsFromCutArea,quantityRound} from './calculations.js?revision=quantity-2';
import {deriveQuantities} from './quantity-models.js';
const fmt=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const range=(a,b)=>a===null?'Not priced':a===b?fmt(a):`${fmt(a)} – ${fmt(b)}`;
const search=document.querySelector('#work-search'),area=document.querySelector('#area-filter');
if(search&&area){
 const filter=()=>{let count=0;for(const row of document.querySelectorAll('[data-work-row]')){row.hidden=!(row.dataset.search.includes(search.value.toLowerCase().trim())&&(!area.value||row.dataset.area===area.value));if(!row.hidden)count++;}for(const section of document.querySelectorAll('.area-group'))section.hidden=![...section.querySelectorAll('[data-work-row]')].some(r=>!r.hidden);document.querySelector('#filter-status').textContent=`${count} works shown`;};
 search.addEventListener('input',filter);area.addEventListener('change',filter);
}
const detail=document.querySelector('#work-detail');
if(detail){
 try{
  const response=await fetch('./material-takeoff.json?revision=quantity-2');if(!response.ok)throw Error('Material register unavailable');
  const data=await response.json(),item=data.items.find(x=>x.id===detail.dataset.workId);
  if(!item)throw Error('Work not found');
  let rows=structuredClone(item.rows),drafts={},modelOverrides={},extra=0,dirty=false;
  const table=document.querySelector('#material-table tbody'),status=document.querySelector('#draft-status');
  const update=()=>{
   for(const row of rows){const tr=[...table.rows].find(t=>t.dataset.materialId===row.id),calc=calculateRow(row,drafts[row.id]);tr.querySelector('[data-amount]').textContent=range(calc.amount_low,calc.amount_high);tr.querySelector('[data-row-error]').textContent=calc.invalid?'Use whole purchase units and a high rate ≥ low rate.':'';}
   const sum=subtotal(rows,drafts);document.querySelector('#material-subtotal').textContent=range(sum.low,sum.high);document.querySelector('#subtotal-coverage').textContent=`${sum.priced_rows} of ${rows.length} rows priced; ${sum.missing_rows} incomplete. Excludes labour, delivery and unconfirmed taxes.`;
   status.textContent=item.held?'Held — no allocation.':dirty?'Temporary draft inputs · download to keep; original quote unchanged.':'Published planning inputs; no accepted take-off.';
  };
  table.addEventListener('input',e=>{const tr=e.target.closest('[data-material-id]');if(!tr||!e.target.dataset.field||item.held)return;const id=tr.dataset.materialId;drafts[id]??={};drafts[id][e.target.dataset.field]=e.target.value;if(e.target.dataset.field==='quantity'){drafts[id].quantity_basis='User-entered purchase quantity; overrides the published planning input.';const basis=tr.querySelector('[data-quantity-basis]'),state=tr.querySelector('[data-quantity-state]');if(basis)basis.textContent=drafts[id].quantity_basis;if(state)state.textContent='User quantity draft';}dirty=true;update();});
  table.addEventListener('click',e=>{if(!e.target.matches('[data-use-cut]')||item.held)return;const tr=e.target.closest('[data-material-id]');const q=sheetsFromCutArea(tr.querySelector('[data-cut-area]').value,tr.querySelector('[data-cut-waste]').value);if(q===null)return;tr.querySelector('[data-field=quantity]').value=q;drafts[tr.dataset.materialId]??={};drafts[tr.dataset.materialId].quantity=q;drafts[tr.dataset.materialId].cut_area_m2=tr.querySelector('[data-cut-area]').value;drafts[tr.dataset.materialId].cut_allowance_percent=tr.querySelector('[data-cut-waste]').value;drafts[tr.dataset.materialId].quantity_basis='User cut area '+tr.querySelector('[data-cut-area]').value+' m² × (1 + '+tr.querySelector('[data-cut-waste]').value+'% allowance) ÷ 2.97289728 m²/sheet, rounded up.';tr.querySelector('[data-quantity-basis]').textContent=drafts[tr.dataset.materialId].quantity_basis;tr.querySelector('[data-quantity-state]').textContent='User cut-area draft';dirty=true;update();});
  document.querySelector('#reset-draft')?.addEventListener('click',()=>{
   for(const row of rows){const tr=[...table.rows].find(t=>t.dataset.materialId===row.id),original=item.rows.find(r=>r.id===row.id);if(!original){tr.remove();continue;}for(const field of ['quantity','rate_low','rate_high'])tr.querySelector(`[data-field=${field}]`).value=original[field]??'';const cut=tr.querySelector('[data-cut-area]');if(cut){cut.value='';tr.querySelector('[data-cut-waste]').value=10;}}
   rows=structuredClone(item.rows);drafts={};modelOverrides={};dirty=false;
   for(const input of document.querySelectorAll('[data-model-key]'))input.value=item.quantity_model.parameters[input.dataset.modelKey].value??'';
   const summary=document.querySelector('#model-summary');if(summary){summary.replaceChildren();for(const text of item.quantity_model_result.valid?item.quantity_model_result.summary:item.quantity_model_result.errors){const p=document.createElement('p');p.textContent=text;summary.append(p);}}
   for(const row of rows){const tr=[...table.rows].find(t=>t.dataset.materialId===row.id);tr.querySelector('[data-quantity-basis]').textContent=row.quantity_basis;tr.querySelector('[data-quantity-state]').textContent=row.quantity===null?'Take-off needed':row.quantity_rule==='planning_model'?'Planning model · assumptions':row.quantity_rule==='count'?'Provisional source count':'Source-based estimate';}
   const modelStatus=document.querySelector('#model-status');if(modelStatus)modelStatus.textContent=item.quantity_model_result.valid?'Reference scenario restored.':'Add the missing input before this quantity can be calculated.';
   update();
  });
  document.querySelector('#quantity-model-form')?.addEventListener('submit',e=>{
   e.preventDefault();if(item.held||!item.quantity_model)return;
   const values=Object.fromEntries([...e.target.querySelectorAll('[data-model-key]')].map(input=>[input.dataset.modelKey,input.value]));
   const result=deriveQuantities(item.quantity_model,values),modelStatus=document.querySelector('#model-status');
   if(!result.valid){modelStatus.textContent=result.errors.join(' ');return;}
   modelOverrides=values;
   for(const row of rows){const estimate=result.quantities[row.material_id];if(!estimate)continue;
    const quantity=quantityRound(estimate.quantity,row.whole_units);
    const tr=[...table.rows].find(t=>t.dataset.materialId===row.id);drafts[row.id]??={};drafts[row.id].quantity=quantity;drafts[row.id].quantity_basis=estimate.basis;
    tr.querySelector('[data-field=quantity]').value=quantity;tr.querySelector('[data-quantity-basis]').textContent=estimate.basis;tr.querySelector('[data-quantity-state]').textContent='Planning model · assumptions';
   }
   const summary=document.querySelector('#model-summary');summary.replaceChildren();for(const text of result.summary){const p=document.createElement('p');p.textContent=text;summary.append(p);}
   modelStatus.textContent='Quantities recalculated from these assumptions; rate edits retained.';dirty=true;update();
  });
  document.querySelector('#print-work')?.addEventListener('click',()=>window.print());
  document.querySelector('#download-draft')?.addEventListener('click',()=>{
   const draft={schema_version:'material-item-draft-1.1.0',version:'v8',item_id:item.id,title:item.title,exported_at:new Date().toISOString(),accepted:false,original:item.original,original_summary:data.original_summary,source_snapshot:data.researched_date,sources:data.sources,quantity_model:item.quantity_model,model_overrides:modelOverrides,scope:'Temporary NPR material planning inputs; incomplete rows are unknown; authored dimensions and coefficients are assumptions, not surveyed data; no quote replacement or tax inference.',rows:rows.map(row=>({...row,published_planning_quantity:row.quantity,source_rate_low:row.rate_low,source_rate_high:row.rate_high,user_overrides:drafts[row.id]??null,effective:calculateRow(row,drafts[row.id])})),subtotal:subtotal(rows,drafts)};
   const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=item.id+'-v8-material-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelector('#add-material')?.addEventListener('submit',e=>{
   e.preventDefault();const fields=new FormData(e.target),name=String(fields.get('name')).trim(),unit=String(fields.get('unit')).trim(),note=String(fields.get('source')).trim();if(!name||!unit||!note||item.held)return;
   const row={id:item.id+'-draft-'+(++extra),material_id:null,name,unit,note,currency:'NPR',quantity:null,rate_low:null,rate_high:null,held:false,whole_units:false,source_id:null,quantity_sources:[],quantity_basis:'User-added draft material; measure and confirm purchase unit.',vat_status:'not_stated'};
   rows.push(row);const tr=document.createElement('tr');tr.dataset.materialId=row.id;const th=document.createElement('th');th.scope='row';th.textContent=name;const small=document.createElement('small');small.textContent='User draft · '+note;th.append(small);tr.append(th);
   for(const field of ['quantity','rate_low','rate_high']){const td=document.createElement('td'),input=document.createElement('input');input.type='number';input.min='0';input.step='any';input.dataset.field=field;input.placeholder='Unknown';input.setAttribute('aria-label',field.replaceAll('_',' ')+' for '+name);td.append(input);if(field==='quantity'){const u=document.createElement('small');u.textContent=unit;td.append(u);}tr.append(td);}
   const amount=document.createElement('td'),out=document.createElement('output'),err=document.createElement('small');out.dataset.amount='';out.textContent='Not priced';err.dataset.rowError='';amount.append(out,err);tr.append(amount);const basis=document.createElement('td');basis.textContent='User-entered source: '+note;tr.append(basis);table.append(tr);e.target.reset();dirty=true;update();
  });
  update();
 }catch(error){document.querySelector('#draft-status').textContent='Published table is available. Draft controls could not load; reload to retry.';for(const control of detail.querySelectorAll('input,button'))control.disabled=true;}
}

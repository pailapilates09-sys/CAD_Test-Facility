import {M2_PER_FT2,quantityFor,subtotal} from '../public/construction/estimates/pilates-astra-2026-10-15/v8/calculations.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=2)=>n===null?'—':Number(n).toLocaleString('en-IN',{maximumFractionDigits:d,minimumFractionDigits:d===2?2:0});
const range=(a,b)=>a===null?'Not priced':a===b?fmt(a):`${fmt(a)} – ${fmt(b)}`;
const r=(id,rule='manual',note='')=>({material_id:id,rule,note});
const cabinets=[r('ply18'),r('ply12'),r('laminate'),r('glue'),r('hinge'),r('hardware'),r('edges'),r('screws'),r('finish')];
const marble=[r('marble','surface10'),r('stoneglue'),r('stonefinish')];
const panel=[r('pvc','surface10'),r('frame'),r('trim'),r('panelglue'),r('screws')];
const strip=[r('strip','length'),r('driver'),r('channel','length'),r('cable'),r('electrical')];
const ac=mat=>[r(mat,'count'),r('copper'),r('drain'),r('acmount','count'),r('cable'),r('electrical')];
const lights=mat=>[r(mat,'count'),r('bulbs'),r('cable'),r('electrical'),r('screws')];
const paint=withPaint=>[r('putty','putty'),...(withPaint?[r('primer'),r('paint','paint')]:[]),r('abrasives')];
const ceiling=[r('gypsum','surface10'),r('metalframe'),r('joint'),r('screws'),r('cable'),r('electrical')];
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
export function buildV8({original,components,images,catalog}) {
 const materials=new Map(catalog.materials.map(m=>[m.id,m]));
 const items=original.line_items.map(item=>{
  const c=components.items.find(x=>x.item_id===item.id),image=images.items.find(x=>x.item_id===item.id);
  const asset=images.assets.find(x=>x.id===image.image_id),held=c.status==='on_hold_original_retained';
  if(!recipes[item.id])throw Error('Missing assembly '+item.id);
  const rows=recipes[item.id].map((recipe,i)=>{
   const mat=materials.get(recipe.material_id);if(!mat)throw Error('Unknown material');
   const conversion=mat.rate_conversion;
   const low=conversion?conversion.low_ft2/M2_PER_FT2:mat.rate_low??null;
   const high=conversion?conversion.high_ft2/M2_PER_FT2:mat.rate_high??null;
   return {id:item.id+'-m'+String(i+1).padStart(2,'0'),material_id:mat.id,name:mat.name,unit:mat.unit,whole_units:mat.whole_units??false,cut_sheet:mat.cut_sheet??false,
    quantity:held?null:quantityFor(recipe.rule,item),quantity_rule:held?'held':recipe.rule,quantity_basis:held?'User hold; no new quantity or material price allocated.':basis[recipe.rule],
    quantity_sources:recipe.rule==='putty'?['S07']:recipe.rule==='paint'?['S09']:[],
    rate_low:held?null:low,rate_high:held?null:high,currency:'NPR',vat_status:mat.vat_status??'not_stated',
    source_id:held?null:mat.source_id??null,note:held?'Material specification deferred while this item remains on hold.':mat.note+(recipe.note?' '+recipe.note:''),held};
  });
  return {id:item.id,title:c.title,section_id:item.section_id,section_name:item.section_name,description:item.description,source_page:item.source.page,
   original:{quantity:item.quantity,unit:item.unit_raw,unit_code:item.unit_code,rate:item.rate,amount:item.amount,currency:original.currency},
   si:c.si,held,rows,subtotal:subtotal(rows),complete_material_takeoff:false,
   image:{path:'../v6/'+asset.local_path.replace(/^\.\//,''),alt:image.alt,scope_note:image.scope_note,source_page:asset.source_page,author:asset.author,license:asset.license,license_url:asset.license_url},
   gaps:[...(held?['User hold; original rate and amount retained.']:[]),...c.gaps,'Materials shown are a specification-led checklist, not an approved complete procurement schedule. Quantities, grades, delivery and taxes require confirmation.']};
 });
 const sources=catalog.sources.map(s=>({...s,url:s.id==='S19'?'../v7/component-rates.json':s.url}));
 return {schema_version:'material-takeoff-1.0.0',version:'v8',based_on:'v7',researched_date:catalog.researched_date,currency:'NPR',estimate_currency:original.currency,
  original_summary:original.summary,policy:catalog.price_policy,
  quantity_policy:'Default quantities are provisional planning take-offs derived from source measurements. Cabinet cut lists, curtain geometry, frame layouts and service routes remain unknown. Six held items are locked. Unknown is null, never zero. No complete project material total is inferred.',
  coverage:{work_items:items.length,areas:new Set(items.map(x=>x.section_id)).size,held_items:items.filter(x=>x.held).length,material_rows:items.reduce((s,x)=>s+x.rows.length,0),priced_rows:items.reduce((s,x)=>s+x.subtotal.priced_rows,0),items_with_priced_rows:items.filter(x=>x.subtotal.priced_rows>0).length,complete_takeoffs:0},sources,items,
  allowances:components.allowances};
}
function originalLink(item){return `../source/pilates-estimate-astra.pdf#page=${item.source_page}`;}
export function renderIndex(data){
 const areas=[...new Set(data.items.map(x=>x.section_id))];
 return `<div class="page-title"><div><p class="eyebrow">VERSION 8 / MATERIAL TAKE-OFF</p><h1>Inside each work item</h1><p>Choose a work to open its materials, quantities, Kathmandu supply references and amounts.</p></div><a class="plain-button" href="../v7/">Full estimate + labour →</a></div>
 <div class="v8-metrics"><div><strong>${data.coverage.work_items}</strong><span>work detail pages</span></div><div><strong>${data.coverage.material_rows}</strong><span>material checklist rows</span></div><div><strong>${data.coverage.items_with_priced_rows}</strong><span>works with partial priced quantities</span></div><div><strong>6 + 2</strong><span>held works + unsplit allowances</span></div></div>
 <section class="block notes"><h2>Planning quantities, visible gaps</h2><p>Public prices reviewed 18 October 2026; dated references are marked. Default material quantities use the estimate measurement and stated assumptions. Missing dimensions remain “Take-off needed”. Open a work to enter quantities, try rates and download that draft. Source estimate values remain fixed; material subtotals exclude unpriced rows, labour, delivery and unconfirmed taxes.</p><p><strong>Labour:</strong> v7 contains public references, not an accepted contractor split. <strong>Earlier versions:</strong> all tables, charts and images remain available from <a href="../milestone.html">Versions + milestone</a>.</p><div class="export-tools"><a href="material-takeoff.json" download>All materials JSON ↓</a><a href="material-catalog.json" download>Price + source register ↓</a></div></section>
 <section class="block notes v8-tools"><label for="work-search">Find a work or material <input id="work-search" type="search" placeholder="Try plywood, lighting, studio…"></label><label for="area-filter">Area <select id="area-filter"><option value="">All areas</option>${areas.map(id=>`<option value="${id}">${esc(data.items.find(x=>x.section_id===id).section_name)}</option>`).join('')}</select></label><p id="filter-status" role="status">51 works shown</p></section>
 ${areas.map(id=>{const group=data.items.filter(x=>x.section_id===id);return `<section class="block area-group" data-area="${id}"><div class="block-header"><h2>${esc(group[0].section_name)}</h2></div><div class="table-scroll"><table class="v8-index-table"><caption class="sr-only">${esc(group[0].section_name)} material detail links</caption><thead><tr><th>Work</th><th>Source quantity → SI</th><th>Original amount¹</th><th>Material rows</th><th>Material subtotal · NPR²</th></tr></thead><tbody>${group.map(item=>`<tr data-work-row data-area="${id}" data-search="${esc((item.title+' '+item.section_name+' '+item.rows.map(r=>r.name).join(' ')).toLowerCase())}"><th scope="row"><a class="work-link" href="${item.id}.html">${esc(item.title)} <span aria-hidden="true">→</span></a><small>${item.id}${item.held?' · ON HOLD':''}</small></th><td>${esc(item.original.quantity)} ${esc(item.original.unit??'unit unspecified')}<small>${fmt(item.si.quantity,4)} ${esc(item.si.unit_label)}</small></td><td>${fmt(item.original.amount)}</td><td>${item.rows.length}<small>${item.held?'Held':item.subtotal.priced_rows+' priced · '+item.subtotal.missing_rows+' incomplete'}</small></td><td>${item.held?'Held — original retained':range(item.subtotal.low,item.subtotal.high)}<small>${item.held?'No new allocation':'Partial only; open to inspect'}</small></td></tr>`).join('')}</tbody></table></div></section>`;}).join('')}
 <section class="block notes"><h2>Allowances remain unsplit</h2><p>Laminate flooring: original 5,50,000.00. Electrical works: original 2,80,057.43. Neither has a detailed quantity/material schedule. No materials are invented or added to these allowances. Electrical fittings in individual works must be checked against this allowance for overlap.</p><p>¹ Original currency unspecified. ² NPR supply planning subtotals are incomplete and must not be compared as a complete price against the installed quote. No project-wide material total is asserted.</p></section>${renderSources(data.sources)}`;
}
export function renderSources(sources){return `<section class="block notes" id="sources"><h2>Material evidence register</h2><p>Listed prices are evidence snapshots, not live stock feeds. VAT is unknown except the retained district-board reference, which excludes VAT.</p><ol class="v8-sources">${sources.map(s=>`<li id="source-${s.id}"><strong>${s.id} · <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)} ↗</a></strong><small>${esc(s.location)} · ${esc(s.kind.replaceAll('_',' '))} · retrieved ${esc(s.checked)}${s.refresh_attempt?' · refresh attempt '+s.refresh_attempt:''}</small><p>${esc(s.finding)}</p></li>`).join('')}</ol></section>`;}
export function renderWork(item,data){
 const pos=data.items.findIndex(x=>x.id===item.id),prev=data.items[pos-1],next=data.items[pos+1];
 const sourceIDs=new Set(item.rows.flatMap(r=>[r.source_id,...r.quantity_sources]).filter(Boolean));
 return `<div id="work-detail" data-work-id="${item.id}"><p class="v8-breadcrumb"><a href="./">V8 materials</a> / ${esc(item.section_name)} / ${esc(item.id)}</p><div class="page-title"><div><p class="eyebrow">${esc(item.section_name)} / MATERIALS</p><h1>${esc(item.title)}</h1><p>Required quantities, supply prices and partial material amounts.</p></div><a class="plain-button" href="./">← All works</a></div>
 <div class="v8-work-intro"><section class="block notes"><h2>Original work retained</h2><p>${esc(item.description)}</p><dl class="v8-facts"><div><dt>Source measurement</dt><dd>${esc(item.original.quantity)} ${esc(item.original.unit??'unit unspecified')}</dd></div><div><dt>SI work measurement</dt><dd>${fmt(item.si.quantity,4)} ${esc(item.si.unit_label)}</dd></div><div><dt>Original rate¹</dt><dd>${fmt(item.original.rate)} / ${esc(item.original.unit??'unspecified unit')}</dd></div><div><dt>Original amount¹</dt><dd>${fmt(item.original.amount)}</dd></div></dl><p><a href="${originalLink(item)}" target="_blank" rel="noopener">Source PDF · page ${item.source_page} ↗</a> · <a href="../v7/#component-title">Full v7 estimate + labour references →</a></p><small>¹ Original currency remains unspecified. No material value replaces this quote.</small></section><figure class="block v8-reference"><img src="${esc(item.image.path)}" alt="${esc(item.image.alt)}" loading="lazy"><figcaption>Reference example · not a studio photograph.<details><summary>Image source and scope</summary><p>${esc(item.image.scope_note)}</p><a href="${esc(item.image.source_page)}">${esc(item.image.author)}</a> · <a href="${esc(item.image.license_url)}">${esc(item.image.license)}</a><p>Existing resized WebP; original source image register retained in v6.</p></details></figcaption></figure></div>
 ${item.held?'<aside class="block notes v8-held"><h2>On hold · original values retained</h2><p>No new material quantities, prices or amounts are assigned to this work. The checklist below is deferred until the hold is lifted.</p></aside>':'<aside class="block notes"><strong>Provisional material take-off</strong><p>Rows marked “Take-off needed” require dimensions or a specification. Enter purchase quantities and NPR rates below to test a draft. Blank means unknown. Default amounts cover only the priced rows. Draft entries stay in this tab and can be downloaded; they do not alter the original estimate.</p></aside>'}
 <section class="block"><div class="block-header"><div><h2>Materials and amounts</h2><p>Purchase quantities × NPR per purchase unit. Every assumption stays beside its row.</p></div></div><div class="table-scroll"><table id="material-table" class="v8-material-table"><caption class="sr-only">${esc(item.title)} material quantities and costs</caption><thead><tr><th>Material / specification</th><th>Quantity required</th><th>Rate low · NPR</th><th>Rate high · NPR</th><th>Amount · NPR</th><th>Quantity basis / evidence</th></tr></thead><tbody>${item.rows.map(row=>renderRow(row,data)).join('')}</tbody></table></div><div class="v8-subtotal"><strong>Priced material subtotal · partial</strong><output id="material-subtotal">${range(item.subtotal.low,item.subtotal.high)}</output><p id="subtotal-coverage">${item.subtotal.priced_rows} of ${item.rows.length} rows priced; ${item.subtotal.missing_rows} incomplete. Excludes labour, delivery and unconfirmed taxes.</p><p id="draft-status" role="status">${item.held?'Held — no allocation.':'Published planning inputs; no accepted take-off.'}</p></div></section>
 ${item.held?'':`<div class="export-tools v8-actions"><button class="plain-button" id="download-draft">Download item draft JSON ↓</button><button class="plain-button" id="reset-draft">Reset planning inputs</button><button class="plain-button" id="print-work">Print work table</button></div><section class="block notes"><h2>Add a missing material</h2><p>Append a draft row for a supplier-specific component. Its unit and rate source remain explicit in the download.</p><form id="add-material" class="v8-tools"><label>Material <input name="name" required maxlength="100"></label><label>Purchase unit <input name="unit" required maxlength="30" placeholder="kg, m, each…"></label><label>Source / quote note <input name="source" required maxlength="200"></label><button class="plain-button" type="submit">Add draft row</button></form></section>`}
 <section class="block notes"><h2>Inputs still needed</h2><ul>${item.gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul><p>No approved drawings or SKP geometry were used. Two-sided partitions need face/layer confirmation; cabinetry needs all board cut areas; curtains need cloth width, drops and fullness; services need measured routes. A zero source glass-door quantity is retained as zero and does not mean the scope was removed.</p></section>
 ${renderSources(data.sources.filter(s=>sourceIDs.has(s.id)))}<nav class="v8-pager" aria-label="Work items">${prev?`<a href="${prev.id}.html">← ${esc(prev.title)}</a>`:'<span></span>'}<a href="./">All works</a>${next?`<a href="${next.id}.html">${esc(next.title)} →</a>`:'<span></span>'}</nav></div>`;
}
export function renderRow(row,data){
 const source=data.sources.find(s=>s.id===row.source_id),disabled=row.held?' disabled':'';
 const input=(field,value,label)=>`<input type="number" min="0" step="${field==='quantity'&&row.whole_units?'1':'any'}" data-field="${field}" value="${value??''}" aria-label="${esc(label+' for '+row.name)}" placeholder="Unknown"${disabled}>`;
 const qty=row.quantity===null?'Take-off needed':row.quantity_rule==='count'?'Provisional source count':row.quantity_rule==='surface'?'Net source area':'Calculated planning quantity';
 const amounts=subtotal([row]);
 return `<tr data-material-id="${row.id}"><th scope="row">${esc(row.name)}<small>${esc(row.note)}</small><span class="v8-row-state">${row.held?'Held':qty}</span></th><td>${input('quantity',row.quantity,'Quantity')}<small>${esc(row.unit)}</small>${row.cut_sheet&&!row.held?`<details><summary>From cut area</summary><label>Net cut area, m² <input type="number" min="0" step="any" data-cut-area aria-label="Cut area for ${esc(row.name)}"></label><label>Cut allowance, % <input type="number" min="0" step="any" value="10" data-cut-waste aria-label="Cut allowance for ${esc(row.name)}"></label><button type="button" data-use-cut>Use sheet count</button><small>ceil(cut area × (1 + allowance/100) ÷ 2.97289728 m²). Does not solve nesting or grain direction.</small></details>`:''}</td><td>${input('rate_low',row.rate_low,'Low NPR rate')}</td><td>${input('rate_high',row.rate_high,'High NPR rate')}</td><td><output data-amount>${range(amounts.low,amounts.high)}</output><small data-row-error></small></td><td><small>${esc(row.quantity_basis)}</small>${source?`<a href="#source-${source.id}">${source.id} · ${esc(source.publisher)}</a><small>Source price: ${range(row.rate_low,row.rate_high)} / ${esc(row.unit)}</small>`:'<small>Supplier rate required</small>'}${row.quantity_sources.map(id=>`<a href="#source-${id}">${id} · coverage evidence</a>`).join('')}<small>VAT: ${esc(row.vat_status.replaceAll('_',' '))}</small></td></tr>`;
}
export function pageFromTemplate(template,content,title){return template.replace('<!-- V8_CONTENT -->',content).replace('<title>Pilates estimate v8 | Materials</title>',`<title>${esc(title)} | Pilates materials v8</title>`);}

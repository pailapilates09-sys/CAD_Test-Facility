import {esc} from './linked-estimate-views.mjs';

const fmt=(n,d=2)=>Number(n).toLocaleString('en-IN',{maximumFractionDigits:d,minimumFractionDigits:d===2?2:0});
const link=(url,label)=>`<a href="${esc(url)}">${esc(label)}</a>`;
const table=(title,heads,rows)=>`<section class="block register-section"><h2>${esc(title)}</h2><div class="table-scroll"><table class="linked-table"><caption>${esc(title)}</caption><thead><tr>${heads.map(head=>`<th scope="col">${esc(head)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></section>`;
const workLink=(work,prefix='../')=>link(prefix+'#work-'+work.id,work.title??work.id);

export function renderOriginal(r,d){
 const summary=d.original.summary;
 return `<p class="view-note">Currency is not stated in the quote. Source values are preserved; measured changes belong in the shared register. ${link('./source/pilates-estimate-astra.pdf','Original 8-page PDF')} · ${link('./v2/','Concise scope v2')} · ${link('./v3/','SI conversion v3')}</p>`+
 table('Original summary',['Before VAT','VAT · 13%','Total including VAT'],[`<tr><td class="value-money">${fmt(summary.subtotal)}</td><td class="value-money">${fmt(summary.vat_amount)}</td><td class="value-money">${fmt(summary.grand_total)}</td></tr>`])+
 r.areas.filter(area=>area.item_count).map(area=>table(area.name,['Quoted work / full source description','Source quantity / unit','Quoted rate','Quoted amount'],r.works.filter(work=>work.section_id===area.id).map(work=>`<tr id="work-${esc(work.id)}" data-source-work="${esc(work.id)}"><th scope="row"><strong>${esc(work.title)}</strong><small>${esc(work.id)}</small><p>${esc(work.description)}</p>${link('./source/pilates-estimate-astra.pdf#page='+work.source.page,'PDF page '+work.source.page)}</th><td class="value-number">${fmt(work.quantity,12)} ${esc(work.unit_raw??'unit unspecified')}</td><td class="value-money">${fmt(work.rate)}</td><td class="value-money">${fmt(work.amount)}</td></tr>`))).join('')+
 table('Original summary allowances',['Area','Quoted amount','Source coverage'],r.areas.filter(area=>!area.item_count).map(area=>`<tr><th scope="row">${esc(area.name)}</th><td class="value-money">${fmt(area.summary_amount)}</td><td>No item-level quantities or original labour/material split.</td></tr>`))+
 `<section class="block notes"><h2>Source qualifications and downloads</h2><ul>${d.original.issues.map(issue=>`<li>${esc(issue.message)}</li>`).join('')}</ul><p>${link('./data/estimate.json','Dated extraction JSON')} · ${link('./data/line-items.csv','Source CSV')} · ${link('./data/estimate.sqlite','Source SQLite')} · ${link('./data/full-text.txt','Full extracted text')} · ${link('./data/manifest.json','Source checksums')}</p><p>These dated evidence files are preserved. Current web views derive from ${link('./v9/','the shared register')}.</p></section>`;
}

export function deriveHierarchy(d,seed){
 const result=structuredClone(seed),works=new Map(d.original.line_items.map(work=>[work.id,work])),titles=new Map(d.research.items.map(work=>[work.item_id,work.title])),areas=new Map(d.original.sections.map(area=>[area.id,area]));
 for(const node of result.nodes){
  const work=works.get(node.id),area=areas.get(node.id);
  if(work){node.amount=work.amount;node.title=titles.get(node.id)??node.title}
  else if(area)node.amount=area.summary_amount;
  else if(node.id==='grand-total')node.amount=d.original.summary.grand_total;
  else if(node.id==='subtotal')node.amount=d.original.summary.subtotal;
  else if(node.id==='vat')node.amount=d.original.summary.vat_amount;
 }
 return result;
}

export function renderScope(r){
 return `<p class="view-note">This page owns the hierarchy and concise scope. Quantities and quoted rates are in ${link('../','Original / v0')}; metric conversion is in ${link('../v3/','v3')}.</p><p id="status" role="status">Loading the interactive hierarchy…</p><div id="content"><section class="block" aria-labelledby="chart-title"><div class="block-header"><div><h2 id="chart-title">Cost hierarchy</h2><p>Nodes are totals, areas and works. Edges mean “includes”. Values use Indian number grouping.</p></div><a class="plain-button" href="./hierarchy.json">Nodes + edges JSON</a></div><div class="tree-toolbar"><button id="expand-all" class="plain-button">Expand all areas</button><button id="collapse-all" class="plain-button">Collapse all areas</button></div><div id="chart" class="org-chart"><svg id="edges" aria-hidden="true"></svg><div id="chart-root" class="chart-root"></div><div id="chart-fiscal" class="chart-fiscal"></div><div id="chart-areas" class="chart-areas"></div></div></section><section class="block register-section"><h2>Concise scope by area</h2><div class="filters"><label>Area<select id="area"><option value="">All detailed areas</option></select></label><label>Find a work<input id="search" type="search" placeholder="Title or full scope"></label><label>Order<select id="sort"><option value="source">Source order</option><option value="desc">Amount: high to low</option><option value="asc">Amount: low to high</option></select></label></div><p id="count" role="status">${r.works.length} works</p><div id="items" class="area-tables">${r.areas.filter(area=>area.item_count).map(area=>table(area.name,['Concise work title','Full source scope'],r.works.filter(work=>work.section_id===area.id).map(work=>`<tr><th scope="row">${esc(work.title)}<small>${esc(work.id)}</small></th><td>${link('../#work-'+work.id,'Open complete description')}</td></tr>`))).join('')}</div></section><section class="block notes"><h2>Source access</h2><p>${link('../data/estimate.json','Preserved source extraction')} · ${link('./hierarchy.json','Current hierarchy')} · ${link('../v9/','Current shared register')}</p><ul id="issues"></ul></section></div><dialog id="detail" class="evidence-dialog" aria-labelledby="detail-title"><button id="close-detail" class="dialog-close" autofocus>Close ×</button><p id="detail-meta" class="eyebrow"></p><h2 id="detail-title"></h2><div id="detail-body"></div></dialog>`;
}

export function renderSI(r,d){
 const originals=new Map(r.works.map(work=>[work.id,work]));
 return `<p class="view-note">1 ft = 0.3048 m; 1 ft² = 0.09290304 m². Rates divide by the same factor, so the underlying amount is unchanged. Counts stay counts; missing units stay unknown. AC “MT” wording is not reinterpreted.</p>`+
 r.areas.filter(area=>area.item_count).map(area=>table(area.name,['Work / source scope','Source measurement','SI measurement','SI work rate'],d.si.line_items.filter(work=>work.section_id===area.id).map(work=>{const original=originals.get(work.id);return `<tr data-si-work="${esc(work.id)}"><th scope="row">${workLink(original)}<small>${esc(work.id)}</small></th><td>${fmt(original.quantity,12)} ${esc(original.unit_raw??'unit unspecified')}</td><td class="value-number">${fmt(work.quantity,12)} ${esc(work.unit_raw??'unit unspecified')}</td><td class="value-money">${fmt(work.rate)}${work.unit_raw?' / '+esc(work.unit_raw):' · unit unspecified'}</td></tr>`}))).join('')+
 `<p class="view-note">Quoted amounts and source qualifications remain in ${link('../','Original / v0')}. ${link('./estimate-si.json','Current SI JSON')} · ${link('./line-items-si.jsonl','Current SI JSONL')}. Displayed rates are rounded; exports retain the exact conversion fraction.</p>`;
}

export function renderMarket(r,d){
 const sources=new Map(d.research.sources.map(source=>[source.id,source])),works=new Map(r.works.map(work=>[work.id,work]));
 return `<p class="view-note">One row per public observation, with its linked works. Research dates are retained; v12 adds purchasing-route research without refreshing these quoted prices. Product, labour and installed-package references have different scopes.</p>`+
 table('Public price evidence',['Observation / scope','Published price and unit','Used by works','Source / qualification'],d.research.observations.map(observation=>{
  const source=sources.get(observation.source_id),ids=d.research.items.filter(work=>work.reference_ids.includes(observation.id)).map(work=>work.item_id),price=observation.low==null?'Not priced':observation.high==null?'From '+fmt(observation.low):observation.high===observation.low?fmt(observation.low):fmt(observation.low)+' – '+fmt(observation.high);
  return `<tr id="observation-${esc(observation.id)}" data-market-observation="${esc(observation.id)}"><th scope="row">${esc(observation.label??observation.title??observation.id)}<small>${esc(observation.id)} · ${esc(observation.basis??observation.qualifier??'scope varies')}</small></th><td class="value-money">${esc(observation.currency??'NPR')} ${price}<small>per ${esc(observation.unit_label??observation.unit??'unit unspecified')}</small></td><td>${ids.map(id=>workLink(works.get(id))).join('<br>')||'Unmapped observation'}</td><td>${source?link(source.url,source.publisher??source.title??source.id):'Source needed'}<small>${esc(observation.qualification??'Exact specification and inclusions need confirmation.')}</small><small>${esc(source?.retrieved_date??source?.accessed_date??'See dated source register')}</small></td></tr>`;
 }))+
 `<section class="block notes"><h2>Research records</h2><p>${link('./market-rates.json','Dated v4 research JSON')} · ${link('./rate-research.csv','Dated research CSV')} · ${link('../v5/','Work-by-work comparisons v5')} · ${link('../v7/','Component evidence v7')}</p><p>Current observation definitions are maintained once in ${link('../v9/','the shared register')}. The dated downloads preserve their original research snapshot.</p></section>`;
}

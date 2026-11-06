import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {BUILDERA_SELECTED_PATH} from '../public/organization/site-model.js';
import {toMills,formatMills,selectedWorksCsv} from '../public/construction/estimates/pilates-buildera-2-selected-works/selected-works-model.js';

const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const amount=(mills,exact=false)=>'NPR '+formatMills(mills,exact);

export function analyseSelectedWorks(source){
 if(source.schema!=='cad-buildera-2-selected-works-1'||source.currency!=='NPR'||!source.items.length||!source.areas.length||new Set(source.areas).size!==source.areas.length)throw Error('Invalid BuildEra 2 extract');
 const areas=source.areas.map(name=>({name,count:0,mills:0})), ids=new Set();
 const items=source.items.map(item=>{
  const areaIndex=source.areas.indexOf(item.area);
  if(!Number.isInteger(item.id)||item.id<1||ids.has(item.id)||areaIndex<0||!Number.isInteger(item.page)||item.page<1||!item.work||!item.title||!item.unit)throw Error('Invalid or duplicate selected work '+item.id);
  ids.add(item.id);
  const mills=toMills(item.amount), product=toMills(item.qty)*toMills(item.rate);
  if(!Number.isSafeInteger(product)||product!==mills*1000)throw Error('Selected work amount does not match quantity × rate: '+item.id);
  areas[areaIndex].count++;
  areas[areaIndex].mills+=mills;
  return {...item,areaIndex,mills};
 });
 const total=items.reduce((sum,item)=>sum+item.mills,0);
 return {source:source.source,items,areas,total};
}

function workRow(item){
 const id=String(item.id).padStart(2,'0');
 return `<tr role="row" id="selected-work-${id}" data-id="${item.id}" data-area="${esc(item.area)}" data-area-order="${item.areaIndex}" data-qty="${esc(item.qty)}" data-unit="${esc(item.unit)}" data-rate="${esc(item.rate)}" data-amount="${esc(item.amount)}" data-page="${item.page}">
  <th role="rowheader" scope="row"><details><summary>${esc(item.title)}</summary><p data-swx-description>${esc(item.work)}</p></details><small>Work ${id} · Estimate page ${item.page}</small></th>
  <td role="cell"><span class="swx-label" aria-hidden="true">Area</span>${esc(item.area)}</td>
  <td role="cell"><span class="swx-label" aria-hidden="true">Quantity</span>${esc(item.qty)} <span class="swx-unit">${esc(item.unit)}</span></td>
  <td role="cell"><span class="swx-label" aria-hidden="true">Rate · NPR</span>${formatMills(toMills(item.rate),true)}<small>per ${esc(item.unit)}</small></td>
  <td role="cell" class="swx-line-amount"><span class="swx-label" aria-hidden="true">Amount · NPR</span><strong>${formatMills(item.mills,true)}</strong></td>
 </tr>`;
}

export function renderSelectedWorks(model,revision){
 const {source,items,areas,total}=model;
 return `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${items.length} selected works from BuildEra estimate 2 for the Paila Pilates studio, with quantities, rates and exact source amounts.">
<meta name="robots" content="noindex">
<title>BuildEra 2 Selected Works · Paila Pilates | CAD Test Facility</title>
<link rel="icon" href="../../../favicon.svg"><link rel="stylesheet" href="../../../workspace.css">
<link rel="stylesheet" href="selected-works.css?v=${revision}"></head>
<body class="swx-page"><a class="skip" href="#main">Skip to content</a>
<main class="container swx" id="main">
 <header class="swx-intro">
  <div><p class="org-kicker">PAILA PILATES · BUILDERA ESTIMATE 2</p><h1>Selected Interior Works &amp; Amounts</h1>
  <p>Quoted quantities, rates and amounts for ${items.length} selected works across ${areas.length} areas.</p></div>
  <div class="swx-total"><span>Total for selected works</span><strong>${amount(total)}</strong><small>Exact sum: ${amount(total,true)}</small></div>
 </header>
 <section class="swx-section" aria-labelledby="area-summary">
  <h2 id="area-summary">Cost by area</h2>
  <ul class="swx-areas">${areas.map((area,index)=>{
   const share=total?area.mills/total*100:0;
   return `<li class="swx-area" data-tone="${index}"><strong>${esc(area.name)}</strong><span>${amount(area.mills)}</span><small>${area.count} ${area.count===1?'work':'works'} · ${share.toFixed(1)}% of total</small><div class="swx-bar" aria-hidden="true"><i style="width:${share.toFixed(3)}%"></i></div></li>`;
  }).join('')}</ul>
 </section>
 <section class="swx-section" aria-labelledby="selected-items">
  <h2 id="selected-items">Selected work items</h2>
  <p class="swx-muted">Open a work title to read its full description.</p>
  <form class="swx-filters" data-swx-filters hidden>
   <label>Find work<input type="search" name="query" placeholder="Work, area or amount" autocomplete="off"></label>
   <label>Area<select name="area"><option value="">All areas</option>${areas.map(a=>`<option value="${esc(a.name)}">${esc(a.name)}</option>`).join('')}</select></label>
   <label>Sort<select name="sort"><option value="original">Original order</option><option value="area">Group by area</option><option value="high">Highest amount</option><option value="low">Lowest amount</option></select></label>
   <button type="reset">Clear filters</button>
  </form>
  <div class="swx-tools">
   <p role="status" data-swx-count>Showing ${items.length} of ${items.length} selected works</p>
   <div><a href="selected-works.csv" download data-swx-export title="Export the currently shown works">Export CSV</a><button type="button" data-swx-print hidden>Print / PDF</button></div>
  </div>
  <table class="swx-table" role="table" aria-label="BuildEra 2 selected works with quantities, rates and amounts">
   <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Work</th><th scope="col" role="columnheader">Area</th><th scope="col" role="columnheader">Quantity</th><th scope="col" role="columnheader">Rate (NPR)</th><th scope="col" role="columnheader">Amount (NPR)</th></tr></thead>
   <tbody role="rowgroup">${items.map(workRow).join('')}</tbody>
  </table>
  <p class="swx-empty" data-swx-empty hidden>No matching works. Try another search or clear the filters.</p>
  <div class="swx-subtotal"><span data-swx-subtotal-label>Total selected works</span><strong data-swx-subtotal>${amount(total)}</strong></div>
 </section>
 <section class="swx-section swx-source" aria-labelledby="source-scope">
  <h2 id="source-scope">Source &amp; scope</h2>
  <p>The supplied extract cites <cite>${esc(source.estimate)}</cite>, pages 2–6, from ${esc(source.contractor)}. Amounts cover only the selected works. The three-decimal paint amount is retained; the overall total is shown rounded to two decimals.</p>
  <p>The <a href="../pilates-buildera-2026-11-01/">BuildEra market comparison</a> uses a separate quotation. <a href="selection.json">View the extracted source data (JSON).</a></p>
 </section>
</main>
<script type="module" src="selected-works.js?v=${revision}"></script></body></html>\n`;
}

export async function buildBuildEraSelectedWorks(dist){
 const dir=new URL(BUILDERA_SELECTED_PATH,dist);
 const [data,style,controller,model,renderer]=await Promise.all(
  ['selection.json','selected-works.css','selected-works.js','selected-works-model.js'].map(f=>readFile(new URL(f,dir),'utf8')).concat(readFile(new URL(import.meta.url),'utf8')));
 const selection=analyseSelectedWorks(JSON.parse(data));
 const revision=createHash('sha256').update(data).update(style).update(controller).update(model).update(renderer).digest('hex').slice(0,16);
 await Promise.all([
  writeFile(new URL('index.html',dir),renderSelectedWorks(selection,revision)),
  writeFile(new URL('selected-works.csv',dir),selectedWorksCsv(selection.items)),
  writeFile(new URL('selected-works.js',dir),controller.replace('./selected-works-model.js','./selected-works-model.js?v='+revision))
 ]);
 console.log(`BuildEra 2 selected works: ${selection.items.length} items, ${selection.areas.length} areas, ${amount(selection.total,true)} exact.`);
}

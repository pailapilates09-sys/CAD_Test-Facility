import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {BUILDERA_MARKET_PATH} from '../public/organization/site-model.js';

const units={'sq-ft':'sq ft','running-ft':'running ft',each:'unit'};
const unitName=unit=>units[unit];
const money2=new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const moneyExact=new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:3});
const number=new Intl.NumberFormat('en-IN',{maximumFractionDigits:3});
const quantity=item=>number.format(item.quantity)+' '+(item.unit==='each'&&item.quantity!==1?'units':unitName(item.unit));
const npr=value=>'NPR '+money2.format(value);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const mills=n=>{
 if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*1000))||Math.round(n*1000)/1000!==n)throw Error('Invalid BOQ decimal: '+n);
 return Math.round(n*1000);
};
const micros=n=>mills(n)*1000;
const rounded=micros=>Math.round(micros/10_000)/100;
const multiply=(qty,rate)=>{
 const result=mills(qty)*mills(rate);
 if(!Number.isSafeInteger(result))throw Error('BOQ amount exceeds supported precision');
 return result;
};
const label={above:'Above range',within:'Within range',below:'Below range',conditional:'Unit to confirm',unavailable:'Market rate unavailable'};
const position=(q,lo,hi)=>q<lo?'below':q>hi?'above':'within';
const dateLabel=date=>new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));

export function ratePlot(quote,min,max){
 // Zero-based, item-specific axis. Include the quote even outside the band.
 const end=Math.max(quote,max)*1.12||1;
 return {minimum:min/end*100,maximum:max/end*100,quote:quote/end*100};
}

export function metricEquivalent(item){
 const conversion={'sq-ft':[0.09290304,'m²'],'running-ft':[0.3048,'running m']}[item.unit];
 if(!conversion||item.assessment==='conditional')return null;
 const [factor,unit]=conversion;
 return {quantity:item.quantity*factor,quoted_rate:item.quoted_rate/factor,unit};
}

export function analyseBuildEra(quote,market){
 if(quote.schema!=='cad-buildera-quotation-1'||quote.currency!=='NPR'||market.schema!=='cad-buildera-market-rates-1'||!/^\d{4}-\d{2}-\d{2}$/.test(market.benchmark_date))throw Error('Invalid BuildEra comparison inputs');
 const areaById=new Map(quote.areas.map(a=>[a.id,a])),ids=new Set(),sourceRows=new Set(),usedBands=new Set();
 if(areaById.size!==quote.areas.length)throw Error('Duplicate BuildEra area');
 for(const [id,ref] of Object.entries(market.sources)){
  if(!/^S\d{2}$/.test(id)||new URL(ref.url).protocol!=='https:'||!ref.publisher||!ref.limits)throw Error('Invalid evidence reference '+id);
 }
 for(const [id,band] of Object.entries(market.bands)){
  if(mills(band.minimum)>mills(band.maximum)||!Object.hasOwn(units,band.unit)||!band.method||!band.scope||!band.sources.length||band.sources.some(ref=>!Object.hasOwn(market.sources,ref)))throw Error('Invalid market band '+id);
 }
 const items=quote.items.map((item,index)=>{
  const area=areaById.get(item.area),comparison=market.items[item.id];
  const pdfRow=area?.pdf_page+':'+item.pdf_item;
  if(!/^[A-Z]{2}-\d{2}$/.test(item.id)||ids.has(item.id)||sourceRows.has(pdfRow)||!area?.pdf_page||!Number.isInteger(item.pdf_item)||item.pdf_item<1||!item.title||!Object.hasOwn(units,item.unit)||!comparison?.note)throw Error('Invalid or duplicate BuildEra work '+item.id);
  ids.add(item.id);sourceRows.add(pdfRow);
  const band=comparison.band===null?null:market.bands[comparison.band];
  const conditional=comparison.conditional_unit===true;
  if((comparison.band!==null&&!band)||(conditional&&!band)||(band&&(item.unit!==band.unit)!==conditional))throw Error('Unexpected comparison unit for '+item.id);
  if(band)usedBands.add(comparison.band);
  const relation=band?position(item.quoted_rate,band.minimum,band.maximum):null;
  const assessment=conditional?'conditional':relation??'unavailable';
  const amountMicros=multiply(item.quantity,item.quoted_rate);
  return {...item,index,area,comparison,band,relation,assessment,amountMicros,
   lineDifference:rounded(micros(item.printed_amount)-amountMicros),
   marketAmount:band&&!conditional?[rounded(multiply(item.quantity,band.minimum)),rounded(multiply(item.quantity,band.maximum))]:null};
 });
 if(Object.keys(market.items).some(id=>!ids.has(id))||usedBands.size!==Object.keys(market.bands).length)throw Error('Unlinked BuildEra comparison data');
 const areas=quote.areas.map(area=>{
  const lines=items.filter(item=>item.area.id===area.id);
  if((area.summary_amount===null)!==(!lines.length)||(area.detail_subtotal===null)!==(!lines.length))throw Error('Unexpected priced status for '+area.label);
  const detailMicros=sum(lines.map(x=>x.amountMicros));
  return {...area,count:lines.length,recomputed:rounded(detailMicros),
   difference:area.summary_amount===null?null:rounded(micros(area.summary_amount)-Math.round(detailMicros/10_000)*10_000)};
 });
 const {quoted_total,interior_subtotal,electrical_allowance}=quote.summary;
 const detailMicros=sum(items.map(x=>x.amountMicros)),printedAreaMicros=sum(areas.map(a=>micros(a.summary_amount??0)));
 const recalculated=rounded(detailMicros+micros(electrical_allowance));
 return {quote,market,areas,items,
  counts:{...Object.fromEntries(Object.keys(label).map(key=>[key,items.filter(i=>i.assessment===key).length])),banded:items.filter(i=>i.band).length},
  amounts:{detail:rounded(detailMicros),recalculated,
   difference:rounded(micros(quoted_total)-micros(recalculated)),
   interiorDifference:rounded(micros(interior_subtotal)-printedAreaMicros),
   totalDifference:rounded(micros(quoted_total)-micros(interior_subtotal)-micros(electrical_allowance))}};
}

const itemAnchor=id=>'work-'+id.toLowerCase();
const refAnchor=id=>'market-'+id.toLowerCase();
const rank={above:0,below:1,conditional:2,unavailable:3,within:4};
const badge=item=>`<span class="bmq-badge bmq-${item.assessment}">${label[item.assessment]}</span>`;
const recordAttrs=item=>`data-bmq-item="${item.id}" data-area="${esc(item.area.id)}" data-assessment="${item.assessment}" data-order="${item.index}" data-rank="${rank[item.assessment]}" data-amount="${item.printed_amount}"`;

function plot(item){
 if(!item.band)return `<p class="bmq-no-band"><span class="bmq-dot" aria-hidden="true"></span><strong>${npr(item.quoted_rate)}</strong> per ${unitName(item.unit)} quoted. No market range to plot.</p>`;
 const {minimum,maximum,unit}=item.band,p=ratePlot(item.quoted_rate,minimum,maximum);
 const conditional=item.assessment==='conditional';
 const compareUnit=conditional?'fixture':unitName(unit);
 const trackLabel=`NPR per ${compareUnit}. Minimum ${number.format(minimum)}, quote ${number.format(item.quoted_rate)}${conditional?' if priced per fixture':''}, maximum ${number.format(maximum)}.`;
 const delta=item.relation==='above'?item.quoted_rate-maximum:minimum-item.quoted_rate;
 const direction=item.relation==='above'?'above the upper end':'below the lower end';
 return `<div class="bmq-rate-plot bmq-${item.assessment}">
  <p class="bmq-rate-unit">NPR per ${compareUnit}${conditional?' · conditional':''}</p>
  <div class="bmq-track" role="img" aria-label="${esc(trackLabel)}" style="--bmq-lo:${p.minimum.toFixed(5)}%;--bmq-hi:${p.maximum.toFixed(5)}%;--bmq-q:${p.quote.toFixed(5)}%">
   <span class="bmq-band" aria-hidden="true"></span><span class="bmq-end bmq-min" aria-hidden="true"></span><span class="bmq-end bmq-max" aria-hidden="true"></span><span class="bmq-dot" aria-hidden="true"></span>
  </div>
  <dl class="bmq-values"><div><dt>Market min</dt><dd>${number.format(minimum)}</dd></div><div><dt>${conditional?'Quote if per fixture':'Our quote'}</dt><dd>${number.format(item.quoted_rate)}</dd></div><div><dt>Market max</dt><dd>${number.format(maximum)}</dd></div></dl>
  ${conditional?`<p class="bmq-plot-note">PDF rate is per sq ft. If per fixture, the quote ${item.relation==='within'?'falls within the band':`is ${number.format(delta)} ${direction}`}.</p>`:item.relation!=='within'?`<p class="bmq-plot-note">${number.format(delta)} ${direction} per ${unitName(unit)}.</p>`:''}
 </div>`;
}

function itemCard(item,market){
 const refs=item.band?.sources??[],metric=metricEquivalent(item);
 return `<article class="bmq-item" id="${itemAnchor(item.id)}" ${recordAttrs(item)}>
  <div class="bmq-item-head"><div><p class="bmq-item-kicker">${esc(item.area.label)} · ${item.id}</p><h3>${esc(item.title)}</h3></div>${badge(item)}</div>
  ${plot(item)}
  <details class="bmq-item-details"><summary>Quantity, scope &amp; evidence</summary><div class="bmq-detail-body">
   <p><strong>From the quotation:</strong> ${quantity(item)}, ${npr(item.quoted_rate)} per ${unitName(item.unit)}. Printed amount: NPR ${moneyExact.format(item.printed_amount)}. PDF page ${item.area.pdf_page}, item ${item.pdf_item}.</p>
   ${metric?`<p><strong>SI equivalent:</strong> ${number.format(metric.quantity)} ${metric.unit} at ${npr(metric.quoted_rate)} per ${metric.unit} (rounded for display).</p>`:''}
   ${item.band?`<p><strong>${esc(item.band.method)}:</strong> ${esc(item.band.scope)}.</p>`:''}
   <p>${esc(item.comparison.note)}</p>
   ${refs.length?`<ul class="bmq-ref-list">${refs.map(id=>`<li><a href="#${refAnchor(id)}">${id} · ${esc(market.sources[id].publisher)}</a></li>`).join('')}</ul>`:''}
  </div></details>
 </article>`;
}

function detailRow(item){
 return `<tr role="row" ${recordAttrs(item)}><th role="rowheader" scope="row"><a href="#${itemAnchor(item.id)}">${esc(item.title)}</a><small>${item.id} · ${esc(item.area.label)} · PDF p. ${item.area.pdf_page}</small></th>
  <td role="cell"><span class="bmq-cell-label" aria-hidden="true">BOQ quantity</span>${quantity(item)}</td>
  <td role="cell"><span class="bmq-cell-label" aria-hidden="true">Quoted rate &amp; amount</span><strong>${npr(item.quoted_rate)}</strong><small>per ${unitName(item.unit)}</small><span class="bmq-table-amount">NPR ${moneyExact.format(item.printed_amount)}<small>printed amount</small></span></td>
  <td role="cell"><span class="bmq-cell-label" aria-hidden="true">Market rate &amp; line range</span>${item.band?`<strong>${npr(item.band.minimum)}–${money2.format(item.band.maximum)}</strong><small>per ${unitName(item.band.unit)}${item.assessment==='conditional'?' · assumed':''}</small>${item.marketAmount?`<span class="bmq-table-amount">${npr(item.marketAmount[0])}–${money2.format(item.marketAmount[1])}<small>at BOQ quantity</small></span>`:'<small>Line range withheld until unit is confirmed</small>'}`:'<small>No comparable rate found</small>'}</td>
  <td role="cell">${badge(item)}<small>${esc(item.band?.method??'Unverified')}</small></td>
 </tr>`;
}

function costRows(model){
 const costs=model.areas.filter(a=>a.count).map(a=>({label:a.label,amount:a.summary_amount}));
 costs.push({label:'Electrical allowance',amount:model.quote.summary.electrical_allowance,allowance:true});
 costs.sort((a,b)=>b.amount-a.amount);
 const max=Math.max(...costs.map(x=>x.amount))||1;
 return costs.map(x=>`<li class="bmq-cost${x.allowance?' bmq-allowance':''}"><span>${esc(x.label)}</span><strong>${npr(x.amount)}</strong><span class="bmq-cost-track" aria-hidden="true"><span style="width:${(100*x.amount/max).toFixed(5)}%"></span></span></li>`).join('');
}

function auditNotes(model){
 const {quote,areas,items,amounts}=model;
 const discrepancies=areas.filter(a=>a.difference);
 const lineDiscrepancies=items.filter(i=>i.lineDifference);
 return `<ul class="bmq-audit-list">
  ${discrepancies.map(a=>`<li><strong>${esc(a.label)} · ${npr(Math.abs(a.difference))} difference.</strong> The printed subtotal is ${npr(a.detail_subtotal)} (PDF page ${a.pdf_page}). Its ${a.count} lines total ${npr(a.recomputed)}. The original summary is kept as printed.</li>`).join('')}
  ${lineDiscrepancies.map(i=>`<li><strong>${i.id} · ${npr(Math.abs(i.lineDifference))} line difference.</strong> Printed amount and quantity × rate differ.</li>`).join('')}
  ${amounts.interiorDifference||amounts.totalDifference?'<li>The printed summary does not reconcile to its own component totals.</li>':''}
  <li><strong>Electrical allowance · ${npr(quote.summary.electrical_allowance)}.</strong> The PDF lists a lump sum without a work schedule. Check whether fittings, drivers and cutouts are also included in the itemized lighting works.</li>
  <li><strong>Changing Room and Washroom.</strong> No detailed prices appear in the quotation. A blank amount does not mean the work is free.</li>
  <li><strong>Studio lights · <a href="#work-st-05">ST-05</a>.</strong> Quantity 12 is printed in sq ft. The per-fixture band is a scenario only; the quote retains its original quantity, unit and amount.</li>
 </ul>`;
}

function sourceCards(model){
 const {market}=model;
 return Object.entries(market.sources).map(([id,r])=>`<li id="${refAnchor(id)}"><strong><a href="${esc(r.url)}" rel="noopener noreferrer" target="_blank">${id} · ${esc(r.publisher)} <span aria-hidden="true">↗</span></a></strong><span>${esc(r.topic)}${r.published_unit?` · ${esc(r.published_unit)}`:''}</span><p>${esc(r.limits)}</p></li>`).join('');
}

export function renderMarketComparison(model,revision){
 const {quote,market,items,areas,counts,amounts}=model;
 const date=dateLabel(market.benchmark_date);
 return `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="description" content="BuildEra’s Paila Pilates BOQ compared with saved Kathmandu market-rate ranges from ${esc(date)}.">
 <meta name="robots" content="noindex">
 <title>BOQ Market Rate Comparison · Paila Pilates | CAD Test Facility</title>
 <link rel="icon" href="../../../favicon.svg"><link rel="stylesheet" href="../../../workspace.css">
 <link rel="stylesheet" href="market.css?v=${revision}"></head>
<body class="bmq-page"><a class="skip" href="#main">Skip to content</a>
<main class="container bmq" id="main">
 <header class="bmq-intro">
  <p class="org-kicker">BUILDERA QUOTATION · KATHMANDU, NEPAL</p>
  <h1>BOQ Market Rate Comparison</h1>
  <p>Benchmarks from <time datetime="${market.benchmark_date}">${date}</time>.</p>
  <div class="bmq-summary">
   <div><span>BuildEra total as printed</span><strong>${npr(quote.summary.quoted_total)}</strong></div>
   <div><span>Market bands${counts.conditional?" ("+counts.conditional+" conditional)":""}</span><strong>${counts.banded} of ${items.length} items</strong></div>
  </div>
 </header>
 <section class="bmq-section" aria-labelledby="rate-bands">
  <h2 id="rate-bands">Quoted vs market rates</h2>
  <p class="bmq-muted">Each item uses its own rate scale.</p>
  <ul class="bmq-legend" aria-label="Chart key"><li><i class="bmq-key-band"></i>Market range</li><li><i class="bmq-key-dot"></i>Our quoted rate</li></ul>
  <div class="bmq-actions">
   <nav class="project-contents bmq-contents" aria-label="On this page"><ol>
  <li><a href="#rate-bands">Rate bands</a></li><li><a href="#boq-table">BOQ table</a></li>
  <li><a href="#quote-checks">Quotation checks</a></li><li><a href="#market-evidence">Market evidence</a></li>
 </ol></nav>
   <details class="bmq-controls" data-bmq-controls hidden><summary>Search, filter and sort</summary>
   <form class="bmq-filters" data-bmq-filters>
    <label>Find work<input type="search" name="q" placeholder="Item, area or work" autocomplete="off"></label>
    <label>Area<select name="area"><option value="">All areas</option>${areas.filter(a=>a.count).map(a=>`<option value="${esc(a.id)}">${esc(a.label)}</option>`).join('')}</select></label>
    <label>Rate assessment<select name="assessment"><option value="">All assessments</option>${Object.entries(label).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></label>
    <label>Order<select name="order"><option value="boq">BOQ order</option><option value="review">Review items first</option><option value="amount">Largest amount first</option></select></label>
    <button type="reset">Clear filters</button>
   </form>
   </details>
  </div>
  <p class="bmq-count" data-bmq-count role="status">Showing ${items.length} of ${items.length} works · ${counts.above} above · ${counts.below} below</p>
  <div class="bmq-plots" data-bmq-rows>${items.map(i=>itemCard(i,market)).join('')}</div>
  <p class="bmq-empty" data-bmq-empty hidden>No work matches these filters. Try another area or search term.</p>
 </section>
 <section class="bmq-section" aria-labelledby="boq-table">
  <h2 id="boq-table">BOQ comparison table</h2>
  <p class="bmq-muted">The table follows the filters above. Market line ranges use the original BOQ quantity and an indicative unit rate. They are not a total project price.</p>
  <p class="bmq-table-tools"><a href="#rate-bands">Change filters ↑</a><a href="comparison.csv" download>Export all ${items.length} works as CSV</a></p>
  <table class="bmq-table" role="table" aria-label="BuildEra work items and market rate comparisons">
   <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Work item</th><th scope="col" role="columnheader">BOQ quantity</th><th scope="col" role="columnheader">Quoted rate &amp; amount</th><th scope="col" role="columnheader">Market rate &amp; line range</th><th scope="col" role="columnheader">Assessment</th></tr></thead>
   <tbody data-bmq-rows role="rowgroup">${items.map(detailRow).join('')}</tbody>
  </table>
  <p class="bmq-empty" data-bmq-empty hidden>No matching works. <a href="#rate-bands">Change the filters.</a></p>
 </section>
 <section class="bmq-section" aria-labelledby="quote-checks">
  <h2 id="quote-checks">Quotation checks</h2>
  <div class="bmq-audit-grid">
   <div class="bmq-panel"><h3>Quoted cost by area</h3><p class="bmq-muted">From the printed cost summary, including the separate electrical allowance.</p><ul class="bmq-costs">${costRows(model)}</ul></div>
   <div class="bmq-panel"><h3>Original and recalculated amounts</h3><dl class="bmq-totals">
    <div><dt>Original total · PDF page 1</dt><dd>${npr(quote.summary.quoted_total)}</dd></div>
    <div><dt>Sum of ${items.length} detailed works</dt><dd>${npr(amounts.detail)}</dd></div>
    <div><dt>Electrical allowance</dt><dd>${npr(quote.summary.electrical_allowance)}</dd></div>
    <div><dt>Recalculated works + allowance</dt><dd>${npr(amounts.recalculated)}</dd></div>
    <div><dt>Original less recalculated</dt><dd>${npr(amounts.difference)}</dd></div>
   </dl><p class="bmq-muted">Calculation uses the unrounded quantities and rates. Reception's printed page 3 subtotal has three decimal places and rounds to the page 1 figure.</p></div>
  </div>
  ${auditNotes(model)}
 </section>
 <section class="bmq-section" aria-labelledby="market-evidence">
  <h2 id="market-evidence">Market evidence</h2>
  <p>This ${esc(date)} snapshot does not refresh automatically. The inputs include installed price guides, product listings and fitted allowances. Proxy bands are approximate. Match materials, labour, transport, VAT and installation scope before treating any difference as savings.</p>
  <ol class="bmq-sources">${sourceCards(model)}</ol>
  <p class="bmq-muted">Quotation: ${esc(quote.contractor)}, <cite>${esc(quote.source.name)}</cite> (${quote.source.pages} pages). Values checked against the PDF and the original comparison workbook. The data files record the source names and checksums.</p>
  <p class="bmq-table-tools"><a href="quotation.json">Quotation data (JSON)</a><a href="market-rates.json">Market evidence (JSON)</a></p>
 </section>
</main>
<script type="module" src="market.js?v=${revision}"></script>
</body></html>\n`;
}

export function comparisonCsv(model){
 const head=['id','area','pdf_page','pdf_item','work','quoted_unit','quantity','quoted_rate_npr','printed_amount_npr','recomputed_amount_npr','market_unit','market_min_npr','market_max_npr','market_line_min_npr','market_line_max_npr','assessment','market_date','evidence_method','scope','references','note'];
 const rows=model.items.map(i=>[i.id,i.area.label,i.area.pdf_page,i.pdf_item,i.title,unitName(i.unit),i.quantity,i.quoted_rate,i.printed_amount,i.amountMicros/1e6,i.band?unitName(i.band.unit):null,i.band?.minimum,i.band?.maximum,i.marketAmount?.[0],i.marketAmount?.[1],label[i.assessment],model.market.benchmark_date,i.band?.method,i.band?.scope,i.band?.sources.join(' '),i.comparison.note]);
 return [head,...rows].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}

export async function buildBuildEraMarket(dist){
 const dir=new URL(BUILDERA_MARKET_PATH,dist);
 const [quote,market,css,js,renderer]=await Promise.all(['quotation.json','market-rates.json','market.css','market.js'].map(name=>readFile(new URL(name,dir),'utf8')).concat(readFile(new URL(import.meta.url))));
 const model=analyseBuildEra(JSON.parse(quote),JSON.parse(market));
 const revision=createHash('sha256').update(quote).update(market).update(css).update(js).update(renderer).digest('hex').slice(0,16);
 await Promise.all([
  writeFile(new URL('index.html',dir),renderMarketComparison(model,revision)),
  writeFile(new URL('comparison.csv',dir),'\ufeff'+comparisonCsv(model))
 ]);
 console.log(`BuildEra market comparison: ${model.items.length} works, ${model.counts.banded} bands (${model.counts.conditional} conditional), ${model.counts.unavailable} unavailable.`);
}

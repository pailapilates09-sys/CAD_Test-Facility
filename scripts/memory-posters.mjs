import {esc} from './linked-estimate-views.mjs';
import {fmt,range} from './contractor-v10.mjs';
import {materialLine} from '../public/construction/estimates/pilates-astra-2026-10-15/v10/contractor-model.js';
const estimate='../construction/estimates/pilates-astra-2026-10-15/';
const kinds=new Set(['result','vocabulary','source','math','limits','recipe','prompt']),tones=new Set(['mint','peach','sky','ink','lilac','paper']),sizes=new Set(['wide','narrow','half']);
export function validatePosters(collection){
 if(collection.schema_version!=='paila-memory-posters-1.0.0'||collection.based_on!=='v11')throw Error('Unexpected memory poster collection');
 const categories=new Set(collection.categories.map(c=>c.id)),ids=new Set();
 if(categories.size!==collection.categories.length)throw Error('Duplicate poster category');
 for(const poster of collection.posters){
  if(!/^[a-z][a-z0-9-]+$/.test(poster.id)||ids.has(poster.id)||!categories.has(poster.category)||!kinds.has(poster.kind)||!tones.has(poster.tone)||!sizes.has(poster.size)||!poster.title)throw Error('Invalid poster: '+poster.id);
  if(poster.kind==='prompt'&&(!poster.prompt||poster.prompt.length<30))throw Error('Missing reusable prompt: '+poster.id);
  ids.add(poster.id);
 }
 return collection;
}
export function wallContext(data){
 const example=data.items.find(w=>!w.held&&w.rows.some(row=>row.quantity>0&&row.rate_low!==null&&row.rate_low===row.rate_high))??data.items.find(w=>!w.held)??data.items[0];
 const material=example?.rows.find(row=>row.quantity>0&&row.rate_low!==null&&row.rate_low===row.rate_high)??null;
 return {works:data.items.length,areas:new Set(data.items.map(w=>w.section_id)).size,materials:data.items.reduce((sum,w)=>sum+w.rows.length,0),held:data.items.filter(w=>w.held).length,allowances:data.allowances.length,priced:data.items.reduce((sum,w)=>sum+w.rows.filter(row=>materialLine(row).amount_low!==null).length,0),example,material};
}
const fill=(text,context)=>String(text??'').replace(/\{\{([a-z]+)\}\}/g,(_,key)=>{if(!Object.hasOwn(context,key)||typeof context[key]==='object')throw Error('Unknown poster value: '+key);return String(context[key]);});
const bullets=(poster,context)=>poster.items?.length?`<ul class="poster-list">${poster.items.map(item=>`<li>${esc(fill(item,context))}</li>`).join('')}</ul>`:'';
function exampleTable(context){
 const work=context.example;if(!work)return '<p>Work measurements and material rows are needed for an example.</p>';const rows=work.rows.slice(0,3);
 return `<div class="poster-example"><p class="example-work">${esc(work.title)}</p><div class="table-scroll"><table class="poster-table" data-mobile-layout="scroll"><caption>A small piece of the real v11 table · NPR planning references</caption><thead><tr><th scope="col">Material</th><th scope="col">Qty / unit</th><th scope="col">Rate · NPR</th><th scope="col">Amount · NPR</th></tr></thead><tbody>${rows.map(row=>{const cost=materialLine(row);return `<tr><th scope="row">${esc(row.name)}</th><td>${row.quantity===null?'Unknown':fmt(row.quantity,3)} ${esc(row.unit)}</td><td>${range(row.rate_low,row.rate_high)}</td><td>${range(cost.amount_low,cost.amount_high)}</td></tr>`;}).join('')}</tbody></table></div><p class="poster-fine">An excerpt, not a complete order. Planning quantities and selected specifications need confirmation.</p></div>`;
}
function sourceMap(){return `<table class="poster-table source-map"><caption>Three roles in the same website</caption><thead><tr><th scope="col">View</th><th scope="col">Purpose</th></tr></thead><tbody><tr><th scope="row">V9</th><td>Shared published data</td></tr><tr><th scope="row">V10</th><td>Work schedule + individual worksheets</td></tr><tr><th scope="row">V11</th><td>All work/material tables inline</td></tr></tbody></table>`;}
function math(context){
 const row=context.material;if(!row)return '<p class="poster-fine">A measured quantity and matching purchase-unit price are needed for a numeric example.</p>';const cost=materialLine(row);
 return `<p class="poster-equation"><span>${fmt(row.quantity,3)} <small>${esc(row.unit==='sheet'&&row.quantity!==1?'sheets':row.unit)}</small></span><b aria-label="times">×</b><span>${fmt(cost.rate_low)} <small>NPR / ${esc(row.unit)}</small></span><b aria-label="equals">=</b><span>${fmt(cost.amount_low)} <small>NPR</small></span></p><p class="poster-fine">${esc(row.name)} · published planning example. Price evidence: ${esc(context.example.rows.find(r=>r.id===row.id).source_id)} in the v11 source.</p>`;
}
function posterContent(poster,context){
 let body=poster.body?`<p class="poster-body">${esc(fill(poster.body,context))}</p>`:'';
 if(poster.kind==='result')body+=exampleTable(context);
 if(poster.kind==='source')body+=sourceMap();
 if(poster.kind==='math')body+=math(context);
 if(poster.kind==='limits')body+=`<p class="poster-number"><strong>${context.priced}</strong> of ${context.materials} material lines have a default quantity and price.</p>`;
 body+=bullets(poster,context);
 if(poster.prompt)body+=`<pre class="poster-prompt" id="prompt-${esc(poster.id)}">${esc(fill(poster.prompt,context))}</pre>`;
 return body;
}
export function renderMemoryPosters(collection,data){
 validatePosters(collection);const context=wallContext(data);
 const posters=collection.posters.map(poster=>`<article class="memory-poster poster-${poster.tone} poster-${poster.size}" id="${esc(poster.id)}" data-poster data-category="${esc(poster.category)}" aria-labelledby="heading-${esc(poster.id)}"><div class="poster-kicker">${esc(poster.kicker)}</div><h2 id="heading-${esc(poster.id)}">${esc(poster.title)}</h2>${posterContent(poster,context)}<p class="poster-takeaway">${esc(fill(poster.takeaway,context))}</p><div class="poster-actions">${poster.prompt?`<button type="button" data-copy-prompt="prompt-${esc(poster.id)}" disabled>Copy prompt</button>`:poster.kind==='result'?`<a href="${estimate}v11/">Open v11 →</a>`:''}<a href="#${esc(poster.id)}" aria-label="Link to ${esc(poster.title)}"># Keep this poster</a></div></article>`).join('');
 return `<section class="memory-hero" aria-labelledby="memory-title"><div class="memory-hero-copy"><p class="eyebrow">PAILA PILATES / THE LEARNING WALL</p><h1 id="memory-title">Remember the idea.<br><em>Keep the words.</em></h1><p>What we built in v11, why its layout works, and the prompts to ask for it again. Pinned in one place, like the reminders above your desk.</p><div class="memory-hero-links"><a class="memory-primary" href="${estimate}v11/">Open v11 tables ↗</a><a href="#build-v11-prompt">Get the v11 prompt ↓</a></div></div><div class="hero-pinned-note" aria-label="V11 coverage"><span class="note-label">V11 / ALL IN ONE PAGE</span><strong>${context.works}<small>works</small></strong><div><b>${context.materials}</b> material lines<br><b>${context.areas}</b> areas</div><span class="note-footer">Work → materials → quantity × rate</span></div></section><section class="memory-board" id="poster-board" aria-labelledby="board-title"><div class="memory-board-head"><div><p class="eyebrow">PINNED / ALWAYS OPEN</p><h2 id="board-title">Your Memory Posters</h2><p>Start with the result. Keep the prompt for next time.</p></div><p id="poster-count" role="status">${collection.posters.length} posters</p></div><div class="memory-controls"><div class="memory-categories" role="group" aria-label="Poster categories"><button type="button" data-category-filter="all" aria-pressed="true" disabled>All posters</button>${collection.categories.map(category=>`<button type="button" data-category-filter="${esc(category.id)}" aria-pressed="false" disabled>${esc(category.label)}</button>`).join('')}</div><div class="memory-tools"><label class="memory-search">Find a reminder<input id="poster-search" type="search" placeholder="Try source, rates or prompts" disabled></label><button type="button" id="reading-view" aria-pressed="false" disabled>Reading view</button><button type="button" id="print-posters" disabled>Print shown posters</button></div></div><p class="memory-status" id="memory-status" role="status">All poster content is visible. Prompts can be copied or printed.</p><div class="poster-wall">${posters}</div><p id="poster-empty" hidden>No matching posters. Clear the search or choose All posters.</p><noscript><p>All posters and prompts are available. Enable JavaScript for filters and copy buttons.</p></noscript></section><section class="memory-footnotes"><div><h2>Keep this wall growing</h2><p>Add topics to the <a href="./posters.json">poster collection</a>, then rebuild the page. The construction examples are generated from the same v10 data used by v11.</p></div><div><h2>A place to revisit</h2><p><a href="${estimate}milestone.html">Versions + milestone</a> keeps the history. The notice-board idea was inspired by the <a href="https://fabingurung.github.io/JP_A7_System_Registry_and_Knowledge_Graph/memory-wall.html" target="_blank" rel="noopener">reference Memory Wall</a> you shared.</p></div></section>`;
}

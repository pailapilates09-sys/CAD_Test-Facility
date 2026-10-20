import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {contractorData} from '../scripts/contractor-v10.mjs';
import {renderMemoryPosters,validatePosters,wallContext} from '../scripts/memory-posters.mjs';
const root=new URL('../',import.meta.url),base='public/construction/estimates/pilates-astra-2026-10-15/';
const collection=JSON.parse(await readFile(new URL('public/memory-posters/posters.json',root),'utf8'));
const register=JSON.parse(await readFile(new URL(base+'v9/register.json',root),'utf8'));
const data=contractorData(deriveViews(register));

test('Memory Posters shows the v11 result and reusable prompts without hidden poster faces',()=>{
 const before=JSON.stringify(collection),html=renderMemoryPosters(collection,data),context=wallContext(data);
 assert.equal(context.works,51);assert.equal(context.areas,6);assert.equal(context.materials,261);assert.equal(context.priced,63);
 assert.equal((html.match(/data-poster data-category=/g)||[]).length,11);assert.equal((html.match(/data-copy-prompt=/g)||[]).length,5);
 assert.match(html,/3 <small>sheets/);assert.match(html,/2,720.00/);assert.match(html,/8,160.00/);assert.match(html,/v11-build|build-v11-prompt/);
 assert.doesNotMatch(html,/<details|<dialog|<iframe|\{\{|undefined|NaN/);
 for(const poster of collection.posters){assert.ok(html.includes('id="'+poster.id+'"'));if(poster.prompt)assert.ok(html.includes('id="prompt-'+poster.id+'"'));}
 assert.equal(JSON.stringify(collection),before);
});

test('poster examples follow the shared quantities/prices and stay unknown when no price exists',()=>{
 const changed=structuredClone(register);changed.materials.materials.find(row=>row.id==='ply18').rate_low=3000;changed.materials.materials.find(row=>row.id==='ply18').rate_high=3000;
 const next=contractorData(deriveViews(changed));assert.match(renderMemoryPosters(collection,next),/9,000.00/);
 const unknown=structuredClone(data);for(const work of unknown.items)for(const row of work.rows){row.rate_low=null;row.rate_high=null;}
 const html=renderMemoryPosters(collection,unknown);assert.match(html,/matching purchase-unit price/);assert.doesNotMatch(html,/NaN|undefined/);
});

test('poster registry validation and escaping preserve safe copyable content and accessible controls',async()=>{
 for(const mutate of [c=>c.posters.push(c.posters[0]),c=>c.posters[0].category='missing',c=>c.posters[0].tone='bad',c=>c.posters.find(p=>p.prompt).prompt='']){const changed=structuredClone(collection);mutate(changed);assert.throws(()=>validatePosters(changed));}
 const attack=structuredClone(collection);attack.posters[0].title='<script>bad</script>';attack.posters.find(p=>p.prompt).prompt='<img onerror=bad> This prompt is displayed as text.';
 const html=renderMemoryPosters(attack,data);assert.doesNotMatch(html,/<script>bad|<img onerror/);assert.match(html,/&lt;script&gt;/);
 const template=await readFile(new URL('public/memory-posters/index.html',root),'utf8'),script=await readFile(new URL('public/memory-posters/wall.js',root),'utf8');
 assert.match(template,/meta name="viewport"/);assert.match(script,/navigator.clipboard/);assert.match(script,/textContent/);assert.doesNotMatch(script,/innerHTML/);assert.match(script,/aria-pressed/);
});

test('coloured poster text keeps readable contrast in light and dark modes',async()=>{
 const css=await readFile(new URL('public/memory-posters/wall.css',root),'utf8');
 const vars=block=>Object.fromEntries([...block.matchAll(/--poster-(paper|ink|muted|accent):(#\w{6})/g)].map(match=>[match[1],match[2]]));
 const light=vars(css.match(/\.memory-poster\{([^}]*)\}/)[1]),dark=vars(css.match(/html\[data-theme=dark\] \.memory-poster\{([^}]*)\}/)[1]);
 const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const theme of ['light','dark'])for(const tone of new Set(collection.posters.map(poster=>poster.tone))){
  const selector=theme==='dark'?'html\\[data-theme=dark\\] \\.poster-':'\\.poster-';
  const block=css.match(new RegExp(selector+tone+'\\{([^}]*)\\}'))?.[1]??'';
  const palette={...(theme==='dark'?dark:light),...vars(block)};
  for(const key of ['ink','muted','accent']){const a=luminance(palette.paper),b=luminance(palette[key]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,theme+' '+tone+' '+key+' contrast '+ratio);}
 }
});

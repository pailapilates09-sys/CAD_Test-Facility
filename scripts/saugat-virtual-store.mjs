import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SAUGAT_STORE_PATH,PROJECTS} from '../public/organization/site-model.js';
import {buildStore,floorItems,escapeHTML as e} from '../public/construction/models/saugat-paneru-virtual-store/store-model.js';
import {renderPlan,renderCatalog,renderProduct} from '../public/construction/models/saugat-paneru-virtual-store/store-view.js';

export async function buildSaugatVirtualStore(dist){
 const base=new URL(SAUGAT_STORE_PATH,dist);
 const files=['store.js','store-model.js','store-view.js','store-geometry.js','store.css','data/project.json','../layout-designer/design-view3d.js'];
 const input=Object.fromEntries(await Promise.all(files.map(async file=>[file,await readFile(new URL(file,base),'utf8')])));
 const revision=createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0,16);
 const raw=JSON.parse(input['data/project.json']),store=buildStore(raw);
 if(raw.id!==SAUGAT_STORE_PATH.split('/').at(-2)||raw.title!==PROJECTS.saugat.label)throw Error('Store page and model identity differ');
 for(const file of files.filter(f=>f.endsWith('.js')&&!f.startsWith('../'))){
  await writeFile(new URL(file,base),input[file].replace(/(from\s*['"])(\.\.?\/[^'"]+\.js)(['"])/g,`$1$2?v=${revision}$3`));
 }
 const floor=store.levels[0],items=floorItems(store,floor.id),active=items[0],title=e(store.title);
 const buttons=(list,key,value)=>list.map(r=>`<button type="button" data-store-${key}="${r.id}" aria-pressed="${r.id===value}">${e(r.name??r.label)}</button>`).join('');
 const html=`<!doctype html>
<html lang="en"><head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${title} | CAD Test Facility</title>
 <meta name="description" content="Visit Saugat Paneru Virtual Store. Explore its two-floor plan and select Chappal and household plastics on the 3D shelves.">
 <link rel="icon" href="../../../favicon.svg"><link rel="stylesheet" href="../../../workspace.css"><link rel="stylesheet" href="./store.css?v=${revision}">
</head><body>
<main id="main" class="container store-page">
 <header class="store-intro">
  <p class="store-eyebrow">Virtual shop · Concept layout</p><h1>${title}</h1>
  <p>Choose a floor or room, then tap a product on the shelf to see its brand and price.</p>
  <div class="store-tags"><span class="store-tag">${store.levels.length} floors</span><span class="store-tag">${store.pillars.length} aligned pillars</span><span class="store-tag">${store.step} ft spacing</span><span class="store-tag store-sample">${store.items.length} sample products</span></div>
 </header>
 <div id="store-workspace" data-floor="${floor.id}">
  <div class="store-controls" aria-label="Store navigation">
   <div><span class="store-eyebrow" id="store-floor-label">Choose a floor</span><div class="store-button-row" role="group" aria-labelledby="store-floor-label">${buttons(store.levels,'floor',floor.id)}</div></div>
   <div><span class="store-eyebrow" id="store-room-label">Focus a room</span><div class="store-button-row" id="store-rooms" role="group" aria-labelledby="store-room-label">${buttons([{id:'all',name:'All rooms'},...floor.rooms],'room','all')}</div></div>
  </div>
  <div class="store-views">
   <section class="store-panel" id="store-floor-plan">
    <div class="store-panel-head"><div><h2><span>01</span> 2D floor plan</h2><p>${floor.rooms.length} rooms along one open front aisle</p></div></div>
    <div class="store-plan-wrap" id="store-plan-wrap">${renderPlan(store,floor,'all',active?.id)}</div>
    <div class="store-plan-legend"><span><i class="store-key" aria-hidden="true"></i>Pillar</span><span><i class="store-key store-key-shelf" aria-hidden="true"></i>Corner shelf</span><span><i class="store-key store-key-product" aria-hidden="true"></i>Product</span></div>
    <p class="store-panel-note">Pillar centres are ${store.step} ft apart in both directions. The two floors share the same grid.</p>
   </section>
   <section class="store-panel" id="store-3d-shop">
    <div class="store-panel-head"><div><h2><span>02</span> 3D shop</h2><p id="store-model-scope">${e(floor.label)} · All rooms</p></div></div>
    <div class="store-camera-tools" aria-label="3D camera controls">
     <button type="button" id="store-left" aria-label="Rotate left">↶ Left</button><button type="button" id="store-right" aria-label="Rotate right">Right ↷</button><button type="button" id="store-fit">Fit view</button>
     <label>Zoom <input id="store-zoom" type="range" min="1" max="1.8" step=".1" value="1"></label>
    </div>
    <div class="store-scene">
     <canvas id="store-canvas" tabindex="0" aria-label="3D shelves. Drag or use arrow keys to rotate, then select a product."></canvas>
     <div id="store-pins" class="store-pins" aria-label="Products on shelves"></div>
    </div>
    <p id="store-3d-unavailable" class="store-panel-note" hidden>The 3D viewer is unavailable here. Choose a product from the plan or list.</p>
    <div id="store-detail" class="store-detail" role="region" aria-label="Selected product" aria-live="polite" aria-atomic="true" data-selected-item="${active?.id??''}">${renderProduct(active)}</div>
   </section>
  </div>
  <section id="store-products" class="store-catalog">
   <div class="store-catalog-head"><h2>Browse products</h2><span id="store-catalog-count" aria-live="polite">${items.length} products</span><span>Sample brands and prices in NPR</span></div>
   <div class="store-catalog-items" id="store-catalog-items">${renderCatalog(items,active?.id)}</div>
  </section>
 </div>
 <details class="store-source" id="store-layout-basis"><summary>Layout basis and model data</summary>
  <p>The brief sets the two floors, aligned pillars and ${store.step} ft grid. The three bays repeat on both floors. Shelf sizes, wall heights and floor elevations are illustrative; the stair position is still to be set.</p>
  <p>The items, brands and prices are examples. <a href="./data/project.json" download>Download the layout and catalog JSON</a>.</p>
 </details>
 <noscript><p>Enable JavaScript to switch floors, rotate the 3D shop and select products.</p></noscript>
</main>
<script type="application/json" id="store-data">${JSON.stringify(raw).replaceAll('<','\\u003c')}</script>
<script type="module" src="./store.js?v=${revision}"></script>
</body></html>
`;
 await writeFile(new URL('index.html',base),html);
}

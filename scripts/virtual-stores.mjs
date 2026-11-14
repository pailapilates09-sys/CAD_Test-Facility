import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PROJECTS} from '../public/organization/site-model.js';
import {buildStore,floorItems,escapeHTML as e,shelfLabels} from '../public/construction/models/saugat-paneru-virtual-store/store-model.js';
import {renderPlan,renderCatalog,renderProduct,renderShelfLevels} from '../public/construction/models/saugat-paneru-virtual-store/store-view.js';

export async function buildVirtualStores(dist){
 const shared=new URL(PROJECTS.saugat.path,dist);
 const files=['store.js','store-model.js','store-view.js','store-geometry.js','store.css','../layout-designer/design-view3d.js','../virtual-store/apparel-geometry.js'];
 const input=Object.fromEntries(await Promise.all(files.map(async file=>[file,await readFile(new URL(file,shared),'utf8')])));
 const revision=createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0,16);
 for(const file of files.filter(f=>f.endsWith('.js')&&!f.startsWith('../'))){
  await writeFile(new URL(file,shared),input[file].replace(/(from\s*['"])(\.\.?\/[^'"]+\.js)(['"])/g,`$1$2?v=${revision}$3`));
 }
 for(const project of [PROJECTS.saugat,PROJECTS.nabin])await buildStorePage(dist,project,revision);
}

async function buildStorePage(dist,project,revision){
 const base=new URL(project.path,dist);
 const raw=JSON.parse(await readFile(new URL('data/project.json',base),'utf8')),store=buildStore(raw);
 if(raw.id!==project.path.split('/').at(-2)||raw.title!==project.label)throw Error('Store page and model identity differ: '+project.id);
 const {apparel}=store;
 const sharedAssets=apparel?'../'+PROJECTS.saugat.path.split('/').at(-2)+'/':'./';
 const theme=apparel?'showroom.css':'arc-vault.css';
 const themeRevision=createHash('sha256').update(await readFile(new URL(theme,base))).digest('hex').slice(0,16);
 const description=apparel?
  'Explore two floors of sample apparel. Browse stocked racks from the front and locate the selected garment in the 2D floor plan and product table.':
  'Explore Arc Vault display cabinets from the front. Open their doors, switch finishes and locate products in the linked 2D floor plan and table.';
 const heading=(number,label)=>apparel?label:`<span>${number}</span> ${label}`;
 const floor=store.levels[0],room=floor.rooms[0],items=floorItems(store,floor.id,room.id,0,'rear'),active=items[0],facing=store.home.get(active.id),title=e(store.title);
 const buttons=(list,key,value)=>list.map(r=>`<button type="button" data-store-${key}="${r.id}" aria-pressed="${r.id===value}">${e(r.name??r.label)}</button>`).join('');
 const html=`<!doctype html>
<html lang="en"><head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${title} | CAD Test Facility</title>
 <meta name="description" content="${e(description)}">
 <link rel="icon" href="../../../favicon.svg"><link rel="stylesheet" href="../../../workspace.css"><link rel="stylesheet" href="${sharedAssets}store.css?v=${revision}"><link rel="stylesheet" href="./${theme}?v=${themeRevision}">
</head><body>
<main id="main" class="container store-page${apparel?' apparel-store':' arc-store'}">
 <header class="store-intro">
  <p class="store-eyebrow">${apparel?'Apparel showroom · Concept layout':'Arc Vault · Virtual showroom'}</p><h1>${title}</h1>
  <p>${apparel?'Choose a department and tap a garment to see its fabric, sizes, sample price and position.':'Browse the stocked cabinets straight on. Tap a product for a close-up, or tap the glowing crest to control the cabinet.'}</p>
  <div class="store-tags">${apparel?`<span class="store-tag">${store.levels.length} floors</span><span class="store-tag">${store.racks.size} stocked racks</span><span class="store-tag store-sample">${store.items.length} sample garments</span>`:`<span class="store-tag">${store.levels.length} storeys · ${store.storeyHeight} ft each</span><span class="store-tag">${store.bands.length} shelf levels · ${store.cellHeight} ft each</span><span class="store-tag store-sample">${store.items.length} sample products</span>`}</div>
 </header>
 <div id="store-workspace" data-floor="${floor.id}" data-view="shelves">
  <div class="store-controls" aria-label="Store navigation">
   <div><span class="store-eyebrow" id="store-floor-label">Choose a floor</span><div class="store-button-row" role="group" aria-labelledby="store-floor-label">${buttons(store.levels,'floor',floor.id)}</div></div>
   <div><span class="store-eyebrow" id="store-room-label">${apparel?'Department':'Choose a room'}</span><div class="store-button-row" id="store-rooms" role="group" aria-labelledby="store-room-label">${buttons([{id:'all',name:apparel?'All departments':'All rooms'},...floor.rooms],'room',room.id)}</div></div>
   <div id="store-rack-controls" class="store-rack-controls">
    <label class="store-level-label"><span class="store-eyebrow">Category rack</span><select id="store-rack-select">${Object.entries(room.rack_labels).map(([id,label])=>`<option value="${id}">${e(label)} · ${shelfLabels[id]}</option>`).join('')}</select></label>
    <label class="store-level-label"><span class="store-eyebrow">Shelf height</span><select id="store-level-select"><option value="0">All heights</option>${store.bands.map(b=>`<option value="${b.level}">L${b.level} · ${b.low}–${b.high} ft</option>`).join('')}</select></label></div>
  </div>
  <div id="store-3d-slot">
   <section class="store-panel" id="store-3d-shop" data-camera="front"${apparel?'':' data-finish="armor" data-doors="open"'}>
    <div class="store-panel-head"><div>${apparel?'':'<p class="arc-kicker">Arc Vault · Display bay</p>'}<h2>${apparel?'3D showroom':'3D cabinet'}</h2><p id="store-model-scope">${e(floor.label)} · ${e(room.name)} · ${e(room.rack_labels.rear)}</p></div>
     <div class="store-button-row store-mode-buttons" role="group" aria-label="3D view">${buttons([{id:'shelves',name:'Stocked shelves'},{id:'floor',name:'Floor overview'}],'mode','shelves')}</div>
    </div>
    <div class="store-camera-tools" aria-label="3D camera controls">
     <div class="store-button-row" role="group" aria-label="Camera angle">${buttons([{id:'front',name:'Front'},{id:'angled',name:'Angled'}],'camera','front')}</div>
     <div class="store-button-row store-angle-only"><button type="button" id="store-left" aria-label="Rotate left">↶ Left</button><button type="button" id="store-right" aria-label="Rotate right">Right ↷</button></div>
     <button type="button" id="store-fit">Fit view</button>
     <label>Zoom <input id="store-zoom" type="range" min="1" max="2.5" step=".1" value="1"></label>
     <button type="button" class="store-expand" id="store-expand" aria-controls="store-full-dialog" aria-expanded="false">Expand 3D</button>
    </div>
    ${apparel?'':`<div class="arc-deck">
     <div class="arc-deck-head">
      <span class="arc-deck-status" id="store-cabinet-status" role="status">Armor · Doors open</span>
      <button type="button" id="store-cabinet-menu" aria-controls="store-cabinet-options" aria-expanded="false"><span class="arc-core-icon" aria-hidden="true"></span> Cabinet controls</button>
     </div>
     <div id="store-cabinet-options" class="arc-options" hidden>
      <div class="arc-option-group">
       <p id="arc-finish-label">Cabinet finish</p>
       <div class="store-button-row" role="group" aria-labelledby="arc-finish-label">${buttons([{id:'armor',name:'Armor'},{id:'blueprint',name:'Blueprint'},{id:'classic',name:'Classic'}],'finish','armor')}</div>
      </div>
      <div class="arc-option-group">
       <p id="arc-access-label">Cabinet access</p>
       <div class="store-button-row" role="group" aria-labelledby="arc-access-label">
        <button type="button" id="store-cabinet-doors">Close doors</button>
        <button type="button" id="store-cabinet-shelf">Zoom to this shelf</button>
       </div>
      </div>
     </div>
    </div>`}
    <div class="store-stage">
     <div class="store-canvas-area">
      <div class="store-scene-viewport"><div class="store-scene" data-display="rack" data-camera="front">
       <canvas id="store-canvas" tabindex="0" aria-label="3D ${apparel?'showroom':'shop'}. Select a shelf cell or product, or use arrow keys to rotate."></canvas>
       <div id="store-targets" class="store-targets" aria-label="Select products on this rack"></div>
      </div></div>
      <p class="store-display-note" id="store-display-note" role="status">${apparel?'Tap a garment to inspect it. Each level shows sample display stock.':'Tap a product for a close-up, or tap the crest for cabinet controls.'}</p>
      <p id="store-3d-unavailable" class="store-panel-note" hidden>The 3D viewer is unavailable here. Choose a product from the shelf elevation or list.</p>
     </div>
     <div class="store-stage-detail">
      <div id="store-detail" class="store-detail" role="region" aria-label="Selected product" aria-live="polite" aria-atomic="true" data-selected-item="${active?.id??''}">${renderProduct(active,facing)}</div>
      <button type="button" id="store-item-focus" aria-pressed="false">Enlarge this item</button>
      <a class="store-elevation-link" href="#store-floor-plan">Find on the floor plan ↓</a>
      <a class="store-elevation-link" href="#store-shelf-levels">See all ${store.bands.length} shelf levels ↓</a>
     </div>
    </div>
   </section>
  </div>
  <section id="store-products" class="store-catalog">
   <div class="store-catalog-head"><h2>${apparel?'Product table':'Browse products'}</h2><span id="store-catalog-count" aria-live="polite">${items.length} products</span><span>${apparel?'Sample assortment and NPR prices':'Sample assortment · prices shown where supplied in the demo'}</span></div>
   <div class="store-catalog-items" id="store-catalog-items">${renderCatalog(items,active?.id)}</div>
  </section>
  <div class="store-views store-secondary-views">
   <section class="store-panel" id="store-shelf-levels">
    <div class="store-panel-head"><div><h2>${heading('02','Shelf elevation')}</h2><p>Front view · tap a height to browse that level, or tap a product.</p></div></div>
    <div id="store-elevation-grid" class="store-elevation-grid">${renderShelfLevels(store,room.id,facing.id,0,'rear')}</div>
    <p class="store-panel-note">Each row represents ${store.cellHeight} ft of height. Tap a product to find the same position in 3D and on the plan.</p>
   </section>
   <section class="store-panel" id="store-floor-plan">
    <div class="store-panel-head"><div><h2>${heading('03','2D floor plan')}</h2><p>${floor.rooms.length} ${apparel?'departments':'rooms'} along one open front aisle</p></div></div>
    <div class="store-plan-wrap" id="store-plan-wrap">${renderPlan(store,floor,room.id,facing,'rear')}</div>
    <div class="store-plan-legend"><span><i class="store-key" aria-hidden="true"></i>Pillar</span><span><i class="store-key store-key-shelf" aria-hidden="true"></i>Category rack</span><span><i class="store-key store-key-product" aria-hidden="true"></i>Selected product</span></div>
    <p class="store-panel-note">Pillar centres remain ${store.step} ft apart in both directions.</p>
   </section>
  </div>
 </div>
 <dialog id="store-full-dialog" class="store-full-dialog" aria-label="Expanded 3D shop"></dialog>
 <details class="store-source" id="store-layout-basis"><summary>Layout basis and model data</summary>
  ${apparel?`<p>${e(raw.layout_basis)} The model uses two ${store.storeyHeight} ft storeys, eight pillar positions and ${store.step} ft centre-to-centre spacing.</p>
  <p>${e(raw.catalog_basis)}</p>
  <p><a href="${sharedAssets}">Saugat Paneru Virtual Store</a> · <a href="./data/project.json" download>Layout and catalog JSON</a></p>`:`<p>The store keeps its two ${store.storeyHeight} ft storeys and original pillar grid. The shelf elevation shows actual height bands for this concept. The straight-on rack view faces each shelf from its aisle.</p>
  <p><strong>${e(raw.catalog_basis.store)} reference:</strong> the supplied storefront and review describe ${e(raw.catalog_basis.documented_groups.join(', ').toLowerCase())}. The specific styles and repeated display stock are examples. Current inventory, brands and prices were not supplied.</p>
  <p><a href="${e(raw.catalog_basis.merchant_directory)}">eSewa merchant directory</a> · ${raw.catalog_basis.examples.map(s=>`<a href="${e(s.url)}">${e(s.label)}</a>`).join(' · ')} · <a href="./data/project.json" download>Layout and catalog JSON</a></p>`}
 </details>
 <noscript><p>Enable JavaScript to switch floors, rotate the 3D shop and select products.</p></noscript>
</main>
<script type="application/json" id="store-data">${JSON.stringify(raw).replaceAll('<','\\u003c')}</script>
<script type="module" src="${sharedAssets}store.js?v=${revision}"></script>
</body></html>
`;
 await writeFile(new URL('index.html',base),html);
}

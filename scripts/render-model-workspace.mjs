import {buildRoomModel,formatDimensions} from '../public/construction/models/pilates-sketchup/room-model.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderModelItems(scene,navigation){
 const model=buildRoomModel(scene,navigation);
 return model.items.map(item=>`<tr data-item-id="${esc(item.id)}"><td data-label="Item"><button class="item-select" data-item-id="${esc(item.id)}" aria-pressed="false" title="${esc('SketchUp: '+item.sourceName+(item.labelEvidence?' — '+item.labelEvidence:''))}"><span class="item-dot category-${esc(item.category.toLowerCase().replaceAll(' ','-'))}" aria-hidden="true"></span><span><strong>${esc(item.name)}</strong><small>${esc(item.category)}${item.labelStatus==='suggested'?' · suggested name':item.labelStatus==='unresolved'?' · name to confirm':''}${item.geometryAvailable?'':' · placement only'}</small></span></button></td><td data-label="Count" class="item-quantity">${item.quantity}</td><td data-label="Size (m)" class="item-size">${esc(formatDimensions(item))}</td><td data-label="Finish"><span class="item-finishes">${esc(item.finishes.slice(0,2).join(' / ')||'Not specified')}${item.finishes.length>2?` +${item.finishes.length-2}`:''}</span></td></tr>`).join('');
}
export function renderRoomNavigation(n){
 return `<label>Area<select id="room-zone" disabled><option value="all">All areas</option>${n.zones.map(z=>`<option value="${esc(z.id)}">${esc(z.name)}</option>`).join('')}</select></label><label>Viewpoint<select id="saved-view" disabled><optgroup label="Model views"><option value="overview">Room overview</option><option value="zone-overview">Area overview</option><option value="top">Top view</option></optgroup><optgroup label="Original SketchUp viewpoints">${n.views.map(v=>`<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('')}</optgroup></select></label><p id="zone-note">Areas are approximate; shared assemblies may span areas. Source viewpoints show the whole room.</p>`;
}
export function renderRoomScope(scene){
 return `${scene.source.root_placements.toLocaleString('en-IN')} room placements · Optimized display geometry. The drawing reference, distant copy and tea-table transform remain in the source archives.`;
}

import {buildRoomModel,formatDimensions} from '../public/construction/models/pilates-sketchup/room-model.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderModelItems(scene){
 const model=buildRoomModel(scene);
 return model.items.map(item=>`<tr data-item-id="${esc(item.id)}"><td data-label="Item"><button class="item-select" data-item-id="${esc(item.id)}" aria-pressed="false"><span class="item-dot category-${esc(item.category.toLowerCase().replaceAll(' ','-'))}" aria-hidden="true"></span><span><strong>${esc(item.name)}</strong><small>${esc(item.category)}${item.geometryAvailable?'':' · placement only'}</small></span></button></td><td data-label="Count" class="item-quantity">${item.quantity}</td><td data-label="Size (m)" class="item-size">${esc(formatDimensions(item))}</td><td data-label="Finish"><span class="item-finishes">${esc(item.finishes.slice(0,2).join(' / ')||'Not specified')}${item.finishes.length>2?` +${item.finishes.length-2}`:''}</span></td></tr>`).join('');
}
export function renderRoomScope(scene){
 return `${scene.source.root_placements.toLocaleString('en-IN')} room placements · Optimized display geometry. The drawing reference, distant copy and tea-table transform remain in the source archives.`;
}

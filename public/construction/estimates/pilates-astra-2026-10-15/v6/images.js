const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assetFor=(item,assets)=>{if(!item||!assets.has(item.image_id))throw new Error('Missing work item photograph');return assets.get(item.image_id)};
export function photoThumbnail(item,assets){
 const a=assetFor(item,assets);
 return `<figure class="scope-photo" data-image-item="${esc(item.item_id)}"><button class="photo-button" data-detail="${esc(item.item_id)}" aria-label="View reference image and full scope: ${esc(item.title)}"><img src="${esc(a.local_path)}" width="${a.width}" height="${a.height}" alt="${esc(item.alt)}" loading="lazy" decoding="async"><span>Reference image · view details ↗</span></button><figcaption>${esc(item.caption)}</figcaption></figure>`;
}
export function photoDetail(item,assets){
 const a=assetFor(item,assets);
 return `<figure class="detail-photo"><a href="${esc(a.local_path)}" target="_blank" rel="noopener" aria-label="Open full reference image"><img src="${esc(a.local_path)}" width="${a.width}" height="${a.height}" alt="${esc(item.alt)}" decoding="async"></a><figcaption><strong>Reference image · ${esc(item.caption)}</strong><p>${esc(item.scope_note)}</p><p>Photo: ${esc(a.author)} · <a href="${esc(a.source_page)}" target="_blank" rel="noopener">${esc(a.title)} ↗</a> · <a href="${esc(a.license_url)}" target="_blank" rel="noopener">${esc(a.license)}</a></p><p>${esc(a.modifications)} This is an illustrative example, not a project photograph or verified specification.</p></figcaption></figure>`;
}
export function renderImageCredits(register){
 const $=id=>document.getElementById(id);
 $('image-summary').textContent=`${register.items.length} detailed work items · ${register.assets.length} sourced reference images · each item has its own image mapping and scope note. Related items may share an image.`;
 $('image-credits').innerHTML=register.assets.map(a=>`<li id="credit-${esc(a.id)}"><a href="${esc(a.local_path)}" target="_blank" rel="noopener">View image ↗</a> · <strong>${esc(a.title)}</strong><br>${esc(a.author)} · <a href="${esc(a.license_url)}" target="_blank" rel="noopener">${esc(a.license)}</a> · <a href="${esc(a.source_page)}" target="_blank" rel="noopener">Original file + license ↗</a><br>${esc(a.modifications)}<br>Used for: ${register.items.filter(x=>x.image_id===a.id).map(x=>esc(x.item_id)).join(', ')}.</li>`).join('');
}

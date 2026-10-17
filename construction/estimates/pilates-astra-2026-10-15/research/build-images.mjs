import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../../../../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const comparison=JSON.parse(await readFile(new URL('v5/comparison.json',base))),source=JSON.parse(await readFile(new URL('v6/image-assets.json',base)));
if(source.errors.length)throw new Error('Image download errors must be resolved');
for(const asset of source.assets){const bytes=await readFile(new URL('v6/'+asset.local_path,base));if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Image integrity check failed: '+asset.id)}
const map={
 reception:['cabinet','marble','reception-desk','shoe-rack','rattan','glass-door','air-conditioner','led-strip','ceiling-light','chandelier','painting','gypsum','signage','false-ceiling','sofa','granite-table'],
 'coffee-lounge':['sofa','marble','counter','skirting','pvc-panel','ceiling-light','painting','air-conditioner','false-ceiling','glass-table','led-strip','pendant-light','sink'],
 'locker-space':['lockers','cabinet','pvc-panel','pendant-light','putty','air-conditioner','gypsum','led-strip','signage','sliding-door'],
 studio:['cabinet','wood-mirror','curtain','pvc-panel','painting','led-strip','air-conditioner','cement-board'],
 'changing-room':['cement-board','curtain'],
 washroom:['wood-mirror','wall-art']
};
const notes={
 cabinet:['Storage cupboard example','Storage cupboard reference only. The photographed board grade, laminate, hardware, partitions, dimensions and final finish are not verified against the quote.'],
 marble:['Marble tile texture example','Photographic marble tile texture reference only; the quoted marble slab installation is not shown. Slab grade, thickness, edge treatment, adhesive, polishing and installed dimensions are not established by this image.'],
 'reception-desk':['Reception desk example','Desk form and reception use only. The photo does not verify WPC cladding, the approved profile, accessories or the final studio design.'],
 'shoe-rack':['Shoe storage rack example','Shoe-storage function only. This existing rack is not the approved joinery design, capacity, finish or fixing specification.'],
 rattan:['Woven cane material detail','Woven cane pattern reference only. The quoted board, backing and installation are not shown. The source says “ratten board”; its intended material, weave, backing and fixing remain unconfirmed.'],
 'glass-door':['Glass entrance door example','Glass entrance-door reference only. Glass thickness, tempering, frame, hinges, patch fittings and dimensions require approved details.'],
 'air-conditioner':['Split AC indoor unit example','Indoor split-unit appearance only. No capacity, brand, piping, outdoor unit, wiring, supports or installed performance is verified. Source “1.5 MT” wording remains unchanged.'],
 'led-strip':['LED strip material example','Strip light product reference only. Colour temperature, wattage, profile, driver, wiring, location and installation scope remain unspecified.'],
 'ceiling-light':['Ceiling lighting layout example','Installed ceiling-light layout example only. Lamp technology, wardrobe lights, lighting points, wiring and the final fixture selection are not verified.'],
 chandelier:['Hanging chandelier example','Decorative hanging light example only. The approved chandelier model, size, supports, wiring and fixture count remain to be confirmed.'],
 painting:['Paint roller tool example','Paint roller tool reference only. No completed wall is shown. Paint grade, colour, substrate preparation, putty layers, primer, coats and finished quality are not specified by this photograph.'],
 'false-ceiling':['Suspended ceiling example','Suspended ceiling system example only. The image does not verify board or tile type, framing, lighting points, fixing or the approved ceiling layout.'],
 gypsum:['Gypsum board material detail','Gypsum board and fixing detail only. This straight board example does not demonstrate the quoted ceiling design, curved geometry, framing, lighting points or complete installation.'],
 signage:['Illuminated lettering example','Generic signage and lettering example only. The visible name belongs to another location; it is not Paila branding or the approved sign design, size, lighting or mounting.'],
 sofa:['Upholstered sofa example','Seating and upholstery example only. Hardwood frame, board grade, foam thickness, fabric, cushion design and dimensions are not verified against the custom quote.'],
 'granite-table':['Granite tabletop example','Granite tabletop material and support example only. The photographed dining table is not the quoted centre table; size, base, grade and fixtures remain unverified.'],
 counter:['Countertop surface detail','Countertop appearance only. The approved counter table design, height, board or slab material, supports, hardware and finish are not verified.'],
 skirting:['Skirting profile example','Edge-trim/skirting example only. This building baseboard is not verified as the counter skirting; profile, material, dimensions and fixing require a detail.'],
 'pvc-panel':['PVC panel material example','PVC hollow-panel material reference only. The photographed translucent panel is not the approved decorative wall panel; finish, grade, framing and fixing are not verified.'],
 'glass-table':['Glass coffee table example','Glass-table furniture example only. The irregular top shape, stools/seating, glass grade, supports and dimensions in the quote are not verified.'],
 'pendant-light':['Pendant light fixture example','Hanging-light appearance only. Fixture model, quantity, wiring, supports, accessories and final positions are not verified.'],
 sink:['Kitchen sink display example','Kitchen sink product display only. The tap and installed plumbing are not shown. Bowl size, steel grade, mixer, waste, trap, plumbing and fixing scope are not verified against the quote.'],
 lockers:['Wooden locker example','Locker layout and door reference only. Plywood grade, Formica finish, compartments, locks, ventilation, dimensions and approved joinery details are not verified.'],
 putty:['Wall joint finishing example','Surface filling/finishing process reference only. Drywall joint compound is shown, not confirmation of the quoted plaster-wall putty product, substrate, coat system or finish.'],
 'sliding-door':['Sliding door example','Sliding-door arrangement reference only. Door material, track, panel size, hardware, glazing and the exact quoted opening remain unverified.'],
 'wood-mirror':['Framed wall mirror example','Framed mirror example only. Frame material, Formica, decorative design, dimensions, supports and fixing are not verified against either mirror item.'],
 curtain:['Sheer curtain hanging example','Fabric hanging, pleats and rings reference only. The approved curtain opacity, length, width, fabric grade, rod, supports and accessories remain unverified.'],
 'cement-board':['Cement board material example','Cement-board material reference only. It does not verify the complete partition, aluminium frame, thickness, joints, fire/moisture rating, layout or fixtures.'],
 'wall-art':['Installed wall art example','Installed wall-art/decorative painting example only. The displayed artwork is not the approved studio decoration; design, size, surface treatment and fixings require a specification.']
};
const offsets=new Map();
const items=comparison.items.map(x=>{
 const offset=offsets.get(x.section_id)??0;offsets.set(x.section_id,offset+1);
 const image_id=map[x.section_id]?.[offset];if(!image_id||!source.assets.some(a=>a.id===image_id))throw new Error(`Missing image for ${x.id}`);
 let [caption,scope_note]=notes[image_id];
 if(x.id==='reception-001')scope_note+=' The specified curved form is not shown.';
 if(x.id==='locker-space-002')scope_note+=' This is a cabinet example, not a photographed cleaning-supply closet.';
 if(x.id==='changing-room-002')scope_note+=' A sheer example is used; changing-room privacy and fabric opacity must be chosen separately.';
 return {item_id:x.id,section_id:x.section_id,title:x.title,image_id,caption,alt:`Reference image for ${x.title}: ${caption.toLowerCase()}.`,scope_note,role:'illustrative_reference',project_photo:false,exact_scope_verified:false,original_status:x.status,original_values_retained:true};
});
const register={schema_version:'work-item-images-1.0.0',version:'v6',based_on:'v5.1',created_date:'2026-10-17',policy:{images:'Sourced reference images of work, products, materials or methods, not project photographs or approved designs. Related items may share one image. Each item retains an explicit scope qualification.',values:'All original values and six holds retained. V5.1 graphs preserved.',v7:'Deferred: separate labour and material rates for all works; no allocation or new rate split is assigned in v6.'},coverage:{detailed_items:items.length,mapped_items:items.length,unique_reference_images:source.assets.length,project_photographs:0,exact_specifications_verified:0},assets:source.assets,items};
await writeFile(new URL('v6/image-register.json',base),JSON.stringify(register,null,2)+'\n');
await writeFile(new URL('v6/image-items.jsonl',base),items.map(x=>JSON.stringify(x)).join('\n')+'\n');
await writeFile(new URL('v6/IMAGE-CREDITS.md',base),'# V6 reference photograph credits\n\nThese are illustrative reference photographs, not photos of the Paila project. Each photograph retains the license below. '+source.assets[0].modifications+'\n\n'+source.assets.map(a=>`- **${a.id} — ${a.title}**\n  Author: ${a.author}. [${a.license}](${a.license_url}). [Original file and license](${a.source_page}). Retrieved ${a.retrieved_date}. Local SHA-256: ${a.sha256}.`).join('\n\n')+'\n');
console.log(`Mapped ${items.length} items to ${source.assets.length} reference images.`);

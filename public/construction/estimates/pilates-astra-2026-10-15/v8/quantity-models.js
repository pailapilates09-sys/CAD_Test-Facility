// Authored planning scenarios. Defaults are assumptions, never measured dimensions
// or manufacturer installation instructions. Source quantities remain separate.
import {M2_PER_FT2,M_PER_FT,SHEET_M2,numberOrNull} from './calculations.js';
const field=(label,value,min=0,whole=false)=>({label,value,min,whole});
const waste=()=>field('Cut / waste allowance (%)',10);
export function createQuantityModel(source,rows){
 const has=id=>rows.some(r=>r.material_id===id),q=Number(source.quantity)*Number(source.no??1);
 const area=source.unit_code==='ft2'?q*M2_PER_FT2:null,length=source.unit_code==='ft'?q*M_PER_FT:null;
 const count=source.unit_code==='each'?q:null;
 let family,parameters={},limitations=[];
 if(has('hardware')&&has('ply18')){
  family='joinery';const tall=source.id.startsWith('locker-space');
  parameters={height_m:field('Assumed front height (m)',tall?1.8:.9,.1),depth_m:field('Assumed depth (m)',has('wpc')?.6:.45,.1),module_width_m:field('Maximum module width (m)',tall?.45:.6,.1),shelves:field('Shelves per module',tall?3:1,0,true),hinges_per_door:field('Hinges per assumed door',tall?3:2,0,true),hinges_per_sale_unit:field('Assumed hinges per sale unit',1,1,true),laminate_faces:field('Laminated faces per main board',2,0,true),laminate_sheet_m2:field('Assumed laminate sheet area (m²)',SHEET_M2,.1),glue_kg_m2:field('Assumed adhesive use (kg/m²)',.2,0),waste_percent:waste()};
  limitations=['Source work area is assumed to be front elevation area. Depth, shelves and door layout are reference assumptions.','Box model includes ends, top/bottom, partitions, shelves and one door per module. Curved geometry and nesting are not measured.','Laminate sheet area and adhesive use are editable planning inputs, not verified supplier specifications. Separate work totals round packs independently; pooled purchasing can need fewer packs.'];
 }else if(has('rod')){
  family='curtain';parameters={drop_m:field('Assumed finished drop (m)',2.7,.1),fullness:field('Cloth fullness multiplier',2,1),fabric_width_m:field('Usable fabric width (m)',1.4,.1),hem_m:field('Hem / heading per drop (m)',.3,0),openings:field('Assumed opening count',1,1,true),rod_extra_m:field('Rod extra per opening (m)',.3,0)};
  limitations=['Quoted m² is assumed to be finished span × drop, before fullness. If it already includes gathered cloth, adjust fullness to avoid counting it twice.','Drop, cloth width and opening count are assumed. Pattern repeat and supplier cut layout remain unverified. Fullness 2 is a scenario within existing S15 guide references.'];
 }else if(has('cementboard')){
  family='partition';parameters={height_m:field('Assumed wall height (m)',2.7,.1),faces:field('Board faces per quoted wall area',2,1,true),layers:field('Layers on each face',1,1,true),stud_spacing_m:field('Assumed stud spacing (m)',.6,.1),waste_percent:waste()};
  limitations=['Source area is assumed to be one wall elevation. If both faces are already measured in the quote, change faces to 1.','Framing is a rectangular planning layout retaining the specified aluminium. Section, gauge, fixing, fire performance and engineering suitability are not established.'];
 }else if(has('gypsum')){
  family='ceiling';parameters={area_m2:field('Ceiling area used (m²)',area,0),aspect_ratio:field('Assumed length / width ratio',2,.1),layers:field('Board layers',1,1,true),primary_spacing_m:field('Assumed primary channel spacing (m)',1.2,.1),secondary_spacing_m:field('Assumed secondary channel spacing (m)',.4,.1),hanger_spacing_m:field('Assumed hanger spacing (m)',1.2,.1),waste_percent:waste()};
  limitations=['Area is modelled as a rectangle. Channel lengths and hanger counts use the assumed layout; profiles, drop lengths and fixing details still need design confirmation.','Curved work is estimated by surface area only. Bending radius, actual board type and extra framing are unverified. Source points cannot be converted to ceiling m² without an area input.'];
 }else if(has('pvc')){
  family='panel';parameters={height_m:field('Assumed panelled height (m)',2.7,.1),batten_spacing_m:field('Assumed batten spacing (m)',.6,.1),waste_percent:waste()};
  limitations=['Source m² is assumed to be panel face area. Rectangular elevation and vertical batten layout are assumptions; openings and corners are not known.'];
 }else if(has('mirror')){
  family='mirror';parameters={height_m:field('Assumed mirror panel height (m)',1.8,.1),panel_width_m:field('Maximum mirror panel width (m)',.9,.1),frame_band_m:field('Laminate band width (m)',.05,0),waste_percent:waste()};
  limitations=['Panel height and subdivision are assumptions. Frame timber is a perimeter length, not a timber volume; the section remains unspecified.','Mirror panel glass area remains the source area. Laminate covers the modelled frame band, not the glass.'];
 }else if(has('marble')){
  family='stone';parameters={bed_mm:field('Assumed adhesive bed (mm)',4,0),density_kg_m3:field('Assumed adhesive density (kg/m³)',1600,.1),waste_percent:waste()};
  limitations=['Adhesive = net stone area × bed thickness × assumed density. Product consumption and substrate preparation still require the selected supplier specification.'];
 }else if(has('sofa')){
  family='sofa';parameters={units:field(source.unit_code?'Source sofa count':'Assumed sofa count · source unit missing',q,0,true),length_m:field('Assumed sofa length (m)',1.8,.1),depth_m:field('Assumed seat depth (m)',.6,.1),back_height_m:field('Assumed back height (m)',.45,.1),seat_foam_m:field('Assumed seat foam thickness (m)',.1,0),back_foam_m:field('Assumed back foam thickness (m)',.075,0),timber_section_m2:field('Assumed timber section area (m²)',.0025,.0001),fabric_width_m:field('Usable fabric width (m)',1.4,.1),waste_percent:waste()};
  limitations=['A reference box-frame sofa is assumed, with four legs/uprights, perimeter rails, seat/back panels and two arm panels. Actual dimensions, sections, density and upholstery pattern are not supplied.','Reception couch source quantity has no unit; its use as a sofa count is an explicit assumption.'];
 }else if(has('copper')){
  family='ac';parameters={pipe_per_unit_m:field('Assumed copper-pair route per AC (m)',3,0),drain_per_unit_m:field('Assumed drain route per AC (m)',3,0),cable_per_unit_m:field('Assumed cable route per AC (m)',5,0)};
  limitations=['Routes are per-unit planning allowances, not measured routes. Check included pipe, cable and supports before ordering additional material.','A source 1.5 MT is not confirmed cooling tonnage; the existing AC price option stays conditional.'];
 }else if(has('strip')){
  family='strip';parameters={watts_per_m:field('Assumed strip load (W/m)',10,.1),driver_watts:field('Assumed driver rating (W)',60,.1),driver_load_percent:field('Assumed usable driver load (%)',80,.1),max_feed_m:field('Assumed maximum run per feed (m)',5,.1),cable_per_feed_m:field('Assumed cable route per feed (m)',3,0)};
  limitations=['Driver count is a budgeting scenario only. Actual strip voltage, wattage, manufacturer limits, cable size and feed layout must be selected; this is not an electrical design.'];
 }else if(has('putty')){
  family='paint';parameters={primer_coverage_m2_l:field('Assumed primer coverage (m²/L)',10,.1),primer_coats:field('Assumed primer coats',1,0,true)};
  limitations=['Putty and topcoat keep the existing source-backed coverage examples. Primer coverage is an authored planning assumption, not verified for the selected product. Mixed abrasive/repair kits still require contents.'];
 }else if(has('panelLight')||has('chandelier')||has('pendant')){
  family='lighting';parameters={cable_per_fixture_m:field('Assumed cable route per fixture (m)',3,0)};
  limitations=['Fixture counts come from the quote. Cable is an allowance per fixture, not a measured circuit. Bulb counts and connector kits still depend on the luminaire selection.'];
 }else if(has('sink')){
  family='sink';parameters={water_route_m:field('Assumed water route per sink (m)',3,0),waste_route_m:field('Assumed drain route per sink (m)',2,0)};
  limitations=['Combined route length is a planning total; water and drain require different pipes and fittings. Confirm routes and avoid overlap with the electrical/plumbing allowance.'];
 }else return null;
 return {schema_version:'work-quantity-model-1.0.0',family,source:{quantity:q,area_m2:area,length_m:length,count,unit_code:source.unit_code},parameters,limitations,authority:'Authored planning scenario; not a surveyed cut list, accepted supplier take-off or engineering design.'};
}
const f=n=>Number(n).toLocaleString('en-IN',{maximumFractionDigits:4});
export function deriveQuantities(model,overrides={}){
 if(!model)return {valid:true,quantities:{},summary:[],errors:[]};
 const p={},errors=[];for(const [key,def] of Object.entries(model.parameters)){
  const n=numberOrNull(Object.hasOwn(overrides,key)?overrides[key]:def.value);
  if(n===null||n<def.min||(def.whole&&!Number.isInteger(n)))errors.push(def.label+' needs '+(def.whole?'a whole number':'a number')+' ≥ '+def.min+'.');else p[key]=n;
 }
 if(p.driver_load_percent>100)errors.push('Usable driver load cannot exceed 100%.');
 if(errors.length)return {valid:false,quantities:{},summary:[],errors};
 const {area_m2:A,length_m:L,count:N}=model.source,w=1+(p.waste_percent??0)/100,quantities={},summary=[];
 const set=(id,quantity,formula)=>{quantities[id]={quantity,basis:formula,classification:'planning_model'};};
 const dimensions=(W,H)=>summary.push(`Reference width ${f(W)} m × height ${f(H)} m; source area ${f(A)} m².`);
 switch(model.family){
 case 'joinery':{
  const H=p.height_m,D=p.depth_m,W=A/H,n=A===0?0:Math.ceil(W/p.module_width_m);
  const cut=A===0?0:2*H*D+(2+p.shelves)*W*D+Math.max(n-1,0)*H*D+A,back=A,bond=cut*p.laminate_faces+back;
  dimensions(W,H);summary.push(`${n} assumed modules / doors; main board cut area ${f(cut)} m² before allowance; back area ${f(back)} m².`);
  set('ply18',Math.ceil(cut*w/SHEET_M2),`ceil((2HD + (2 + shelves)WD + (modules − 1)HD + front area) × ${f(w)} ÷ ${f(SHEET_M2)}) = sheets. Main cut area ${f(cut)} m²; door area equals source front area.`);
  set('ply12',Math.ceil(back*w/SHEET_M2),`ceil(back area ${f(back)} m² × ${f(w)} ÷ ${f(SHEET_M2)} m²/sheet).`);
  set('laminate',Math.ceil(bond*w/p.laminate_sheet_m2),`ceil((main board area ${f(cut)} × ${p.laminate_faces} faces + back ${f(back)}) × ${f(w)} ÷ assumed ${f(p.laminate_sheet_m2)} m²/sheet).`);
  set('glue',Math.ceil(bond*p.glue_kg_m2*w/10),`ceil(bond area ${f(bond)} m² × assumed ${f(p.glue_kg_m2)} kg/m² × ${f(w)} ÷ 10 kg/pack).`);
  set('hinge',Math.ceil(n*p.hinges_per_door/p.hinges_per_sale_unit),`ceil(${n} assumed doors × ${p.hinges_per_door} hinges/door ÷ assumed ${p.hinges_per_sale_unit} hinges/sale unit). Confirm supplier pack contents before using this price.`);
  set('edges',(2*(W+n*H)+p.shelves*W)*w,`(door-edge perimeter 2 × (width + doors × height) + exposed shelf-front lengths) × ${f(w)}.`);
  set('wpc',A*w,`Source front area ${f(A)} m² × ${f(w)}; desk facing only, not a complete desk skin.`);break;
 }
 case 'curtain':{
  const W=A/p.drop_m,drops=A===0?0:Math.ceil(W*p.fullness/p.fabric_width_m),cloth=drops*(p.drop_m+p.hem_m);
  dimensions(W,p.drop_m);summary.push(`${drops} full-width cloth drops; assumed fullness ${f(p.fullness)}; usable cloth width ${f(p.fabric_width_m)} m.`);
  set('sheer',cloth,`${drops} drops = ceil((source area ÷ drop) × fullness ÷ fabric width); cloth = drops × (drop + hem) = ${f(cloth)} linear m.`);
  set('curtain',cloth,`ceil((source area ÷ drop) × fullness ÷ fabric width) × (drop + hem) = ${f(cloth)} linear m. Fabric type remains unselected.`);
  set('rod',A===0?0:W+p.openings*p.rod_extra_m,`Source area ÷ assumed drop + ${p.openings} openings × ${f(p.rod_extra_m)} m extension.`);break;
 }
 case 'partition':{
  const W=A/p.height_m,studs=A===0?0:Math.ceil(W/p.stud_spacing_m)+1,frame=(studs*p.height_m+2*W)*w;
  dimensions(W,p.height_m);summary.push(`${studs} assumed studs; ${p.faces} faces × ${p.layers} layers.`);
  set('cementboard',A*p.faces*p.layers*w,`Source one-face wall area ${f(A)} × ${p.faces} faces × ${p.layers} layers × ${f(w)}. Change faces if quote already measures both sides.`);
  set('aluminium',frame,`(${studs} studs × ${f(p.height_m)} m + top/bottom track 2 × ${f(W)} m) × ${f(w)}; total member length, sections priced separately.`);break;
 }
 case 'ceiling':{
  const C=p.area_m2,W=Math.sqrt(C/p.aspect_ratio),D=W*p.aspect_ratio,primary=C===0?0:(Math.ceil(W/p.primary_spacing_m)+1)*D,secondary=C===0?0:(Math.ceil(D/p.secondary_spacing_m)+1)*W,perimeter=2*(W+D);
  summary.push(`Reference ceiling ${f(D)} m × ${f(W)} m; ${f(C)} m². Channels: primary ${f(primary)} m, secondary ${f(secondary)} m, perimeter ${f(perimeter)} m before allowance.`);
  set('gypsum',C*p.layers*w,`Ceiling area ${f(C)} m² × ${p.layers} layers × ${f(w)}; curved surface and extra framing unverified.`);
  set('metalframe',(primary+secondary+perimeter)*w,`(primary ${f(primary)} + secondary ${f(secondary)} + perimeter ${f(perimeter)}) × ${f(w)} m; channels only, profiles need separate quotes.`);
  set('hangers',C===0?0:(Math.ceil(W/p.primary_spacing_m)+1)*(Math.ceil(D/p.hanger_spacing_m)+1),`Assumed primary channel lines × (ceil(length ÷ ${f(p.hanger_spacing_m)} m hanger spacing) + 1). Assemblies exclude unmeasured suspension drop lengths.`);break;
 }
 case 'panel':{
  const W=A/p.height_m,n=A===0?0:Math.ceil(W/p.batten_spacing_m)+1;
  dimensions(W,p.height_m);set('pvc',A*w,`Source panel area ${f(A)} m² × ${f(w)}.`);
  set('frame',(n*p.height_m+2*W)*w,`(${n} assumed vertical battens × ${f(p.height_m)} m + top/bottom 2 × ${f(W)} m) × ${f(w)}.`);
  set('trim',A===0?0:2*(W+p.height_m)*w,`Rectangular perimeter 2 × (width ${f(W)} + height ${f(p.height_m)}) × ${f(w)}; additional corners excluded.`);break;
 }
 case 'mirror':{
  const W=A/p.height_m,n=A===0?0:Math.ceil(W/p.panel_width_m),perimeter=2*(W+n*p.height_m);
  dimensions(W,p.height_m);summary.push(`${n} assumed framed panels; unadjusted total panel perimeter ${f(perimeter)} m.`);
  set('woodframe',perimeter*w,`Total individual panel perimeter 2 × (total width + ${n} panels × height) × ${f(w)}.`);
  set('laminate',Math.ceil(perimeter*p.frame_band_m*w/SHEET_M2),`ceil(frame perimeter ${f(perimeter)} m × assumed band ${f(p.frame_band_m)} m × ${f(w)} ÷ assumed ${f(SHEET_M2)} m²/sheet). Supplier sheet dimensions need confirmation.`);break;
 }
 case 'stone':set('stoneglue',A*p.bed_mm/1000*p.density_kg_m3*w,`Net stone area ${f(A)} m² × assumed bed ${f(p.bed_mm)} mm ÷ 1000 × density ${f(p.density_kg_m3)} kg/m³ × ${f(w)}.`);break;
 case 'sofa':{
  const n=p.units,X=p.length_m,D=p.depth_m,H=p.back_height_m,cut=n*(X*D+X*H+2*D*H),timber=n*(4*(X+D)+8*H+2*X);
  summary.push(`${n} reference sofas, each ${f(X)} m long × ${f(D)} m seat depth; dimensions not surveyed.`);
  set('sofa',timber*p.timber_section_m2*w,`Reference rails/legs length ${f(timber)} m × assumed section ${f(p.timber_section_m2)} m² × ${f(w)}.`);
  set('ply18',Math.ceil(cut*w/SHEET_M2),`ceil(reference seat + back + arm panel area ${f(cut)} m² × ${f(w)} ÷ ${f(SHEET_M2)} m²/sheet).`);
  set('foam',n*(X*D*p.seat_foam_m+X*H*p.back_foam_m)*w,`Units × (seat L × D × foam thickness + back L × H × foam thickness) × ${f(w)}; foam density and arm/cushion details unverified.`);
  set('fabric',(2*cut)*w/p.fabric_width_m,`Twice reference seat/back/arm panel area ${f(cut)} m² × ${f(w)} ÷ usable fabric width ${f(p.fabric_width_m)} m; no pattern matching allowance.`);break;
 }
 case 'ac':set('copper',N*p.pipe_per_unit_m,`${N} source AC units × assumed ${f(p.pipe_per_unit_m)} m copper-pair route per unit. Check in-box pipe before purchase.`);set('drain',N*p.drain_per_unit_m,`${N} source units × assumed ${f(p.drain_per_unit_m)} m drain per unit.`);set('cable',N*p.cable_per_unit_m,`${N} source units × assumed ${f(p.cable_per_unit_m)} m electrical route per unit; conductor count not implied.`);break;
 case 'strip':{
  const max=Math.min(p.max_feed_m,p.driver_watts*p.driver_load_percent/100/p.watts_per_m),drivers=L===0?0:Math.ceil(L/max);
  summary.push(`Net run ${f(L)} m; usable scenario feed length ${f(max)} m; ${drivers} assumed drivers/feeds.`);
  set('driver',drivers,`ceil(${f(L)} m ÷ min(${f(p.max_feed_m)} m, ${f(p.driver_watts)} W × ${f(p.driver_load_percent)}% ÷ ${f(p.watts_per_m)} W/m)).`);
  set('cable',drivers*p.cable_per_feed_m,`${drivers} modelled feeds × assumed ${f(p.cable_per_feed_m)} m route per feed.`);break;
 }
 case 'paint':if(A!==null)set('primer',A*p.primer_coats/p.primer_coverage_m2_l,`Wall area ${f(A)} m² × assumed ${p.primer_coats} coats ÷ ${f(p.primer_coverage_m2_l)} m²/L. Actual product coverage not confirmed.`);break;
 case 'lighting':set('cable',N*p.cable_per_fixture_m,`${N} source fixture units × assumed ${f(p.cable_per_fixture_m)} m route per fixture. New circuits and conductor counts not included.`);break;
 case 'sink':set('plumbing',N*(p.water_route_m+p.waste_route_m),`${N} sinks × (${f(p.water_route_m)} m water + ${f(p.waste_route_m)} m waste) per sink. Different pipe specifications require separate quotes.`);break;
 }
 return {valid:true,quantities,summary,errors:[]};
}

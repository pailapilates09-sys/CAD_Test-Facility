// Millimetres. Geometry is independent of the number of display samples.
import {unitMass} from '../v5/fabrication-math.js';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length=a=>Math.hypot(...a),unit=a=>mul(a,1/length(a));
const positive=(x,k)=>{if(!Number.isFinite(x)||x<=0)throw Error(k+' must be positive and finite');return x;};
// Closest distance of finite 2D/3D segments, including degenerate segments.
export function segmentDistance(a,b,c,d){
 const u=sub(b,a),v=sub(d,c),w=sub(a,c),A=dot(u,u),B=dot(u,v),C=dot(v,v),D=dot(u,w),E=dot(v,w),den=A*C-B*B;let s=den>1e-16?Math.max(0,Math.min(1,(B*E-C*D)/den)):0,t=C>1e-16?(B*s+E)/C:0;
 if(t<0){t=0;s=A>1e-16?Math.max(0,Math.min(1,-D/A)):0;}else if(t>1){t=1;s=A>1e-16?Math.max(0,Math.min(1,(B-D)/A)):0;}
 return length(sub(add(a,mul(u,s)),add(c,mul(v,t))));
}
export function sampledSelfClearance(shape){
 const p=shape.points,s=[0];for(let i=1;i<p.length;i++)s.push(s.at(-1)+length(sub(p[i],p[i-1])));
 let minimum=Infinity;const localExclusion=Math.PI*shape.radius_mm+2*shape.diameter_mm;
 for(let i=1;i<p.length;i++)for(let j=i+2;j<p.length;j++){if(s[j-1]-s[i]<localExclusion)continue;minimum=Math.min(minimum,segmentDistance(p[i-1],p[i],p[j-1],p[j]));}
 return {minimum_sampled_nonlocal_axis_distance_mm:Number.isFinite(minimum)?minimum:null,minimum_sampled_nonlocal_clear_mm:Number.isFinite(minimum)?minimum-shape.diameter_mm:null,local_path_exclusion_mm:localExclusion,display_chord_error_mm:shape.radius_mm*(1-Math.cos(Math.PI/72)),method:'At most5-degree chords; nearby connected portions excluded. This is a geometric screen, not a manufacturing or structural tolerance check.'};
}
export function twoPieceBeamLink({widthMm,depthMm,diameterMm=8,mandrelDiameterMm=6*diameterMm,tailMm=10*diameterMm,pieceGapMm=6}){
 for(const [k,x]of Object.entries({widthMm,depthMm,diameterMm,mandrelDiameterMm,tailMm,pieceGapMm}))positive(x,k);
 const r=(mandrelDiameterMm+diameterMm)/2,W=widthMm,H=depthMm;
 if(Math.min(W,H)<=2*r)throw Error('Bend tangents do not fit the cross section');
 if(tailMm<Math.max(6*diameterMm,65))throw Error('Hook tail does not meet the selected NBC minimum');
 // Open the U on the longer side. This keeps the two inward hooks apart in narrow beams.
 let ring=[[-W/2,-H/2],[W/2,-H/2],[W/2,H/2],[-W/2,H/2]];
 const openingEdge=W>=H?0:1;ring=Array.from({length:4},(_,i)=>ring[(openingEdge+1+i)%4]);
 const dirs=ring.map((p,i)=>unit(sub(ring[(i+1)%4],p))),centres=ring.map((p,i)=>add(p,mul(sub(dirs[i],dirs[(i+3)%4]),r)));
 function builder(){const points=[],segments=[];return {points,segments,line(a,b){const L=length(sub(b,a));if(!points.length)points.push(a);segments.push({kind:'straight',a,b,length_mm:L});points.push(b);return b;},arc(center,start,sweep){const a=add(center,[r*Math.cos(start),r*Math.sin(start)]),b=add(center,[r*Math.cos(start+sweep),r*Math.sin(start+sweep)]);if(!points.length)points.push(a);segments.push({kind:'arc',center,a,b,radius_mm:r,angle_degrees:Math.abs(sweep)*180/Math.PI,length_mm:r*Math.abs(sweep)});const n=Math.ceil(Math.abs(sweep)*180/Math.PI/5);for(let j=1;j<=n;j++)points.push(add(center,[r*Math.cos(start+sweep*j/n),r*Math.sin(start+sweep*j/n)]));return b;}};}
 const angle=(p,c)=>Math.atan2(p[1]-c[1],p[0]-c[0]);
 function startHook(b,corner,outgoing){const end=add(ring[corner],mul(outgoing,r)),a=angle(end,centres[corner])-3*Math.PI/4,p=add(centres[corner],[r*Math.cos(a),r*Math.sin(a)]),tip=sub(p,mul([-Math.sin(a),Math.cos(a)],tailMm));b.line(tip,p);return b.arc(centres[corner],a,3*Math.PI/4);}
 function endHook(b,corner,incoming,current){const entry=sub(ring[corner],mul(incoming,r));b.line(current,entry);const a=angle(entry,centres[corner]),p=b.arc(centres[corner],a,3*Math.PI/4);return b.line(p,add(p,mul([-Math.sin(a+3*Math.PI/4),Math.cos(a+3*Math.PI/4)],tailMm)));}
 const U=builder();let p=startHook(U,0,dirs[0]);for(let i=1;i<=2;i++){const entry=sub(ring[i],mul(dirs[i-1],r));U.line(p,entry);p=U.arc(centres[i],angle(entry,centres[i]),Math.PI/2);}endHook(U,3,dirs[2],p);
 const cap=builder();p=startHook(cap,3,dirs[3]);endHook(cap,0,dirs[3],p);
 const offset=diameterMm+pieceGapMm;
 const finish=(b,label,zOffset)=>{const straight=b.segments.filter(s=>s.kind==='straight').reduce((n,s)=>n+s.length_mm,0),arcs=b.segments.filter(s=>s.kind==='arc').reduce((n,s)=>n+s.length_mm,0),shape={...b,shape:label,diameter_mm:diameterMm,mandrel_diameter_mm:mandrelDiameterMm,radius_mm:r,tail_mm:tailMm,straight_mm:straight,arc_mm:arcs,cut_mm:straight+arcs,nominal_mass_kg:(straight+arcs)/1000*unitMass(diameterMm),closure_projection_overlap:false,closure_offset_designed:true,axial_piece_offset_mm:zOffset,release:'DIMENSIONED_COORDINATION_GEOMETRY_NOT_ISSUED',references:['R01','R04','R11']};shape.self_clearance=sampledSelfClearance(shape);if((shape.self_clearance.minimum_sampled_nonlocal_clear_mm??Infinity)<0)throw Error(label+': nonlocal portions intersect');return shape;};
 return {pieces:[{role:'U-link stirrup · two 135° hooks',shape:finish(U,'U-link: 2×90° body bends + 2×135° hooks',0),zOffset:0},{role:'Closing crosstie · two 135° hooks',shape:finish(cap,'Closing crosstie: 2×135° hooks',offset),zOffset:offset}],opening_side:W>=H?'bottom / horizontal long side':'right / vertical long side',piece_axis_offset_mm:offset,minimum_interpiece_clear_mm:pieceGapMm,hook_angles:[135,135],clause:'NBC105:2025 Annex A1.1 and 4.1.3(b,c). Both cap hooks135° satisfy the not-less-than90° end definition; no90° alternation is needed.',scope:'Beam links only. This permission is not applied to column closed hoops.'};
}
export const COUPLERS=Object.freeze({12:{part:'TTS12',diameter_mm:22,length_mm:58},16:{part:'TTS16',diameter_mm:25,length_mm:70},20:{part:'TTS20',diameter_mm:30,length_mm:74}});
export const TRANSITIONS=Object.freeze({'12/16':{part:'TTT12/16',diameter_mm:25,length_mm:72},'16/20':{part:'TTT16/20',diameter_mm:30,length_mm:78}});
export function balancedSpliceGroups(bars){
 if(!bars.length||new Set(bars.map(b=>b.id)).size!==bars.length)throw Error('Need nonempty bars with unique IDs');
 const byDiameter=new Map();for(const b of bars){positive(b.diameter_mm,'Diameter');const list=byDiameter.get(b.diameter_mm)??[];list.push(b);byDiameter.set(b.diameter_mm,list);}
 const groups=[[],[]];for(const list of byDiameter.values())list.forEach((b,i)=>groups[i%2].push(b));
 const areas=groups.map(g=>g.reduce((n,b)=>n+Math.PI*b.diameter_mm**2/4,0)),total=areas.reduce((a,b)=>a+b,0);
 return {groups,area_mm2:areas,total_area_mm2:total,area_fraction:areas.map(a=>a/total),balanced:areas.every(a=>a<=total/2+1e-7)};
}
export function spliceLevels(clearHeightMm,bars){
 positive(clearHeightMm,'Clear height');const grouping=balancedSpliceGroups(bars);if(!grouping.balanced)throw Error('Cannot divide this cage into two groups with at most half its steel area');
 const zone=[clearHeightMm/4,clearHeightMm*3/4],levels=[clearHeightMm*3/8,clearHeightMm*5/8],rows=grouping.groups.flatMap((group,i)=>group.map(b=>{const product=COUPLERS[b.diameter_mm];if(!product)throw Error('No inspected product dimensions for this diameter');return {bar:b.id,diameter_mm:b.diameter_mm,group:i?'B':'A',level_mm:levels[i],body_bottom_mm:levels[i]-product.length_mm/2,body_top_mm:levels[i]+product.length_mm/2,product:{...product},body_inside_selected_zone:levels[i]-product.length_mm/2>=zone[0]&&levels[i]+product.length_mm/2<=zone[1],supply_and_seismic_acceptance:false};}));
 return {...grouping,groups:grouping.groups.map(g=>g.map(b=>b.id)),rows,units:'mm; area in mm²; levels from clear-column base; XY from column centre',zone_mm:zone,levels_mm:levels,clear_height_mm:clearHeightMm,location_basis:'Middle-half and two area-balanced levels are a conservative coordination choice. NBC4.5.1(a,b) expressly govern laps, not a claimed location exemption/requirement for couplers.',product_scope:'Ancon tapered-thread reference envelope only. TA1-B5015 verifies static tension with BS4449 B500B/C; it does not verify this NS191 steel or seismic cyclic use. Not a purchase specification.',preparation_allowance_mm_per_end:25,preparation_allowance_scope:'Square-cutting allowance only; never added to the installed coupler length, gap or finished cut.',final_cut_lengths_issued:false};
}

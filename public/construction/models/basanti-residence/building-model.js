import {stairSettingOut} from './stair-model.js';
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateProject(p){
 if(p?.schema!=='paila-building-1.0'||p.units!=='m'||!p.components?.length||!p.levels?.length)throw Error('Unexpected building model');
 const ids=new Set();for(const c of p.components){if(!/^[a-zA-Z0-9-]+$/.test(c.id)||ids.has(c.id))throw Error('Duplicate or invalid component ID');ids.add(c.id);if(!['observed','derived','assumed'].includes(c.status)||c.source.page<1||c.source.page>21)throw Error('Missing source status');const numbers=[];const walk=o=>{if(typeof o==='number')numbers.push(o);else if(o&&typeof o==='object')Object.values(o).forEach(walk)};walk(c.geometry);if(numbers.some(n=>!Number.isFinite(n)))throw Error('Non-finite geometry');}
 for(const c of p.components)if(c.geometry.host&&!ids.has(c.geometry.host))throw Error('Missing opening host');
 if(Math.abs(p.levels.reduce((s,l)=>s+(l.stated_area_m2??0),0)-115.58)>.0001)throw Error('Stated areas changed without reconciliation');
 return p;
}
export function componentDimensions(c){const g=c.geometry,fmt=n=>n==null?'unknown':Number(n.toFixed(3)).toString();if(g.type==='wall')return `${fmt(g.length)} × ${fmt(g.thickness)} × ${fmt(g.height)}`;if(g.type==='opening')return `${fmt(g.width)} × ${fmt(g.height)}; sill ${fmt(g.z-({ground:0,first:3,second:6}[c.level]??0))}`;if(g.type==='box')return `${fmt(g.width)} × ${fmt(g.depth)} × ${fmt(g.height)}`;if(g.type==='segment')return `${fmt(Math.hypot(...g.b.map((n,i)=>n-g.a[i])))} long; ${fmt(g.width)} × ${fmt(g.height)}`;if(g.type==='stair')return `rise ${fmt(g.height)}; ${g.riser_count} risers; tread ${fmt(g.tread)}`;if(g.type==='polygon')return `traced envelope; ${fmt(g.height)} thick`;if(g.type==='railing')return `traced boundary; ${fmt(g.height)} high`;return 'See source detail';}
export function filterComponents(project,{level='all',kind='all',query=''}={}){const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);return project.components.filter(c=>(level==='all'||c.level===level)&&(kind==='all'||c.kind===kind)&&terms.every(t=>(c.id+' '+c.label+' '+c.kind+' '+c.level+' '+c.note).toLowerCase().includes(t)));}
export function wallPanels(c){const g=c.geometry,holes=g.openings??[],xs=[-g.length/2,g.length/2,...holes.flatMap(o=>[Math.max(-g.length/2,o.offset-o.width/2),Math.min(g.length/2,o.offset+o.width/2)])].sort((a,b)=>a-b),parts=[];
 for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i];if(b-a<1e-6)continue;const cuts=holes.filter(o=>(a+b)/2>o.offset-o.width/2&&(a+b)/2<o.offset+o.width/2),zs=[0,g.height,...cuts.flatMap(o=>[Math.max(0,o.sill),Math.min(g.height,o.sill+o.height)])].sort((a,b)=>a-b);for(let j=1;j<zs.length;j++){const lo=zs[j-1],hi=zs[j];if(hi-lo<1e-6||cuts.some(o=>(lo+hi)/2>o.sill&&(lo+hi)/2<o.sill+o.height))continue;const u=(a+b)/2,angle=g.rotation*Math.PI/180;parts.push({x:g.x+u*Math.cos(angle),y:g.y+u*Math.sin(angle),z:g.z+lo,width:b-a,depth:g.thickness,height:hi-lo,rotation:g.rotation});}}
 return parts;
}
export function clipPolygonAtZ(points,z){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],insideA=a[2]<=z,insideB=b[2]<=z;if(insideA)out.push(a);if(insideA!==insideB){const t=(z-a[2])/(b[2]-a[2]);out.push(a.map((n,j)=>n+t*(b[j]-n)));}}return out;}
// The SVG overview looks toward the origin along (1, 1, .78).
export function isOverviewFaceVisible(points){if(points.length<3)return false;const a=points[0],u=points[1].map((n,i)=>n-a[i]),v=points[2].map((n,i)=>n-a[i]);return u[1]*v[2]-u[2]*v[1]+u[2]*v[0]-u[0]*v[2]+.78*(u[0]*v[1]-u[1]*v[0])>1e-10;}
export function footprint(c){const g=c.geometry;if(g.points)return g.points;let x=g.x,y=g.y,w=g.width,d=g.depth,rotation=g.rotation??0;
 if(g.type==='wall'){w=g.length;d=g.thickness;}if(g.type==='opening'){w=g.width;d=g.thickness;}
 if(g.type==='segment'){x=(g.a[0]+g.b[0])/2;y=(g.a[1]+g.b[1])/2;w=Math.hypot(g.b[0]-g.a[0],g.b[1]-g.a[1]);d=g.width;rotation=Math.atan2(g.b[1]-g.a[1],g.b[0]-g.a[0])*180/Math.PI;}
 if(g.type==='stair'){w=stairSettingOut(g).runWithLanding;d=g.flight_width*2;x+=w/2;y+=d/2;}
 if(![x,y,w,d].every(Number.isFinite))return [];const a=rotation*Math.PI/180;return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a)]);
}
export function planMarkup(project,components,selectedId=null){const f=escapeHTML,polys=components.slice().sort((a,b)=>(a.kind==='slab'?-1:0)-(b.kind==='slab'?-1:0));let content='';
 for(const c of polys){const pts=footprint(c);if(!pts.length)continue;const g=c.geometry,selected=c.id===selectedId,color=selected?'#d09129':c.display_color??(c.status==='assumed'?'#b58235':c.kind==='column'?'#637995':c.kind==='slab'?'#e1e8ea':['door','window','vent','sliding door'].includes(c.kind)?'#318da0':'#2b5662');
  const footprints=g.type==='wall'?wallPanels(c).filter(p=>p.z<=g.z+1.2&&p.z+p.height>g.z+1.2).map(p=>footprint({geometry:{...p,type:'box'}})):[pts];
  const outline=['railing','route'].includes(g.type);
  content+=`<g data-pick="${c.id}" role="button" tabindex="0" aria-label="${f(c.label)}"><title>${f(c.label)} · ${f(componentDimensions(c))} m · ${c.status}</title>${footprints.map(points=>`<${outline?'polyline':'polygon'} points="${points.map(p=>`${p[0]},${-p[1]}`).join(' ')}" fill="${outline?'none':color}" fill-opacity="${c.kind==='slab'?.25:.78}" stroke="${selected?'#b0750c':color}" stroke-width="${selected?.065:.025}"${c.status==='assumed'?' stroke-dasharray=".08 .05"':''}/>`).join('')}</g>`;
  if(g.type==='stair'){const ss=stairSettingOut(g);for(const [i,f]of ss.flights.entries())for(let k=0;k<=f.goings;k++){const x=i?g.x+ss.flights[0].run-k*g.tread:g.x+k*g.tread;content+=`<path d="M${x} ${-(g.y+i*g.flight_width)}v${-g.flight_width}" stroke="#546979" stroke-width=".018" fill="none"/>`;}}
 }
 const levels=new Set(components.map(c=>c.level));for(const r of project.rooms.filter(r=>levels.has(r.level)))content+=`<text x="${r.label_position_m[0]}" y="${-r.label_position_m[1]}" text-anchor="middle" font-size=".28" fill="var(--ink,#233e49)" pointer-events="none">${f(r.label)}<tspan x="${r.label_position_m[0]}" dy=".27" font-size=".22">${r.written_width_m} × ${r.written_depth_m} m</tspan></text>`;
 for(let i=0;i<project.grids.x.length;i++){const x=project.grids.x[i];content+=`<path d="M${x} 1.8V-4.7" stroke="#96adb7" stroke-width=".012" stroke-dasharray=".12 .08"/><text x="${x}" y="1.95" text-anchor="middle" font-size=".2" fill="var(--muted,#50626e)">${i+1}</text>`;}for(let i=0;i<project.grids.y.length;i++){const y=project.grids.y[i];content+=`<path d="M-.8 ${-y}H12.2" stroke="#96adb7" stroke-width=".012" stroke-dasharray=".12 .08"/><text x="-.9" y="${-y}" font-size=".2" fill="var(--muted,#50626e)">${'AB'[i]}</text>`;}
 return content;
}

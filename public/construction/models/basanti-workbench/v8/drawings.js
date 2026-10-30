import {escapeHTML as e,footprint} from '../../basanti-residence/building-model.js';
import {dimensionedPlanMarkup} from '../../basanti-residence/shop-drawings.js';
export function buildingPlan(project,items,{selected=null,interior=false,context=[]}={}){
 let body=dimensionedPlanMarkup(project,interior?context:items,selected);
 if(interior)for(const [index,c]of items.entries()){
  const g=c.geometry,a=(g.rotation??0)*Math.PI/180,parts=g.parts?.map(p=>({...c,geometry:{type:'box',...p,x:g.x+p.x*Math.cos(a)-p.y*Math.sin(a),y:g.y+p.x*Math.sin(a)+p.y*Math.cos(a),z:g.z+p.z,rotation:(p.rotation??0)+(g.rotation??0)}}))??[c];
  const shapes=parts.map(part=>footprint(part)).filter(points=>points.length);
  body+=`<g data-pick="${e(c.id)}" role="button" tabindex="0" aria-label="${e(c.label+' · illustrative proposal')}"><title>${e(c.label+' · proposal, not a source furniture schedule')}</title>${shapes.map(points=>`<polygon points="${points.map(p=>p[0]+','+-p[1]).join(' ')}" fill="${c.id===selected?'#c78a2c':'#6b81bb'}" fill-opacity=".7" stroke="${c.id===selected?'#875304':'#405a90'}" stroke-width=".035"/>`).join('')}</g>`;
  const p=shapes[0];if(p){const x=p.reduce((n,p)=>n+p[0],0)/p.length,y=p.reduce((n,p)=>n+p[1],0)/p.length;body+=`<text x="${x}" y="${-y}" text-anchor="middle" font-size=".19" fill="#fff" pointer-events="none">${index+1}</text>`;}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.4 -4.95 14.2 7.6" role="img" aria-label="Linked ${interior?'interior proposal':'building'} plan in metres">${body}</svg>`;
}
const wrap=(text,max=42)=>{const lines=[''];for(const word of text.split(/\s+/)){const i=lines.length-1;if((lines[i]+' '+word).trim().length>max)lines.push(word);else lines[i]+=(lines[i]?' ':'')+word;}return lines;};
export function programmeSVG(groups,schedule,{expanded=false,selected=null}={}){
 const rows=groups.flatMap(g=>[{...g,label:schedule.groups[g.id]??g.id,group:true},...(expanded?g.tasks:[])]),W=1320,left=360,span=880,row=64,H=80+row*rows.length,total=Math.max(1,schedule.duration),X=n=>left+n/total*span;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(schedule.name+' programme in '+schedule.unit)}"><rect width="${W}" height="${H}" fill="#fff"/><g font-family="Arial,sans-serif" font-size="12" fill="#203b32"><text x="20" y="25" font-weight="bold">${e(schedule.name+' · '+schedule.unit+' · planning baseline')}</text>`;
 for(let i=0;i<=5;i++){const day=total*i/5,x=X(day);s+=`<path d="M${x} 44V${H}" stroke="#dce6e0"/><text x="${x}" y="48" text-anchor="${i===5?'end':'start'}">${Math.round(day)} ${e(schedule.unit==='workdays'?'wd':'d')}</text>`;}
 rows.forEach((r,i)=>{const y=66+i*row,colour=r.group?'#284d40':r.id===selected?'#b67924':r.critical?'#ae4c48':'#31826b';s+=`<path d="M0 ${y+row-8}H${W}" stroke="#e4ebe7"/><text x="${r.group?20:34}" y="${y+17}" font-weight="${r.group?'bold':'normal'}">${wrap((r.code?r.code+' · ':'')+r.label).map((line,k)=>`<tspan x="${r.group?20:34}" dy="${k?15:0}">${e(line)}</tspan>`).join('')}</text><rect x="${X(r.start)}" y="${y+7}" width="${Math.max(3,X(r.finish)-X(r.start))}" height="${r.group?12:20}" rx="3" fill="${colour}"><title>${e(r.label+' · '+r.start+'–'+r.finish+' '+schedule.unit)}</title></rect>`;});return s+'</g></svg>';
}

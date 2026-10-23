import {itemCorners,isOpening,openingPose,escapeXML,round} from './design-model.js';
export function planDrawing(layout,{selectedId=null,issues=[]}={}){
 const {width:W,depth:D,wall:t}=layout.room,points=layout.items.flatMap(i=>itemCorners(i,layout.room)),margin=Math.max(W,D)*.075;
 const x0=Math.min(-margin,...points.map(p=>p[0]-margin)),y0=Math.min(-margin,...points.map(p=>p[1]-margin)),x1=Math.max(W+margin,...points.map(p=>p[0]+margin)),y1=Math.max(D+margin,...points.map(p=>p[1]+margin)),font=Math.max(W,D)*.017;
 const sy=y=>D-y,polygon=points=>points.map(([x,y])=>`${round(x)},${round(sy(y))}`).join(' '),line=(x,y,a,b,extra='')=>`<line x1="${x}" y1="${sy(y)}" x2="${a}" y2="${sy(b)}" ${extra}/>`;
 const walls=['south','north','west','east'].map(wall=>{
  const horizontal=['south','north'].includes(wall),length=horizontal?W+t:D,holes=layout.items.filter(i=>isOpening(i)&&i.wall===wall).sort((a,b)=>a.offset-b.offset),segments=[];let from=horizontal?-t:0;
  for(const hole of [...holes,{offset:length,width:0}]){if(hole.offset>from)segments.push(horizontal?line(from,wall==='south'?-t/2:D+t/2,hole.offset,wall==='south'?-t/2:D+t/2):line(wall==='west'?-t/2:W+t/2,from,wall==='west'?-t/2:W+t/2,hole.offset));from=hole.offset+hole.width;}
  return segments.join('');
 }).join('');
 const elements=[...layout.items.filter(i=>i.kind==='zone'),...layout.items.filter(i=>i.kind!=='zone')].map(item=>{
  const pose=isOpening(item)?openingPose(item,layout.room):item,color=item.kind==='zone'?'#c3dce4':item.asset_id?'#b6a0d4':item.kind==='partition'?'#a0adb8':'#91c6bd',selected=item.id===selectedId,problem=issues.includes(item.id),corners=itemCorners(item,layout.room);
  const label=escapeXML(item.label.length>28?item.label.slice(0,26)+'…':item.label);
  let content=`<polygon points="${polygon(corners)}" fill="${color}" fill-opacity="${item.kind==='zone'?.25:.72}" stroke="${problem?'#b04e30':selected?'#9c630d':'#446b70'}" stroke-width="${selected?font*.17:font*.055}"${item.kind==='zone'?' stroke-dasharray=".15 .1"':''}/>`;
  if(item.kind==='window')content+=line(...corners[0],...corners[1],'stroke="#3b92b0" stroke-width=".04"');
  if(item.kind==='door')content+=`<text x="${pose.x}" y="${sy(pose.y)+font*.35}" font-size="${font*.9}" text-anchor="middle" fill="var(--ink,#20313c)">DOOR</text>`;
  else content+=`<text x="${pose.x}" y="${sy(pose.y)+font*.32}" font-size="${font*.75}" text-anchor="middle" fill="var(--ink,#20313c)" pointer-events="none">${label}</text>`;
  return `<g data-design-item="${escapeXML(item.id)}" class="plan-element"><title>${escapeXML(item.label)} · ${item.width} × ${isOpening(item)?t:item.depth} m${item.asset_id?' · reused source mesh':''}</title>${content}</g>`;
 }).join('');
 const content=`<defs><pattern id="metre-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="var(--line,#c7d5dc)" stroke-width=".012"/></pattern></defs><rect x="0" y="0" width="${W}" height="${D}" fill="var(--surface,#fff)"/><rect x="0" y="0" width="${W}" height="${D}" fill="url(#metre-grid)"/><g fill="none" stroke="var(--ink,#20313c)" stroke-width="${t}" stroke-linecap="butt">${walls}</g>${elements}<g fill="var(--muted,#526877)" font-family="Arial,sans-serif" font-size="${font}"><text x="${W/2}" y="${D+margin*.7}" text-anchor="middle">${W.toFixed(2)} m</text><text x="${W+margin*.5}" y="${D/2}" text-anchor="middle" transform="rotate(-90 ${W+margin*.5} ${D/2})">${D.toFixed(2)} m</text></g>`;
 return {viewBox:[x0,D-y1,x1-x0,y1-y0].map(n=>round(n)).join(' '),content};
}
export function svgDocument(layout){const drawing=planDrawing(layout);return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${drawing.viewBox}" width="1200" height="900" font-family="Arial,sans-serif"><title>${escapeXML(layout.name)} · concept plan</title><metadata>Units: metres. Dimensions are concept inputs; not an approved construction drawing.</metadata>${drawing.content}</svg>\n`;}

import { spec as S, colors as C, fmt, braceLength } from './spec.mjs';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const text = (x,y,s,size=16,color='#17394b',anchor='start',bold=false) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${bold?700:400}">${esc(s)}</text>`;
const rect = (x,y,w,h,color,stroke='#385466') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="${stroke}" stroke-width="1.2"/>`;
const ln = (x1,y1,x2,y2,color='#17394b',dash='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.4" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const arrow = (x1,y1,x2,y2,color='#17394b') => `<path d="M${x1},${y1} L${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.6" marker-end="url(#arrow)"/>`;
const circle = (x,y,r,color) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
function dh(x1,x2,y,label){return ln(x1,y-7,x1,y+7)+ln(x2,y-7,x2,y+7)+`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#17394b" marker-start="url(#dim)" marker-end="url(#dim)"/>`+text((x1+x2)/2,y-12,label,15,'#17394b','middle');}
function dv(x,y1,y2,label){return ln(x-7,y1,x+7,y1)+ln(x-7,y2,x+7,y2)+`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#17394b" marker-start="url(#dim)" marker-end="url(#dim)"/><text x="${x-13}" y="${(y1+y2)/2}" font-size="15" text-anchor="middle" transform="rotate(-90 ${x-13} ${(y1+y2)/2})">${esc(label)}</text>`;}
function frame(title,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="720" viewBox="0 0 1100 720" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#17394b"/></marker><marker id="dim" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse"><path d="M7 0 L0 3.5 L7 7" fill="none" stroke="#17394b"/></marker></defs><rect width="1100" height="720" fill="white"/><g font-family="Arial,Helvetica,sans-serif" fill="#17394b">${text(35,43,title,25,'#17394b','start',true)}${text(35,70,'W01 | All dimensions in inches | Do not scale | Preliminary support layout',14,'#5b7482')}${ln(35,88,1065,88,'#d0dce1')}${body}${ln(35,675,1065,675,'#d0dce1')}${text(35,700,'Connections, spacing and anchors require site-engineer verification before pouring.',13,'#9b481f')}</g></svg>`;}
function cut(){let b='';for(const [x,num] of [[115,1],[505,2]]){
 const scale=4,y=156,h=96*scale,w=48*scale,a=16*scale,bb=S.panels[1].width*scale,k=S.kerf*scale;
 b+=text(x,111,`SHEET ${num}`,19,'#17394b','start',true)+rect(x,y,w,h,'#edf2f4')+rect(x,y,a,h,C.A)+rect(x+a+k,y,bb,h,C.B);
 for(const [xx,n] of [[x+a,1],[x+a+k+bb,2]])b+=ln(xx,y,xx,y+h,'#d95853','8 4')+circle(xx,y+28,13,'#d95853')+text(xx,y+34,n,16,'white','middle',true)+arrow(xx,y+h-35,xx,y+h-5,'#d95853');
 b+=text(x+a/2,y+110,`A${num}`,24,'#17394b','middle',true)+text(x+a/2,y+146,'16 in',17,'#17394b','middle');
 b+=text(x+a+k+bb/2,y+110,`B${num}`,24,'#17394b','middle',true)+text(x+a+k+bb/2,y+146,'16.945 in',13,'#17394b','middle');
 b+=text(x+w-28,y+250,'OFFCUT',12,'#5b7482','middle')+dh(x,x+w,y-15,'48 in')+dv(x-22,y,y+h,'96 in');
 }
 b+=text(825,126,'FOUR FINISHED FACES',18,'#17394b','start',true)+arrow(730,345,797,345);
 for(let i=0;i<4;i++){const p=S.panels[i%2];b+=rect(825+i*56,185,p.width*2.7,96*3.2,C[p.id])+text(825+i*56+p.width*1.35,222,p.id+Math.floor(i/2+1),17,'#17394b','middle',true);}
 b+=text(50,582,'1. Rip A at 16 in from the sheet edge.',17,'#17394b','start',true)+text(50,614,'2. From the fresh cut edge, rip B at 16.945 in. Repeat on sheet 2.',17)+text(50,647,'Keep the blade on the waste side. B = 16 in + twice the actual ply thickness (0.4724 in).',15);
 return frame('01. Cut two sheets into four plywood panels',b);
}
function panels(){let b=text(78,120,'BACK: THREE BATTENS PER FACE',19,'#17394b','start',true)+text(697,120,'FRONT: HIT THE BLACK DOTS',19,'#17394b','start',true);
 for(const [i,x] of [[0,120],[1,385]]){const p=S.panels[i],sx=8,sy=4,y=182;
 b+=rect(x,y,p.width*sx,96*sy,C[p.id]);for(const q of p.centres)b+=rect(x+(q-1)*sx,y,2*sx,96*sy,C.studs);
 b+=text(x+p.width*sx/2,150,`${p.id} panel x 2`,20,'#17394b','middle',true)+dh(x,x+p.width*sx,y-9,fmt(p.width)+' in')+dv(x-25,y,y+384,'96 in');
 b+=text(x-40,602,`Centres: ${p.centres.map(v=>fmt(v)).join(' / ')} in`,15)+text(x-40,627,'Measured from the left ply edge.',13,'#5b7482');
 }
 const x=732,y=182,sx=8,sy=4;b+=rect(x,y,128,384,'#cce8f8');
 for(const q of [1,8,15]){b+=rect(x+(q-1)*sx,y,16,384,'#f7dfb8','#f7dfb8')+ln(x+q*sx,y,x+q*sx,y+384,'#79909b','4 5');for(const n of S.nailPositions)b+=circle(x+q*sx,y+n*sy,3,C.nails);}
 b+=dv(705,y+S.nailPositions[1]*sy,y+S.nailPositions[2]*sy,'5.905 in max')+text(697,602,'17 x 3 = 51 nails per face',19,'#17394b','start',true)+text(697,631,'4 faces = 204 retaining nails',19,'#17394b','start',true);
 b+=text(920,229,'End offset:',15)+text(920,252,'1.969 in',17,'#17394b','start',true)+arrow(942,266,855,y+S.nailPositions[0]*sy);
 b+=text(920,383,'Edge row:',15)+text(920,406,'1 in inward',17,'#17394b','start',true)+arrow(931,417,854,y+S.nailPositions[8]*sy);
 b+=text(45,659,'Nail from smooth ply face into batten centres; 1.969 in nail, about 1.496 in timber penetration. Keep heads flush.',14);
 return frame('02. Batten positions and plywood-retaining nails',b);
}
function plan(){let b='',cx=565,cy=365,s=14,q=16,t=S.ply; b+=rect(cx-q*s/2,cy-q*s/2,q*s,q*s,'#edf2f4');
 for(const sign of [-1,1]){
 b+=rect(cx+(sign*(8+t/2)-t/2)*s,cy-8*s,t*s,16*s,C.A);
 b+=rect(cx-(8+t)*s,cy+(sign*(8+t/2)-t/2)*s,(16+2*t)*s,t*s,C.B);
 for(const z of [-7,0,7])b+=rect(cx+(sign*(8+t+1.5)-1.5)*s,cy+(z-1)*s,3*s,2*s,C.studs);
 for(const x of [-7-t,0,7+t])b+=rect(cx+(x-1)*s,cy+(sign*(8+t+1.5)-1.5)*s,2*s,3*s,C.studs);
 }
 b+=text(cx,cy-10,'CLEAR CONCRETE',18,'#5b7482','middle',true)+text(cx,cy+24,'16 in x 16 in',25,'#17394b','middle',true)+dh(cx-8*s,cx+8*s,573,'16 in clear')+dv(785,cy-8*s,cy+8*s,'16 in clear')+dh(cx-(8+t)*s,cx+(8+t)*s,170,'B width = 16.945 in');
 b+=text(56,196,'TWO A FACES',19,C.A,'start',true)+text(56,223,'16 in wide x 96 in high',16)+arrow(233,240,cx-(8+t/2)*s,cy-65);
 b+=text(56,426,'TWO B FACES',19,C.B,'start',true)+text(56,453,'16.945 in wide x 96 in high',16)+arrow(235,471,cx-70,cy+(8+t/2)*s);
 b+=text(849,256,'Orange = timber',16,C.studs,'start',true)+text(849,286,'2 in against ply',15)+text(849,311,'3 in outward',15);
 b+=text(56,635,'B covers the cut ends of A. All four panels at 16 in width would make the corner overlap wrong.',17);
 return frame('03. Top plan - how the four faces close',b);
}
function elevation(){let b='',cx=423,base=574,s=4,t=S.ply;
 b+=rect(cx-8*s,base-96*s,16*s,96*s,C.B);for(const x of [-7-t,0,7+t])b+=rect(cx+(x-1)*s,base-96*s,2*s,96*s,C.studs);
 for(const datum of S.collarDatums){const yy=base-datum*s;b+=rect(cx-15*s,yy,30*s,3*s,C.collars)+rect(cx-(8+t+5)*s,yy-3*s,2*s,3*s,C.collars)+rect(cx+(8+t+3)*s,yy-3*s,2*s,3*s,C.collars)+ln(cx-72,yy,cx+75,yy,'#5b7482','4 5');}
 for(const sign of [-1,1]){const x1=cx+sign*S.braceHeadOffset*s,x2=cx+sign*S.braceFootOffset*s,y1=base-75*s;b+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${base}" stroke="${C.braces}" stroke-width="10"/>`+circle(x2,base,7,C.nails);}
 b+=ln(77,base,780,base,'#79909b')+dv(71,base-96*s,base,'96 in')+dh(cx-8*s,cx+8*s,base-96*s-17,'16 in')+dh(cx,cx+S.braceFootOffset*s,base+43,'74.803 in from centre');
 b+=text(795,158,'9 COLLARS / 36 RAILS',20,C.collars,'start',true)+text(795,190,'Band datums above base:',16);
 S.collarDatums.forEach((n,i)=>{b+=text(819,224+i*30,`${i+1}.  ${n} in`,17);});
 b+=text(795,512,'12 in usual datum pitch',15)+text(795,538,'6 in at the final band',15);
 b+=text(86,149,'Four braces total;',17,C.braces,'start',true)+text(86,174,'two visible in this elevation.',15)+arrow(338,183,cx-S.braceHeadOffset*s,base-75*s);
 b+=text(86,226,'Brace length: 96.884 in',17,C.braces,'start',true)+text(86,251,'Before joint allowances.',14)+arrow(265,263,313,348);
 b+=text(83,654,'Head elevation: 75 in. Rails are staggered in two tiers at each collar. This is a proposed support arrangement.',14);
 return frame('04. Support elevation and collar locations',b);
}
function corner(){let b=text(792,133,'CORNER AT ENLARGED SCALE',14,'#17394b','start',true),x=165,y=211,s=210,t=S.ply;
 b+=rect(x,y,420,360,'#edf2f4')+rect(x+420,y,t*s,360,C.A)+rect(x,y-t*s,420+t*s,t*s,C.B);
 b+=text(x+45,y+140,'INSIDE CONCRETE',25,'#5b7482','start',true)+text(x+45,y+180,'Clear size: 16 in x 16 in',21);
 b+=text(792,189,'B PANEL',22,C.B,'start',true)+text(792,220,'Covers the full end of A.',17)+arrow(795,235,x+420+t*s/2,y-2);
 b+=text(792,408,'A PANEL',22,C.A,'start',true)+text(792,439,'Its cut end meets B.',17)+arrow(788,451,x+420+t*s/2,y+200);
 b+=dh(x+420,x+420+t*s,604,'0.4724 in ply')+text(57,649,'Cut B to 16 in + 2 x measured plywood thickness. For the supplied ply: approximately 16.945 in.',17);
 return frame('05. Corner overlap - why B is wider than A',b);
}
export const drawingInfo=[
 {id:'cut',label:'1. Cut the ply',filename:'01_Plywood_Cutting.svg',description:'Two 96 x 48 in sheets become A1, A2, B1 and B2. Follow the red rip lines.'},
 {id:'panels',label:'2. Battens & nails',filename:'02_Battens_and_Nails.svg',description:'Three vertical battens per face. Black dots show the 204 plywood-retaining nails.'},
 {id:'plan',label:'3. Top plan',filename:'03_Top_Plan.svg',description:'A faces oppose each other. The wider B faces cover their two plywood ends.'},
 {id:'elevation',label:'4. Elevation',filename:'04_Support_Elevation.svg',description:'Nine proposed collar levels; four braces on two axes. Final collar interval is 6 in.'},
 {id:'corner',label:'5. Corner detail',filename:'05_Corner_Detail.svg',description:'An enlarged corner explains the thickness allowance and the 16 in clear opening.'}
];
export const renderDrawings = () => ({cut:cut(),panels:panels(),plan:plan(),elevation:elevation(),corner:corner()});

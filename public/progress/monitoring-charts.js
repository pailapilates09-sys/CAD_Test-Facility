export const escapeHTML=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const fmt=n=>Number(n).toLocaleString('en-IN');
export function growthChart(points,metric='rows'){
 if(!points.length)return '<p>No comparable checkpoint history is available.</p>';
 const max=Math.ceil(Math.max(...points.map(p=>p[metric]))/1000)*1000||1,minCP=points[0].cp,maxCP=points.at(-1).cp;
 const x=p=>60+(p.cp-minCP)/Math.max(1,maxCP-minCP)*620,y=p=>246-p[metric]/max*210;
 const ticks=Array.from({length:5},(_,i)=>{const v=max*i/4,yy=246-i*52.5;return `<line x1="60" y1="${yy}" x2="680" y2="${yy}" class="em-grid"/><text x="49" y="${yy+4}" text-anchor="end">${fmt(v)}</text>`;}).join('');
 return `<svg viewBox="0 0 730 295" class="em-growth" role="img" aria-label="MSCH ${escapeHTML(metric)} at ${points.length} saved checkpoints, CP${minCP} to CP${maxCP}; vertical scale starts at zero"><title>MSCH ${escapeHTML(metric)} by saved checkpoint</title>${ticks}<polyline points="${points.map(p=>`${x(p)},${y(p)}`).join(' ')}" fill="none" class="em-line"/>${points.filter((p,i)=>i%Math.ceil(points.length/35)===0||i===points.length-1).map(p=>`<circle cx="${x(p)}" cy="${y(p)}" r="${p.cp===maxCP?5:2.7}" data-cp="${p.cp}" tabindex="0" role="button" aria-label="CP${p.cp}: ${fmt(p[metric])} ${escapeHTML(metric)}"><title>CP${p.cp}: ${fmt(p[metric])} ${escapeHTML(metric)}</title></circle>`).join('')}<text x="60" y="277">CP${minCP}</text><text x="680" y="277" text-anchor="end">CP${maxCP}</text><text x="370" y="293" text-anchor="middle">Saved checkpoint number</text></svg>`;
}
export function historyRows(points,metric='rows'){
 return points.slice(-40).reverse().map(p=>`<tr><th scope="row">CP${p.cp}</th><td>${fmt(p[metric])}</td><td>${p.added===null?'—':fmt(p.added)}</td><td>${escapeHTML(p.ack)}</td></tr>`).join('');
}

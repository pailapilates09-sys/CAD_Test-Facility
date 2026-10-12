import {spec, materials, sources} from './spec.mjs';
import {drawingInfo, renderDrawings} from './drawings.mjs';
const escape = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
document.querySelectorAll('[data-link]').forEach(a=>a.href=spec.drive[a.dataset.link]);
document.getElementById('material-rows').innerHTML=materials.map(m=>`<tr><td><span>${m.id}</span>${escape(m.name)}</td><td>${m.qty}</td><td>${escape(m.size)}</td><td>${escape(m.stock)}<small>${escape(m.note)}</small></td></tr>`).join('');
document.getElementById('source-list').innerHTML=sources.map(s=>`<article class="source-card"><span>${String(s.rank).padStart(2,'0')}</span><div><h3><a href="${s.url}" target="_blank" rel="noopener">${s.name} ↗</a></h3><p>${escape(s.description)}</p><div class="source-meta"><span>${s.license}</span><span>•</span><span>${s.use}</span></div></div></article>`).join('');
const drawings=renderDrawings();
const tabs=document.getElementById('drawing-tabs');
tabs.innerHTML=drawingInfo.map((d,i)=>`<button id="tab-${d.id}" type="button" role="tab" data-drawing="${d.id}" aria-controls="drawing" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${d.label}</button>`).join('');
function selectDrawing(id){const info=drawingInfo.find(d=>d.id===id);document.getElementById('drawing').innerHTML=drawings[id];document.getElementById('drawing').setAttribute('aria-labelledby','tab-'+id);document.getElementById('drawing-description').textContent=info.description;document.getElementById('svg-download').href=new URL('../downloads/'+info.filename, import.meta.url).href;tabs.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.drawing===id));b.tabIndex=b.dataset.drawing===id?0:-1;});}
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-drawing]');if(b)selectDrawing(b.dataset.drawing);});
tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...tabs.querySelectorAll('button')];let i=buttons.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;selectDrawing(buttons[i].dataset.drawing);buttons[i].focus();});
selectDrawing('cut');
const presets={assembled:['ply','studs','collars','braces','base'],skeleton:['studs','collars','braces','base','nails'],panels:['ply','studs','nails']};
const steps=[
 {layers:['ply'],explode:14,note:'Cut two stock sheets into four full-height faces. A is 16 in wide; B is approximately 16.945 in wide. See sheet 1 below for the cut lines.'},
 {layers:['ply','studs','nails'],explode:14,note:'Fit three 96 in battens to the back of each face. Nail from the smooth ply surface into the marked batten centre lines: 51 retaining nails per face.'},
 {layers:['ply','studs','nails'],explode:0,note:'Close opposite A faces with the wider B faces. Check the clear opening is 16 in x 16 in and seal the mating plywood edges.'},
 {layers:['ply','studs','collars','base','joints'],explode:0,note:'Add nine proposed collars, four 30 in rails per collar. Rails sit in staggered tiers. The marked corner joints still need an engineered fixing detail.'},
 {layers:presets.assembled,explode:0,note:'Four braces on two perpendicular axes keep the assembly aligned. End connections and anchorage must be detailed for the site.'}
];
try{
 const {createViewer}=await import('./model.mjs');
 const viewer=createViewer(document.getElementById('stage'),p=>{document.getElementById('part-info').innerHTML=`<span class="eyebrow">SELECTED PIECE</span><h4>${escape(p.title)}</h4><span class="part-size">${escape(p.size)}</span><p>${escape(p.note)}</p>`;});
 window.cadViewer=viewer;
 document.getElementById('model-loading').remove();
 const checkboxes=[...document.querySelectorAll('[data-layer]')];
 const slider=document.getElementById('explode');
 const applyLayers=()=>checkboxes.forEach(i=>viewer.setLayer(i.dataset.layer,i.checked));
 const explode=amount=>{slider.value=amount;document.getElementById('explode-value').textContent=Number(amount)+' in';viewer.setExplode(Number(amount));};
 function layers(keys){checkboxes.forEach(i=>i.checked=keys.includes(i.dataset.layer));applyLayers();}
 checkboxes.forEach(i=>i.addEventListener('change',applyLayers));applyLayers();
 slider.addEventListener('input',()=>explode(slider.value));
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{layers(presets[b.dataset.preset]);explode(b.dataset.preset==='panels'?14:0);document.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-step]').forEach(x=>x.classList.remove('active'));document.getElementById('viewer-state').textContent=b.textContent;}));
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>viewer.setView(b.dataset.view)));
 document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{const step=steps[Number(b.dataset.step)-1];layers(step.layers);explode(step.explode);document.getElementById('step-description').textContent=step.note;document.querySelectorAll('[data-step]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('active'));document.getElementById('viewer-state').textContent='Assembly step '+b.dataset.step;}));
 document.getElementById('snapshot').addEventListener('click',()=>{const a=document.createElement('a');a.download='Column_Formwork_3D.png';a.href=viewer.snapshot();a.click();});
}catch(error){console.error('3D viewer unavailable:',error);document.querySelector('.fallback').style.display='block';document.getElementById('model-loading').textContent='3D unavailable on this device. Use the 2D drawings and PDF below.';document.getElementById('model-loading').style.cssText='inset:auto 0 0;padding:15px;background:#fff;font-size:11px';document.getElementById('viewer-state').textContent='Static assembly preview';document.querySelectorAll('[data-layer],[data-preset],[data-step],[data-view],#explode,#snapshot').forEach(el=>el.disabled=true);}

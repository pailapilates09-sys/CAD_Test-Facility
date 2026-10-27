import {growthChart,historyRows,fmt} from './monitoring-charts.js';
const root=document.querySelector('.em-dashboard');
if(root){
 const data=JSON.parse(document.getElementById('em-data').textContent);
 const select=root.querySelector('[data-em-metric]');
 select.addEventListener('change',()=>{const metric=select.value,last=data.history.at(-1);root.querySelector('[data-em-growth]').innerHTML=growthChart(data.history,metric);root.querySelector('[data-em-history]').innerHTML=historyRows(data.history,metric);root.querySelector('[data-em-column]').textContent=select.selectedOptions[0].textContent;root.querySelector('[data-em-observation]').textContent=`CP${last.cp}: ${fmt(last[metric])} ${metric} · ${fmt(last[metric]-data.history[0][metric])} more than CP${data.history[0].cp}.`;});
 function detail(cp){const p=data.history.find(x=>x.cp===Number(cp));if(p)root.querySelector('[data-em-detail]').textContent=`CP${p.cp} · ${fmt(p.rows)} records · ${fmt(p.files)} files · ${fmt(p.folders)} folders · ${p.added===null?'gain not recorded':fmt(p.added)+' added'} · Main ${p.ack}`;}
 root.addEventListener('click',e=>{const cp=e.target.closest('[data-cp],[data-em-cp]');if(cp)detail(cp.dataset.cp??cp.dataset.emCp);const lane=e.target.closest('[data-em-open-lane]');if(lane){e.preventDefault();const tab=document.querySelector('[data-lane-tab="'+lane.dataset.emOpenLane+'"]');tab.click();document.getElementById('extraction-roadmap').scrollIntoView({block:'start'});tab.focus();}const node=e.target.closest('[data-em-node]');if(node){for(const b of root.querySelectorAll('[data-em-node]'))b.setAttribute('aria-pressed',String(b===node));root.querySelector('[data-em-node-detail]').textContent=data.nodes.find(n=>n[0]===node.dataset.emNode)[2];}});
 root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-cp]')){e.preventDefault();detail(e.target.dataset.cp);}});
}

document.querySelector('[data-em-open-research]')?.addEventListener('click',()=>{document.getElementById('open-source-patterns').open=true;});

import {readFile} from 'node:fs/promises';
import {escapeHTML} from '../public/construction/models/basanti-residence/building-model.js';
import {renderRegister} from '../public/construction/models/basanti-residence/register-view.js';

const template=await readFile(new URL('./templates/building-viewer.inc',import.meta.url),'utf8');

export function renderBuildingViewer(project,construction,evidenceBase='./'){
 const rows=renderRegister(construction,project.components).html;
 const levels=project.levels.map(l=>`<option value="${escapeHTML(l.id)}">${escapeHTML(l.label)} · +${l.elevation_m} m</option>`).join('');
 return template.trimEnd()
  .replaceAll('EVIDENCE_BASE',()=>escapeHTML(evidenceBase))
  .replace('<!-- BUILDING_ROWS -->',()=>rows)
  .replace('<!-- FLOOR_OPTIONS -->',()=>levels)
  .replace('<!-- MODEL_COUNT -->',()=>String(project.components.length));
}

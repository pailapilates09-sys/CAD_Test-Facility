import {siteHref} from './workspace-organization.mjs';
import {escapeHTML as e} from '../public/construction/models/basanti-residence/building-model.js';
const map={
 'building-explore':['Views','Filters'],'building-2d':['Views','Plan'],'building-3d':['Views','Model'],'building-register':['Quantities','Registers'],'building-confirmation':['Sources','Checks'],'building-downloads':['Sources','Downloads'],
 'work-controls':['Views','Filters'],'drawing-plan':['Views','Plan'],'drawing-model':['Views','Model'],'measurement-tables':['Quantities','Work quantities'],'member-inspection':['Views','Inspect'],'code-checks':['Steel','Code checks'],'bbs-study':['Steel','BBS'],'fabrication-panel':['Steel','Assembly'],'connection-panel':['Steel','Connections'],'renderer-check':['Views','Renderer'],'space-study':['Quantities','Excavation'],'concrete-planner':['Quantities','Materials'],'programme-panel':['Gantt','Programme'],'v6-decisions':['Sources','Design basis'],'v5-decisions':['Sources','Design basis'],'source-review':['Sources','Review'],'references':['Sources','References'],
 'work-picker':['Views','Filters'],'work-2d':['Views','Plan'],'work-3d':['Views','Model'],'work-quantities':['Quantities','Work quantities'],'work-programme':['Gantt','Programme'],'work-inspection':['Views','Inspect'],'work-assumptions':['Quantities','Assumptions'],'work-breakdown':['Gantt','All activities'],'work-coverage':['Sources','Missing scope'],'work-downloads':['Sources','Downloads'],
 'four-views':['Views','Filters'],'plan-panel':['Views','Plan'],'model-panel':['Views','Model'],'table-panel':['Quantities','Routes'],'inspector':['Views','Route details'],'locations':['Sources','Rooms'],'calculations':['Quantities','Sizing'],'coordination':['Sources','Review items'],'change-guide':['Sources','Help'],'downloads':['Sources','Downloads'],
 'room-explorer':['Views','Rooms'],'interior-floor-plan':['Views','Source plan'],'furniture-status':['Sources','Furniture status'],'interior-source-basis':['Sources','Room basis'],
 'versions':['Versions','Directory'],'changes':['Versions','Change report'],'building-plans':['Views','Building plans'],'source-and-downloads':['Sources','Downloads'],'limits':['Sources','Missing scope'],'website-guide':['Sources','Help'],'org-project-tasks':['Views','Quick links']
};
const text=s=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export function compactBasantiContents(html,page){
 if(page.includes('/v8/'))return html.replace(/<nav\b[^>]*class="[^"]*\borg-contents\b[^"]*"[^>]*>[\s\S]*?<\/nav>/,'');
 const aliases=new Map(),sections=[];
 for(const tag of html.matchAll(/<section\b[^>]*>|<\/section>|<h2\b[^>]*>/g)){
  if(tag[0]==='</section>'){sections.pop();continue;}
  const id=tag[0].match(/\bid="([^"]+)"/)?.[1];
  if(tag[0].startsWith('<section'))sections.push(id??null);
  else if(id){const owner=[...sections].reverse().find(s=>map[s]);if(owner)aliases.set(id,map[owner]);}
 }
 return html.replace(/<nav\b([^>]*class="[^"]*\borg-contents\b[^"]*"[^>]*)>([\s\S]*?)<\/nav>/,(_,attrs,body)=>{
  const groups=new Map(),add=(group,label,href)=>{if(!groups.has(group))groups.set(group,[]);if(!groups.get(group).some(l=>l.href===href))groups.get(group).push({label,href});};
  for(const m of body.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
   const id=m[1].split('#')[1]??'',version=id.match(/^version-(\d+)$/),known=map[id]??aliases.get(id),label=text(m[2]);
   const [group,short]=version?['Versions','V'+version[1]]:known??['Sources',label.split(' ').slice(0,4).join(' ')];add(group,short,m[1]);
  }
  add('Quantities','BOQ · v8',siteHref(page,'construction/models/basanti-workbench/v8/?panel=boq#boq'));add('Gantt','Gantt · v8',siteHref(page,'construction/models/basanti-workbench/v8/?panel=gantt#gantt'));
  const headingAttrs=body.match(/<h2([^>]*)>/)?.[1]??'',ordered=['Views','Quantities','Steel','Gantt','Versions','Sources'].filter(g=>groups.has(g));
  return `<nav${attrs.replace(/class="([^"]*)"/,'class="$1 bd-compact-toc"')}><h2${headingAttrs}>Contents</h2><div class="bd-toc-groups">${ordered.map(group=>`<details class="bd-toc-group" name="basanti-contents"><summary>${e(group)}</summary><ul>${groups.get(group).map(l=>`<li><a href="${l.href}">${e(l.label)}</a></li>`).join('')}</ul></details>`).join('')}</div></nav>`;
 });
}

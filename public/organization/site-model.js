export const GROUPS = [
  {id:'workspace',label:'Workspace',items:[
    {id:'home',label:'Overview',path:'',icon:'home'},
    {id:'directory',label:'All pages',path:'directory/',icon:'search'}
  ]},
  {id:'projects',label:'Projects',items:[
    {id:'paila',label:'Paila Pilates',note:'Studio interior',path:'projects/paila-pilates/',icon:'studio'},
    {id:'basanti',label:'Basanti Poudel Baral',note:'Residence · project 14',path:'construction/models/basanti-residence/milestone.html',icon:'building'}
  ]},
  {id:'tools',label:'Drawings & design',items:[
    {id:'drawings',label:'Drawing library',path:'construction/',icon:'layers'},
    {id:'formwork',label:'Column formwork CAD',path:'cad/',icon:'ruler'},
    {id:'designer',label:'Layout Designer',path:'construction/models/layout-designer/',icon:'layout'}
  ]},
  {id:'records',label:'Records & learning',items:[
    {id:'sources',label:'Sources & exports',path:'library/',icon:'folder'},
    {id:'progress',label:'Extraction progress',path:'progress/',icon:'chart'},
    {id:'memory',label:'Memory Posters',path:'memory-posters/',icon:'book'},
    {id:'guide',label:'Website guide & references',path:'guide/organization/',icon:'compass'}
  ]}
];

export const PROJECTS = {
  paila:{id:'paila',label:'Paila Pilates',subtitle:'Studio interior',path:'projects/paila-pilates/'},
  basanti:{id:'basanti',label:'Basanti Poudel Baral',subtitle:'Residence · project 14',path:'construction/models/basanti-residence/milestone.html'},
  formwork:{id:'formwork',label:'Column formwork',subtitle:'Reusable CAD study',path:'cad/'},
  workspace:{id:'workspace',label:'Workspace',subtitle:'Shared tools and records',path:''}
};

export function normalisePath(path='') {
  return String(path).replace(/^\/+/, '').replace(/(?:^|\/)index\.html$/, '').replace(/\/$/,'');
}

export function classifyPage(path='') {
  const p=normalisePath(path);
  if(p==='projects/paila-pilates'||/construction\/(?:estimates\/pilates-|models\/pilates-sketchup)/.test(p)) {
    const supplier=p.includes('pilates-hamro-');
    return {project:'paila',category:supplier?'Supplier quotation':p.includes('/pilates-sketchup')?'Model & quantities':p.includes('/v14')?'Programme':p.endsWith('milestone.html')?'Versions':p==='projects/paila-pilates'?'Project hub':'Estimate & materials',active:'paila'};
  }
  if(/construction\/models\/basanti-(?:residence|workbench)/.test(p)) {
    return {project:'basanti',category:p.includes('/v7')?'MEP coordination':p.endsWith('milestone.html')?'Project hub':p.endsWith('/interior.html')?'Interior & furniture':p.includes('basanti-residence')?'Building drawings':p.includes('/changes')?'Change report':'Structure & quantities',active:'basanti'};
  }
  if(p==='cad')return {project:'formwork',category:'Drawings & quantities',active:'formwork'};
  if(p==='construction')return {project:'workspace',category:'Drawing library',active:'drawings'};
  if(p.includes('layout-designer'))return {project:'workspace',category:'Design tool',active:'designer'};
  if(p==='progress')return {project:'workspace',category:'Extraction progress',active:'progress'};
  if(p==='memory-posters')return {project:'workspace',category:'Learning',active:'memory'};
  if(p==='library')return {project:'workspace',category:'Sources & exports',active:'sources'};
  if(p==='directory')return {project:'workspace',category:'Page directory',active:'directory'};
  if(p.startsWith('guide/'))return {project:'workspace',category:'Website guide',active:'guide'};
  return {project:'workspace',category:'Overview',active:'home'};
}

export function searchRecords(records,query='',{project='',format='',limit=Infinity}={}) {
  const words=String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return records.filter(item=>(!project||item.project===project)&&(!format||item.format===format)&&words.every(word=>`${item.title??''} ${item.description??''} ${item.project_label??''} ${item.category??''} ${item.path??''} ${(item.headings??[]).map(h=>h.text).join(' ')}`.toLocaleLowerCase().includes(word))).slice(0,limit);
}

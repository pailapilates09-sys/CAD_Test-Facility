export const GROUPS = [
  {id:'workspace',label:'Workspace',items:[
    {id:'home',label:'Overview',path:'',icon:'home'},
    {id:'directory',label:'All pages',path:'directory/',icon:'search'}
  ]},
  {id:'projects',label:'Projects',items:[
    {id:'paila',label:'Paila Pilates',note:'Studio interior',path:'projects/paila-pilates/',icon:'studio'},
    {id:'basanti',label:'Basanti Poudel Baral',note:'Residence · project 14',path:'construction/models/basanti-residence/milestone.html',icon:'building'}
  ]},
  {id:'tools',label:'Drawings & tools',items:[
    {id:'formwork',label:'Column formwork CAD',path:'cad/',icon:'ruler'},
    {id:'designer',label:'Layout Designer',path:'construction/models/layout-designer/',icon:'layout'},
    {id:'drawings',label:'Drawing library',path:'construction/',icon:'layers'}
  ]},
  {id:'records',label:'Progress & source files',items:[
    {id:'sources',label:'Sources & exports',path:'library/',icon:'folder'},
    {id:'progress',label:'Extraction progress',path:'progress/',icon:'chart'}
  ]},
  {id:'learning',label:'Learning & guides',items:[
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

export const PAGE_KINDS = {
  overview:'Hubs & directories',
  quotation:'Original quotations',
  version:'Versioned workspaces',
  'work-detail':'Individual work details',
  model:'Drawings & design tools',
  reference:'Progress, sources & learning'
};

export function pageKind(path='') {
  const p=normalisePath(path);
  if(/\/pilates-astra-[^/]+\/v(?:8|10)\/[^/]+\.html$/.test(p))return 'work-detail';
  if(!p||p==='directory'||p==='projects/paila-pilates'||p.endsWith('/milestone.html'))return 'overview';
  if(/^construction\/estimates\/pilates-(?:astra|hamro)-[^/]+$/.test(p))return 'quotation';
  if(/\/basanti-workbench(?:\/v\d+)?$/.test(p)||/\/pilates-astra-[^/]+\/v[\d.]+$/.test(p))return 'version';
  if(p==='cad'||p==='construction'||/\/models\/(?:pilates-sketchup|layout-designer|basanti-residence)(?:\/interior\.html)?$/.test(p))return 'model';
  return 'reference';
}

const estimateCategories={v2:'Scope & hierarchy',v3:'SI units',v4:'Rate research',v5:'Rate comparison','v5.1':'Comparison graphs',v6:'Work illustrations',v7:'Labour & materials',v8:'Material quantity scenarios',v9:'Technical source register',v10:'Contractor worksheets',v11:'All materials inline',v12:'Buy or delegate',v13:'Budget & savings',v14:'Construction programme'};

export function normalisePath(path='') {
  return String(path).replace(/^\/+/, '').replace(/(?:^|\/)index\.html$/, '').replace(/\/$/,'');
}

export function classifyPage(path='') {
  const p=normalisePath(path);
  if(p==='projects/paila-pilates'||/construction\/(?:estimates\/pilates-|models\/pilates-sketchup)/.test(p)) {
    const supplier=p.includes('pilates-hamro-');
    const version=p.match(/\/pilates-astra-[^/]+\/(v[\d.]+)(?:\/|$)/)?.[1];
    return {project:'paila',category:supplier?'Hamro quotation':p.includes('/pilates-sketchup')?'Studio model & quantities':p.endsWith('milestone.html')?'Astra versions':p==='projects/paila-pilates'?'Project hub':estimateCategories[version]??'Astra original quotation',active:'paila'};
  }
  if(/construction\/models\/basanti-(?:residence|workbench)/.test(p)) {
    return {project:'basanti',category:p.includes('/v8')?'BOQ & programme':p.includes('/v7')?'MEP coordination':p.endsWith('milestone.html')?'Project hub':p.endsWith('/interior.html')?'Interior & furniture':p.includes('basanti-residence')?'Building drawings':p.includes('/changes')?'Change report':'Structure & quantities',active:'basanti'};
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

export function searchRecords(records,query='',{project='',format='',kind='',limit=Infinity}={}) {
  const words=String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return records.filter(item=>(!project||item.project===project)&&(!format||item.format===format)&&(!kind||kind==='all'||(kind==='main'?item.kind!=='work-detail':item.kind===kind))&&words.every(word=>`${item.title??''} ${item.description??''} ${item.project_label??''} ${item.category??''} ${item.format??''} ${PAGE_KINDS[item.kind]??''} ${item.path??''} ${(item.headings??[]).map(h=>h.text).join(' ')}`.toLocaleLowerCase().includes(word))).slice(0,limit);
}

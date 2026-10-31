import {workspaceState as baseState,filterItems as baseFilter} from '../v8/register-model.js';
import {SYSTEMS} from '../v7/mep-model.js';
export {DISCIPLINES,BASIS,FLOORS,groupProgramme,csv} from '../v8/register-model.js';

export function workspaceState(params){
  const pick=(key,values,fallback)=>values.includes(params.get(key))?params.get(key):fallback;
  return {...baseState(params),
    system:pick('system',['all',...Object.keys(SYSTEMS)],'all'),
    element:params.get('element'),
    layout:pick('layout',['split','plan','model'],'split'),
    camera:pick('camera',['iso','top','front','side'],'iso'),
    sort:pick('sort',['code','name','quantity'],'code'),
    unit:params.get('unit')??'all',
    related:params.get('related')??''
  };
}

export function filterItems(items,state={}){
  const rows=baseFilter(items,state).filter(item=>
    (!state.unit||state.unit==='all'||item.unit===state.unit)&&
    (!state.related||`${item.origin}:${item.task_id}`===state.related)&&
    (!state.system||state.system==='all'||item.discipline!=='mep'||item.system===state.system)
  );
  const compare=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true});
  return rows.sort(state.sort==='name'?(a,b)=>compare(a.label,b.label)||compare(a.code,b.code):
    state.sort==='quantity'?(a,b)=>compare(a.unit,b.unit)||(a.quantity===null)-(b.quantity===null)||
      (b.quantity??0)-(a.quantity??0)||compare(a.code,b.code):()=>0);
}

export function filteredRuns(model,{system='all',floor='all',query=''}={}){
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return model.runs.filter(run=>(system==='all'||run.system===system)&&
    (floor==='all'||run.level===floor||run.level==='all'||floor==='roof'&&run.system==='rain')&&
    words.every(word=>[run.id,run.size,run.level,run.note,SYSTEMS[run.system]?.name].join(' ').toLowerCase().includes(word)));
}

export function routeComponents(runs){
  return runs.map(run=>({...run,
    label:`${run.id} · ${SYSTEMS[run.system]?.name??run.system} · ${run.size}`,
    kind:'route',status:'proposal',display_color:SYSTEMS[run.system]?.colour,
    geometry:{type:'route',points:run.points}
  }));
}

export function preferredSelection(items,selected,floor='all'){
  return items.find(item=>item.id===selected)?.id??
    items.find(item=>item.level===(floor==='all'?'ground':floor))?.id??items[0]?.id??null;
}

export function selectedPlanLevel(items,selected,floor='all'){
  return floor!=='all'?floor:items.find(item=>item.id===selected)?.level??'ground';
}

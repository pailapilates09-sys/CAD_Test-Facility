// Presentation filters only. Source dimensions, geometry and calculations stay in project.json.
export const ARCHITECTURE_KINDS=Object.freeze(['wall','door','window','vent','sliding door','railing','stair','slab']);
const packages={architecture:ARCHITECTURE_KINDS,envelope:['wall','door','window','vent','sliding door','railing'],structure:['column','beam','slab','stair','footing','tie beam','strap beam'],bands:['sill band','lintel band'],reinforcement:['rebar']};
export function packageAllowsKind(viewPackage,kind){return kind==='all'||viewPackage==='all'||(packages[viewPackage]??null)?.includes(kind)||(viewPackage==='building'&&!['sill band','lintel band','rebar'].includes(kind));}
export function architectureState(params,project){
 const level=params.get('level'),viewPackage=params.get('package'),register=params.get('register');
 return {level:['all','foundation',...project.levels.map(l=>l.id)].includes(level)?level:'ground',viewPackage:['architecture','building','structure','envelope','reinforcement','bands','all'].includes(viewPackage)?viewPackage:'architecture',query:params.get('q')??'',tab:['elements','facts','rooms','openings','structure','reinforcement','steps','ifc','observations','sheets'].includes(register)?register:'elements'};
}
export function filterInteriorRooms(rooms,{level='ground',query=''}={}){
 const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return rooms.filter(r=>(level==='all'||r.level===level)&&words.every(word=>`${r.id} ${r.label} ${r.level} ${r.written_width_m} ${r.written_depth_m}`.toLocaleLowerCase().includes(word)));
}
export function interiorState(params){return {level:['all','ground','first','second'].includes(params.get('level'))?params.get('level'):'ground',query:params.get('q')??'',selected:params.get('room')??null};}

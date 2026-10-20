// All money calculations use integer minor units. Blank is unknown, never zero.
export function parseMinor(value){
 const raw=String(value??'').trim();
 if(!raw)return {minor:null,invalid:false};
 if(!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?$/.test(raw))return {minor:null,invalid:true};
 const [whole,fraction='']=raw.replaceAll(',','').split('.');
 return {minor:BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0')),invalid:false};
}
export function formatMinor(value){
 if(value===null||value===undefined)return 'Not established';
 const amount=BigInt(value),negative=amount<0n,absolute=negative?-amount:amount;
 return (negative?'−':'')+(absolute/100n).toLocaleString('en-IN')+'.'+String(absolute%100n).padStart(2,'0');
}
export function compareBudget(data,input=''){
 const parsed=parseMinor(input),owner=data.groups.find(group=>group.id==='owner'),professional=data.groups.find(group=>group.id==='professional');
 const original=BigInt(data.pre_vat_minor),ownerOriginal=BigInt(owner.original_minor),ownerHeld=BigInt(owner.held_minor);
 const ownerProposed=parsed.minor===null?null:parsed.minor+ownerHeld;
 const saving=ownerProposed===null?null:ownerOriginal-ownerProposed;
 return {invalid:parsed.invalid,owner_proposed_minor:ownerProposed?.toString()??null,professional_proposed_minor:professional.original_minor,works_proposed_minor:ownerProposed===null?null:(ownerProposed+BigInt(professional.original_minor)).toString(),pre_vat_proposed_minor:saving===null?null:(original-saving).toString(),saving_minor:saving?.toString()??null};
}
export function scenarioKey(data){return 'paila-owner-savings:'+data.derivation.source_revision+':'+data.derivation.responsibility_revision;}
export function readScenario(storage,data){
 try{const saved=JSON.parse(storage?.getItem(scenarioKey(data))??'null');return saved?.source_revision===data.derivation.source_revision&&saved?.responsibility_revision===data.derivation.responsibility_revision&&typeof saved.owner_active_cost==='string'?saved.owner_active_cost:'';}catch{return '';}
}

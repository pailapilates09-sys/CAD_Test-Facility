// Pure arithmetic shared by the static build, browser and tests.
export const M2_PER_FT2 = 0.09290304;
export const M_PER_FT = 0.3048;
export const SHEET_M2 = 32 * M2_PER_FT2;
export function numberOrNull(value) {
 if(value === null || value === undefined || String(value).trim() === '') return null;
 const n=Number(value); return Number.isFinite(n) && n>=0 ? n : null;
}
export const moneyRound=n=>Math.round((n+Number.EPSILON)*100)/100;
export const quantityRound=(n,whole=false)=>n===null?null:Math.max(0,whole?Math.ceil(n):Math.ceil((n-1e-9)*1000)/1000);
export function calculateRow(row, draft={}) {
 const q=numberOrNull(Object.hasOwn(draft,'quantity')?draft.quantity:row.quantity);
 const low=numberOrNull(Object.hasOwn(draft,'rate_low')?draft.rate_low:row.rate_low);
 const high=numberOrNull(Object.hasOwn(draft,'rate_high')?draft.rate_high:row.rate_high);
 const invalid=(row.whole_units&&q!==null&&!Number.isInteger(q)) || (low!==null&&high!==null&&high<low);
 const ready=!row.held&&!invalid&&q!==null&&low!==null&&high!==null&&row.currency==='NPR';
 return {quantity:q,rate_low:low,rate_high:high,invalid:Boolean(invalid),amount_low:ready?moneyRound(q*low):null,amount_high:ready?moneyRound(q*high):null};
}
export function subtotal(rows,drafts={}) {
 const calculated=rows.map(r=>calculateRow(r,drafts[r.id]));
 const priced=calculated.filter(r=>r.amount_low!==null);
 return {priced_rows:priced.length,missing_rows:rows.length-priced.length,low:priced.length?moneyRound(priced.reduce((s,r)=>s+r.amount_low,0)):null,high:priced.length?moneyRound(priced.reduce((s,r)=>s+r.amount_high,0)):null};
}
export function sheetsFromCutArea(area,waste=10) {
 const a=numberOrNull(area),w=numberOrNull(waste);
 return a===null||w===null?null:Math.ceil(a*(1+w/100)/SHEET_M2);
}
export function quantityFor(rule,item) {
 const q=Number(item.quantity)*Number(item.no),a=item.unit_code==='ft2'?q*M2_PER_FT2:null;
 if(rule==='count')return item.unit_code==='each'?q:null;
 if(rule==='length')return item.unit_code==='ft'?q*M_PER_FT:null;
 if(rule==='surface')return a===null?null:a;
 if(rule==='surface10')return a===null?null:a*1.1;
 if(rule==='putty')return a===null?null:Math.ceil(q*2/20*1.1/40);
 if(rule==='paint')return a===null?null:Math.ceil(q/50*1.1);
 return null;
}

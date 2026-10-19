import {calculateRow,moneyRound,numberOrNull} from '../v8/calculations.js?source=SOURCE_REVISION';

// Published work, take-off and reference prices are supplied by the shared register.
// Contractor inputs are a separate worksheet, never an allocation of the source quote.
export function workBasis(item){
 const quantity=numberOrNull(item.si.quantity),unit=item.si.unit;
 return {quantity,unit:unit?item.si.unit_label:null,perUnit:quantity!==null&&Boolean(unit)};
}
const invalidNumber=value=>value!==null&&value!==undefined&&String(value).trim()!==''&&numberOrNull(value)===null;
export function materialLine(row,input={}){
 if(row.held)return {quantity:null,rate_low:null,rate_high:null,invalid:false,amount_low:null,amount_high:null,contractor_price:false};
 const draft={};
 if(Object.hasOwn(input,'quantity'))draft.quantity=input.quantity;
 const quoted=Object.hasOwn(input,'price')&&String(input.price??'').trim()!=='';
 if(quoted){draft.rate_low=input.price;draft.rate_high=input.price;}
 const calculated=calculateRow(row,draft);
 const invalid=calculated.invalid||invalidNumber(input.quantity)||invalidNumber(input.price);
 return {...calculated,invalid,amount_low:invalid?null:calculated.amount_low,amount_high:invalid?null:calculated.amount_high,contractor_price:quoted&&!invalid};
}
export function worksheet(item,draft={}){
 const basis=workBasis(item),rows=item.rows.map(row=>({id:row.id,...materialLine(row,draft.rows?.[row.id])}));
 const priced=rows.filter(row=>row.amount_low!==null);
 const sum=key=>priced.length?moneyRound(priced.reduce((total,row)=>total+row[key],0)):null;
 const material={low:sum('amount_low'),high:sum('amount_high'),priced_rows:priced.length,missing_rows:rows.length-priced.length};
 const perUnit=value=>value!==null&&basis.perUnit&&basis.quantity>0?moneyRound(value/basis.quantity):null;
 const cost=key=>{
  const rate=item.held?null:numberOrNull(draft[key]);
  return {rate,invalid:invalidNumber(draft[key]),amount:rate===null?null:moneyRound(rate*(basis.perUnit?basis.quantity:1))};
 };
 const labour=cost('labour'),other=cost('other');
 const totalReady=!item.held&&material.missing_rows===0&&material.low!==null&&labour.amount!==null&&other.amount!==null;
 return {basis,rows,material,material_rate:{low:perUnit(material.low),high:perUnit(material.high)},labour,other,total:{low:totalReady?moneyRound(material.low+labour.amount+other.amount):null,high:totalReady?moneyRound(material.high+labour.amount+other.amount):null},held:item.held};
}
export function draftKey(revision,id){return 'paila-contractor:'+revision+':'+id;}
export function readDraft(storage,revision,id){
 try{
  const saved=JSON.parse(storage?.getItem(draftKey(revision,id))??'null');
  if(!saved||saved.source_revision!==revision||saved.work_id!==id||typeof saved.inputs!=='object'||!saved.inputs||Array.isArray(saved.inputs))return {};
  const clean={},values=saved.inputs;
  for(const key of ['labour','other'])if(typeof values[key]==='string'||typeof values[key]==='number')clean[key]=values[key];
  clean.rows={};
  for(const [key,input] of Object.entries(values.rows??{})){
   if(!input||typeof input!=='object')continue;
   const row={};for(const field of ['quantity','price','selection'])if(typeof input[field]==='string'||typeof input[field]==='number')row[field]=input[field];
   clean.rows[key]=row;
  }
  return clean;
 }catch{return {};}
}
const csvCell=value=>{const s=String(value??'');return '"'+(/^[=+@\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';};
export function materialCSV(item,draft={}){
 const totals=worksheet(item,draft),lines=[['Work','Material / specification','Selected brand / size / finish','Quantity','Purchase unit','Unit price low NPR','Unit price high NPR','Amount low NPR','Amount high NPR','Price basis','Quantity basis','Order status']];
 for(const row of item.rows){const input=draft.rows?.[row.id]??{},cost=materialLine(row,input);lines.push([item.title,row.name+'; '+row.note,input.selection,cost.quantity,row.unit,cost.rate_low,cost.rate_high,cost.amount_low,cost.amount_high,cost.contractor_price?'Contractor worksheet input':'Published planning reference; confirm current supplier quote',Object.hasOwn(input,'quantity')?'Contractor quantity input; measure and confirm':row.quantity_basis,item.held?'On hold':'Planning worksheet; confirm specifications, quantities, taxes and stock before ordering']);}
 lines.push([],['Work quantity',item.si.quantity,item.si.unit_label??'unit unspecified'],['Quoted work rate · currency unspecified',item.si.rate,item.si.unit_label??'unit unspecified'],['Labour '+(totals.basis.perUnit?'rate NPR / '+totals.basis.unit:'amount NPR for whole work'),totals.labour.rate],['Other cost '+(totals.basis.perUnit?'rate NPR / '+totals.basis.unit:'amount NPR for whole work'),totals.other.rate],['Material subtotal · partial NPR','','','','','','',totals.material.low,totals.material.high],['Labour amount · contractor input NPR','','','','','','',totals.labour.amount],['Other cost amount · contractor input NPR','','','','','','',totals.other.amount],['Listed worksheet total NPR','','','','','','',totals.total.low,totals.total.high],['Original quoted work amount · currency unspecified','','','','','','',item.original.amount]);
 return lines.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}

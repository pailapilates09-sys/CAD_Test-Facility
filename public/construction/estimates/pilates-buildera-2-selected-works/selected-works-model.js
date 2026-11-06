export function toMills(text){
 if(typeof text!=='string'||!/^\d+(\.\d{1,3})?$/.test(text))throw Error('Invalid selected-work decimal: '+text);
 const [whole,fraction='']=text.split('.');
 const mills=Number(whole)*1000+Number(fraction.padEnd(3,'0'));
 if(!Number.isSafeInteger(mills))throw Error('Selected-work value exceeds supported precision');
 return mills;
}

const formats=[2,3].map(d=>new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:d}));
export function formatMills(mills,exact=false){
 return exact?formats[1].format(mills/1000):formats[0].format(Math.round(mills/10)/100);
}

export function selectedWorksCsv(rows){
 const columns=['S.N.','Area','Work description','Unit','Quantity','Rate (NPR)','Amount (NPR)','Source PDF page'];
 const data=rows.map(r=>[r.id,r.area,r.work,r.unit,r.qty,r.rate,r.amount,r.page]);
 return '\ufeff'+[columns,...data].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}

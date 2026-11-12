export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const priceLabel = price => price===null?'Price not listed':'NPR ' + new Intl.NumberFormat('en-IN').format(price);
export const shelfLabels = {rear:'Back wall',left:'Left corner',right:'Right corner'};
export const rackKey=(room,shelf)=>room+'/'+shelf;
const shapes = new Set(['slippers','slides','sandals','sneaker','school-shoe','boot','box','bowl','jug','tray','bucket','dustpan','bin','basket','mug','stool','bottle','brush','open-umbrella','folded-umbrella','stick-umbrella']);
const hex = /^#[0-9a-f]{6}$/i;
const idPattern = /^[a-z][a-z0-9-]+$/;

export function buildStore(data) {
 const {grid,display,floors,products} = data;
 if (data.schema !== 'saugat-virtual-store-3' || data.currency !== 'NPR' || grid?.unit !== 'ft' ||
     !Number.isFinite(grid.spacing_ft) || grid.spacing_ft <= 0 || !Number.isInteger(grid.columns) || grid.columns < 2 ||
     grid.rows !== 2 || !floors?.length || !products?.length) throw Error('Invalid store layout');
 const step = grid.spacing_ft, length = (grid.columns - 1) * step, depth = step;
 const {floor_to_floor_ft:storeyHeight,pillar_width_ft:pillarWidth,shelf_depth_ft:shelfDepth,shelf_cell_height_ft:cellHeight} = display;
 const slots=display.facings_per_level;
 if (![storeyHeight,pillarWidth,shelfDepth,cellHeight].every(n => Number.isFinite(n) && n > 0) ||
     !Number.isInteger(storeyHeight/cellHeight) || storeyHeight/cellHeight>30 ||
     !Number.isInteger(slots)||slots<1||slots>6) throw Error('Invalid display dimensions');
 const board=.055, bands=Array.from({length:storeyHeight/cellHeight},(_,index)=>({
   index,level:index+1,low:index*cellHeight,high:(index+1)*cellHeight
 }));
 if(cellHeight<=board*2)throw Error('Shelf level is too short');
 const pillars = Array.from({length:grid.rows}, (_,r) => Array.from({length:grid.columns}, (_,c) => ({
   id: String.fromCharCode(65 + r) + (c + 1), x: c * step, y: r * step
 }))).flat();
 const roomMap = new Map(), floorIds = new Set();
 const levels = floors.map((floor, i) => {
   if (!idPattern.test(floor.id) || floorIds.has(floor.id) || !floor.label || floor.rooms.length !== grid.columns - 1) throw Error('Invalid floor ' + floor.id);
   floorIds.add(floor.id);
   const rooms = floor.rooms.map((r,bay) => {
     if (!idPattern.test(r.id) || roomMap.has(r.id) || !r.name || !hex.test(r.color) ||
         Object.keys(shelfLabels).some(id=>!r.rack_labels?.[id]?.trim())) throw Error('Invalid room ' + r.id);
     const x=bay*step;
     const room={...r,bay,x,floor:floor.id,floorLabel:floor.label,shelves:[
       {id:'rear',x:x+step*.155,y:depth-shelfDepth-.45,w:step*.69,d:shelfDepth,along:'x'},
       {id:'left',x:x+.48,y:depth*.44,w:shelfDepth,d:depth*.34,along:'y'},
       {id:'right',x:x+step-shelfDepth-.48,y:depth*.44,w:shelfDepth,d:depth*.34,along:'y'}
     ]};
     roomMap.set(r.id,room);
     return room;
   });
   return {...floor,elevation:i*storeyHeight,rooms};
 });
 const productMap = new Map();
 const items = products.map(p => {
   const room = roomMap.get(p.room), shelf = room?.shelves.find(s => s.id === p.shelf);
   if (!idPattern.test(p.id) || productMap.has(p.id) || !p.name?.trim() ||
       (p.brand!==null&&!p.brand?.trim()) || (p.price_npr!==null&&(!Number.isSafeInteger(p.price_npr)||p.price_npr<0)) ||
       !shelf || !Number.isInteger(p.tier) || bands[p.tier] === undefined || !Number.isFinite(p.slot) || p.slot <= 0 || p.slot >= 1 ||
       !shapes.has(p.shape) || !hex.test(p.color) || !['plastic','footwear','umbrella'].includes(p.type) ||
       !Array.isArray(p.size_ft) || p.size_ft.length !== 3 || !p.size_ft.every(n => Number.isFinite(n) && n > 0)) throw Error('Invalid product ' + p.id);
   const band=bands[p.tier], scale=Math.min(1,(cellHeight-board*2)/p.size_ft[2]);
   const [w,d,h] = p.size_ft.map(n=>n*scale);
   const x = shelf.x + shelf.w*(shelf.along==='x'?p.slot:.5), y = shelf.y + shelf.d*(shelf.along==='y'?p.slot:.5), z=band.low+board;
   if (x-w/2 < shelf.x || x+w/2 > shelf.x+shelf.w || y-d/2 < shelf.y || y+d/2 > shelf.y+shelf.d) throw Error('Product does not fit shelf: ' + p.id);
   const item = {...p,x,y,z,w,d,h,band,floor:room.floor,floorLabel:room.floorLabel,roomName:room.name,roomColor:room.color,category:room.rack_labels[p.shelf]};
   if ([...productMap.values()].some(other => other.room===item.room && other.shelf===item.shelf && other.tier===item.tier &&
       Math.abs(x-other.x) < (w+other.w)/2 && Math.abs(y-other.y) < (d+other.d)/2)) throw Error('Products overlap on shelf: ' + p.id);
   productMap.set(p.id,item);
   return item;
 });
 const racks=new Map(),stockMap=new Map(),home=new Map();
 for(const room of roomMap.values())for(const shelf of room.shelves){
   const key=rackKey(room.id,shelf.id),goods=items.filter(p=>p.room===room.id&&p.shelf===shelf.id);
   if(!goods.length)throw Error('Rack needs at least one catalog item: '+key);
   const facings=[];
   for(const band of bands){
     const row=Array(slots).fill(null);
     for(const p of goods.filter(p=>p.tier===band.index)){
       const nearest=row.map((v,i)=>({v,i,distance:Math.abs((i+.5)/slots-p.slot)})).filter(v=>!v.v).sort((a,b)=>a.distance-b.distance)[0];
       if(!nearest)throw Error('Too many assigned products in '+key+' level '+band.level);
       row[nearest.i]=p;
     }
     for(let i=0;i<slots;i++){
       const assigned=row[i],p=assigned??goods[(band.index+i)%goods.length];
       const scale=Math.min(1,(shelf.along==='x'?shelf.w/slots:shelf.w)*.86/p.w,(shelf.along==='y'?shelf.d/slots:shelf.d)*.84/p.d);
       const x=shelf.x+shelf.w*(shelf.along==='x'?(i+.5)/slots:.5),y=shelf.y+shelf.d*(shelf.along==='y'?(i+.5)/slots:.5);
       const id=room.id+'-'+shelf.id+'-'+band.level+'-'+(i+1);
       const f={...p,id,productId:p.id,band,column:i,x,y,z:band.low+board,w:p.w*scale,d:p.d*scale,h:p.h*scale};
       facings.push(f);stockMap.set(id,f);if(assigned)home.set(p.id,f);
     }
   }
   racks.set(key,{...shelf,key,room:room.id,floor:room.floor,label:room.rack_labels[shelf.id],goods,facings});
 }
 return {...data,levels,pillars,roomMap,productMap,items,step,length,depth,pillarWidth,bands,cellHeight,board,storeyHeight,slots,racks,stockMap,home};
}

export function stockItems(store,floor,room='all',shelf='all',level=0){
 return [...store.racks.values()].filter(r=>r.floor===floor&&(room==='all'||r.room===room)&&(shelf==='all'||r.id===shelf))
  .flatMap(r=>r.facings.filter(f=>!level||f.band.level===level));
}

export function floorItems(store,floor,room='all',level=0,shelf='all') {
 const visible=level?new Set(stockItems(store,floor,room,shelf,level).map(f=>f.productId)):null;
 return store.items.filter(p=>p.floor===floor&&(room==='all'||p.room===room)&&(shelf==='all'||p.shelf===shelf)&&(!visible||visible.has(p.id)));
}

export function viewScope(store,floorId,roomId='all') {
 const floor = store.levels.find(l => l.id===floorId) ?? store.levels[0];
 const rooms = roomId==='all'?floor.rooms:floor.rooms.filter(r=>r.id===roomId);
 const activeRooms = rooms.length?rooms:floor.rooms, start=activeRooms[0].x, end=activeRooms.at(-1).x+store.step;
 return {floor,rooms:activeRooms,start,end,depth:store.depth,pillars:store.pillars.filter(p=>p.x>=start && p.x<=end),
   products:floorItems(store,floor.id,activeRooms.length===1?activeRooms[0].id:'all'),
   stock:stockItems(store,floor.id,activeRooms.length===1?activeRooms[0].id:'all')};
}

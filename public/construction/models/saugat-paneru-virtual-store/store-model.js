export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const priceLabel = price => 'NPR ' + new Intl.NumberFormat('en-IN').format(price);
export const shelfLabels = {rear:'Back wall',left:'Left corner',right:'Right corner'};
const shapes = new Set(['slippers','box','bowl','jug','tray','bucket','dustpan','bin','basket','mug','stool']);
const hex = /^#[0-9a-f]{6}$/i;
const idPattern = /^[a-z][a-z0-9-]+$/;

export function buildStore(data) {
 const {grid,display,floors,products} = data;
 if (data.schema !== 'saugat-virtual-store-1' || data.currency !== 'NPR' || grid?.unit !== 'ft' ||
     !Number.isFinite(grid.spacing_ft) || grid.spacing_ft <= 0 || !Number.isInteger(grid.columns) || grid.columns < 2 ||
     grid.rows !== 2 || !floors?.length || !products?.length) throw Error('Invalid store layout');
 const step = grid.spacing_ft, length = (grid.columns - 1) * step, depth = step;
 const {floor_to_floor_ft:storeyHeight,pillar_width_ft:pillarWidth,shelf_depth_ft:shelfDepth,shelf_levels_ft:tiers} = display;
 if (![storeyHeight,pillarWidth,shelfDepth].every(n => Number.isFinite(n) && n > 0) ||
     !Array.isArray(tiers) || !tiers.length || tiers.some((n,i) => !Number.isFinite(n) || n <= (tiers[i-1] ?? 0) || n >= storeyHeight)) throw Error('Invalid display dimensions');
 const pillars = Array.from({length:grid.rows}, (_,r) => Array.from({length:grid.columns}, (_,c) => ({
   id: String.fromCharCode(65 + r) + (c + 1), x: c * step, y: r * step
 }))).flat();
 const roomMap = new Map(), floorIds = new Set();
 const levels = floors.map((floor, i) => {
   if (!idPattern.test(floor.id) || floorIds.has(floor.id) || !floor.label || floor.rooms.length !== grid.columns - 1) throw Error('Invalid floor ' + floor.id);
   floorIds.add(floor.id);
   const rooms = floor.rooms.map((r,bay) => {
     if (!idPattern.test(r.id) || roomMap.has(r.id) || !r.name || !hex.test(r.color)) throw Error('Invalid room ' + r.id);
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
 const items = products.map((p,i) => {
   const room = roomMap.get(p.room), shelf = room?.shelves.find(s => s.id === p.shelf);
   if (!idPattern.test(p.id) || productMap.has(p.id) || !p.name?.trim() || !p.brand?.trim() || !Number.isSafeInteger(p.price_npr) || p.price_npr < 0 ||
       !shelf || !Number.isInteger(p.tier) || tiers[p.tier] === undefined || !Number.isFinite(p.slot) || p.slot <= 0 || p.slot >= 1 ||
       !shapes.has(p.shape) || !hex.test(p.color) || !['plastic','footwear'].includes(p.type) ||
       !Array.isArray(p.size_ft) || p.size_ft.length !== 3 || !p.size_ft.every(n => Number.isFinite(n) && n > 0)) throw Error('Invalid product ' + p.id);
   const [w,d,h] = p.size_ft, x = shelf.x + shelf.w*(shelf.along==='x'?p.slot:.5), y = shelf.y + shelf.d*(shelf.along==='y'?p.slot:.5), z=tiers[p.tier];
   if (x-w/2 < shelf.x || x+w/2 > shelf.x+shelf.w || y-d/2 < shelf.y || y+d/2 > shelf.y+shelf.d ||
       z+h > (tiers[p.tier+1] === undefined ? storeyHeight : tiers[p.tier+1]-.12)) throw Error('Product does not fit shelf: ' + p.id);
   const item = {...p,number:i+1,x,y,z,w,d,h,floor:room.floor,floorLabel:room.floorLabel,roomName:room.name,roomColor:room.color};
   if ([...productMap.values()].some(other => other.room===item.room && other.shelf===item.shelf && other.tier===item.tier &&
       Math.abs(x-other.x) < (w+other.w)/2 && Math.abs(y-other.y) < (d+other.d)/2)) throw Error('Products overlap on shelf: ' + p.id);
   productMap.set(p.id,item);
   return item;
 });
 return {...data,levels,pillars,roomMap,productMap,items,step,length,depth,pillarWidth,tiers,storeyHeight};
}

export function floorItems(store,floor,room='all') {
 return store.items.filter(p => p.floor===floor && (room==='all' || p.room===room));
}

export function viewScope(store,floorId,roomId='all') {
 const floor = store.levels.find(l => l.id===floorId) ?? store.levels[0];
 const rooms = roomId==='all'?floor.rooms:floor.rooms.filter(r=>r.id===roomId);
 const activeRooms = rooms.length?rooms:floor.rooms, start=activeRooms[0].x, end=activeRooms.at(-1).x+store.step;
 return {floor,rooms:activeRooms,start,end,depth:store.depth,pillars:store.pillars.filter(p=>p.x>=start && p.x<=end),
   products:floorItems(store,floor.id,activeRooms.length===1?activeRooms[0].id:'all')};
}

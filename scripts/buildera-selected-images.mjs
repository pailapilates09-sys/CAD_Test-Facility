import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const astraPath='../pilates-astra-2026-10-15/v6/';
const imagePath=/^images\/[a-z0-9-]+\.webp$/;

export async function resolveSelectedImages(dir,items,data,astra){
 if(data.schema!=='cad-buildera-2-work-images-1'||data.astra_register!==astraPath+'image-register.json')throw Error('Invalid work image register');
 const assets=new Map(),imageByWork=new Map();
 for(const asset of data.assets){
  if(!/^[a-z0-9-]+$/.test(asset.id)||assets.has(asset.id))throw Error('Invalid work image ID '+asset.id);
  let src,record;
  if(asset.kind==='generated'&&asset.generator&&asset.prompt&&imagePath.test(asset.path)){
   src=asset.path;record=asset;
  }else if(asset.kind==='astra-v6'){
   record=astra.assets.find(a=>a.id===asset.asset_id);
   const file=record?.local_path.replace(/^\.\//,'');
   if(!imagePath.test(file)||!record.author||!record.license||!/^https:\/\//.test(record.source_page)||!/^https:\/\//.test(record.license_url))throw Error('Invalid licensed work reference '+asset.id);
   src=astraPath+file;
  }else throw Error('Invalid work image origin '+asset.id);
  const bytes=await readFile(new URL(src,dir));
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error('Work image differs from register: '+asset.id);
  if(!Number.isInteger(record.width)||!Number.isInteger(record.height)||record.width<1||record.height<1)throw Error('Invalid work image dimensions '+asset.id);
  assets.set(asset.id,{...record,src,kind:asset.kind});
 }
 const ids=new Set(items.map(i=>i.id));
 for(const image of data.items){
  const asset=assets.get(image.asset_id);
  if(!ids.has(image.work_id)||!asset||imageByWork.has(image.work_id)||!image.alt||!image.scope_note)throw Error('Invalid work image mapping for '+image.work_id);
  imageByWork.set(image.work_id,{...asset,...image});
 }
 if(imageByWork.size!==ids.size)throw Error('Every quoted work needs an image reference');
 return imageByWork;
}

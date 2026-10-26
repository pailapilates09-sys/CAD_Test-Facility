import * as THREE from '../vendor/three.module.min.js';
import {createBuildingAdapter} from '../public/construction/models/basanti-residence/three-adapter.js';
import {measureExport} from '../public/construction/models/basanti-residence/geometry-checks.js';
import {wallPanels} from '../public/construction/models/basanti-residence/building-model.js';
import {writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

export async function buildBuildingIFC(root,data,model){
 const adapter=createBuildingAdapter(THREE),scene=adapter.create({...model,components:model.components.filter(c=>c.kind!=='rebar')},wallPanels),payload={title:model.title,source_sha256:model.source_sha256,levels:model.levels,base_count:model.base_components.length,reinforcement_sets:model.reinforcement_sets.map(c=>c.id),components:model.components.map(c=>{if(c.kind==='rebar')return c;const geometry=adapter.exportGeometry(scene,c.id);return {...c,mesh_export:geometry,gross_geometry_check:measureExport(geometry)};})},temp=await mkdtemp(join(tmpdir(),'paila-ifc-'));
 try{const path=join(temp,'model.json');await writeFile(path,JSON.stringify(payload));const receipt=execFileSync('python3',[fileURLToPath(new URL('tools/building/export_ifc.py',root)),path,fileURLToPath(data)],{encoding:'utf8',maxBuffer:2_000_000});console.log('IFC review export:',receipt.trim());}finally{await rm(temp,{recursive:true,force:true});}
}

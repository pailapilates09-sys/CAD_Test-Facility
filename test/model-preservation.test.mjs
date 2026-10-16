import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
test('unread SKP status never invents geometry counts or duplicate conclusions',async()=>{
 const r=JSON.parse(await readFile(new URL('../public/construction/models/pilates-sketchup/source-register.json',import.meta.url)));
 assert.equal(r.source_size_bytes,r.preserved_copy_size_bytes);assert.equal(r.geometry_extraction_status,'blocked_download_limit');assert.equal(r.duplicate_analysis_status,'not_inspected');assert.equal(r.source_sha256,null);assert.equal(r.model_count,null);assert.equal(r.component_count,null);
});
test('duplicate inspector distinguishes coincident instances from intentional separate placement',()=>{
 const source=new URL('../tools/sketchup/ingest-scene.py',import.meta.url).pathname;
 const script=`import importlib.util,sys\nsys.dont_write_bytecode=True\ns=importlib.util.spec_from_file_location('inspector',${JSON.stringify(source)});m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\ni=m.IDENTITY.copy();offset=i.copy();offset[12]=3\nscene={'root':{'children':[{'id':'a','definition_id':'d','matrix_m':i},{'id':'b','definition_id':'d','matrix_m':i},{'id':'c','definition_id':'d','matrix_m':offset}]},'definitions':[{'id':'d','children':[]}]}\nr,rows=m.inspect(scene)\nassert r['placed_instance_occurrences']==3\nassert len(r['repeated_definitions'])==1\nassert len(r['coincident_instance_candidates'])==1\nassert r['coincident_instance_candidates'][0]['paths']==['root/a','root/b']\nassert len(rows)==3\nprint('synthetic duplicate fixture passed')`;
 assert.match(execFileSync('python',['-c',script],{encoding:'utf8'}),/passed/);
});

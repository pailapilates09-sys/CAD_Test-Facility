import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
test('SKP status is backed by actual extraction counts and scoped duplicate review',async()=>{
 const r=JSON.parse(await readFile(new URL('../public/construction/models/pilates-sketchup/source-register.json',import.meta.url)));
 const report=JSON.parse(await readFile(new URL('../public/construction/models/pilates-sketchup/inspection.json',import.meta.url)));
 assert.equal(r.source_size_bytes,r.preserved_copy_size_bytes);assert.equal(r.geometry_extraction_status,'decoded_supported_entities');assert.equal(r.duplicate_analysis_status,'candidates_identified_review_required');assert.match(r.source_sha256,/^[a-f0-9]{64}$/);assert.equal(r.model_count,1);assert.equal(r.component_count,report.definition_count);assert.equal(r.geometry_count,report.decoded_counts.faces);
 assert.deepEqual(report.decoded_counts,report.entity_counts);assert.equal(report.sqlite_quick_check,'ok');assert.equal(report.reference_validation.edges_with_missing_vertices,0);assert.equal(report.reference_validation.face_coedges_with_missing_edges,0);assert.deepEqual(report.reference_validation.missing_definition_ids,[]);assert.equal(r.coincident_candidate_groups,report.coincident_instance_candidates.length);assert.equal(report.layout_validation_status,'needs_review');
});
test('published browser partition keeps explicit scope and valid face/instance data',async()=>{
 const base=new URL('../public/construction/models/pilates-sketchup/',import.meta.url);
 const scene=JSON.parse(await readFile(new URL('architectural-base.scene.json',base))),report=JSON.parse(await readFile(new URL('inspection.json',base))),views=JSON.parse(await readFile(new URL('saved-views.json',base)));
 assert.equal(scene.schema_version,'paila-scene-1.0');assert.equal(scene.units,'m');assert.equal(report.browser_preview.complete_model,false);assert.match(scene.source.scope,/not the complete/);
 const defs=new Map(scene.definitions.map(d=>[d.id,d]));let faces=0,triangles=0;
 for(const d of [scene.root,...scene.definitions]){for(const c of d.children){assert.ok(defs.has(c.definition_id));assert.equal(c.matrix_m.length,16);assert.ok(c.matrix_m.every(Number.isFinite))}for(const f of d.faces){faces++;assert.ok(f.positions.every(p=>p.length===3&&p.every(Number.isFinite)));for(const tri of f.polygons){triangles++;assert.equal(tri.length,3);assert.ok(tri.every(i=>Number.isInteger(i)&&i>=0&&i<f.positions.length))}}}
 assert.equal(faces,report.browser_preview.face_count);assert.equal(triangles,report.browser_preview.triangle_count);assert.equal(views.views.length,report.saved_view_thumbnail_count);
 for(const v of views.views)assert.ok((await readFile(new URL(v.preview_path,base))).length>0);
});
test('duplicate inspector distinguishes coincident instances from intentional separate placement',()=>{
 const source=new URL('../tools/sketchup/ingest-scene.py',import.meta.url).pathname;
 const script=`import importlib.util,sys\nsys.dont_write_bytecode=True\ns=importlib.util.spec_from_file_location('inspector',${JSON.stringify(source)});m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\ni=m.IDENTITY.copy();offset=i.copy();offset[12]=3\nscene={'root':{'children':[{'id':'a','definition_id':'d','matrix_m':i},{'id':'b','definition_id':'d','matrix_m':i},{'id':'c','definition_id':'d','matrix_m':offset}]},'definitions':[{'id':'d','children':[]}]}\nr,rows=m.inspect(scene)\nassert r['placed_instance_occurrences']==3\nassert len(r['repeated_definitions'])==1\nassert len(r['coincident_instance_candidates'])==1\nassert r['coincident_instance_candidates'][0]['paths']==['root/a','root/b']\nassert len(rows)==3\nprint('synthetic duplicate fixture passed')`;
 assert.match(execFileSync('python',['-c',script],{encoding:'utf8'}),/passed/);
});

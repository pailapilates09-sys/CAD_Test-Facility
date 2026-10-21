import {readFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {basename,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const milestones={
 M2:{tag:'workspace-m2-2026-10-18',manifestPath:'public/milestones/workspace-m2-2026-10-18.json',notesPath:'public/milestones/WORKSPACE-M2-2026-10-18.md'},
 M3:{tag:'workspace-m3-2026-10-19',manifestPath:'public/milestones/workspace-m3-2026-10-19.json',notesPath:'public/milestones/WORKSPACE-M3-2026-10-19.md'},
 M4:{tag:'workspace-m4-2026-10-20',manifestPath:'public/milestones/workspace-m4-2026-10-20.json',notesPath:'public/milestones/WORKSPACE-M4-2026-10-20.md'},
 M5:{tag:'workspace-m5-2026-10-21',manifestPath:'public/milestones/workspace-m5-2026-10-21.json',notesPath:'public/milestones/WORKSPACE-M5-2026-10-21.md'},
 M6:{tag:'workspace-m6-2026-10-22',manifestPath:'public/milestones/workspace-m6-2026-10-22.json',notesPath:'public/milestones/WORKSPACE-M6-2026-10-22.md'}
};
export function validateWorkspaceMilestone(m){
 const spec=milestones[m.id];
 if(m.schema_version!=='workspace-milestone-1.0.0'||!spec||m.tag!==spec.tag)throw new Error('Unexpected workspace milestone');
 if(typeof m.title!=='string'||!m.title.trim()||/[\r\n]/.test(m.title)||m.title.length>160)throw new Error('Invalid workspace milestone title');
 if(m.release_notes_path!==spec.notesPath||!/^[a-f0-9]{40}$/.test(m.base_commit))throw new Error('Unexpected workspace source or notes path');
 const previous={M2:'pilates-estimates-m1-2026-10-17',M3:milestones.M2.tag,M4:milestones.M3.tag,M5:milestones.M4.tag,M6:milestones.M5.tag}[m.id];
 if(m.previous_milestone_tag!==previous||(['M2','M3'].includes(m.id)&&(m.coverage.generated_pages!==66||m.coverage.latest_estimate_version!=='v8')))throw new Error('Incomplete milestone preservation');
 if(m.verification.browser_animation_qa!=='unverified')throw new Error('Unexpected browser verification claim');
 if(m.id==='M2'&&(m.verification.automated_tests!==69||m.verification.live_files_verified!==79))throw new Error('Unexpected verification claims');
 if(m.id==='M3'&&(m.verification.automated_tests!==78||m.verification.milestone_record_automated_tests!==81||m.verification.live_files_verified<85||m.verification.mobile_device_visual_qa!=='unverified'||m.coverage.work_detail_pages!==51||m.coverage.held_works!==6||m.coverage.summary_allowances!==2))throw new Error('Unexpected mobile milestone verification or preservation');
 if(m.id==='M4'){
  const c=m.coverage,v=m.verification;
  if(c.generated_pages!==121||c.primary_sections!==3||c.estimate_views!==12||c.latest_estimate_version!=='v11'||c.work_detail_pages!==102||c.inline_work_panels!==51||c.material_rows!==261||c.held_works!==6||c.summary_allowances!==2||c.memory_posters!==11||c.reusable_prompts!==5||c.source_content_extraction_claimed!==false||c.accepted_original_component_splits!==0)throw Error('Incomplete v11 / Memory Posters preservation');
  if(!Number.isInteger(v.automated_tests)||v.automated_tests<104||!Number.isInteger(v.milestone_record_automated_tests)||v.milestone_record_automated_tests<107||!Number.isInteger(v.live_files_verified)||v.live_files_verified<25||v.mobile_device_visual_qa!=='unverified'||v.drive_source_bodies_reverified_for_this_release!==false||v.publication_policy!=='Tag the milestone-record commit after its checks and Pages deployment succeed')throw Error('Unexpected v11 / Memory Posters verification');
 }
 if(m.id==='M5'){
  const c=m.coverage,v=m.verification,s=m.storage;
  if(c.generated_pages!==123||c.primary_sections!==5||c.estimate_views!==14||c.latest_estimate_version!=='v13'||c.quoted_works!==51||c.held_works!==6||c.summary_allowances!==2||c.indexed_geometry_records!==8172940||c.coincident_candidate_groups!==44||c.full_geometry_in_browser!==false)throw Error('Incomplete native extraction preservation');
  if(v.source_commit!==m.base_commit||v.automated_tests!==127||(!Number.isInteger(v.milestone_record_automated_tests)||v.milestone_record_automated_tests<130)||v.live_files_verified!==36||v.mobile_device_visual_qa!=='unverified'||v.desktop_model_comparison!=='pending'||v.publication_policy!=='Tag the milestone-record commit after its checks and Pages deployment succeed')throw Error('Unexpected native extraction verification');
  if(s?.frontend_mode!=='github_static_copies'||s.live_drive_fetch!==false||s.automatic_drive_sync!==false||s.geometry_archive_parts!==11||s.geometry_formats?.join(',')!=='JSONL,SQL,SQLite'||m.version_control?.working_branch!=='work/after-workspace-m5')throw Error('Unexpected storage or branch plan');
 }
 if(m.id==='M6'){
  const c=m.coverage,v=m.verification;
  if(c.generated_pages!==123||c.latest_estimate_version!=='v13'||c.quoted_works!==51||c.held_works!==6||c.summary_allowances!==2||c.linked_views!==3||c.room_placements!==242||c.item_types!==106||c.preview_triangles!==946789)throw Error('Incomplete linked room preservation');
  if(v.source_commit!==m.base_commit||v.automated_tests!==135||v.milestone_record_automated_tests!==138||v.desktop_model_comparison!=='pending'||v.rendered_3d_visual_qa!=='unverified'||v.publication_policy!=='Tag the milestone-record commit after its checks and Pages deployment succeed')throw Error('Unexpected linked room verification');
  if(m.storage?.live_drive_fetch!==false||m.storage?.automatic_drive_sync!==false||m.version_control?.existing_tags_moved!==false)throw Error('Unexpected linked room storage or rollback claim');
 }
 if(!Array.isArray(m.remaining_debt)||m.remaining_debt.length<6||Object.keys(m.preservation_sha256??{}).length<10||Object.values(m.preservation_sha256).some(v=>!/^[a-f0-9]{64}$/.test(v)))throw new Error('Missing preservation hashes or remaining debt');
 return {tag:m.tag,title:m.title,notesPath:spec.notesPath,manifestPath:spec.manifestPath};
}

export function changedWorkspaceManifests(diff){
 return diff.trim().split(/\r?\n/).filter(path=>/^public\/milestones\/workspace-.*\.json$/.test(path)).map(path=>{
  if(!Object.values(milestones).some(spec=>spec.manifestPath===path))throw new Error('Unexpected workspace milestone manifest: '+path);
  return path;
 });
}

// Check the snapshot only when publishing its record, so future UI edits do not rewrite a frozen milestone.
export function verifyWorkspaceFiles(m,root=process.cwd()){
 for(const [path,expected] of Object.entries(m.preservation_sha256)){
  if(!/^[a-zA-Z0-9._/-]+$/.test(path)||path.startsWith('/')||path.split('/').some(x=>x==='..'))throw new Error('Unexpected preservation path');
  const actual=createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex');
  if(actual!==expected)throw new Error('Workspace snapshot hash differs: '+path);
 }
}

export function runWorkspaceRelease(){
 const repo=process.env.GITHUB_REPOSITORY,sha=process.env.GITHUB_SHA;
 if(repo!=='pailapilates09-sys/CAD_Test-Facility'||!/^[a-f0-9]{40}$/.test(sha??''))throw new Error('Unexpected workspace release repository or commit');
 const changed=spawnSync('git',['diff','--name-only','HEAD^','HEAD','--','public/milestones/'],{encoding:'utf8'});
 if(changed.status!==0)throw new Error(changed.stderr);
 const paths=changedWorkspaceManifests(changed.stdout);
 if(!paths.length){console.log('Workspace milestone manifests unchanged; no tag or release created.');return}
 for(const manifestPath of paths){
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8')),{tag,title,notesPath,manifestPath:expectedPath}=validateWorkspaceMilestone(manifest);
 if(manifestPath!==expectedPath)throw new Error('Workspace manifest path does not match its milestone');
 verifyWorkspaceFiles(manifest);
 const notes=readFileSync(notesPath,'utf8');
 const gh=(args,allow404=false)=>{
  const r=spawnSync('gh',args,{encoding:'utf8'});
  if(r.status!==0){if(allow404&&/HTTP 404/.test(r.stderr))return null;throw new Error(r.stderr||r.error?.message||'GitHub command failed')}
  return r.stdout;
 };
 const api=(path,allow404=false)=>{const raw=gh(['api',path],allow404);return raw===null?null:JSON.parse(raw)};
 const refPath=`repos/${repo}/git/ref/tags/${tag}`;
 let ref=api(refPath,true);
 if(ref){let object=ref.object;for(let i=0;i<5&&object.type==='tag';i++)object=api(`repos/${repo}/git/tags/${object.sha}`).object;if(object.type!=='commit'||object.sha!==sha)throw new Error('Existing workspace tag points elsewhere; refusing to move it')}
 else{gh(['api','--method','POST',`repos/${repo}/git/refs`,'-f',`ref=refs/tags/${tag}`,'-f',`sha=${sha}`]);ref=api(refPath);if(ref.object.type!=='commit'||ref.object.sha!==sha)throw new Error('Workspace tag failed readback')}
 let release=api(`repos/${repo}/releases/tags/${tag}`,true);
 if(!release){gh(['release','create',tag,manifestPath,'--repo',repo,'--verify-tag','--title',title,'--notes-file',notesPath,'--latest']);release=api(`repos/${repo}/releases/tags/${tag}`)}
 const asset=release.assets.find(a=>a.name===basename(manifestPath));
 if(!asset||asset.size!==Buffer.byteLength(readFileSync(manifestPath,'utf8')))throw new Error('Workspace release manifest missing or size differs');
 if(asset.digest&&asset.digest!=='sha256:'+createHash('sha256').update(readFileSync(manifestPath)).digest('hex'))throw new Error('Workspace release manifest digest differs');
 if(release.tag_name!==tag||release.draft||release.prerelease||release.body.trim()!==notes.trim())throw new Error('Workspace release readback differs from the prepared milestone');
 const report={tag,sha,url:release.html_url,release_id:release.id,draft:release.draft,verified:true};console.log(JSON.stringify(report));
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Workspace milestone published\n\n[${tag}](${release.html_url})\n\n${title}\n\nCommit: ${sha}\n\nHistorical milestones, estimate values and the saved progress boundary are preserved. Browser animation/layout QA remains unverified.\n`);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)runWorkspaceRelease();

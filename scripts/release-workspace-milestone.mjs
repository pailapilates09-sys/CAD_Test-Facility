import {readFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {basename,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const manifestPath='public/milestones/workspace-m2-2026-10-18.json';
const notesPath='public/milestones/WORKSPACE-M2-2026-10-18.md';
export function validateWorkspaceMilestone(m){
 if(m.schema_version!=='workspace-milestone-1.0.0'||m.id!=='M2'||m.tag!=='workspace-m2-2026-10-18')throw new Error('Unexpected workspace milestone');
 if(typeof m.title!=='string'||!m.title.trim()||/[\r\n]/.test(m.title)||m.title.length>160)throw new Error('Invalid workspace milestone title');
 if(m.release_notes_path!==notesPath||!/^[a-f0-9]{40}$/.test(m.base_commit))throw new Error('Unexpected workspace source or notes path');
 if(m.previous_milestone_tag!=='pilates-estimates-m1-2026-10-17'||m.coverage.generated_pages!==66||m.coverage.latest_estimate_version!=='v8')throw new Error('Incomplete milestone preservation');
 if(m.verification.browser_animation_qa!=='unverified'||m.verification.automated_tests!==69||m.verification.live_files_verified!==79)throw new Error('Unexpected verification claims');
 if(!Array.isArray(m.remaining_debt)||m.remaining_debt.length<6||Object.keys(m.preservation_sha256??{}).length<10||Object.values(m.preservation_sha256).some(v=>!/^[a-f0-9]{64}$/.test(v)))throw new Error('Missing preservation hashes or remaining debt');
 return {tag:m.tag,title:m.title,notesPath};
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
 const changed=spawnSync('git',['diff','--name-only','HEAD^','HEAD','--',manifestPath],{encoding:'utf8'});
 if(changed.status!==0)throw new Error(changed.stderr);
 if(!changed.stdout.trim()){console.log('Workspace milestone manifest unchanged; no tag or release created.');return}
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8')),{tag,title}=validateWorkspaceMilestone(manifest);
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
 if(release.tag_name!==tag||release.draft||release.prerelease||release.body.trim()!==notes.trim())throw new Error('Workspace release readback differs from the prepared milestone');
 const report={tag,sha,url:release.html_url,release_id:release.id,draft:release.draft,verified:true};console.log(JSON.stringify(report));
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Workspace milestone published\n\n[${tag}](${release.html_url})\n\nCommit: ${sha}\n\nStudio light/dark theme and fluffy free-flying Pip. Historical estimates, source values, M1 and progress are preserved. Browser animation QA remains unverified.\n`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)runWorkspaceRelease();

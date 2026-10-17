import {readFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const manifestPath='public/construction/estimates/pilates-astra-2026-10-15/milestone.json';
const notesPath='construction/estimates/pilates-astra-2026-10-15/MILESTONE-M1.md';
export function validateMilestone(m){
 if(!/^pilates-estimates-m\d+-\d{4}-\d{2}-\d{2}$/.test(m.tag))throw new Error('Invalid estimate milestone tag');
 if(typeof m.title!=='string'||!m.title.trim()||/[\r\n]/.test(m.title)||m.title.length>160)throw new Error('Invalid milestone title');
 if(m.release_notes_path!==notesPath)throw new Error('Unexpected release notes path');
 if(m.latest_version!=='v7'||JSON.stringify(m.synchronized_comparison_versions)!==JSON.stringify(['v5','v5.1','v6','v7']))throw new Error('Incomplete comparison version coverage');
 if(m.coverage.detailed_items!==51||m.coverage.held_items!==6||m.coverage.accepted_original_component_splits!==0)throw new Error('Unexpected preservation coverage');
 if(!Array.isArray(m.remaining_debt)||m.remaining_debt.length<5)throw new Error('Missing remaining input/external debt');
 return {tag:m.tag,title:m.title,notesPath};
}
export function runRelease(){
 const repo=process.env.GITHUB_REPOSITORY,sha=process.env.GITHUB_SHA;
 if(repo!=='pailapilates09-sys/CAD_Test-Facility'||!/^[a-f0-9]{40}$/.test(sha??''))throw new Error('Unexpected release repository or commit');
 const changed=spawnSync('git',['diff','--name-only','HEAD^','HEAD','--',manifestPath],{encoding:'utf8'});
 if(changed.status!==0)throw new Error(changed.stderr);
 if(!changed.stdout.trim()){console.log('Estimate milestone manifest unchanged; no tag or release created.');return}
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8')),{tag,title}=validateMilestone(manifest);
 readFileSync(notesPath,'utf8');
 const gh=(args,allow404=false)=>{
  const r=spawnSync('gh',args,{encoding:'utf8'});
  if(r.status!==0){if(allow404&&/HTTP 404/.test(r.stderr))return null;throw new Error(r.stderr||r.error?.message||'GitHub command failed')}
  return r.stdout;
 };
 const api=(path,allow404=false)=>{const raw=gh(['api',path],allow404);return raw===null?null:JSON.parse(raw)};
 const refPath=`repos/${repo}/git/ref/tags/${tag}`;
 let ref=api(refPath,true);
 if(ref){let object=ref.object;for(let i=0;i<5&&object.type==='tag';i++)object=api(`repos/${repo}/git/tags/${object.sha}`).object;if(object.type!=='commit'||object.sha!==sha)throw new Error('Existing tag points elsewhere; refusing to move it')}
 else{gh(['api','--method','POST',`repos/${repo}/git/refs`,'-f',`ref=refs/tags/${tag}`,'-f',`sha=${sha}`]);ref=api(refPath);if(ref.object.sha!==sha)throw new Error('Created tag failed readback')}
 let release=api(`repos/${repo}/releases/tags/${tag}`,true);
 if(!release){gh(['release','create',tag,manifestPath,'--repo',repo,'--verify-tag','--title',title,'--notes-file',notesPath,'--latest=false']);release=api(`repos/${repo}/releases/tags/${tag}`)}
 if(!release.assets.some(a=>a.name==='milestone.json'&&a.size===Buffer.byteLength(readFileSync(manifestPath,'utf8'))))throw new Error('Release manifest asset missing or size differs');
 if(release.tag_name!==tag||release.draft||release.prerelease)throw new Error('Release readback did not match the published milestone');
 const report={tag,sha,url:release.html_url,release_id:release.id,draft:release.draft,verified:true};console.log(JSON.stringify(report));
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Estimate milestone published\n\n[${tag}](${release.html_url})\n\nCommit: ${sha}\n\nSource currency, supplier breakdowns, six holds, two allowances, SKP extraction and browser QA limits remain documented.\n`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)runRelease();

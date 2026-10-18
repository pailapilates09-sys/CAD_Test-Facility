import {readdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';

export const experienceVersion='studio-1';

// Apply presentation after generating the pages, without rewriting historical templates.
export function decoratePage(html,pagePath,distPath){
 if(html.includes('data-site-experience'))throw new Error('Site experience already applied: '+pagePath);
 const prefix=relative(dirname(pagePath),distPath).split('\\').join('/')||'.';
 const asset=name=>`${prefix}/theme/${name}?v=${experienceVersion}`;
 const boot=`<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f3f5fa"><script src="${asset('boot.js')}"></script>`;
 const styles=`<link rel="stylesheet" href="${asset('studio.css')}" data-site-experience="${experienceVersion}">`;
 const controls=`<aside class="site-rail" aria-label="Appearance and companion">
 <div class="flight-lane" aria-hidden="true"><span class="flight-label">Pip <span>your flying companion</span></span><span class="flight-track"></span><div class="pip-position" id="pip-position"><svg class="pip" viewBox="0 0 100 80"><ellipse class="pip-shadow" cx="48" cy="72" rx="25" ry="3"/><path class="pip-tail" d="M35 43 8 27 18 52 36 54Z"/><path class="pip-wing pip-far" d="M40 43 55 8 67 43Z"/><path class="pip-body" d="M22 49Q41 28 65 35Q77 21 87 32Q93 43 80 53L49 66Z"/><path class="pip-belly" d="M34 53 72 48 50 65Z"/><path class="pip-wing pip-near" d="M44 47 26 12 62 45Z"/><path class="pip-beak" d="M86 36 98 41 86 44Z"/><circle class="pip-eye" cx="80" cy="35" r="2.6"/><path class="pip-cheek" d="M75 43 79 44"/></svg></div></div>
 <div class="experience-controls" hidden><div class="theme-switch" role="group" aria-label="Colour theme"><button type="button" data-theme-choice="light" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>Light</button><button type="button" data-theme-choice="dark" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>Dark</button></div><button type="button" class="flight-control" id="flight-control" aria-pressed="false" aria-label="Pause mascot flight"><span aria-hidden="true" data-flight-icon>Ⅱ</span><span data-flight-label>Pause flight</span></button></div>
 </aside><script type="module" src="${asset('experience.js')}"></script>`;
 return html.replace(/<head([^>]*)>/i,`<head$1>${boot}`).replace(/<\/head>/i,styles+'</head>').replace(/<\/body>/i,controls+'</body>');
}

export async function applySiteExperience(distPath){
 const base=resolve(distPath);let count=0;
 async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const path=resolve(dir,entry.name);
   if(entry.isDirectory())await walk(path);
   else if(entry.name.endsWith('.html')){await writeFile(path,decoratePage(await readFile(path,'utf8'),path,base));count++}
  }
 }
 await walk(base);return count;
}

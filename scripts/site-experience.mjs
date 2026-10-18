import {readdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';

export const experienceVersion='studio-2';

// Apply presentation after generating the pages, without rewriting historical templates.
export function decoratePage(html,pagePath,distPath){
 if(html.includes('data-site-experience'))throw new Error('Site experience already applied: '+pagePath);
 const prefix=relative(dirname(pagePath),distPath).split('\\').join('/')||'.';
 const asset=name=>`${prefix}/theme/${name}?v=${experienceVersion}`;
 const boot=`<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f3f5fa"><script src="${asset('boot.js')}"></script>`;
 const styles=`<link rel="stylesheet" href="${asset('studio.css')}" data-site-experience="${experienceVersion}">`;
 const controls=`<div class="pip-sky" aria-hidden="true"><div class="pip-position" id="pip-position"><div class="pip-facing" id="pip-facing"><svg class="pip" viewBox="0 0 160 144" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pip-fluff" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#fffdf4"/><stop offset=".5" stop-color="#eef8ee"/><stop offset="1" stop-color="#addfce"/></linearGradient><linearGradient id="pip-feathers" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b6a2e2"/><stop offset="1" stop-color="#8672bd"/></linearGradient></defs><g class="pip-puff"><path class="pip-tail" d="M34 91C18 99 8 89 14 82C4 78 10 66 21 70C21 59 36 64 42 76Z"/><path class="pip-wing pip-far" d="M94 64C109 43 126 41 133 51C144 49 149 61 139 67C142 79 120 85 99 80Z"/><path class="pip-feet" d="M63 115Q60 127 69 125M84 116Q84 128 94 123"/><path class="pip-body" d="M38 39C31 30 42 20 51 25C54 10 70 12 76 23C88 12 104 20 103 30C118 24 129 36 125 47C141 49 147 62 139 73C152 84 145 99 133 100C136 115 121 124 110 118C102 133 84 133 75 124C61 137 46 128 43 117C28 121 18 107 22 96C8 91 11 74 21 69C10 55 24 40 38 39Z"/><ellipse class="pip-belly" cx="87" cy="98" rx="35" ry="25"/><path class="pip-fluff-detail" d="M45 44Q50 39 55 44M65 34Q70 29 75 34M89 41Q94 36 99 41M58 110Q63 115 68 110M99 108Q103 112 107 108"/><g class="pip-wing pip-near"><path d="M55 69C37 52 18 44 15 54C4 51 3 64 13 68C3 72 8 84 18 84C15 96 31 98 40 92C54 93 63 81 55 69Z"/><path class="pip-wing-detail" d="M22 65Q34 68 43 79M20 77Q29 77 35 83"/></g><ellipse class="pip-cheek" cx="92" cy="77" rx="8" ry="4.5"/><ellipse class="pip-cheek" cx="128" cy="74" rx="7" ry="4"/><g class="pip-eyes"><ellipse class="pip-eye" cx="99" cy="64" rx="4.5" ry="6.8"/><ellipse class="pip-eye" cx="122" cy="61" rx="4.5" ry="6.8"/><circle class="pip-eye-light" cx="100.5" cy="61.5" r="1.7"/><circle class="pip-eye-light" cx="123.5" cy="58.5" r="1.7"/></g><path class="pip-beak" d="M111 74Q118 69 125 74Q124 79 118 82Q112 79 111 74Z"/></g></svg></div></div></div>
 <aside class="site-rail" aria-label="Appearance and companion"><div class="companion-label" aria-hidden="true"><strong>Pip</strong><span>your fluffy companion</span></div>
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

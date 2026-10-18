export const storageKeys={theme:'cad-theme',flight:'cad-flight',position:'cad-pip-position'};
export const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
export function readPreference(storage,key){try{return storage.getItem(key)}catch{return null}}
export function writePreference(storage,key,value){try{storage.setItem(key,value)}catch{/* Private modes can block storage; controls still work. */}}

export function initExperience(win=window,doc=document){
 const root=doc.documentElement,rail=doc.querySelector('.site-rail');
 if(!rail)return;
 const controls=rail.querySelector('.experience-controls'),themes=[...rail.querySelectorAll('[data-theme-choice]')];
 const flightButton=doc.getElementById('flight-control'),position=doc.getElementById('pip-position'),lane=rail.querySelector('.flight-lane');
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),systemTheme=win.matchMedia('(prefers-color-scheme: dark)');
 // Accessing storage itself can throw (not just getItem).
 const storage=name=>{try{return win[name]}catch{return null}};
 const local=storage('localStorage'),session=storage('sessionStorage');
 let themeOverride=readPreference(local,storageKeys.theme),flightPaused=readPreference(local,storageKeys.flight)==='paused';
 const applyTheme=theme=>{
  root.dataset.theme=theme;
  themes.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme)));
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101827':'#f3f5fa');
 };
 themes.forEach(button=>button.addEventListener('click',()=>{themeOverride=button.dataset.themeChoice;writePreference(local,storageKeys.theme,themeOverride);applyTheme(themeOverride)}));
 systemTheme.addEventListener('change',()=>{if(themeOverride!=='light'&&themeOverride!=='dark')applyTheme(systemTheme.matches?'dark':'light')});
 const initial=Number(readPreference(session,storageKeys.position));
 let progress=Number.isFinite(initial)?clamp(initial,0,1):0,target=progress,frame=0,last=0,elapsed=0;
 function place(){
  const room=Math.max(0,lane.clientWidth-76);
  position.style.transform=`translate3d(${Math.round(progress*room)}px, ${Math.round(Math.sin(elapsed/900)*4)}px, 0)`;
 }
 function tick(time){
  if(root.dataset.flight==='paused'||doc.hidden){frame=0;last=0;return}
  const delta=last?Math.min(time-last,64):16;last=time;elapsed+=delta;
  // A slow patrol also makes the companion alive while reading; scrolling changes its destination.
  const destination=clamp(target+Math.sin(elapsed/2400)*0.09,0,1);
  progress+=(destination-progress)*(1-Math.exp(-delta/320));place();
  frame=win.requestAnimationFrame(tick);
 }
 function start(){if(!frame&&root.dataset.flight==='active'&&!doc.hidden)frame=win.requestAnimationFrame(tick)}
 function applyFlight(){
  const paused=flightPaused||reduced.matches;
  root.dataset.flight=paused?'paused':'active';
  flightButton.setAttribute('aria-pressed',String(paused));
  flightButton.disabled=reduced.matches;
  flightButton.setAttribute('aria-label',reduced.matches?'Flight off: reduced motion enabled':paused?'Resume mascot flight':'Pause mascot flight');
  flightButton.querySelector('[data-flight-label]').textContent=reduced.matches?'Motion off':paused?'Resume flight':'Pause flight';
  flightButton.querySelector('[data-flight-icon]').textContent=paused?'▷':'Ⅱ';
  if(paused){win.cancelAnimationFrame(frame);frame=0;last=0;position.style.transform='translate3d(0, 0, 0)'}else start();
 }
 function scrollTarget(){const range=root.scrollHeight-win.innerHeight;target=range>0?clamp(win.scrollY/range,0,1):0.35}
 flightButton.addEventListener('click',()=>{flightPaused=!flightPaused;writePreference(local,storageKeys.flight,flightPaused?'paused':'active');applyFlight()});
 reduced.addEventListener('change',applyFlight);
 win.addEventListener('scroll',scrollTarget,{passive:true});
 win.addEventListener('resize',()=>{scrollTarget();if(root.dataset.flight==='active')place()},{passive:true});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){win.cancelAnimationFrame(frame);frame=0;last=0}else start()});
 win.addEventListener('pagehide',()=>writePreference(session,storageKeys.position,String(progress)));
 // Keep native links and deep links; only the companion responds to navigation.
 doc.querySelectorAll('nav[aria-label="Workspace"] a').forEach((link,index,links)=>{
  link.addEventListener('pointerenter',()=>{target=(index+0.5)/links.length});
  link.addEventListener('focus',()=>{target=(index+0.5)/links.length});
  link.addEventListener('pointerleave',scrollTarget);
  link.addEventListener('blur',scrollTarget);
 });
 applyTheme(themeOverride==='light'||themeOverride==='dark'?themeOverride:systemTheme.matches?'dark':'light');
 controls.hidden=false;scrollTarget();applyFlight();
 win.addEventListener('storage',event=>{
  if(event.key===storageKeys.theme){themeOverride=event.newValue;applyTheme(themeOverride==='light'||themeOverride==='dark'?themeOverride:systemTheme.matches?'dark':'light')}
  if(event.key===storageKeys.flight){flightPaused=event.newValue==='paused';applyFlight()}
 });
}
if(typeof window!=='undefined'&&typeof document!=='undefined')initExperience();

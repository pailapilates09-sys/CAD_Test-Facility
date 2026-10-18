export const storageKeys={theme:'cad-theme',flight:'cad-flight',position:'cad-pip-position'};
export const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
export function readPreference(storage,key){try{return storage.getItem(key)}catch{return null}}
export function writePreference(storage,key,value){try{storage.setItem(key,value)}catch{/* Private modes can block storage; controls still work. */}}

export function flightBounds(width,height){
 const size=width<=700?92:116;
 const left=Math.min(12,Math.max(0,(width-size)/2)),right=Math.max(left,width-size-left);
 const top=Math.min(width<=700?164:100,Math.max(0,height-size-12));
 return {left,right,top,bottom:Math.max(top,height-size-108),size};
}
export function flightPoint(elapsed,scroll=0){
 return {x:0.5+0.47*Math.sin(elapsed/6500),y:0.5+0.44*Math.sin(elapsed/4300+scroll*Math.PI*2+0.4)};
}
export function restoreFlight(value){
 try{
  const saved=JSON.parse(value);
  if(typeof saved==='number'&&Number.isFinite(saved))return {x:clamp(saved,0,1),y:.25,elapsed:0};
  if(saved&&[saved.x,saved.y,saved.elapsed].every(Number.isFinite))return {x:clamp(saved.x,0,1),y:clamp(saved.y,0,1),elapsed:clamp(saved.elapsed,0,1e9)};
 }catch{/* Start near the edge when no previous flight is available. */}
 return {x:.82,y:.22,elapsed:0};
}

export function initExperience(win=window,doc=document){
 const root=doc.documentElement,rail=doc.querySelector('.site-rail');
 if(!rail)return;
 const controls=rail.querySelector('.experience-controls'),themes=[...rail.querySelectorAll('[data-theme-choice]')];
 const flightButton=doc.getElementById('flight-control'),position=doc.getElementById('pip-position'),facing=doc.getElementById('pip-facing');
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
 const initial=restoreFlight(readPreference(session,storageKeys.position));
 let current={x:initial.x,y:initial.y},frame=0,last=0,elapsed=initial.elapsed,scroll=0,navTarget=null,pointer=null,direction=1;
 function place(){
  const bounds=flightBounds(win.innerWidth,win.innerHeight);
  position.style.transform=`translate3d(${Math.round(bounds.left+current.x*(bounds.right-bounds.left))}px, ${Math.round(bounds.top+current.y*(bounds.bottom-bounds.top))}px, 0)`;
  facing.style.transform=`scaleX(${direction})`;
  position.dataset.ready='true';
 }
 function tick(time){
  if(root.dataset.flight==='paused'||doc.hidden){frame=0;last=0;return}
  const delta=last?Math.min(time-last,64):16;last=time;elapsed+=delta;
  // A broad, smooth flight crosses the viewport; scrolling bends the route.
  const destination=navTarget&&elapsed<navTarget.until?navTarget:flightPoint(elapsed,scroll);
  let goal={x:destination.x,y:destination.y};
  const bounds=flightBounds(win.innerWidth,win.innerHeight),width=bounds.right-bounds.left,height=bounds.bottom-bounds.top;
  if(pointer){
   const dx=bounds.left+current.x*width+bounds.size/2-pointer.x,dy=bounds.top+current.y*height+bounds.size/2-pointer.y;
   if(Math.hypot(dx,dy)<140){
    // Drift away from what the visitor is pointing at, without intercepting clicks.
    goal.x=clamp(current.x+(dx>=0?1:-1)*.25,0,1);goal.y=clamp(current.y+(dy>=0?1:-1)*.2,0,1);
   }
  }
  const alpha=1-Math.exp(-delta/650),dx=(goal.x-current.x)*alpha;
  if(Math.abs(dx)>.0001)direction=dx<0?-1:1;
  current={x:clamp(current.x+dx,0,1),y:clamp(current.y+(goal.y-current.y)*alpha,0,1)};place();
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
  if(paused){win.cancelAnimationFrame(frame);frame=0;last=0;current={x:1,y:1};place()}else start();
 }
 function scrollTarget(){const range=root.scrollHeight-win.innerHeight;scroll=range>0?clamp(win.scrollY/range,0,1):0;navTarget=null}
 flightButton.addEventListener('click',()=>{flightPaused=!flightPaused;writePreference(local,storageKeys.flight,flightPaused?'paused':'active');applyFlight()});
 reduced.addEventListener('change',applyFlight);
 win.addEventListener('scroll',scrollTarget,{passive:true});
 win.addEventListener('resize',()=>{scrollTarget();place()},{passive:true});
 doc.addEventListener('pointermove',event=>{pointer={x:event.clientX,y:event.clientY}},{passive:true});
 doc.addEventListener('pointerleave',()=>{pointer=null});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){win.cancelAnimationFrame(frame);frame=0;last=0}else start()});
 win.addEventListener('pagehide',()=>writePreference(session,storageKeys.position,JSON.stringify({...current,elapsed})));
 // Keep native links and deep links; only the companion responds to navigation.
 doc.querySelectorAll('nav[aria-label="Workspace"] a').forEach((link,index,links)=>{
  const visit=()=>{navTarget={x:(index+0.5)/links.length,y:.04,until:elapsed+2400}};
  link.addEventListener('pointerenter',visit);
  link.addEventListener('focus',visit);
  link.addEventListener('pointerleave',scrollTarget);
  link.addEventListener('blur',scrollTarget);
 });
 applyTheme(themeOverride==='light'||themeOverride==='dark'?themeOverride:systemTheme.matches?'dark':'light');
 controls.hidden=false;scrollTarget();place();applyFlight();
 win.addEventListener('storage',event=>{
  if(event.key===storageKeys.theme){themeOverride=event.newValue;applyTheme(themeOverride==='light'||themeOverride==='dark'?themeOverride:systemTheme.matches?'dark':'light')}
  if(event.key===storageKeys.flight){flightPaused=event.newValue==='paused';applyFlight()}
 });
}
if(typeof window!=='undefined'&&typeof document!=='undefined')initExperience();

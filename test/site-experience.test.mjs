import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {runInNewContext} from 'node:vm';
import {applySiteExperience,decoratePage} from '../scripts/site-experience.mjs';
import {initExperience,flightBounds,flightPoint,restoreFlight} from '../public/theme/experience.js';

const asset=new URL('../public/theme/',import.meta.url);
function target(){
 const listeners=new Map();return {listeners,addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)},emit(type,event={}){for(const fn of listeners.get(type)||[])fn(event)}};
}
const store=(map=new Map())=>({getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),map});
function env({saved=new Map(),sessionSaved=new Map(),systemDark=false,reducedMotion=false,blocked=false}={}){
 const root={dataset:{},scrollHeight:3000};
 const button=()=>({...target(),attributes:{},setAttribute(k,v){this.attributes[k]=v}});
 const light={...button(),dataset:{themeChoice:'light'}},dark={...button(),dataset:{themeChoice:'dark'}};
 const label={},icon={},flight={...button(),querySelector:s=>s==='[data-flight-label]'?label:icon};
 const mascotLabel={},mascot={...button(),querySelector:()=>mascotLabel};
 const position={style:{},dataset:{}},facing={style:{}},controls={hidden:true};
 const rail={querySelector:()=>controls,querySelectorAll:()=>[light,dark]};
 const meta={setAttribute(k,v){this[k]=v}},nav=Array.from({length:4},button);
 const doc={...target(),documentElement:root,hidden:false,getElementById:id=>id==='flight-control'?flight:id==='mascot-control'?mascot:id==='pip-facing'?facing:position,querySelector:s=>s==='.site-rail'?rail:meta,querySelectorAll:()=>nav};
 const reduce={...target(),matches:reducedMotion},system={...target(),matches:systemDark};
 const frames=new Map();let seq=0;
 const win={...target(),scrollY:0,innerWidth:1280,innerHeight:800,localStorage:store(saved),sessionStorage:store(sessionSaved),matchMedia:q=>q.includes('reduced-motion')?reduce:system,requestAnimationFrame:fn=>{frames.set(++seq,fn);return seq},cancelAnimationFrame:id=>frames.delete(id)};
 if(blocked)Object.defineProperty(win,'localStorage',{get(){throw new Error('Storage blocked')}});
 const step=t=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(t))};
 return {win,doc,root,light,dark,flight,label,mascot,mascotLabel,position,nav,controls,reduce,system,frames,step,meta};
}

test('theme boot restores valid preferences before styles, falls back to system, and honours reduced motion even when storage fails',async()=>{
 const script=await readFile(new URL('boot.js',asset),'utf8');
 for(const scenario of [{saved:'dark',system:false,want:'dark',mascot:'hidden'},{saved:'light',system:true,want:'light',flight:'paused'},{saved:'invalid',system:true,want:'dark',mascot:'invalid'},{saved:null,system:false,want:'light'},{blocked:true,system:true,reduced:true,want:'dark',mascot:'hidden'}]){
  const document={documentElement:{dataset:{}}},window={matchMedia:q=>({matches:q.includes('reduced-motion')?!!scenario.reduced:scenario.system})};
  const localStorage={getItem:key=>{if(scenario.blocked)throw new Error('Blocked');return {'cad-theme':scenario.saved,'cad-flight':scenario.flight,'cad-mascot':scenario.mascot}[key]??null}};
  runInNewContext(script,{document,window,localStorage});
  assert.equal(document.documentElement.dataset.theme,scenario.want);
  assert.equal(document.documentElement.dataset.flight,scenario.reduced||scenario.flight==='paused'?'paused':'active');
  assert.equal(document.documentElement.dataset.mascot,!scenario.blocked&&scenario.mascot==='hidden'?'hidden':'visible');
 }
});

test('theme controls persist across native navigation and synchronize accessible pressed states, system changes and tabs',()=>{
 const saved=new Map(),e=env({saved,systemDark:true});initExperience(e.win,e.doc);
 assert.equal(e.root.dataset.theme,'dark');assert.equal(e.dark.attributes['aria-pressed'],'true');assert.equal(e.controls.hidden,false);
 e.light.emit('click');assert.equal(saved.get('cad-theme'),'light');assert.equal(e.light.attributes['aria-pressed'],'true');assert.equal(e.dark.attributes['aria-pressed'],'false');
 e.system.emit('change');assert.equal(e.root.dataset.theme,'light');
 const next=env({saved,systemDark:true});initExperience(next.win,next.doc);assert.equal(next.root.dataset.theme,'light');
 next.win.emit('storage',{key:'cad-theme',newValue:'dark'});assert.equal(next.root.dataset.theme,'dark');assert.equal(next.meta.content,'#101827');
 next.system.matches=false;next.win.emit('storage',{key:'cad-theme',newValue:null});assert.equal(next.root.dataset.theme,'light');
});

test('companion pauses immediately, saves its preference, respects reduced motion, and stops animating in hidden pages',()=>{
 const saved=new Map(),e=env({saved});initExperience(e.win,e.doc);assert.equal(e.frames.size,1);
 e.win.scrollY=1800;e.win.emit('scroll');e.step(16);e.step(100);assert.match(e.position.style.transform,/translate3d\([1-9]/);
 e.flight.emit('click');assert.equal(e.root.dataset.flight,'paused');assert.equal(e.frames.size,0);assert.equal(saved.get('cad-flight'),'paused');assert.equal(e.flight.attributes['aria-pressed'],'true');
 const next=env({saved});initExperience(next.win,next.doc);assert.equal(next.frames.size,0);
 next.flight.emit('click');assert.equal(next.frames.size,1);next.doc.hidden=true;next.doc.emit('visibilitychange');assert.equal(next.frames.size,0);next.doc.hidden=false;next.doc.emit('visibilitychange');assert.equal(next.frames.size,1);
 next.reduce.matches=true;next.reduce.emit('change');assert.equal(next.frames.size,0);assert.equal(next.flight.disabled,true);assert.equal(next.label.textContent,'Motion off');
 next.reduce.matches=false;next.reduce.emit('change');assert.equal(next.frames.size,1);
 next.win.emit('pagehide');assert.ok(next.win.sessionStorage.map.has('cad-pip-position'));
});

test('blocked storage cannot disable theme controls or animation; native links remain untouched',()=>{
 const e=env({blocked:true});initExperience(e.win,e.doc);e.dark.emit('click');assert.equal(e.root.dataset.theme,'dark');e.flight.emit('click');assert.equal(e.root.dataset.flight,'paused');
 e.mascot.emit('click');assert.equal(e.root.dataset.mascot,'hidden');assert.equal(e.frames.size,0);e.mascot.emit('click');assert.equal(e.root.dataset.mascot,'visible');assert.equal(e.root.dataset.flight,'paused');
 assert.ok(e.nav.every(link=>!link.listeners.has('click')));
});

test('hiding Pip persists across pages and tabs, stops animation and restores the saved motion choice when shown',()=>{
 const saved=new Map(),e=env({saved});initExperience(e.win,e.doc);
 assert.equal(e.root.dataset.mascot,'visible');assert.equal(e.frames.size,1);
 e.mascot.emit('click');assert.equal(e.root.dataset.mascot,'hidden');assert.equal(saved.get('cad-mascot'),'hidden');assert.equal(e.mascot.attributes['aria-pressed'],'true');assert.equal(e.mascotLabel.textContent,'Show mascot');assert.equal(e.frames.size,0);
 const next=env({saved});initExperience(next.win,next.doc);assert.equal(next.root.dataset.mascot,'hidden');assert.equal(next.frames.size,0);
 next.doc.emit('visibilitychange');next.win.emit('storage',{key:'cad-flight',newValue:'active'});next.win.emit('scroll');assert.equal(next.frames.size,0);
 e.mascot.emit('click');assert.equal(saved.get('cad-mascot'),'visible');assert.equal(e.frames.size,1);assert.equal(e.mascotLabel.textContent,'Hide mascot');assert.equal(e.mascot.attributes['aria-pressed'],'false');
 next.win.emit('storage',{key:'cad-mascot',newValue:'visible'});assert.equal(next.root.dataset.mascot,'visible');assert.equal(next.frames.size,1);
 next.flight.emit('click');next.mascot.emit('click');next.mascot.emit('click');assert.equal(next.root.dataset.flight,'paused');assert.equal(next.frames.size,0);
 next.flight.emit('click');assert.equal(next.frames.size,1);
 const reduced=env({saved:new Map([['cad-mascot','hidden']]),reducedMotion:true});initExperience(reduced.win,reduced.doc);reduced.mascot.emit('click');assert.equal(reduced.root.dataset.mascot,'visible');assert.equal(reduced.frames.size,0);
 reduced.reduce.matches=false;reduced.reduce.emit('change');assert.equal(reduced.frames.size,1);
});

test('free flight crosses both axes of the page and remains inside desktop, mobile and short viewports',()=>{
 const points=Array.from({length:6000},(_,i)=>flightPoint(i*16,.4));
 for(const axis of ['x','y']){assert.ok(Math.min(...points.map(p=>p[axis]))<.07);assert.ok(Math.max(...points.map(p=>p[axis]))>.93)}
 for(const [width,height] of [[1920,1080],[1280,800],[700,800],[390,844],[320,568],[375,360],[320,240]]){
  const b=flightBounds(width,height);
  for(const p of points){
   const x=b.left+p.x*(b.right-b.left),y=b.top+p.y*(b.bottom-b.top);
   assert.ok(x>=0&&x+b.size<=width);assert.ok(y>=0&&y+b.size<=height);
  }
 }
 assert.notDeepEqual(flightPoint(1000,0),flightPoint(1000,.4));
});

test('flight location and route survive page navigation, migrate the footer-era preference and clamp corrupt positions',()=>{
 assert.deepEqual(restoreFlight('0.3'),{x:.3,y:.25,elapsed:0});
 assert.deepEqual(restoreFlight('{"x":2,"y":-1,"elapsed":-4}'),{x:1,y:0,elapsed:0});
 assert.deepEqual(restoreFlight('garbage'),restoreFlight(null));
 const sessionSaved=new Map(),e=env({sessionSaved});initExperience(e.win,e.doc);e.step(16);e.step(1000);e.win.emit('pagehide');
 const saved=JSON.parse(sessionSaved.get('cad-pip-position'));assert.ok(saved.elapsed>0);
 const next=env({sessionSaved});initExperience(next.win,next.doc);assert.equal(next.position.style.transform,e.position.style.transform);
 next.win.innerWidth=320;next.win.innerHeight=568;next.win.emit('resize');assert.doesNotMatch(next.position.style.transform,/NaN|undefined/);
});

test('the fluffy mascot occupies a separate click-through viewport layer and moves away from the pointer',async()=>{
 const html=decoratePage('<html><head></head><body></body></html>','/site/index.html','/site');
 assert.ok(html.indexOf('class="pip-sky"')<html.indexOf('class="site-rail"'));assert.doesNotMatch(html,/flight-lane|flight-track/);
 assert.match(html,/pip-fluff/);assert.match(html,/pip-cheek/);
 const css=await readFile(new URL('studio.css',asset),'utf8');assert.match(css,/\.pip-sky\{[^}]*position:fixed;[^}]*inset:0;[^}]*pointer-events:none/);
 const e=env();initExperience(e.win,e.doc);
 const before=e.position.style.transform;e.doc.emit('pointermove',{clientX:Math.round(12+.82*1140+58),clientY:Math.round(100+.22*476+58)});
 e.step(16);assert.notEqual(e.position.style.transform,before);assert.equal(e.position.dataset.ready,'true');
});

test('page decoration gives all four sibling sections accessible links from every depth and retains existing data and scripts',async()=>{
 const base=await mkdtemp(resolve(tmpdir(),'cad-theme-'));
 const template='<!doctype html><html><head><link rel="stylesheet" href="./old.css"></head><body><nav aria-label="Workspace"><a href="../">Construction</a><a href="milestone.html">Versions + milestone</a><a href="progress/">Progress</a></nav><table><tr><td>66,45,762.90</td></tr></table><script src="./original.js"></script></body></html>';
 const pages=['index.html','construction/index.html','progress/index.html','cad/index.html','memory-posters/index.html','construction/estimates/pilates-astra-2026-10-15/milestone.html','construction/estimates/pilates-astra-2026-10-15/v8/item-01.html'];
 try{
  for(const p of pages){await mkdir(dirname(resolve(base,p)),{recursive:true});await writeFile(resolve(base,p),template)}
  assert.equal(await applySiteExperience(base),pages.length);
  for(const p of pages){
   const html=await readFile(resolve(base,p),'utf8');assert.ok(html.indexOf('boot.js')<html.indexOf('old.css'));assert.ok(html.indexOf('studio.css')>html.indexOf('old.css'));assert.match(html,/<td>66,45,762.90<\/td>/);assert.match(html,/src="\.\/original.js"/);
   assert.equal((html.match(/data-site-experience=/g)||[]).length,1);
   assert.equal((html.match(/id="mascot-control"/g)||[]).length,1);assert.match(html,/aria-label="Hide mascot" title="Hide mascot"/);
   const nav=html.match(/<nav aria-label="Workspace">([\s\S]*?)<\/nav>/)[1],links=[...nav.matchAll(/<a href="([^"]+)"([^>]*)>([^<]+)<\/a>/g)];
   assert.deepEqual(links.map(link=>link[3]),['Construction','Versions + milestone','Progress','Memory Posters']);
   assert.deepEqual(links.map(link=>resolve(dirname(resolve(base,p)),link[1])),['construction','construction/estimates/pilates-astra-2026-10-15/milestone.html','progress','memory-posters'].map(path=>resolve(base,path)));
   const active=p==='index.html'?null:p.endsWith('milestone.html')?'Versions + milestone':p.startsWith('progress/')?'Progress':p.startsWith('memory-posters/')?'Memory Posters':'Construction';
   assert.deepEqual(links.filter(link=>link[2].includes('aria-current="page"')).map(link=>link[3]),active?[active]:[]);
   for(const match of html.matchAll(/(?:src|href)="([^"]*theme\/[^"?]+)(?:\?[^"]*)?"/g))assert.ok(resolve(dirname(resolve(base,p)),match[1]).startsWith(resolve(base,'theme')+'/'));
  }
  assert.throws(()=>decoratePage('data-site-experience',resolve(base,'index.html'),base),/already applied/);
 }finally{await rm(base,{recursive:true,force:true})}
});

test('light and dark text palettes retain at least 4.5 contrast across their actual surfaces',async()=>{
 const css=await readFile(new URL('studio.css',asset),'utf8');let palette={};
 const luminance=hex=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return c.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)};
 const ratio=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (values[1]+.05)/(values[0]+.05)};
 for(const selector of [':root{',':root[data-theme="dark"]{']){
  const block=css.slice(css.indexOf(selector)+selector.length).split('}')[0];palette={...palette,...Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[a-fA-F\d]{6})\s*;/g)].map(m=>[m[1],m[2]]))};
  const pairs=['ink','muted','teal','blue','purple','amber','red','green'].flatMap(fg=>['paper','surface','surface-2'].map(bg=>[fg,bg]));
  for(const color of ['teal','blue','purple','amber','red'])pairs.push([color,color+'-soft']);
  pairs.push(['on-accent','teal'],['muted','teal-soft'],['muted','amber-soft']);
  for(const [fg,bg] of pairs)assert.ok(ratio(palette[fg],palette[bg])>=4.5,`${selector} ${fg} on ${bg}`);
 }
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/@media print[\s\S]*\.site-rail[^}]*display:none!important/);
});

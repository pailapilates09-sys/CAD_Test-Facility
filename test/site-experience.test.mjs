import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {runInNewContext} from 'node:vm';
import {applySiteExperience,decoratePage} from '../scripts/site-experience.mjs';
import {initExperience} from '../public/theme/experience.js';

const asset=new URL('../public/theme/',import.meta.url);
function target(){
 const listeners=new Map();return {listeners,addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)},emit(type,event={}){for(const fn of listeners.get(type)||[])fn(event)}};
}
const store=(map=new Map())=>({getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),map});
function env({saved=new Map(),systemDark=false,reducedMotion=false,blocked=false}={}){
 const root={dataset:{},scrollHeight:3000};
 const button=()=>({...target(),attributes:{},setAttribute(k,v){this.attributes[k]=v}});
 const light={...button(),dataset:{themeChoice:'light'}},dark={...button(),dataset:{themeChoice:'dark'}};
 const label={},icon={},flight={...button(),querySelector:s=>s==='[data-flight-label]'?label:icon};
 const position={style:{}},lane={clientWidth:600},controls={hidden:true};
 const rail={querySelector:s=>s==='.experience-controls'?controls:lane,querySelectorAll:()=>[light,dark]};
 const meta={setAttribute(k,v){this[k]=v}},nav=Array.from({length:3},button);
 const doc={...target(),documentElement:root,hidden:false,getElementById:id=>id==='flight-control'?flight:position,querySelector:s=>s==='.site-rail'?rail:meta,querySelectorAll:()=>nav};
 const reduce={...target(),matches:reducedMotion},system={...target(),matches:systemDark};
 const frames=new Map();let seq=0;
 const win={...target(),scrollY:0,innerHeight:800,localStorage:store(saved),sessionStorage:store(),matchMedia:q=>q.includes('reduced-motion')?reduce:system,requestAnimationFrame:fn=>{frames.set(++seq,fn);return seq},cancelAnimationFrame:id=>frames.delete(id)};
 if(blocked)Object.defineProperty(win,'localStorage',{get(){throw new Error('Storage blocked')}});
 const step=t=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(t))};
 return {win,doc,root,light,dark,flight,label,position,nav,controls,reduce,system,frames,step,meta};
}

test('theme boot restores valid preferences before styles, falls back to system, and honours reduced motion even when storage fails',async()=>{
 const script=await readFile(new URL('boot.js',asset),'utf8');
 for(const scenario of [{saved:'dark',system:false,want:'dark'},{saved:'light',system:true,want:'light'},{saved:'invalid',system:true,want:'dark'},{saved:null,system:false,want:'light'},{blocked:true,system:true,reduced:true,want:'dark'}]){
  const document={documentElement:{dataset:{}}},window={matchMedia:q=>({matches:q.includes('reduced-motion')?!!scenario.reduced:scenario.system})};
  const localStorage={getItem:key=>{if(scenario.blocked)throw new Error('Blocked');return key==='cad-theme'?scenario.saved:null}};
  runInNewContext(script,{document,window,localStorage});
  assert.equal(document.documentElement.dataset.theme,scenario.want);
  assert.equal(document.documentElement.dataset.flight,scenario.reduced?'paused':'active');
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
 assert.ok(e.nav.every(link=>!link.listeners.has('click')));
});

test('page decoration reaches generated detail pages and retains all existing data, scripts and navigation',async()=>{
 const base=await mkdtemp(resolve(tmpdir(),'cad-theme-'));
 const template='<!doctype html><html><head><link rel="stylesheet" href="./old.css"></head><body><nav aria-label="Workspace"><a href="../">Construction</a><a href="milestone.html">Versions + milestone</a><a href="progress/">Progress</a></nav><table><tr><td>66,45,762.90</td></tr></table><script src="./original.js"></script></body></html>';
 const pages=['index.html','progress/index.html','cad/index.html','construction/estimates/project/v8/item-01.html'];
 try{
  for(const p of pages){await mkdir(dirname(resolve(base,p)),{recursive:true});await writeFile(resolve(base,p),template)}
  assert.equal(await applySiteExperience(base),pages.length);
  for(const p of pages){
   const html=await readFile(resolve(base,p),'utf8');assert.ok(html.indexOf('boot.js')<html.indexOf('old.css'));assert.ok(html.indexOf('studio.css')>html.indexOf('old.css'));assert.match(html,/<td>66,45,762.90<\/td>/);assert.match(html,/src="\.\/original.js"/);
   assert.equal((html.match(/data-site-experience=/g)||[]).length,1);
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

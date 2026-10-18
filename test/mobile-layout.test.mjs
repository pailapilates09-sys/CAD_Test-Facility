import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decorateMobileTable,initMobile} from '../public/theme/mobile.js';
import {mobileQuery} from '../public/theme/mobile-config.js';
import {flightBounds} from '../public/theme/experience.js';
import {decoratePage} from '../scripts/site-experience.mjs';

class Element{
 constructor(tag,text='',attrs={}){
  this.tagName=tag.toUpperCase();this.textContent=text;this.attrs=new Map(Object.entries(attrs));this.isConnected=true;this.hidden=false;
  const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,on){if(on)classes.add(x);else classes.delete(x)}};
  Object.defineProperty(this,'innerHTML',{set(){throw new Error('Must preserve the original table nodes and controls')}});
 }
 getAttribute(n){return this.attrs.get(n)??null}
 setAttribute(n,v){this.attrs.set(n,v)}
 removeAttribute(n){this.attrs.delete(n)}
 hasAttribute(n){return this.attrs.has(n)}
}
const cell=(tag,text='',colSpan=1,rowSpan=1)=>Object.assign(new Element(tag,text),{colSpan,rowSpan});
const row=cells=>Object.assign(new Element('tr'),{cells});
const section=(tag,rows)=>Object.assign(new Element(tag),{rows});
function tableFixture(labels=['Work','Quantity','Rate','Amount']){
 const cells=[cell('th','Plywood lining'),cell('td','0 m²'),cell('td','Unknown'),cell('td','NPR 0.00')];
 const table=Object.assign(new Element('table'),{tHead:section('thead',[row(labels.map(x=>cell('th',x)))]),tBodies:[section('tbody',[row(cells)])],tFoot:null});
 const wrapper=Object.assign(new Element('div'),{clientWidth:320,scrollWidth:1100});
 table.closest=()=>wrapper;wrapper.querySelector=()=>table;wrapper.prepend=node=>{wrapper.prepended=node;node.isConnected=true};
 return {table,wrapper,cells};
}
const events=()=>{const handlers=new Map();return {addEventListener(k,fn){if(!handlers.has(k))handlers.set(k,[]);handlers.get(k).push(fn)},emit(k,...args){for(const fn of handlers.get(k)??[])fn(...args)}}};
function environment(matches){
 const fixture=tableFixture(),media={...events(),matches};
 const chart=Object.assign(new Element('div'),{clientWidth:320,scrollWidth:1000,querySelector:()=>null,prepend(node){this.prepended=node;node.isConnected=true}});
 let queries=0,observed=0,disconnected=0,observerCallback=null;const frames=new Map();let seq=0;
 const doc={...events(),body:new Element('body'),createElement:tag=>new Element(tag),querySelectorAll(selector){queries++;return selector==='table'?[fixture.table]:[fixture.wrapper,chart]}};
 const win={...events(),matchMedia:q=>{assert.equal(q,mobileQuery);return media},requestAnimationFrame:fn=>{frames.set(++seq,fn);return seq},cancelAnimationFrame:id=>frames.delete(id),MutationObserver:class{constructor(fn){observerCallback=fn}observe(){observed++}disconnect(){disconnected++}}};
 const flush=()=>{const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn())};
 return {...fixture,media,chart,doc,win,frames,flush,mutate:()=>observerCallback(),counts:()=>({queries,observed,disconnected})};
}

test('phone table cards preserve values, zero, unknown rates, controls, held states and existing listeners',()=>{
 const {table,cells}=tableFixture();const input={value:'0',disabled:true,oninput:()=>42};cells[1].input=input;
 const before=cells.map(c=>c.textContent);assert.equal(decorateMobileTable(table),true);
 assert.equal(table.tBodies[0].rows[0].cells,cells);assert.equal(cells[1].input,input);assert.equal(input.oninput(),42);assert.equal(input.value,'0');assert.equal(input.disabled,true);
 assert.deepEqual(cells.map(c=>c.textContent),before);assert.equal(table.getAttribute('role'),'table');assert.equal(table.tHead.getAttribute('role'),'rowgroup');assert.equal(cells[0].getAttribute('role'),'rowheader');
 assert.equal(cells[1].getAttribute('data-mobile-label'),'Quantity');assert.equal(cells[2].getAttribute('data-mobile-label'),'Rate');assert.equal(cells[3].getAttribute('data-mobile-label'),'Amount');
 assert.equal(cells[3].getAttribute('aria-colindex'),'4');assert.equal(cells[0].hasAttribute('data-mobile-primary'),true);assert.equal(cells[3].hasAttribute('data-mobile-money'),true);
 assert.equal(decorateMobileTable(table),true);assert.deepEqual(cells.map(c=>c.textContent),before);
});

test('mobile labels follow colspan totals and empty rows; complex headers and rowspans retain the scrollable table',()=>{
 const {table}=tableFixture();const total=cell('td','NPR 100.00');table.tFoot=section('tfoot',[row([cell('th','Area total',3),total])]);
 const empty=cell('td','No matching works',4);table.tBodies[0].rows.push(row([empty]));
 assert.equal(decorateMobileTable(table),true);assert.equal(total.getAttribute('data-mobile-label'),'Amount');assert.equal(empty.hasAttribute('data-mobile-span-all'),true);
 const multi=tableFixture().table;multi.tHead.rows.push(row([cell('th','Complex')]));assert.equal(decorateMobileTable(multi),false);assert.equal(multi.classList.contains('mobile-card-table'),false);
 const spanning=tableFixture().table;spanning.tBodies[0].rows[0].cells[0].rowSpan=2;assert.equal(decorateMobileTable(spanning),false);
 const explicit=tableFixture().table;explicit.setAttribute('data-mobile-layout','scroll');assert.equal(decorateMobileTable(explicit),false);
});

test('desktop initialization leaves the table DOM and desktop presentation unchanged',()=>{
 const e=environment(false);initMobile(e.win,e.doc);
 assert.equal(e.counts().queries,0);assert.equal(e.counts().observed,0);assert.equal(e.table.attrs.size,0);assert.equal(e.table.classList.contains('mobile-card-table'),false);assert.equal(e.chart.prepended,undefined);
 e.win.emit('resize');assert.equal(e.frames.size,0);
});

test('mobile enhancements follow filtering and screen rotation, hide swipe hints on desktop and avoid duplicate hints',()=>{
 const e=environment(true);initMobile(e.win,e.doc);assert.equal(e.table.classList.contains('mobile-card-table'),true);assert.equal(e.wrapper.classList.contains('mobile-cards-wrap'),true);
 const hint=e.chart.prepended;assert.equal(hint.hidden,false);assert.equal(e.chart.getAttribute('tabindex'),'0');assert.equal(e.wrapper.prepended,undefined);
 const next=row([cell('td','Held mirror'),cell('td','0 each'),cell('td','Original retained'),cell('td','0')]);next.hidden=true;e.table.tBodies[0].rows=[next];
 e.mutate();e.mutate();assert.equal(e.frames.size,1);e.flush();assert.equal(next.cells[2].getAttribute('data-mobile-label'),'Rate');assert.equal(next.hidden,true);assert.equal(e.chart.prepended,hint);
 e.media.matches=false;e.media.emit('change');assert.equal(hint.hidden,true);assert.equal(e.counts().disconnected,1);
 e.media.matches=true;e.media.emit('change');assert.equal(hint.hidden,false);assert.equal(e.chart.prepended,hint);
 e.win.emit('beforeprint');assert.equal(hint.hidden,true);e.win.emit('afterprint');assert.equal(hint.hidden,false);
});

test('all new CSS is inside the mobile media query; generated pages gate that stylesheet and retain the desktop stylesheet',async()=>{
 const css=await readFile(new URL('../public/theme/mobile.css',import.meta.url),'utf8');
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'').trim();const prefix='@media '+mobileQuery+'{';assert.ok(clean.startsWith(prefix));
 let depth=0,lastEnd=-1;for(let i=clean.indexOf('{');i<clean.length;i++){if(clean[i]==='{')depth++;if(clean[i]==='}'){depth--;if(depth===0)lastEnd=i;assert.ok(depth>=0)}}
 assert.equal(depth,0);assert.equal(lastEnd,clean.length-1);assert.equal(clean.slice(lastEnd+1).trim(),'');
 assert.match(css,/font-size:16px!important/);assert.match(css,/safe-area-inset-bottom/);assert.match(css,/\.mobile-card-table \[hidden\]\{display:none!important\}/);
 const source='<html><head><link rel="stylesheet" href="old.css"></head><body><main>Desktop content</main></body></html>';
 const html=decoratePage(source,'/site/work/index.html','/site');assert.ok(html.includes('media="'+mobileQuery+'"'));assert.match(html,/href="\.\.\/theme\/mobile\.css/);assert.ok(html.includes('<main>Desktop content</main>'));assert.match(html,/href="old.css"/);assert.match(html,/src="\.\.\/theme\/mobile\.js/);
});

test('desktop Pip flight bounds remain unchanged while compact phones and touch landscape use the smaller mascot',()=>{
 assert.deepEqual(flightBounds(1280,800),{left:12,right:1152,top:100,bottom:576,size:116});
 assert.deepEqual(flightBounds(1920,1080),{left:12,right:1792,top:100,bottom:856,size:116});
 for(const [width,height] of [[320,568],[390,844],[430,932],[932,430]]){
  const b=flightBounds(width,height,true);assert.equal(b.size,72);assert.ok(b.left>=0&&b.right+b.size<=width);assert.ok(b.top>=0&&b.bottom+b.size<=height);
 }
});

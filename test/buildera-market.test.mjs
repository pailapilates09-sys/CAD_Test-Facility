import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyseBuildEra,comparisonCsv,metricEquivalent,ratePlot,renderMarketComparison} from '../scripts/buildera-market.mjs';
import {BUILDERA_MARKET_PATH,classifyPage,pageKind} from '../public/organization/site-model.js';

const source=new URL('../public/'+BUILDERA_MARKET_PATH,import.meta.url);
const read=async name=>JSON.parse(await readFile(new URL(name,source),'utf8'));
const [quote,market]=await Promise.all([read('quotation.json'),read('market-rates.json')]);
const model=analyseBuildEra(quote,market);
const item=id=>model.items.find(x=>x.id===id);

test('BuildEra source reconciliation retains the 23 printed lines, electrical allowance, and Coffee Lounge variance',()=>{
 assert.equal(model.items.length,23);
 assert.equal(new Set(model.items.map(x=>x.id)).size,23);
 assert.equal(model.items.every(x=>x.lineDifference===0),true);
 assert.deepEqual(model.amounts,{
  detail:1884512.03,recalculated:1978760.13,difference:450,interiorDifference:0,totalDifference:0
 });
 assert.deepEqual(quote.summary,{interior_subtotal:1884962.03,electrical_allowance:94248.10,quoted_total:1979210.13});
 assert.equal(item('RE-05').printed_amount,20718.945);
 const coffee=model.areas.find(a=>a.id==='coffee-lounge');
 assert.deepEqual([coffee.detail_subtotal,coffee.recomputed,coffee.difference],[92302.50,91852.50,450]);
 assert.equal(model.areas.filter(a=>a.summary_amount===null).length,2);
});

test('saved market data retains 22 bands and identifies the missing and conditional units independently',()=>{
 assert.deepEqual(model.counts,{above:4,within:16,below:1,conditional:1,unavailable:1,banded:22});
 assert.equal(Object.keys(market.sources).length,14);
 const missing=item('RE-07'),studio=item('ST-05');
 assert.equal(missing.quoted_rate,80);
 assert.equal(missing.band,null);
 assert.equal(missing.marketAmount,null);
 assert.equal(studio.unit,'sq-ft');
 assert.equal(studio.band.unit,'each');
 assert.equal(studio.printed_amount,48000);
 assert.equal(studio.relation,'above');
 assert.equal(studio.marketAmount,null);
 assert.equal(metricEquivalent(studio),null);
 assert.deepEqual(item('FL-01').marketAmount,[431217.50,862435]);
});

test('plot positions are proportional and carry every quote, including ones outside the band',()=>{
 for(const {band,quoted_rate,relation} of model.items.filter(i=>i.band)){
  const {quote,minimum,maximum}=ratePlot(quoted_rate,band.minimum,band.maximum);
  assert.ok(0<=minimum&&minimum<=maximum&&maximum<100&&quote>=0&&quote<100);
  assert.ok(Math.abs(quote/maximum-quoted_rate/band.maximum)<1e-12);
  assert.equal(quote<minimum?'below':quote>maximum?'above':'within',relation);
 }
 assert.equal(ratePlot(250,250,500).quote,ratePlot(250,250,500).minimum);
 assert.equal(ratePlot(500,250,500).quote,ratePlot(500,250,500).maximum);
});

test('SI equivalents preserve the amount for measured quantities',()=>{
 for(const id of ['FL-01','RE-02']){
  const row=item(id),metric=metricEquivalent(row);
  assert.ok(Math.abs(metric.quantity*metric.quoted_rate-row.printed_amount)<1e-8);
 }
 assert.equal(metricEquivalent(item('FL-01')).quantity.toFixed(3),'160.246');
 assert.equal(metricEquivalent(item('RE-02')).quantity.toFixed(3),'25.320');
 assert.equal(metricEquivalent(item('RE-03')),null);
});

test('editing a benchmark cannot change original prices; invalid bands and unit mismatches fail the build',()=>{
 const changed=structuredClone(market);
 changed.bands.laminate.minimum=350;
 const revised=analyseBuildEra(quote,changed);
 assert.equal(revised.items[0].assessment,'below');
 assert.equal(revised.items[0].quoted_rate,300);
 assert.deepEqual(revised.amounts,model.amounts);
 changed.bands.laminate.minimum=501;
 assert.throws(()=>analyseBuildEra(quote,changed),/Invalid market band laminate/);
 const mismatch=structuredClone(market);
 delete mismatch.items['ST-05'].conditional_unit;
 assert.throws(()=>analyseBuildEra(quote,mismatch),/Unexpected comparison unit for ST-05/);
 assert.throws(()=>analyseBuildEra({...quote,items:[...quote.items,quote.items[0]]},market),/duplicate BuildEra work/);
});

test('compiled HTML shows all plots and table rows without scripts and keeps audit data and sources readable',()=>{
 const html=renderMarketComparison(model,'test');
 assert.doesNotMatch(html,/<iframe/i);
 const articles=[...html.matchAll(/<article[^>]+data-bmq-item="([^"]+)"/g)].map(m=>m[1]);
 const rows=[...html.matchAll(/<tr[^>]+data-bmq-item="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(articles,quote.items.map(x=>x.id));
 assert.deepEqual(rows,articles);
 assert.equal((html.match(/class="bmq-track" role="img"/g)??[]).length,22);
 assert.match(html,/Minimum 250, quote 300, maximum 500/);
 assert.match(html,/Quote if per fixture/);
 assert.match(html,/Market rate unavailable/);
 for(const amount of ['19,79,210.13','19,78,760.13','94,248.10','450.00','91,852.50','92,302.50'])assert.ok(html.includes(amount));
 for(const [id,ref] of Object.entries(market.sources)){
  assert.ok(html.includes('id="market-'+id.toLowerCase()+'"'));
  assert.ok(html.includes(ref.url));
 }
 const csv=comparisonCsv(model);
 assert.equal(csv.trim().split('\r\n').length,24);
 assert.match(csv,/"ST-05".+"Unit to confirm"/);
 assert.match(csv,/"RE-07".+"Market rate unavailable"/);
});

test('the page is discoverable as a Paila comparison without relabelling either original quotation',()=>{
 assert.equal(classifyPage(BUILDERA_MARKET_PATH+'index.html').project,'paila');
 assert.equal(pageKind(BUILDERA_MARKET_PATH+'index.html'),'rate-comparison');
 assert.equal(pageKind('construction/estimates/pilates-astra-2026-10-15/index.html'),'quotation');
 assert.equal(pageKind('construction/estimates/pilates-hamro-2026-10-28/index.html'),'quotation');
});

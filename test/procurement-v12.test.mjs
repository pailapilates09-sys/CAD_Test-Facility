import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveViews} from '../public/construction/estimates/pilates-astra-2026-10-15/shared/source-model.js';
import {validateProcurement,deriveProcurement,renderProcurement} from '../scripts/procurement-v12.mjs';
import {renderOriginal,renderScope,renderSI,renderMarket,deriveHierarchy} from '../scripts/source-views.mjs';
import {filterDecisions} from '../public/construction/estimates/pilates-astra-2026-10-15/v12/v12.js';
const base=new URL('../public/construction/estimates/pilates-astra-2026-10-15/',import.meta.url);
const register=JSON.parse(await readFile(new URL('v9/register.json',base),'utf8')),rules=JSON.parse(await readFile(new URL('v12/procurement.json',base),'utf8')),views=deriveViews(register);

test('v12 covers every quoted work exactly once, retaining all holds, zero quantity, allowances and unpriced new options',()=>{
 const before=JSON.stringify(register),data=deriveProcurement(rules,register,views),works=data.subjects.filter(subject=>subject.type==='work');
 assert.equal(works.length,51);assert.equal(new Set(works.map(work=>work.id)).size,51);assert.equal(works.filter(work=>work.held).length,6);assert.deepEqual(works.filter(work=>work.zero).map(work=>work.id),['reception-006']);
 assert.equal(data.profiles.filter(profile=>profile.group==='owner').flatMap(profile=>profile.subjects).filter(subject=>subject.type==='work').length,14);
 assert.equal(data.profiles.filter(profile=>profile.group==='professional').flatMap(profile=>profile.subjects).filter(subject=>subject.type==='work').length,37);
 assert.equal(data.subjects.filter(subject=>subject.type==='allowance').length,2);for(const option of data.subjects.filter(subject=>subject.type==='option')){assert.equal(option.quantity,null);assert.equal(option.unit,null)}
 const html=renderProcurement(rules,register,views);assert.equal((html.match(/<table\b/g)??[]).length,2);assert.equal((html.match(/data-decision-subject=/g)??[]).length,55);assert.equal((html.match(/ON HOLD · route only; no order/g)??[]).length,6);assert.match(html,/Zero quoted quantity · no order/);
 for(const head of html.matchAll(/<thead>(.*?)<\/thead>/gs))assert.equal((head[1].match(/<th /g)??[]).length,4);
 assert.doesNotMatch(html,/66,45,762|grand total|data-inline-material=/i);assert.equal(JSON.stringify(register),before);
});

test('procurement routes distinguish specialist execution from engineering review and direct purchase',()=>{
 const data=deriveProcurement(rules,register,views),profileFor=id=>data.profiles.find(profile=>profile.subjects.some(subject=>subject.id===id));
 for(const id of ['reception-007','reception-008','reception-012','reception-014','studio-008','changing-room-001','electrical']){assert.equal(profileFor(id).group,'professional');assert.equal(profileFor(id).engineer_review,'review_before_order')}
 for(const id of ['studio-003','changing-room-002','reception-004','reception-015','option-carpet'])assert.equal(profileFor(id).group,'owner');
 assert.equal(profileFor('option-vanity').group,'professional');assert.match(profileFor('option-vanity').buy_route,/owner can choose and buy/i);assert.match(profileFor('option-vanity').execution,/Plumber/);assert.equal(profileFor('option-vanity').engineer_review,'conditional');
 assert.match(profileFor('studio-003').checks,/Quoted m² is not the number of retail panels/);
 assert.ok(rules.sources.every(source=>source.url.startsWith('https://')&&source.reviewed_date==='2026-10-20'&&source.access));assert.equal(rules.sources.find(source=>source.id==='NBC105').access,'indexed_only');assert.equal(rules.sources.find(source=>source.id==='CURTAIN').access,'cached_page');
});

test('new work decisions cannot duplicate quantities/rates, omit a work or invent a measured carpet/vanity order',()=>{
 for(const mutate of [rules=>rules.work_decisions.pop(),rules=>rules.work_decisions.push(rules.work_decisions[0]),rules=>rules.work_decisions[0].quantity=10,rules=>rules.work_decisions[0].profile_id='missing',rules=>rules.profiles[0].source_ids.push('missing'),rules=>rules.options[0].quantity=5,rules=>rules.allowance_decisions.pop(),rules=>rules.sources[0].url='javascript:alert(1)']){
  const changed=structuredClone(rules);mutate(changed);assert.throws(()=>validateProcurement(changed,register));
 }
});

test('the shared source changes all early views and v12 without changing dated evidence or copying work fields into rules',async()=>{
 const next=structuredClone(register),work=next.works[0];work.title='Updated shared cupboard';work.quantity='44.86';const derived=deriveViews(next);
 for(const html of [renderOriginal(next,derived),renderScope(next),renderSI(next,derived),renderMarket(next,derived),renderProcurement(rules,next,derived)])assert.ok(html.includes(work.title));
 const data=deriveProcurement(rules,next,derived);assert.equal(data.subjects.find(subject=>subject.id===work.id).quantity,'4.1676303744');
 for(const decision of rules.work_decisions)assert.deepEqual(Object.keys(decision).sort(),['profile_id','work_id']);
 const seed=JSON.parse(await readFile(new URL('v2/hierarchy.json',base),'utf8'));assert.equal(deriveHierarchy(derived,seed).nodes.find(node=>node.id===work.id).title,work.title);
});

test('Original/v0, scope v2, SI v3 and evidence v4 each render only their named feature',()=>{
 const original=renderOriginal(register,views),scope=renderScope(register),si=renderSI(register,views),market=renderMarket(register,views);
 assert.equal((original.match(/data-source-work=/g)??[]).length,51);assert.doesNotMatch(original,/<svg|data-market-observation=/);
 assert.match(scope,/id="chart"/);assert.doesNotMatch(scope,/<th scope="col">Quoted rate|id="total"/);
 assert.equal((si.match(/data-si-work=/g)??[]).length,51);assert.doesNotMatch(si,/<svg|id="chart"|VAT · 13%/);
 assert.equal((market.match(/data-market-observation=/g)??[]).length,register.market.observations.length);assert.doesNotMatch(market,/<svg|id="chart"|VAT · 13%/);
 const attack=structuredClone(register);attack.works[0].title='<script>alert(1)</script>';assert.doesNotMatch(renderProcurement(rules,attack,deriveViews(attack)),/<script>alert/);
});

test('v12 search filters individual works inside a shared trade row without losing its siblings or miscounting options',()=>{
 const make=(id,type,area,text)=>({dataset:{decisionSubject:id,subjectType:type,area,search:text},hidden:false});
 const studio=make('studio-003','work','studio','studio sheer curtains'),changing=make('changing-room-002','work','changing-room','changing room curtains'),rug=make('option-carpet','option','new-options','loose carpet rug');
 const row=(search,subjects)=>({dataset:{search},subjects,hidden:false,querySelectorAll:()=>subjects}),curtains=row('curtain supplier fabric',[studio,changing]),rugs=row('rug retailer',[rug]);
 const search={value:''},area={value:''},count={},empty={},section={querySelectorAll:()=>[curtains,rugs]},doc={getElementById:id=>({'decision-search':search,'decision-area':area,'decision-count':count,'decision-empty':empty}[id]),querySelectorAll:selector=>selector==='[data-decision-profile]'?[curtains,rugs]:[section]};
 assert.deepEqual(filterDecisions(doc),{work:2,allowance:0,option:1});area.value='studio';assert.deepEqual(filterDecisions(doc),{work:1,allowance:0,option:0});assert.equal(changing.hidden,true);assert.equal(rugs.hidden,true);
 area.value='';search.value='changing';assert.deepEqual(filterDecisions(doc),{work:1,allowance:0,option:0});assert.equal(studio.hidden,true);
 search.value='not found';filterDecisions(doc);assert.equal(empty.hidden,false);assert.equal(section.hidden,true);
 search.value='';filterDecisions(doc);assert.equal(section.hidden,false);assert.equal(studio.hidden,false);assert.equal(changing.hidden,false);
});

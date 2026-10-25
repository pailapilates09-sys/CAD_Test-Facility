// Dependencies express review-stage sequencing. Durations are editable allowances,
// never automatic authorisation to pour, load, strike or occupy a structure.
export const phaseNames={preparation:'01 · Preparation',foundation:'02 · Foundations',plinth:'03 · Plinth & ground base',frame:'04 · Storey frames',masonry:'05 · Masonry & bands',services:'06 · Concealed services',finishes:'07 · Finishes & fittings',external:'08 · External works',handover:'09 · Testing & handover'};
export function makeTasks(project){const tasks=[],lastByPhase={},add=(id,label,phase,scope,measure,depends=[],days=2,pages=[],hold='',kinds=[])=>{const code=String(Object.keys(phaseNames).indexOf(phase)+1).padStart(2,'0')+'.'+String((lastByPhase[phase]??0)+1).padStart(2,'0');lastByPhase[phase]=(lastByPhase[phase]??0)+1;const t={id,code,label,phase,scope,measure,depends,duration_days:days,source_pages:pages,hold,kinds};tasks.push(t);return id;};
 add('brief','Survey, design & scope approval','preparation','all','pending',[],3,[1,2,7],'Survey boundary, soil report, approvals and coordinated structural/MEP drawings.');
 add('mobilise','Site setup, safety & temporary services','preparation','all','pending',['brief'],2,[],'Access, storage, welfare, temporary power/water and waste plan.');
 add('setting-out','Set out grids & benchmarks','preparation','ground','grids',['mobilise'],1,[8,9],'Verify boundary offsets and the 5 mm overall chain conflict.');
 add('clearance','Clear site & protect existing services','preparation','foundation','pending',['setting-out'],2,[1],'Locate existing services and arrange excavation support/dewatering where required.');
 add('excavation','Excavation & spoil handling','foundation','foundation','excavation',['clearance'],3,[9],'Vertical-prism planning quantity only. Safe slopes, support and working space require site design.');
 add('formation','Formation & soil acceptance','foundation','foundation','excavation',['excavation'],1,[9],'Inspect bearing ground, formation levels and water; no automatic acceptance.');
 add('foundation-soling','Stone / boulder soling','foundation','foundation','foundation-soling',['formation'],2,[9],'Confirm the interpreted 100 mm layer and bed extents for each footing.');
 add('foundation-pcc','Levelling PCC beneath footings','foundation','foundation','foundation-pcc',['foundation-soling'],1,[9],'75 mm example application; confirm extents and mix.');
 add('footing-steel','Footing reinforcement & starters','foundation','foundation','steel-footing',['foundation-pcc'],3,[9,20],'Cover, bends, starter arrangement and final cuts remain unresolved.');
 add('footing-form','Footing side formwork','foundation','foundation','form-footing',['foundation-pcc'],2,[9],'Four formed sides are assumed; actual soil/form contact method must be confirmed.');
 add('footing-inspect','Footing pre-pour inspection','foundation','foundation','pending',['footing-steel','footing-form'],1,[9,20],'Resolve footing D, eccentric offsets, strap conflicts and signed steel/form checks.');
 add('footing-concrete','Footing concrete','foundation','foundation','footing-concrete',['footing-inspect'],1,[9],'Scenario thickness only; no approved concrete order.');
 add('footing-cure','Footing curing & strength review','foundation','foundation','pending',['footing-concrete'],7,[9],'Planning allowance. Curing, loading and stripping depend on the approved specification and strength evidence.');
 add('pedestal-steel','Columns / starters below plinth','foundation','foundation','pedestal-steel',['footing-cure'],2,[8,9,20],'The below-plinth starter arrangement is not reconciled with the C1/C2 schedule.');
 add('pedestal-form','Below-plinth column formwork','foundation','foundation','form-pedestal',['footing-cure'],2,[9],'Heights use the foundation scenario and provisional tie-beam datum.');
 add('pedestal-concrete','Below-plinth column concrete','foundation','foundation','pedestal-concrete',['pedestal-steel','pedestal-form'],1,[9],'Pre-pour review required.');
 add('strap-steel','Strap beam steel & formwork','foundation','foundation','strap-steel',['pedestal-concrete'],3,[10,13],'355×600 layout versus 300×500 detail is unresolved; no issued cage.');
 add('strap-concrete','Strap beam concrete & curing','foundation','foundation','strap-concrete',['strap-steel'],7,[13],'Programme allowance; resolve section, elevation and monolithic construction sequence.');
 add('plinth-steel','Plinth / tie beam reinforcement','plinth','foundation','steel-tie',['strap-concrete'],2,[10,14],'Transverse 225×300 members have no matching reinforcement detail.');
 add('plinth-form','Plinth beam formwork','plinth','foundation','form-tie',['strap-concrete'],2,[10,14],'Check line, level, bearing and construction joints.');
 add('plinth-concrete','Plinth beam concrete & curing','plinth','foundation','tie-concrete',['plinth-steel','plinth-form'],7,[10,14],'Dates do not release formwork or loading.');
 add('below-ground-services','Underground drainage, sleeves & tests','plinth','ground','plumbing',['plinth-concrete'],3,[21],'Routes, falls, invert levels, pipe sizes and tank siting require design. Test before covering.');
 add('foundation-protection','Foundation protection / DPC preparation','plinth','ground','pending',['plinth-concrete'],2,[7,9],'DPC, waterproofing, termite measures if required, and specifications need approval.');
 add('backfill','Backfill & layer compaction','plinth','foundation','backfill',['below-ground-services','foundation-protection'],3,[9],'In-place volume excludes loose bulking, haulage and additional trenches. Verify compaction.');
 add('ground-soling','Ground-floor boulder soling','plinth','ground','ground-soling',['backfill'],2,[7,9],'Source 200 mm soling; net extent is a model study.');
 add('ground-sand','Ground-floor sand filling','plinth','ground','ground-sand',['ground-soling'],1,[9],'100 mm sand fill is shown in sheet 9; reconcile the complete layer stack.');
 add('ground-pcc','Ground-floor PCC & level checks','plinth','ground','ground-pcc',['ground-sand'],2,[7,9],'75 mm PCC; finish thickness differs between sheets 7 and 9.');
 let previous='ground-pcc';
 for(const [scope,upper]of [['ground','first'],['first','second'],['second','roof']]){
  const name=project.levels.find(l=>l.id===scope).label,up=project.levels.find(l=>l.id===upper).label,prefix='frame-'+scope;
  add(prefix+'-column-steel',name+' · column cages','frame',scope,'steel-column',[previous],3,[8,20],'Confirm laps, cover, anchorage and source storey schedule.');
  add(prefix+'-column-form',name+' · column formwork','frame',scope,'form-column',[previous],2,[8],'Check verticality, dimensions and junctions.');
  add(prefix+'-column-pour',name+' · column concrete','frame',scope,'column-concrete',[prefix+'-column-steel',prefix+'-column-form'],1,[8],'Inspect before pour; vibrate and record approved mix / tests.');
  add(prefix+'-column-cure',name+' · cure & review','frame',scope,'pending',[prefix+'-column-pour'],7,[],'Planning allowance; strength and responsible engineer determine release.');
  add(prefix+'-deck',up+' · beam / slab formwork','frame',upper,'form-deck',[prefix+'-column-cure'],4,[10,11],'Engineered props, bracing, soffit levels and slab/stair voids.');
  add(prefix+'-beam-steel',up+' · beam reinforcement','frame',upper,'steel-beam',[prefix+'-deck'],3,[15,16,17,18,20],'MB2 bottom and SB top conflicts; no fabricated resolution.');
  add(prefix+'-slab-steel',up+' · slab reinforcement','frame',upper,'steel-slab',[prefix+'-beam-steel'],2,[11,20],'Bottom mesh is modelled; top support strips, openings and anchorage require detailing.');
  if(scope!=='second'){add(prefix+'-stair-form',name+' → '+up+' · stair formwork','frame',scope,'stair-form',[prefix+'-deck'],2,[12],'Check 17 equal risers, provisional 9/8 split, landing fit and headroom.');add(prefix+'-stair-steel',name+' → '+up+' · stair reinforcement','frame',scope,'steel-stair',[prefix+'-stair-form'],2,[12,18],'Landing, chairs, nosing and anchorage need coordination.');}
  add(prefix+'-sleeves',up+' · sleeves, openings & pre-pour','frame',upper,'electrical',[prefix+'-slab-steel',...(scope!=='second'?[prefix+'-stair-steel']:[])],1,[11,21],'Coordinated sleeves and tests before concrete. No unapproved drilling/cutting of RCC.');
  add(prefix+'-pour',up+' · slab / beam'+(scope!=='second'?' / stair':'')+' concrete','frame',upper,'deck-concrete',[prefix+'-sleeves'],1,[10,11,12],'Net model junction ownership shown in quantity basis; site measurement still requires approval.');
  add(prefix+'-cure',up+' · curing, strength & reshoring review','frame',upper,'pending',[prefix+'-pour'],14,[],'Allowance only. Reshoring, form removal and loading require approved strength/design review.');
  previous=prefix+'-cure';
 }
 const wallEnds=[];
 for(const scope of ['ground','first','second']){const label=project.levels.find(l=>l.id===scope).label,p='wall-'+scope,release=scope==='ground'?'frame-ground-cure':scope==='first'?'frame-first-cure':'frame-second-cure';
  add(p+'-layout',label+' · wall / opening setting out','masonry',scope,'openings',[release],1,[2,3,4,7],'Coordinate opening sizes, frames, service chases and band datum faces.');
  add(p+'-lower',label+' · masonry below sill','masonry',scope,'masonry-lower',[p+'-layout'],3,[7,19],'Sill datum is +625 mm above the relevant floor.');
  add(p+'-sill-steel',label+' · sill-band steel & form','masonry',scope,'steel-sill',[p+'-lower'],2,[7,19],'Continuous route and anchorage remain uncoordinated.');
  add(p+'-sill-pour',label+' · sill-band concrete / review','masonry',scope,'sill-concrete',[p+'-sill-steel'],2,[7,19],'Confirm datum face and opening conflicts before setting out.');
  add(p+'-middle',label+' · masonry to lintel','masonry',scope,'masonry-middle',[p+'-sill-pour'],3,[7,19],'Lintel datum is +2100 mm above floor; do not overwrite conflicting opening sizes.');
  add(p+'-lintel-steel',label+' · lintel steel & form','masonry',scope,'steel-lintel',[p+'-middle'],2,[7,19],'Resolve bearing, continuity and source opening-head discrepancies.');
  add(p+'-lintel-pour',label+' · lintel concrete / review','masonry',scope,'lintel-concrete',[p+'-lintel-steel'],2,[7,19],'Source band sections are studies, not issued layouts.');
  wallEnds.push(add(p+'-upper',label+' · masonry above lintel','masonry',scope,'masonry-upper',[p+'-lintel-pour'],3,[7,19],'Deduct RCC/openings; coordinate parapets, infill junctions and ties.'));
 }
 add('plumbing-chases','Plumbing grooves, pipes & rough points','services','all','plumbing',wallEnds,5,[21],'Only approved masonry chases. Do not cut beams, columns, slabs or bands without engineered details.');
 add('electrical-chases','Electrical grooves, boxes & conduit','services','all','electrical',wallEnds,5,[],'Point locations are proposals; circuit loads, earthing, protection and cable sizes need qualified design.');
 add('rough-tests','Pressure, drainage & concealed-service checks','services','all','pending',['plumbing-chases','electrical-chases'],2,[21],'Record tests and as-built routes before closing chases.');
 add('plaster','Plastering, reveals & patch repairs','finishes','all','plaster',['rough-tests'],7,[],'Model two-face wall proxy excludes returns/reveals and approved finish thickness.');
 add('roof-drainage','Roof outlets, falls & rainwater routes','services','roof','pending',['frame-second-cure'],3,[5,7],'Outlet locations, falls and discharge route are not specified.');
 add('screed','Room screeds & wet-area falls','finishes','all','screed',['plaster','roof-drainage'],4,[7,9],'40 mm planning example; reconcile thresholds, fall gradients and finished-floor levels.');
 add('waterproof','Wet-area / roof waterproofing','finishes','all','waterproof',['screed'],4,[5,7],'Approve system, substrate, penetrations, upstands, curing and application sequence.');
 add('flood-test','Waterproofing flood / drainage test','finishes','all','pending',['waterproof'],2,[],'Duration and acceptance follow the approved system. Protect the membrane before finishes.');
 add('tiles','Tile bedding, tiles & grout','finishes','all','tiles',['flood-test'],6,[],'600×600 tile and 7.5% cutting allowance are examples; layout and packs need approval.');
 add('granite','Granite worktop, thresholds & stair finish','finishes','all','granite',['tiles'],3,[],'Kitchen tassi is proposed; threshold and stair granite remain unmeasured.');
 add('ceiling','Above-ceiling services & false ceiling','finishes','all','ceiling',['rough-tests','plaster'],4,[],'Ceiling extent, support, access hatches, detectors and moisture suitability need design.');
 add('windows','Window frames, glazing & sealants','finishes','all','windows',['plaster'],4,[7],'Schedule and traced widths/counts differ. Verify each opening on site before ordering.');
 add('doors','Door frames, leaves & hardware','finishes','all','doors',['tiles','plaster'],4,[7],'Check frame/leaf sizes, swings, threshold and finished levels.');
 add('railing','Metal railing & protective coating','finishes','all','railing',['tiles'],3,[6],'Heights, fixings, infill and corrosion protection need detailing.');
 add('primer','Dryness checks, primer & first coat','finishes','all','paint',['plaster','ceiling'],4,[],'Product coverage, substrate moisture and coat system are not specified.');
 add('fixtures','Sanitary fixtures, kitchen sink & appliances','finishes','all','fixtures',['granite','tiles','primer'],4,[],'Proposed layout only; confirm access, headroom, service sizes and fixing details.');
 add('wiring','Final wiring, lights, sockets & DB','finishes','all','electrical',['primer','ceiling'],4,[],'MCB/DB is an un-rated provision; qualified electrical design and testing required.');
 add('plumbing-fit','Plumbing fit-off & connection tests','finishes','all','plumbing',['fixtures'],3,[21],'Pressure/flow, traps, leaks, hot water, drainage and clean-water protection.');
 add('furniture','Beds, sofa, TV, fridge & storage','finishes','all','furniture',['doors','primer'],3,[],'All furniture dimensions/locations are concept proposals; clearances need review.');
 add('final-paint','Snag repairs & final painting','finishes','all','paint',['wiring','plumbing-fit','railing','furniture'],3,[],'Repair damaged plaster, protect finishes, make good penetrations and complete final coats.');
 add('compound-wall','Compound wall & boundary works','external','site','external',['brief','strap-concrete'],7,[1],'No surveyed boundary polygon or wall/foundation design; quantity and position unassigned.');
 add('gate','Metal compound gate / rolling shutter','external','site','gate',['compound-wall'],3,[7],'RS schedule is not an assigned compound-gate design. Access and safety/operation need coordination.');
 add('septic','Septic / soak pit & external drainage','external','site','septic',['brief'],7,[21],'Locate and approve levels, access, ground suitability, pipes and connection before construction.');
 add('external-finish','External paving, drainage & reinstatement','external','site','pending',['gate','septic','final-paint'],4,[1],'Surveyed extents, levels, drainage and landscaping are unmeasured.');
 add('commission','Electrical, water, drainage & safety commissioning','handover','all','pending',['final-paint','external-finish'],3,[],'Earth continuity, protection, insulation, water pressure, drainage, ventilation and access checks.');
 add('snags','Snag list, corrective works & cleaning','handover','all','pending',['commission'],3,[],'Close defects and record inspection acceptance.');
 add('handover','As-builts, approvals, manuals & handover','handover','all','pending',['snags'],2,[],'Record actual dimensions, test certificates, operation manuals, warranties and maintenance plan.');
 return tasks;
}
export function scheduleTasks(tasks,overrides={}){const byId=new Map(tasks.map(t=>[t.id,t])),done=new Map(),visiting=new Set();function visit(id){if(done.has(id))return done.get(id);const t=byId.get(id);if(!t)throw Error('Missing predecessor '+id);if(visiting.has(id))throw Error('Cyclic programme');visiting.add(id);const duration=Number(overrides[id]??t.duration_days);if(!Number.isFinite(duration)||duration<0||duration>365)throw Error('Invalid duration');const start=Math.max(0,...t.depends.map(d=>visit(d).finish)),r={...t,start,finish:start+duration,duration};visiting.delete(id);done.set(id,r);return r;}tasks.forEach(t=>visit(t.id));const total=Math.max(...[...done.values()].map(t=>t.finish));for(const t of [...done.values()].reverse()){const successors=[...done.values()].filter(s=>s.depends.includes(t.id));t.latestFinish=successors.length?Math.min(...successors.map(s=>s.latestStart)):total;t.latestStart=t.latestFinish-t.duration;t.float=t.latestStart-t.start;t.critical=t.float<1e-7;}return {tasks:tasks.map(t=>done.get(t.id)),duration:total};}

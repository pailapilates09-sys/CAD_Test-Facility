"""Build v7 evidence-backed component references; never reverse-engineer a quote split."""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
import json
ROOT=Path(__file__).resolve().parents[4]
BASE=ROOT/'public/construction/estimates/pilates-astra-2026-10-15'
OUT=BASE/'v7';OUT.mkdir(exist_ok=True)
comparison=json.loads((BASE/'v5/comparison.json').read_text())
research=json.loads((BASE/'v4/market-rates.json').read_text())
original=json.loads((ROOT/'construction/estimates/pilates-astra-2026-10-15/data/estimate.json').read_text())
debt=json.loads((OUT/'debt-review.json').read_text())
sources={};observations=[]
def source(id,publisher,url,locator,date=None,note='',kind='provider'):
 sources[id]=dict(id=id,publisher=publisher,url=url,locator=locator,published_date=date,retrieved_date='2026-10-17',kind=kind,note=note)
def rate(id,sid,component,label,low,high,unit,note,kind='published_reference',basis='component',source_page=None):
 normunit='m2' if unit=='ft2' else 'm' if unit=='ft' else unit
 factor=Decimal('0.09290304') if unit=='ft2' else Decimal('0.3048') if unit=='ft' else Decimal(1)
 conv=lambda n:None if n is None else str((Decimal(str(n))/factor).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))
 observations.append(dict(id=id,source_id=sid,component=component,label=label,currency='NPR',low=None if low is None else str(low),high=None if high is None else str(high),unit=unit,normalized=dict(low=conv(low),high=conv(high),unit=normunit,factor=str(factor)),basis=basis,kind=kind,qualification=note,source_pdf_page=source_page,exact_scope_verified=False,vat_status='not_stated'))
source('N01','Kathmandu District Administration Office',debt['resolved'][0]['url'],'FY 2083/84; PDF page 8/printed 1, p48/printed 41, p49/printed 42','2083-03-32 BS','Current-year column visually transcribed from scanned source. Material header excludes VAT. Day wages are not item piece rates.','official_schedule')
sources['N01'].update(dict(source_sha256=debt['resolved'][0]['sha256'],source_bytes=15344169,preserved_copy_url=debt['resolved'][0]['preserved_copy_url']))
rate('C01','N01','labour','Skilled trade daily wage',1330,1330,'day','General skilled-trade schedule benchmark. Crew composition, worker-days per item/unit and specialist premiums are unknown.',basis='daily_wage',source_page=8)
rate('C02','N01','labour','General construction helper wage',1000,1000,'day','Helper daily wage, not a skilled-worker substitute. Productivity and helper count are unknown.',basis='daily_wage',source_page=8)
rate('C03','N01','material','Fibre cement wall board options, 8–12 mm',67,94,'ft2','Material-only alternatives: 8 mm=67; 9 mm=75; 10 mm=85; 12 mm=94 NPR/ft². Not a complete partition, two faces, aluminium frame or fixings.',basis='board_face_area',source_page=48)
rate('C04','N01','material','Vinyl laminated gypsum ceiling board, 7 mm',95,95,'ft2','Board supply benchmark for a named 7 mm variant, not the approved project board or complete ceiling; frames, cutting, fixings and lights excluded.',basis='board_face_area',source_page=49)
rate('C05','N01','material','Both-side laminated hybrid board, 18 mm',141,141,'ft2','One listed WPC/hybrid board option; material face area only. Desk construction, backing, hardware and required board take-off are unknown.',basis='board_face_area',source_page=48)
rate('C06','N01','combined','Supply and fix 12.5 mm gypsum false ceiling',88,88,'ft2','Explicit supply-and-fix benchmark. It is not a material-only price and is never moved into the material column.',basis='installed_work',source_page=48)
for o in observations:
 if o['id'] in {'C03','C04','C05','C06'}:o['vat_status']='excludes_VAT'
source('N02','Homeplex','https://homeplexnepal.com/services/carpenter-services-in-kathmandu','Modular kitchen daraz/drawer fitting: labour-only and with-material cards',note='Standard-complexity guide; measurement face and full inclusions require confirmation.')
rate('C07','N02','labour','Modular cabinet labour benchmark',550,550,'ft2','Kitchen-cabinet benchmark; curved cupboards, shoe racks, lockers and project cabinet depth/measurement basis may differ.',basis='cabinet_measurement_unconfirmed')
rate('C08','N02','combined','Modular cabinet with-material package',2200,3200,'ft2','With-material package includes labour. Subtracting labour does not prove a pure material price; no residual is classified as material.',basis='cabinet_measurement_unconfirmed')
source('N03','Shreya Interiors','https://shreyainterior.com.np/product-category/materials-and-finishes/?per_page=24','18 mm 8×4 C/G plywood 2720; 18 mm 8×4 plywood 3072',note='Kathmandu retailer; alternative products, stock and VAT need confirmation.')
rate('C09','N03','material','18 mm plywood, 8×4 ft sheet options',2720,3072,'sheet','Sheet prices, not the cabinet-front rate. Grade differs; cut list, number of faces, laminate, hardware, adhesive and wastage are not included.',basis='sheet_supply')
source('N04','Sajilo Sewa','https://sajilosewa.com/service/wall-mounted-ac-installation','Price description: labour 4972 per unit; spare parts separate')
rate('C10','N04','labour','Wall-mounted split AC installation labour',4972,4972,'each','Labour for one supported 1/1.5/2-ton wall-mounted unit. Consumables, extra piping, brackets and electrical scope need confirmation; source 1.5 MT remains ambiguous.',basis='unit_installation')
source('N05','Sajilo Sewa','https://www.sajilosewa.com/service/ceiling-light-installation','Price description: labour 650 per unit; spare parts separate')
rate('C11','N05','labour','Ceiling light installation labour',650,650,'each','One ceiling fixture; does not establish wardrobe-light content, new circuits or all wiring in the project.',basis='unit_installation')
source('N06','Sajilo Sewa','https://www.sajilosewa.com/service/decorative-light-installation','Price description: labour 650 per unit; parts separate')
rate('C12','N06','labour','Decorative light installation labour',650,650,'each','Generic decorative fixture only; heavy chandeliers, special supports and new wiring can cost extra.',basis='unit_installation')
source('N07','Reshape Home','https://reshapehome.com/blogs/paint-price-in-nepal/','Emulsion per litre; two-coat coverage; labour per ft²',note='Painting only; excludes full putty/primer system and unquoted repairs.')
rate('C13','N07','labour','Painting labour, partial scope',8,15,'ft2','Paint application benchmark; putty, sanding, primer and repairs are not confirmed as part of this labour rate.',basis='painted_surface')
rate('C14','N07','material','Standard plastic emulsion supply',250,800,'L','Per litre only. Published two-coat coverage is 40–60 ft²/L; brand, coats, primer, putty and waste remain project choices.',basis='paint_volume')
# Explicit interval arithmetic using two published inputs, without selecting a midpoint or waste allowance.
low=Decimal(250)/Decimal(60);high=Decimal(800)/Decimal(40)
rate('C15','N07','material','Two-coat emulsion paint consumption example',str(low),str(high),'ft2','Derived paint-only envelope: 250÷60 to 800÷40 NPR/ft², using published 40–60 ft²/L for two coats. No wastage, primer or putty included.',kind='derived_from_published_inputs',basis='painted_surface')
observations[-1]['formula']={'price_npr_per_litre':['250','800'],'two_coat_coverage_ft2_per_litre':['40','60'],'low':'250/60','high':'800/40','wastage_assumed':None}
source('N08','Expert Sewa','https://expertsewa.com/blog/marble-price-in-nepal-2026-types-costs-top-suppliers','White marble range; installation labour section','2026-06-24','Broad contractor market guide; project marble grade not specified.')
rate('C16','N08','labour','Marble installation labour',80,200,'ft2','General floor/slab installation benchmark. Small counters, adhesive, polishing, edges and surface preparation differ.',basis='stone_surface')
rate('C17','N08','material','White marble grade alternatives',1800,3500,'ft2','Indian to premium white marble alternatives, not the project grade. Range is markedly above the older source; do not replace the quote or average conflicting grades.',basis='stone_surface')
source('N09','Fashion Paints','https://fashionpaints.com.np/all-products/fashion-paints-smooth-wall-putty/','40 kg pack; MRP 2642',note='Manufacturer in Nepal; page does not explicitly state the price currency or current quote date.')
rate('C18','N09','material','Smooth wall putty, 40 kg pack',2642,2642,'bag_40kg','Manufacturer MRP; currency is unstated. No bag-to-covered-area conversion without consumption and coats.',basis='pack_supply')
observations[-1]['currency']=None
# Keep only explicit supply-only observations from the old snapshot. Combined work stays outside both component columns.
supply_ids={'R05','R06','R07','R08','R09','R10','R11','R12','R13','R14','R18','R19','R20','R26'}
for o in research['observations']:
 if o['id'] not in supply_ids:continue
 s=next(s for s in research['sources'] if s['id']==o['source_id']);sid='V4-'+s['id'];sources[sid]={**s,'id':sid,'kind':'prior_supply_snapshot'}
 rate('V4-'+o['id'],sid,'material',o['label'],o['low'],o['high'],o['unit'],o['qualification']+' V4 snapshot retrieved 16 October 2026; current stock/price not revalidated.',basis='finished_product_supply' if o['basis']=='product_only' else 'raw_material_supply',kind=o['price_qualifier'])
 observations[-1].update(availability=o['availability'],vat_status=o['vat_status'],price_qualifier=o['price_qualifier'])
# All item IDs are explicitly reviewed. Six user-held items keep no new research assignments.
labour={};material={};combined={}
def assign(target,ids,refs):
 for id in ids.split():target[id]=refs.split()
for x in comparison['items']:
 if x['status']!='on_hold_original_retained':labour[x['id']]=['C01','C02']
assign(labour,'reception-001 reception-004 locker-space-001 locker-space-002 studio-001','C07 C01')
assign(material,'reception-001 reception-004 locker-space-001 locker-space-002 studio-001','C09')
assign(combined,'reception-001 reception-004 locker-space-001 locker-space-002 studio-001','C08')
assign(material,'reception-003','C05 C09')
assign(material,'coffee-lounge-003','C09')
assign(labour,'reception-002 coffee-lounge-002','C16 C01')
assign(material,'reception-002 coffee-lounge-002','C17')
assign(material,'reception-006','V4-R26')
assign(labour,'reception-007 coffee-lounge-008 locker-space-006 studio-007','C10')
assign(material,'reception-007 studio-007','V4-R09 V4-R10')
assign(material,'coffee-lounge-008 locker-space-006','V4-R08')
assign(material,'reception-008 coffee-lounge-011 locker-space-008 studio-006','V4-R05')
assign(labour,'reception-009 coffee-lounge-006','C11')
assign(material,'reception-009 coffee-lounge-006','V4-R06')
assign(labour,'reception-010 coffee-lounge-012 locker-space-004','C12')
assign(material,'reception-010 coffee-lounge-012 locker-space-004','V4-R07')
assign(labour,'reception-011 coffee-lounge-007 studio-005','C13 C01')
assign(material,'reception-011 coffee-lounge-007 studio-005','C15 C14 C18')
assign(material,'locker-space-005','C18')
assign(material,'reception-012 reception-014 coffee-lounge-009 locker-space-007','C04')
assign(combined,'reception-012 reception-014 coffee-lounge-009 locker-space-007','C06')
assign(material,'reception-015','V4-R11')
assign(material,'coffee-lounge-001','V4-R12')
assign(material,'coffee-lounge-013','V4-R18')
assign(material,'studio-002','V4-R13')
assign(material,'studio-003','V4-R19')
assign(material,'changing-room-002','V4-R20 V4-R19')
assign(material,'studio-008 changing-room-001','C03')
assign(material,'washroom-001','V4-R14')
byid={o['id']:o for o in observations}
items=[]
for x in comparison['items']:
 held=x['status']=='on_hold_original_retained';ls=labour.get(x['id'],[]);ms=material.get(x['id'],[]);cs=combined.get(x['id'],[])
 def same(refs):return [r for r in refs if byid[r]['normalized']['unit']==x['si']['unit'] and x['si']['unit'] is not None]
 gaps=[]
 if held:gaps=['On hold by user; original values retained. No new component prices assigned.']
 else:
  if not ms:gaps.append('No verified material-only price for the stated work; existing public package is not split.')
  if not same(ls):gaps.append('No labour price in the estimate unit; worker-days or a matching installation quote required.')
  if ms and not same(ms):gaps.append('Supply units differ from estimate units; material take-off or dimensions required.')
  gaps.append('A complete matching bill of materials, site labour, transport, equipment, overhead/profit and VAT breakdown is still required.')
 items.append(dict(item_id=x['id'],section_id=x['section_id'],section_name=x['section_name'],title=x['title'],status='on_hold_original_retained' if held else 'component_references_only',original=x['original'],si=x['si'],original_labour_rate=None,original_material_rate=None,original_unallocated_rate=x['si']['rate'],accepted_split=False,labour_reference_ids=ls,material_reference_ids=ms,combined_reference_ids=cs,same_unit_labour_ids=same(ls),same_unit_material_ids=same(ms),gaps=gaps))
allowances=[dict(section_id=s['id'],name=s['name'],original_amount=s['summary_amount'],labour_amount=None,material_amount=None,unit_rate=None,status='summary_only_unallocated',reason='No detailed quantities or specification. Original allowance remains unsplit.') for s in original['sections'] if not s['item_count']]
coverage=dict(all_items=len(items),held_items=sum(x['status']=='on_hold_original_retained' for x in items),labour_reference_items=sum(bool(x['labour_reference_ids']) for x in items),material_reference_items=sum(bool(x['material_reference_ids']) for x in items),both_component_reference_items=sum(bool(x['labour_reference_ids']) and bool(x['material_reference_ids']) for x in items),same_unit_both_items=sum(bool(x['same_unit_labour_ids']) and bool(x['same_unit_material_ids']) for x in items),accepted_original_splits=0,summary_only_areas=len(allowances))
register=dict(schema_version='component-rates-1.0.0',version='v7',based_on='v6',researched_date='2026-10-17',currency='NPR',estimate_currency=None,policy=['Original quote rates and amounts are preserved; accepted original labour/material splits remain null.','Public labour and supply references are separate, qualified evidence, not an allocation of the quote.','Daily wages, product supply units, sheet areas and project measurement bases are not interchanged without productivity or take-off.','Finished products can contain factory labour; their purchase price is supply-side reference, not a raw-material bill.','Missing values mean unknown, never zero. No arbitrary percentage, midpoint or subtraction residual is called material.','Six holds and two allowances remain unsplit. Draft calculator entries do not alter the estimate or create an accepted quote.'],coverage=coverage,summary=original['summary'],sources=list(sources.values()),observations=observations,items=items,allowances=allowances)
(OUT/'component-rates.json').write_text(json.dumps(register,ensure_ascii=False,indent=2)+'\n')
(OUT/'component-items.jsonl').write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in items)+'\n')
print(json.dumps(coverage))

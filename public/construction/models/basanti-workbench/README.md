# Basanti Construction Workbench

This is a sibling page to Building Plans. Both read `../basanti-residence/data/project.json`; no independent copy of the 133 base elements is maintained here. The original 21 PDF sheets and raw archive remain unchanged. The shared model owns source facts, the workbench scenario, band datums, visual assumptions and 39 proposed layout elements. Pure modules derive the 112 work packages, 707 quantity rows and dependency programme.

The four linked panels are the work plan, Three.js / vector 3D, measurement table and Gantt programme. Select a work package in the controls, register or Gantt, then select an element in either drawing or table. Context, isolation, camera presets, source-sheet viewing and zoom keep the selected work inspectable. Phone layouts stack panels and table fields. The existing theme and companion controls remain in force.

## Measurement contract

- **Source**: a written dimension or schedule record, with a source page.
- **Model**: a calculation from reconstructed geometry, not a surveyed bill quantity.
- **Scenario**: a calculation containing explicit example inputs (such as pit clearance or unresolved footing thickness).
- **Study**: provisional geometry/path/contact calculations, not fabrication or procurement quantities.
- **Proposal**: requested furniture, fixtures or MEP concept provisions. Their positions, clearances and specifications are unapproved.
- **Unmeasured**: an explicit null. Unknowns are never silently converted into zero.

`quantities.js` uses rectangle unions so overlapping vertical-prism pits are counted once. Backfill deducts the union of permanent scenario solids clipped inside the pits and below ground. Sloping sides, support/dewatering design, additional trenches, loose bulking and haulage remain excluded.

Source-frame concrete junctions are allocated once: slab polygons (with holes) own slab-depth junctions; beams own the remaining intersections in stable ID order; columns own the remaining volume. These calculations support the model's orthogonal beams/columns and polygon slabs. They are not a redesign of conflicting sections. Foundation scenarios, stair junctions and band routes retain separate qualifications and must not be promoted to approved combined orders.

Footing/column formwork uses a gross side-contact proxy; beam formwork uses gross side/soffit runs. Slab clear soffit excludes holes and beam footprints. End shutters, shared junction faces, stringer edges, engineered props/ties, pressure design and reuse are not fully designed. Stair quantities use the closed displayed flight profiles plus landing prism; contact estimates separate sloping soffits, landing soffit and riser faces.

Room finish quantities use written room rectangles. They exclude unlisted circulation, terraces, reveals/returns, product coverage and uncoordinated build-ups. Example tile counts round up whole 600×600 pieces after an explicit cutting allowance, rather than claiming a selected product or approved order. Kitchen worktop area uses the proposed top including its example overhang; sink cut-outs and fabrication details need measurement.

## Source corrections and limits

Sheet 7 explicitly labels sill datums at +625/+3625/+6625 mm and lintel datums at +2100/+5100/+8100 mm. Band studies now use these levels rather than deriving a different lintel from each opening head. The source does not coordinate the datum face, continuous routes and conflicting opening sizes. Display centring on the datum is an assumption; band concrete quantities remain unmeasured.

Stairs share `stair-model.js` across plan, Three.js, reinforcement, labelled detail and quantities. Seventeen equal risers close 3000 mm at 176.470588 mm; the written 176 mm nominal leaves 8 mm. The provisional 9/8 split has 8/7 regular goings and a 1065 mm example landing. Continuous waist/landing solids replace floating step boxes. Flight split, landing closure, headroom, connections and the source 2135 versus 2×1065 mm width mismatch remain unresolved. No code-compliance or structural approval is asserted.

All 39 furniture/service elements are proposals. No MCB rating, cable size, pipe diameter/slope, concealed route, fixture clearance, circuit load or protection design is invented. Compound wall/gate and septic siting are included as unlocated work scopes: the PDF does not supply a surveyed compound polygon or a chosen compound gate/count. Rolling-shutter schedule types remain unassigned schedule entries.

## Programme and persistence

`work-packages.js` constructs dependencies and computes earliest/latest times, total float and the critical dependency path. Defaults currently produce 241 calendar days; this is an unapproved planning scenario, not an actual start/finish commitment. Crew resources, working calendars, holidays, weather and procurement lead times are not modelled. Curing/strength/release reviews are activities; a date never authorises stripping, loading, pouring or occupation.

Changing an activity allowance reschedules successors. The optional date translates relative project days. Browser changes are session scenarios and can be exported; durable source edits remain conversation-led GitHub changes. CSV/JSON projections are generated by `scripts/building-workbench.mjs` at every Pages build. They record their source hash and shared revision and contain no duplicated editable base model.

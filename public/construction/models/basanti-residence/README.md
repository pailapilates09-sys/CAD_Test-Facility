# Basanti Residence — Building Plans

A separate sibling project, derived from the 21-sheet architectural/structural PDF supplied on 25 October 2026. It does not modify the Pilates model, estimate, paused BOQ interpretation or source Drive. The shared website theme, appearance controls and mascot preference continue to apply.

## Evidence and coverage

The exact 10,046,143-byte PDF has SHA-256 `a951721f046d4321542ae0c6b386c9a54b5575bc4c0676544daaff98a9e77611`. `source/original.pdf.part-*` and `original-parts.json` preserve it without altering a byte. The Pages build verifies each part and reassembles `source/original.pdf`. The original is necessary for native PDF content beyond the extractor's supported records.

All 21 pages retain text spans, positioned words, numeric token observations, vector path operations, source CAD layer labels, embedded image records, page rotations and native vector SVGs. There are 2,128 text spans, 4,248 words, 79,750 paths, 1,316 numeric observations and five embedded-image placements. Raw JSONL, text, CSV, SQLite and SQL are in `source/`. A numeric observation is an unassigned source token, not an accepted measurement. Repeated title blocks remain repeated evidence, rather than being silently discarded.

Page coordinates use PDF points, top-left origin, before rotation. Records also retain display bounding boxes and each page's rotation matrix. The drawing units are not assumed to be metres. The plan calibration in `data/project.json` maps written structural grid spans to metres for the reviewed reconstruction. Source labels and dimensions can disagree with their traced geometric size.

## Shared model and projections

`data/project.json` is the sole editable semantic model. Its 36 measurements, four floor/roof datums, seven room records, 15 opening types, six column schedule rows, structural schedules, 133 model components and 14 issue records refer back to source pages/spans/paths. Ground, first and partial second are the three stated storeys. The section's +9 m `THIRD FLOOR` label is preserved as the upper roof datum; no extra occupied floor is invented.

The derived model includes walls and wall openings, slabs, columns, floor beams, tie/strap beams, footprint-only footings, stairs and balcony/terrace railings. Written values are `observed`; calibrated traces/calculations are `derived`; provisional presentation geometry is `assumed`. Foundations have unresolved eccentric offsets/thickness, some reinforcement labels conflict, and tank/site positions are unknown. Stated floor areas are kept separate from traced gross slab envelopes.

`building-model.js` supplies shared filtering, dimensions, wall opening segmentation, floor-plan generation and clipping. `construction-model.js` derives 98 reinforcement study sets (3,810 displayed bar paths) and 24 band study zones from the source schedules. `shop-drawings.js` and `register-view.js` derive labelled details and four-column category tables. The generated construction JSON stores only the 122 added study records and refers to the original 133 elements; it does not duplicate them. The database likewise keeps base elements, derived studies and individual bar paths in separate linked tables.

`three-adapter.js` creates Three.js geometry, including instanced bars at their nominal diameters. WebGL and the interactive vector fallback share the same geometry and fitted orthographic camera. SVG visibility uses an explicit attribute, and both render surfaces occupy the same absolutely positioned viewport: the fallback cannot push the WebGL canvas below the visible panel. Isometric, top, front and side presets fit all bounding corners at phone, tablet and desktop aspect ratios. Selection, isolation, transparent concrete, plan-height cuts and hover/tap measurements stay linked to the plans and grouped register.

The 12 construction steps are source-review guides from setting out through services and finishing. They are not an issued A–Z execution method or engineering approval. Column ties retain the square-plus-diamond arrangement. Suspended slabs show bottom mesh clipped around stair voids; support-strip top steel is not invented as a full-area top mat. Sheet 18 has conflicting SB top bars (3×Ø12 sections versus 2×Ø16 longitudinal), so that role is withheld, as are unresolved MB2 bottom bars and unmatched strap/transverse-TB details. Band sections are source studies, not coordinated continuous routes. Covers, grades, bend radii, laps, anchorage and final cutting requirements remain unconfirmed. Display offsets, path counts and shown path lengths are not specified cover, procurement quantities or fabrication lengths; final cut/order fields stay null.

Geometry generation does not certify structural safety or turn the PDF into native DWG/SKP/Revit authoring history. All original sheets and raw records remain available for details not modelled or not yet coordinated.

`scripts/building-project.mjs` reassembles source files, restores original sheet SVGs with PDF zero-width hairlines adapted to visible, non-scaling browser strokes, generates CSV/JSONL projections, 12 SVG study drawings and server-renders the grouped tables. `tools/building/export_database.py` rebuilds a queryable raw-plus-model SQLite/SQL export from immutable extraction data and the current model JSON.

`scripts/building-ifc.mjs` and `tools/building/export_ifc.py` generate a source-linked IFC4 exchange model using the pinned open-source IfcOpenShell toolkit. Base elements retain semantic IFC classes; uncoordinated bands are annotations, not approved beams. Individual study bars retain nominal diameters, host/source IDs and unset final `BarLength`. Straight swept segments show the same unconfirmed bend geometry as the viewer; no fabrication fillet radius is invented. The build reopens the IFC, validates its schema, checks GUIDs and representative geometry, and writes an inspection receipt. Native Revit import has not been tested; IFC linking is distinct from native RVT families and drawing history.

Install Python dependencies with `python3 -m pip install -r tools/building/requirements-ifc.txt`, then run `npm run check`. GitHub Actions installs them before testing/building. Re-extraction requires PyMuPDF, whose version is recorded in `source/extraction-register.json`.

## Conversation-led editing

The owner can describe desired changes in ordinary language to the AI assistant. The assistant identifies the referenced floor/element IDs, separates a design alternative from source facts, records assumptions and edits the shared model on a branch. After validation, a commit/PR and Pages deployment rebuild the views together. No manual parameter form, browser-local hidden design data, live LLM endpoint or automatic speech parser is implied.

Use `changes.jsonl` for the request, interpreted action, affected IDs, source basis, unknowns and resulting commit context. Preserve the source archive and observed facts. Critical unclear structural changes need clarification; provisional visual choices must retain their `assumed` status. A request can be copied into a new design alternative without rewriting the original extraction. The example derivation script documents this initial reviewed overlay; future canonical model edits should not be overwritten by rerunning it indiscriminately.

Run `npm run check`, inspect the new page at desktop and phone widths, then publish through the existing Pages workflow. Original and earlier project pages remain available. A clean Git commit/branch and retained source hash provide the rollback boundary.

## Construction Workbench

The sibling `../basanti-workbench/` page reads this same canonical JSON. It adds four linked panels (plan, 3D, quantities and Gantt), 112 work packages, 707 quantity rows and 39 labelled layout/service proposals. Quantity assumptions, proposal geometry and band datums live under `workbench` in the shared model; derived exports are regenerated by the build. Stair plan/mesh/reinforcement/details now share `stair-model.js`. Sheet 7 band levels replace opening-head-derived lintel levels; duplicate studies on the same wall/datum are combined, so the current study count differs from historical B002. Missing band routes, opening conflicts, stair headroom/fit and final fabrication inputs remain explicit.

## Project hub and responsive reading

`milestone.html` is the project hub: an anchor-linked contents list, version-purpose directory, v1 → v2 comparison, source downloads, glossary and reusable prompt. The global Basanti navigation opens this hub; `index.html` continues to serve the building model. Both workbenches and the report expose stable named panels.

`scripts/building-navigation.mjs` renders the hub and shared comparison from the version manifest and generated checks. `project.css` is a Basanti-only reading layer; it preserves the studio theme and desktop panel columns while stacking phone controls and measurement fields. The v1 archive remains checksum verified; only its generated navigation/presentation shell and external resource paths are adapted. See `MOBILE_QA_2026-10-26.md` for observed checks and limits.

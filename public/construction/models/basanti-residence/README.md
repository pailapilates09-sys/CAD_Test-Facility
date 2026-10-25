# Basanti Residence — Building Plans

A separate sibling project, derived from the 21-sheet architectural/structural PDF supplied on 25 October 2026. It does not modify the Pilates model, estimate, paused BOQ interpretation or source Drive. The shared website theme, appearance controls and mascot preference continue to apply.

## Evidence and coverage

The exact 10,046,143-byte PDF has SHA-256 `a951721f046d4321542ae0c6b386c9a54b5575bc4c0676544daaff98a9e77611`. `source/original.pdf.part-*` and `original-parts.json` preserve it without altering a byte. The Pages build verifies each part and reassembles `source/original.pdf`. The original is necessary for native PDF content beyond the extractor's supported records.

All 21 pages retain text spans, positioned words, numeric token observations, vector path operations, source CAD layer labels, embedded image records, page rotations and native vector SVGs. There are 2,128 text spans, 4,248 words, 79,750 paths, 1,316 numeric observations and five embedded-image placements. Raw JSONL, text, CSV, SQLite and SQL are in `source/`. A numeric observation is an unassigned source token, not an accepted measurement. Repeated title blocks remain repeated evidence, rather than being silently discarded.

Page coordinates use PDF points, top-left origin, before rotation. Records also retain display bounding boxes and each page's rotation matrix. The drawing units are not assumed to be metres. The plan calibration in `data/project.json` maps written structural grid spans to metres for the reviewed reconstruction. Source labels and dimensions can disagree with their traced geometric size.

## Shared model and projections

`data/project.json` is the sole editable semantic model. Its 36 measurements, four floor/roof datums, seven room records, 15 opening types, six column schedule rows, structural schedules, 133 model components and nine issue records refer back to source pages/spans/paths. Ground, first and partial second are the three stated storeys. The section's +9 m `THIRD FLOOR` label is preserved as the upper roof datum; no extra occupied floor is invented.

The derived model includes walls and wall openings, slabs, columns, floor beams, tie/strap beams, footprint-only footings, stairs and balcony/terrace railings. Written values are `observed`; calibrated traces/calculations are `derived`; provisional presentation geometry is `assumed`. Foundations have unresolved eccentric offsets/thickness, some reinforcement labels conflict, and tank/site positions are unknown. No reinforcement cut lengths, complete bar cage or fabricated service routing is claimed. Those details remain fully available in original sheets and raw records. Stated floor areas are kept separate from traced gross slab envelopes.

`building-model.js` supplies shared filtering, dimensions, wall opening segmentation, floor-plan generation and clipping. `three-adapter.js` creates real Three.js geometries for WebGL, selection and a labelled SVG fallback when WebGL is unavailable. The fallback projects those same geometry buffers, including footprint/railing lines; it is not a replacement design model. Geometry generation does not certify structural safety or turn the PDF into native DWG/SKP/BIM authoring history.

`scripts/building-project.mjs` reassembles source files, restores original sheet SVGs with PDF zero-width hairlines adapted to visible, non-scaling browser strokes, generates CSV/JSONL projections and server-renders the model table. `tools/building/export_database.py` rebuilds a queryable raw-plus-model SQLite/SQL export from immutable extraction data and the current model JSON. Standard Python 3 is used by the build; no Python package is needed for exports. Re-extraction requires PyMuPDF, whose version is recorded in `source/extraction-register.json`.

## Conversation-led editing

The owner can describe desired changes in ordinary language to the AI assistant. The assistant identifies the referenced floor/element IDs, separates a design alternative from source facts, records assumptions and edits the shared model on a branch. After validation, a commit/PR and Pages deployment rebuild the views together. No manual parameter form, browser-local hidden design data, live LLM endpoint or automatic speech parser is implied.

Use `changes.jsonl` for the request, interpreted action, affected IDs, source basis, unknowns and resulting commit context. Preserve the source archive and observed facts. Critical unclear structural changes need clarification; provisional visual choices must retain their `assumed` status. A request can be copied into a new design alternative without rewriting the original extraction. The example derivation script documents this initial reviewed overlay; future canonical model edits should not be overwritten by rerunning it indiscriminately.

Run `npm run check`, inspect the new page at desktop and phone widths, then publish through the existing Pages workflow. Original and earlier project pages remain available. A clean Git commit/branch and retained source hash provide the rollback boundary.

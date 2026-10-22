# CAD Test Facility

## Current workspace milestone M7 — 22 October 2026

[M7 release](https://github.com/pailapilates09-sys/CAD_Test-Facility/releases/tag/workspace-m7-2026-10-22) preserves the studio navigation before model/BOQ linking. The linked materials table continues on `work/model-boq-after-m7`; merge and successful Pages deployment publish the changes. Rollback can restore the tagged files in a new commit without rewriting history.

## Workspace milestone M5 — 21 October 2026

[Release](https://github.com/pailapilates09-sys/CAD_Test-Facility/releases/tag/workspace-m5-2026-10-21) · [Manifest](public/milestones/workspace-m5-2026-10-21.json) · [Release notes](public/milestones/WORKSPACE-M5-2026-10-21.md).

The native Pilates extraction and the current website are frozen by `workspace-m5-2026-10-21`. Continue future changes on `work/after-workspace-m5`, created from that tag. The Pages workflow deploys `main`; edits on the work branch require a merge and successful checks/deployment before publication. A recovery can restore the tag's files in a new commit/PR and redeploy without moving existing tags or rewriting history.

The unchanged SKP and full supported JSONL/SQL/SQLite archives live in [Drive](https://drive.google.com/drive/folders/1Asat9JD6oCrr2KQI-npg1AmGc4Wml1HF) (the native original is in its preserved parent folder). GitHub versions the copied optimized studio scene, source-linked navigation overlay, inspection JSON/CSV, thumbnails, legacy Group#2 scene and frontend/extraction scripts. Actions copies `public/` into `dist/`, generates the linked views and deploys the static artifact. The viewer fetches `./studio-room.scene.json` and `./room-navigation.json` from Pages. Its second table also reads `./model-boq-links.json` and the same generated v10 material projection used by v11. Only ID relationships and notes are stored in the mapping; shared quantities, rates and calculations stay linked to the estimate source. Drive links provide archive downloads; there is no live Drive API connection or automatic sync. Future extraction changes require an explicit update, commit and deployment. Milestone M7 preserves the studio navigation baseline before model-to-BOQ linking; full recovery also requires retaining the separate Drive archives.

## Visual extraction dashboard

[Progress](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/) presents four project tabs, stage diagrams, available evidence, conditional future outputs and a stored-format explorer. It derives its counts from `progress/recovery/current.json` and the selected saved status; AEC rates and unknown totals remain separate from file-inventory counts.

The existing Pages workflow tests/builds the site, verifies the generated extraction view before upload, and reads back the public view after deployment. Actions summaries show the saved checkpoints and verification result. `progress/extraction-view.json` and `progress/extraction-proof.json` are generated public projections. This interface update does not advance a source checkpoint or run the Drive extraction.

## Current extraction checkpoint — Run 16, 21 October 2026

CP302 / Local/Main293/293 is verified and acknowledged. Fourteen metadata checkpoints added eight identities; the MSCH catalogue has 3,848 records (863 folders, 2,985 files), with 523 folders queued. Next: B303 — Scripts. Most source text/OCR and model execution remain pending; AEC has existing partial structured rate observations and its G076 terminal gate remains open.

[Current Progress](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/) · [Run16 report, derivations and formats](progress/recovery/2026-10-21-run16/cp302/report.md).

## Workspace pages

Preservation/rollback baseline: commit `bbf90547c6e11b2754415e234fc310ea42bf62c8`. This release keeps the original CAD geometry and drawing/PDF assets and changes only navigation, resource resolution and the new status projection. Reverting the workspace release restores the prior single-page site.

- `/`: workspace home with five sibling sections and one shared navigation register.
- `/construction/`: column formwork CAD, with its 3D assembly, five drawing sheets, quantities and downloads at `/cad/`. Geometry, vendor assets and the inch-only PDF are preserved.
- `/construction/models/pilates-sketchup/`: Pilates SketchUp is a primary navigation section. Its existing URL shows the main room in linked 2D/3D views and a four-column item schedule, derived from one optimized source scene. A second five-column table joins proposed model associations to all 51 v11 works and 261 material lines, using the shared quantities and rates. Five approximate area filters, 14 native camera presets and readable source-linked labels reuse the same item identities. Inspection reports, saved thumbnails, the earlier Group#2 partition and complete Drive archives remain preserved separately.
- `/construction/estimates/pilates-astra-2026-10-15/milestone.html`: Versions + milestone owns the estimate view index, including v8–v13. Duplicate shortcut cards have been removed from Construction; the estimate pages and their original URLs remain intact.
- `/progress/`: four-project extraction checkpoints, roadmap, hierarchy, gaps and historical records. The former Construction status table described website deliverables, not physical work on site, and has been removed from this page. Its generated JSON endpoint remains available for existing data links.
- `/memory-posters/`: the learning wall and reusable prompts.

The SketchUp section sits beside Construction, Versions + milestone, Progress and Memory Posters. Each estimate view selects Versions + milestone in the global navigation. Legacy root links such as `/#model` still redirect to the equivalent CAD section.

The current recovery pointer is `progress/recovery/current.json`; it selects a dated status JSON and report. The build renders the current summary directly into HTML and publishes JSON/report downloads. This section is available without JavaScript. See [the current run report](progress/recovery/2026-10-21-run16/cp302/report.md).

The historical onboarding snapshot is `src/progress-data.mjs`. It contains bounded reviewed status facts, not the full handover or private source bodies. `src/progress.mjs` renders it with native SVG and an expandable tree. It is a one-time snapshot; it has no connected-account credentials, live Drive API access or automatic refresh.

## Historical onboarding evidence and scope — 12 October 2026

The complete cross-account handover was independently read through the connected account: 756 paragraphs, 31,854 characters and a complete JSON parse. All 71 supplied Drive IDs were checked; 70 metadata reads passed and the exact AEC Oct9 terminal checkpoint returned 404. This does not prove deletion.

Representative raw readback passed for LSA JSONL (416 records and checkpoint SHA), MSCS SQLite (2,187 records, integrity_check=ok and checkpoint SHA), the 80-page Kaski PDF (page39 rendered; no text-layer/OCR acceptance), MSCH manifest/queue/CP12 (500 records, 99 pending folders), and JP Cost SRC-0005 ZIP (11 total members, 10 JSONL files plus manifest; CRC pass). Six-source JP Cost totals are from the freshly read checkpoint; only the representative archive was downloaded in this account.

Main/Local cursors were read independently from all four Local registrars and Main. AEC is Local11/Main10; the other three agree. Matched MSCS cursors do not clear the registrar narrative's older CP60/B048 pointer versus CP84/B072 machine state.

No project ingestion, source/control change, Main cursor update, permission change or schedule creation/resumption occurred. GitHub website publication is separately authorized by the user's website request. Exposed MSCH source/control edit-link IDs, raw prices, personal contacts, signed file references and raw scientific datasets are excluded from the public projection. Raw upload/update contracts are documented as available but untested under read-only scope.

Reproduction uses the original handover's stable IDs, Google Drive metadata/text/range reads, `fetch(download_raw_file=true, include_base64=false)`, authenticated file materialization, Python json/sqlite3/zipfile/hashlib and Poppler. Relevant successful argument shapes and verification limits are retained in the public capability report; no bearer URLs are retained. Snapshot metrics keep their phase-specific denominators; AEC/MSCH overall percentages remain unknown.

## What is included

- Three.js r180 viewer: orbit/zoom, assembled and timber-frame presets, separated faces, layer controls, piece inspection, assembly steps and PNG export.
- Five dimensioned SVG drawings: plywood cuts, battens and nail positions, top plan, support elevation and corner detail.
- The inch-only shop drawing PDF, material CSV and machine-readable inch specification.
- A plain-language guide to HTML, CSS, JavaScript, TypeScript, SVG and Three.js.
- Ten reviewed open-source drawing projects, linked to their primary GitHub repositories with license labels and intended uses.
- Drive links to compiled drawings and release packages in the connected pailapilates09 account.

## Build and preview

Node 20 or newer is sufficient. No npm dependencies need installing.

```sh
npm run check
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve the multi-file site over HTTP; loading its modules directly with file:// is unsupported by browsers.

For a single-file preview that does open directly in a browser, run `npm run export` and open `releases/Column_Formwork_Interactive_Preview.html`. Three.js, the model, vector drawings, PDF and cut-list downloads are embedded. Drive links still require Internet access.

## Publish

1. The GitHub connection must have write access to pailapilates09-sys/CAD_Test-Facility and permission to write workflows. The initially connected account was pailapilates10-cmd and the provider reported push=false.
2. In repository Settings -> Pages, choose **GitHub Actions** as the source. Ensure Actions is allowed under Settings -> Actions -> General.
3. Push these files to main. `.github/workflows/pages.yml` verifies geometry, builds the static files, uploads the Pages artifact and deploys it. The Actions deployment output provides the verified live URL.

The expected project Pages address is https://pailapilates09-sys.github.io/CAD_Test-Facility/ . This README does not claim it is live until a deployment succeeds and the URL is checked.

## Edit products

Edit `src/spec.mjs` for geometry and quantities. Both the 3D model and SVG sheets consume that specification. `src/drawings.mjs` generates vectors; `src/model.mjs` builds the assembly; `src/app.mjs` wires the user interface. `public/style.css` sets the responsive visual design.

Geometry uses inch coordinates throughout. The original supplied plywood thickness is converted once to 0.4724409449 in; it is **not** assumed to be exactly 0.5 in. A panels are 16 in wide; B panels are 16 in plus two measured ply thicknesses (approximately 16.945 in).

Type declarations in `src/spec.d.ts` document the data contract. Current runtime code is JavaScript modules; no TypeScript transpilation is required for this release.

## Drive project folders

- [CAD Test Facility](https://drive.google.com/drive/folders/1BVsrqqG5I_1XA_9YaZOnBHVfoaext6lU)
- [Column Formwork](https://drive.google.com/drive/folders/1F_Fb3o_ODn8-RUTY3-s8CXx_bwianVt3)
- [Compiled Drawings](https://drive.google.com/drive/folders/1NLG6wdnuT88crenF2SxSYo7sQ5CmWuZU)
- [Website Releases](https://drive.google.com/drive/folders/1_kngq75CEOJGsmkb9XxfP-CEF3Dxagir)

These are links to project files. Drive access uses the user's existing sharing settings; embedding a link does not make a private file public.

## Engineering scope

This is a geometry, cutting and assembly guide. The timber section is assumed actual 2 in x 3 in. The proposed support spacings, timber/ply capacity, collar corner fasteners, brace end joints and substrate anchors are not designed or approved here. A site engineer must verify them against the actual materials, concrete pressure and pour procedure before use.

204 nails count only the proposed plywood-retaining nails, not structural connection fixings. The 28-stock-timber cutting example is geometric: joint allowances, final anchorage material and procurement spare are additional once detailed.

## Open-source notices

Three.js r180 and OrbitControls are bundled locally under the MIT license. See `vendor/THREE-LICENSE.txt`. The ten-project review is in `src/spec.mjs` and the downloadable JSON. Other reviewed libraries are not installed in this release.

## Live phase 01 - 2026-10-12

MSCH B013 advanced the physical catalogue from 500 to 501 rows (150 folders, 351 files, 99 pending folders). The existing manifest, FIFO queue, project-state and read-first IDs were updated in place after a verified PRE rollback archive. All four outputs and finalized CP13 passed exact provider byte/hash readback. Source bodies, original files and schedules were not changed. Local registration and Main ACK remain a separate next phase; no global closeout is claimed. The progress page shows this live result above its explicitly historical onboarding snapshot.

Phase caps: one verified checkpoint per package; maximum 20 minutes, stop new work at 14 weighted work units or approximately 14 minutes, reserve six closeout units. New batches and the scheduler remain off after the stopping point.


## Debt clearance and source continuation — 16 October 2026

A new 61.33-minute source checkpoint window closed 19 checkpoints and added 309 catalogue records: LSA113 and MSCH196. All four Local/Main acknowledgements now agree: MSCS6/6, LSA31/31, AEC11/11 and MSCH65/65. Initial 73 backlog events and 19 new source/audit events were reconciled without replaying source work.

LSA's full140-folder live tree matches1242 catalogue occurrences. Its historical1244-row baseline retains a2-file /9,304-byte discrepancy. MSCH has 1,310 entries and 137 pending FIFO folders; its full denominator is unknown. MSCS hashing policy and the original AEC terminal remain source gates. Source-content extraction and scheduler changes did not occur. The current report and timeline preserve all earlier session history.


## Pilates estimate milestone M1

[Version/milestone register](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/milestone.html) · [latest full v7](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/v7/) · [release notes](construction/estimates/pilates-astra-2026-10-15/MILESTONE-M1.md).

All original/source and conversion views remain available. V5, v5.1, v6 and v7 share permanent NPR-assumed original markers, every-item public ranges, a range-position overview and original-cost treemap. V6/v7 retain images; v7 retains component evidence. Remaining source/supplier/SKP and browser-verification gaps are documented explicitly.

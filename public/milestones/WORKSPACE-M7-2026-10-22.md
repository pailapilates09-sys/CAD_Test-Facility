# Workspace M7 — Studio navigation baseline

This milestone freezes the studio navigation upgrade before a new model-to-BOQ materials table is added. Its source is main commit `c33505e7a87276e08e4dccb3de277f02a6d45ad5`.

The studio page keeps its linked 2D plan, 3D room and four-column SketchUp item table. Five approximate navigation areas filter individual placements consistently. Fourteen original SketchUp viewpoints restore source camera positions, targets and field of view in metres. Original and nested component names remain searchable. All 106 item types retain their source IDs: 39 readable source labels, eight labels supported by nested definitions, 39 suggested names and 20 unresolved elements. The native source, optimized display geometry and complete supported archives remain preserved.

The existing item table is derived from the extracted SketchUp placements and material appearance labels. Its counts are model occurrences and its dimensions are optimized display extents; these are not procurement quantities or an approved takeoff. V11 uses the existing shared estimate register and the same contractor-material projection as v10. M7 includes no model-to-BOQ relationship claims.

The baseline passes 144 automated tests and builds all 123 pages, with 5,312 local links/assets and 41 module imports verified. Three milestone checks bring the release record to 147 tests. The existing deployment-gated release workflow verifies the preservation manifest before creating `workspace-m7-2026-10-22`. Existing milestone tags remain fixed.

Desktop and 390-pixel iframe interactions were reviewed in light/dark themes. Browser area filtering, source-name search, isolation and preset resets were exercised. Rendered 3D visual QA remains unverified because the managed review browser disables WebGL. Three.js picking/filtering and source-camera conversions pass automated checks. Desktop SketchUp/official SDK comparison and physical phone review remain pending.

Estimate source revision `1240677241b90579`, all 51 works, 261 material lines, six holds and two allowances are retained. Original quote currency and accepted labour/material splits remain unconfirmed. Supplier prices and planning material quantities require confirmation. The separate extraction programme's current saved boundary is CP316 / MSCH Local/Main 307/307; this release does not resume extraction.

Pages hosts committed copies of the optimized scene, navigation data and frontend, built by GitHub Actions. The original SKP and full supported archives remain separately preserved in Drive. There is no automatic Drive synchronization or live Drive fetch.

Continue the materials-table work on `work/model-boq-after-m7`. For rollback, restore the tagged files in a new commit/PR and deploy. Full archive recovery also requires retaining the separately preserved Drive files.

[Studio room](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/models/pilates-sketchup/) · [V11 materials](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/v11/)

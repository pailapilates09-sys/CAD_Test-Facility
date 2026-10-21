# Workspace M5 — Native SketchUp extraction + rollback

The Pilates workspace now displays extracted source views and a selected 2D/3D model partition. This milestone freezes the current website and records where its complete supported geometry archives are preserved.

## Included

- One uploaded `PILATES.skp` document (295,205,462 bytes), SHA-256 `ad5c8a00a563d4336a5ea4bdd72907aba7e427f0c842e21196386d944af4b0ec`. This hash identifies the SKP unpacked from the user's ZIP; older Drive source copies were checked by filename and byte size, not by downloading and hashing them again.
- An incremental VFF reader using pinned OpenSKP 1.3.0 helpers decoded all 8,172,940 indexed supported records: 1,641,952 vertices, 4,070,637 edges, 2,458,434 faces and 1,917 local instance records. The hierarchy contains 1,114 definitions and 4,786 placed occurrences.
- Fourteen original saved-camera thumbnails, inspection JSON/CSV, materials, hierarchy, archive hashes and reproducible extraction/restoration scripts. The browser preview explicitly selects Group#2: five definitions, 402 faces and 1,414 triangles. It does not render the full studio model.
- Forty-four coincident-placement candidate pairs and 425 unplaced definitions are recorded for review. Repeated components are not automatically duplicate buildings. Nothing was removed from the original model.
- The five sibling sections, all 123 website pages, 14 estimate views through v13, 51 quoted works, six holds and two allowances remain available. Estimate source revision `1240677241b90579` is unchanged. The saved four-project progress boundary remains CP302 / MSCH Local/Main293/293; this release does not resume that extraction programme.

## Storage and hosting

The unchanged native SKP remains in the existing preserved parent Drive folder. The [extraction folder](https://drive.google.com/drive/folders/1Asat9JD6oCrr2KQI-npg1AmGc4Wml1HF) contains 11 multipart files for the compressed JSONL, SQL and SQLite derivatives, plus an inspection/assets ZIP and archive register. Unzip the inspection bundle beside every part and run `python restore-archives.py` to verify/reassemble them, then unpack `.gz`. The restoration script preserves inputs and rejects mismatched parts.

GitHub contains actual copied inspection data, thumbnails, selected preview geometry and the website/scripts. Actions tests/builds those repository files into `dist/` and deploys them to GitHub Pages. The viewer fetches `./architectural-base.scene.json` from Pages. It does not fetch the geometry from Drive. Drive links open archive downloads; there is no live Drive API connection or automatic synchronization. New extraction data must be explicitly copied, committed and deployed.

## Verification and version control

The verified extraction source commit is `b11ba4bd594b7ff3b9b54a56c01d0d759f028b7f`. It passed 127 automated tests, built 123 pages and resolved 5,343 local links/assets plus 37 module imports. All 36 checked live files matched that source build. Deployment run: 39602900131. Supported geometry references resolve, selected triangulations match polygon areas, and SQLite `quick_check` passed. Local archive/part hashes were verified; Drive IDs, parent folders and byte sizes were read back. The provider archive bytes were not all downloaded again.

Three milestone checks bring this release to 130 automated tests. The existing deployment-gated release workflow verifies preservation hashes before creating `workspace-m5-2026-10-21` at the exact milestone-record commit. It publishes these notes and attaches the JSON manifest. Existing tags and historical milestone records remain fixed.

Continue future work on `work/after-workspace-m5`, starting from this release. The public website deploys `main`; branch edits require a merge and successful deployment. For rollback, restore the tagged files in a new commit/PR and redeploy. The tag protects the repository snapshot and the archive register/hashes. A complete data recovery also requires retaining the separately stored Drive archives.

## Remaining review

Desktop comparison with SketchUp/its official SDK, full-model browser rendering, browser animation/layout review and real-phone visual QA remain unverified. One non-unit homogeneous transform and extreme nested component envelopes require Desktop review; global bounds are not studio measurements or a quantity take-off. Proprietary features remain preserved in the original SKP, without a claim of full decoder fidelity.

Original quote currency and accepted labour/material splits remain unconfirmed. Six held works retain original values; two allowances remain unsplit. Planning material quantities and supplier prices still need project/supplier confirmation. No estimate quantities, rates or amounts were replaced by model-derived values.

[Model workspace](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/models/pilates-sketchup/) · [Versions + milestone](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/milestone.html)

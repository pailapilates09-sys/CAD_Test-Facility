# Basanti discipline interface QA · 30 October 2026

Basanti now has separate **Architecture**, **Structure**, **MEP** and **Interior & Furniture** page tabs. The tabs use normal links, retain native browser navigation and identify the active page. Earlier versions, original source files and the existing 15-product design-reference footer remain available.

## Interface changes

- Architecture opens on the ground floor with architecture elements. Floor, element type and search stay together. Incompatible element types are excluded from the current package. Other source packages and construction steps are expandable. Source-sheet zoom controls wrap within their panel.
- Structural stage, floor, type, work-package and member filters stay visible on phones. Drawing basis, annotations, bar filters, appearance and historical versions are grouped separately. Detailed design-basis notes remain beside the source review.
- MEP filters sit directly above the linked drawings. Room/source context follows the working views. Scenario inputs are grouped into water, roof drainage and electrical fieldsets. Resetting filters is separate from restoring the calculation baseline.
- Interior & Furniture uses the seven original room records, written dimensions, calculated rectangle areas and original floor sheets. It explicitly records the absent furniture schedule; no furniture quantities or placements were invented.

## Browser verification

All four current pages were checked at **320, 375, 430, 768 and 1280 px**. The four-page matrix and source-sheet mode showed no horizontal page overflow or clipped visible text. Drawing canvases and large tables retain their own deliberate scrolling.

Verified architecture filter/search/reset, pointer and keyboard selection, linked detail/source; structural presets/member/annotations/material form; MEP filter/search/reset, route/profile and scenario apply/reset; interior room/search/reset/empty state and the first-floor link into architecture; light/dark switching.

The browser verified interactive vector 3D. Hardware WebGL and physical touch-device behavior were not claimed as tested.

## Data preservation

The comparison baseline is commit `e4a6f78103812d757e06967767446522a08d331a`. All **353 original Basanti published files** remain. All original section IDs and table counts are retained across 11 existing Basanti pages.

Of those files, **292 are byte-identical**. All **244 data/source/drawing files** retain their values and geometry: 229 are byte-identical; changed generated JSON differs only in its root cache revision. Other generated JavaScript changes outside the two edited UI controllers are cache-query revisions only. No quantities, rates, engineering methods, source room dimensions or historical model data were edited.

Original PDF SHA-256: `a951721f046d4321542ae0c6b386c9a54b5575bc4c0676544daaff98a9e77611`.

## Automated checks

`npm run check`: **352 tests passed**, 0 failed. Build checks verified **142 HTML pages, 10,230 local links/assets and 232 module imports**. The four additional tests cover validated architecture defaults/deep links, room filtering without mutation, native discipline navigation and preservation of original form controls/options while regrouping.

[Machine-readable QA record](./discipline-qa.json) · [Architecture](./) · [Structure](../basanti-workbench/v6/) · [MEP](../basanti-workbench/v7/) · [Interior & Furniture](./interior.html)

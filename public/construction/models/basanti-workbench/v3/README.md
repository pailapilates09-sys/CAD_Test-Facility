# 14_Basanti Poudel Baral — detailed drawings v3

V3 derives from the v2 building/work-package functions and the single preserved `../../basanti-residence/data/project.json`. It adds review drawings and scenario calculations without duplicating the source model. V1 and v2 remain available. The project hub and `../versions.json` identify each version's purpose.

## Contents

- Linked 2D, 3D, measurement tables and the inherited 112-work Gantt programme.
- Cut-edge excavation gaps, member dimensions, isolated column cages, separate beam support/midspan cross-sections and selectable displayed bar paths.
- Annotation layers, member/pair/bar-role filters, label size/colour/emphasis and full-width or paired desktop panels.
- Per-work concrete-material inputs; the source PCC 1:3:6 example is explicitly assumption-based. RCC mixture inputs remain blank until entered.
- Ten primary project references with commit pins and licenses in `references.json`, with source observations in `source-evidence.json`.

`detail-model.js` contains review-only geometry patches and calculations. `drawings.js` separates physical dimensions from projected label positions. `v3.js` coordinates controls and shared selections. `scripts/building-v3.mjs` emits reproducible review JSON/CSV and reference sections during the normal Pages build. Session inputs are browser-memory scenarios; exporting does not update GitHub or the source PDF.

## Source corrections and boundaries

Sheet 10 identifies the first/second-floor A1–A2 edge as MB 250×425. V3 applies that mapping through two explicit patches; it does not locate the internal staircase beam at an invented offset. The roof cage remains withheld where the mapping is unresolved. A1–B1 plinth TB 225×300 remains visible/selectable but receives no mismatched 300×350 reinforcement cage.

Source spacing notes are retained: column H/6, beam support/mid link spacings, generic sheet-20 2d, and extra top-bar extents where assigned. Unknown clear H, effective depth and numerical member-zone boundaries stay unknown. Entered H/d values illustrate formulas only; they do not redetail placed steel. Displayed centreline paths are not final cutting lengths or procurement counts.

Excavation scenarios do not define soil stability, shoring/slopes, safe passage, heave or surveyed stockpile locations. No approved RCC mix, concrete grade or final bar-bending schedule is invented. The base IFC export still represents the unchanged building-model baseline, not the v3-only patches.

See [QA_REVIEW_2026-10-27.md](QA_REVIEW_2026-10-27.md) for checks and remaining limits.

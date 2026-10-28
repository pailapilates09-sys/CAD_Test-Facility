# 14_Basanti Poudel Baral — v6

Connection coordination derived from v5. The canonical building JSON, original21-sheet PDF, historical archives and earlier version algorithms are unchanged. Build-time generation in `scripts/building-v6.mjs` owns the page/controller/viewer shell and exports; v6 source modules own new geometry and decisions. Do not hand-edit generated `dist` files.

## What is applied

-22supported beam cages use separate U-links and closing crossties with two 135° ends. The opening is on the longer section side. Source-diameter8mm pieces keep80mm straight tails and48mm inside mandrel; their planes are14mm apart, giving6mm clear separation. The6mm gap is a coordination choice, not a code minimum.
-Each piece has exact tangent-plus-circular-arc length and a dimensioned sketch. The 3D paths, assembly and quantities share that geometry. Sampled display chords do not determine exact lengths.
-20column studies divide source bars into two groups of equal steel area at 3H/8 and 5H/8. This conservative location choice is distinct from claiming the code's lap-location rules directly govern mechanical splices.
-Inspected Ancon TT sleeves are reference envelopes, **rejected for supply here**. Their documented static-tension/BS4449 scope does not establish NS191 steel/seismic cyclic applicability, and their bodies clash with the existing trial hoops. No thread depth, installed bar-end gap or complete longitudinal cut is invented.
-The12/16 transition uses72mm only as a reference envelope: May2026international and 2019approval tables agree; September 2026 UK table prints22mm. The discrepancy is recorded.
-V5 nominal closed-column hoop projections remain visible for comparison but are excluded from v6 numeric cutting/stock quantities. The beam U-link exception is not applied to columns.
-Interactive vector3D is default; optional WebGL remains available. Both use the shared Three.js scene/camera and OrbitControls. Actual device observations are distinct from physical-GPU certification.

## Release boundary

This is a dimensioned coordination product. The20-source register supports individual choices; it cannot establish the missing project forces, actual concrete/steel test results, bearing design, coordinated joint/footing cages or professional structural acceptance. No construction/fabrication release, steel order, installation torque or full-building splice schedule is issued. Baseline IFC is unchanged and contains no v6-only geometry.

Run `npm run check` with the pinned IfcOpenShell Python dependency available. Read `QA_REVIEW_2026-10-28.md` for observed checks.

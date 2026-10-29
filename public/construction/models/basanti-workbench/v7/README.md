# 14_Basanti Poudel Baral · v7 MEP

V7 adds a preliminary service-coordination layer to the residence in Pokhara-14, Kaski. V6 remains the preserved structural connection workspace; its unresolved reinforcement holds are not cleared by MEP work.

## Ownership

- `mep-model.js`: proposed fixture/service coordinates, connection topology, calculation functions, equipment assumptions, task dependencies and review items.
- `mep-drawings.js`: 2D, vector 3D, route profiles, connection sequences, single-line and Gantt projections.
- `v7.js`: linked selection, filters, scenario inputs and browser downloads.
- `v7.css`: `.mep-page` scoped styles; previous styles are not changed.
- `index.html`: page shell and plain-language guide; build-time markers are not final HTML.
- `references.json`: source authority, clause locator, applied scope and access limits.
- `scripts/building-v7.mjs`: creates the page's baseline SVG/CSV/JSON outputs. Never edit `dist/`.

The building's `basanti-residence/data/project.json` is read only. V7 does not copy another editable structural model, modify original PDF parts, rewrite earlier version algorithms or edit the Pilates estimates. A branch inherits all unchanged code through Git history.

## Engineering basis

Source sheets 2–5 locate the kitchen, stacked T/B rooms, store and roof levels. Fixture symbols were visually checked on the original PDF; source positions and new connection offsets are distinguished. All service routes remain proposed calibrated geometry.

The six-person example uses NBC208 domestic demand, a 1000 L ground break-tank candidate, full simultaneous fixture envelope, medium GI water-pipe candidates, Hazen–Williams C=120, 30% equivalent-length fitting allowance, and a stated 200 kPa terminal target. The pressure clause's inconsistent printed units are disclosed. No located tank or off-sheet connecting length is invented.

Roof sizing uses disjoint conservative plan-envelope areas plus a stated parapet allowance, NBC208 Table C3 and an interim 200 mm/h scenario. It does not invent a Pokhara rainfall return period. Scupper head, ponding, inlet capacities and legal outfalls remain unverified.

Drain paths show **invert traces**, not issued fitting axes. Supply and wiring show routing axes. SVG line widths are symbolic. Profile distances are exact polyline distances, not socket-adjusted cutting lengths. Final product bore/OD and structural sleeves still need coordination.

The electrical study includes all stated optional loads, no diversity reduction, phase assignments, conditional ampacity, feeder plus route/spur voltage drop and numbered circuit points. The initial 40 A case was rejected for negligible expansion headroom. The 63 A / 35 mm² Cu feeder candidate uses the conservative 83 A Figure G20 reference and a stated derating factor; NEA service, fault level, earthing, installation method and actual nameplates are absent. Extra control/interlink cores and protection coordination require final product schedules. The selected conduit arithmetic is a screening study rather than a procurement specification.

NBC207 explicitly addresses public buildings; v7 identifies its use as Nepal good-practice guidance alongside Electricity Rules and utility requirements. Foreign ventilation/trap details are marked supplementary. The local Pokhara standard's listing was found but its body was unavailable, so no local compliance is claimed.

## Review and publication

Work branch: `work/14-basanti-poudel-baral-v7-mep-2026-10-29`.

Review `change-scope.json`, then PR **Files changed**. Expected shared changes are one build entry, the version manifest and the project hub's version entry. Shared CSS, earlier algorithms, price data and source facts should not drift.

Run `node --test test/building-v7.test.mjs`, then `npm run check`. The existing Actions workflow checks pull requests and deploys Pages after main changes. A whole-site build does not mean every page's source was edited. Use the exact commit as the review/rollback boundary and a Git revert for a coherent rollback. A user-facing version URL and a Git branch serve different purposes.

See `QA_REVIEW_2026-10-29.md` for observed tests and remaining limits. This page is a coordination draft; a qualified MEP designer must complete site/product checks and release the installation drawings before construction or energisation.

# V7 status

## Current visualization revision — 17 October 2026

The earlier lower amount/ranking/evidence graphs have been replaced with the revised v5.1 every-item ranges, now with permanent original estimate markers. No marker button or checkbox is needed in this version, including the retained top comparison. The original source currency is still unstated: overlays visibly assume NPR and matching measurement units. Incompatible units and six holds do not receive fabricated overlays.

Two additional views use the existing source-backed data:

- **Range-position overview:** 31 closed-range source comparisons on a shared scale, where source low = 0% and high = 100%. Each source stays separate. The displayed window is −50% to 200%; off-window observations use arrows and full numeric position labels. This is a within-range coordinate, not a market percentile or proof of fair pricing. Single prices/open bounds remain in individual plots.
- **Original cost treemap:** nested area/item rectangles are proportional to the original detailed line amounts. Fifty positive amounts occupy rectangles; the one zero-amount item remains listed without fabricated area. Six held amounts are hatched and included once. No public market total, VAT or summary allowances are added to the map. Hover, keyboard focus, item selection and item-detail links expose exact values and the existing full scope/image dialog.

All views follow the original area, description-search, amount-sort and evidence filters. The 51 item images, six area tables, original totals, original data and later component research remain intact. V5.1 retains its optional marker controls; only v6/v7 now use permanent markers.

Design sources, read 17 October 2026:

- Datawrapper dot/range examples: https://www.datawrapper.de/academy/examples-of-datawrapper-dot-charts
- Tableau treemap geometry: https://help.tableau.com/current/pro/desktop/en-us/buildexamples_treemap.htm
- Tableau chart selection: https://www.tableau.com/en-gb/learn/get-started/desktop-viz-design

These are visualization-method references. Public price values remain the preserved 16 October snapshot, not a new price refresh. Geographic maps would require location/geometry data that this item estimate does not contain; this treemap is a cost-composition view.

Validation: 48 automated tests and production build pass. Tests verify exact treemap cost proportions and non-overlap, original totals and holds, empty/zero filters, all source rows, off-window labels, permanent-marker initialization without checkbox access, pointer/focus/select inspection, original table/image preservation and v7 component calculations. Browser layout QA is unavailable in this runtime; no rendered-browser verification is claimed. Live deployment/readback is verified separately in the delivery.

---

## Original delivery record (historical)

# V7 — labour and material evidence

Prepared 17 October 2026 on v6. Earlier pages, 51 item images, SI tables, original values, comparison controls and bottom graphs remain available.

Live page: https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/v7/

## Delivered

- Six area tables cover all 51 exact item IDs, with separate labour and material/purchased-supply references and expandable source/scope notes.
- Labour references cover 45 items; material/supply references cover 40; both kinds cover 40. Six items stay on hold with no new component assignments. Five other items lack a verified material-only reference.
- Only 14 items have references for both components in the same measurement unit as the estimate. Even those references do not establish matching scope, a complete cost or an accepted split of the original rate.
- Selected-item component charts group NPR prices by their actual measurement unit on separate zero-based axes. Worker-days, litres, sheets and project surface areas remain distinct. Prices with unstated currency are not plotted as NPR.
- A temporary calculator accepts three explicitly entered NPR rates: labour, material and other costs. Blank means unknown. It never saves, replaces original values or derives a supplier's allocation. Held items and missing-unit items are locked.
- Combined supply-and-fix packages remain unsplit. No arbitrary percentages, range midpoints or subtraction residuals are called material cost.
- JSON and item JSONL downloads preserve source links, qualifications, original values and unknown component fields.

## Debt reviewed

Resolved: the official Kathmandu FY 2083/84 district schedule is now downloaded and preserved. Selected scanned labour and board rows were visually reviewed; full transcription of all 277 pages is not claimed. The 15,344,169-byte PDF has SHA-256 `697cb38b48e9f22384239e145411e4762ebffb1e7f908d3910f5fc454c40fa16`.

Archive folder: https://drive.google.com/drive/folders/1EkyoN-MHfJy_F8OjnQSFqkLJysvoHrzx

Official preserved PDF: https://drive.google.com/file/d/1owVlzGOBrwKxZrxnEsqWdrPfXyh0KgXk/view?usp=drivesdk

Remaining, without invented resolutions:

- Original estimate currency is unstated. All 51 original labour/material allocations remain unknown; accepted splits are zero. Public NPR prices do not establish the original currency.
- Six user holds remain. Original held amounts remain included once.
- Flooring 5,50,000.00 and Electrical 2,80,057.43 remain original summary allowances without quantities or labour/material breakdowns.
- Exact product grades, material take-offs, productivity, installation inclusions, transport, equipment, overhead/profit, VAT and current stock require matching quotations. Prior supply snapshots retain their historical/stock qualifications.
- The 295,205,462-byte SketchUp file still fails with HTTP 413 against the connector's 268,435,456-byte limit, including the streamed raw-file retry. No model count, geometry extraction or duplicate conclusion is claimed.

The original total remains 66,45,762.90, including printed VAT; no revised market total is produced.

## Validation

`npm run check`: all 40 tests passed and the static site built. Tests cover source preservation, reference classification, SI normalization, exact draft arithmetic, all image detail buttons, filtering, holds and unchanged v6 tables/graphs. Local link and module-reference checks cover the built v7 page and shared assets. Browser visual QA was unavailable in this environment; these checks do not claim a rendered-browser inspection.

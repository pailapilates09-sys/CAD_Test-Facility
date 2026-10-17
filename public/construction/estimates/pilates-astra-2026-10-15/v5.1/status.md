# V5.1 — every-item range comparison revision

Updated 17 October 2026 following the owner's screenshots. No v8 was predefined; this revises the existing v5.1 page.

Live page: https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/v5.1/

The three lower amount/ranking/evidence graphs were removed from this page. Their place, after the final detailed table, now contains an area-by-area comparison for all 51 exact work items.

- Each public reference has its own range/point plot, exact published values, actual measurement unit, source link and expandable scope/date/availability details. No sources are combined into an invented market range.
- Show or hide the original diamond per item, or enable all compatible items together. The global control stays synchronized with the original top comparison's NPR checkbox. Per-item overrides persist through filters; changing the global assumption resets them.
- The original currency remains unspecified. Showing a diamond explicitly assumes NPR and does not establish scope equivalence. Different units or currencies cannot overlay. All numeric distance statements belong to this unconfirmed scenario.
- For closed ranges, the page shows distance from both published bounds and the original's position within the span. Comparisons use the displayed SI rates rounded to 2 decimals so the numeric labels and distances agree. Position = (original − low) ÷ (high − low) × 100; 0% means the low and 100% the high. This is not a market percentile, price-quality judgment or projected saving. Values outside the range show their distance below the minimum or above the maximum.
- Single listed prices remain points. Starting/open prices keep an unknown maximum and never get a closed-range percentage.
- All plots use independent, labeled zero-based axes. Do not compare horizontal lengths between different plots; use the printed rates and positions. Readable chart labels have horizontal scrolling on narrow screens.
- Six held items retain their original values without newly assigned public prices. Nine other items have different-unit references only; 36 have at least one same-unit reference. Matching units do not prove matching scope. Two summary-only allowances remain unsplit.
- Area, full-description search, amount sort and evidence filters operate on the tables and the new comparison cards together. All 51 cards appear without a top-N limit when no filters apply.
- Original SI tables, hierarchy, totals, source data, top comparison and downloads are preserved. Public rates reuse the 16 October snapshot; no new price research is claimed. V6/v7 and their shared legacy graphs remain unchanged.

Design reference: Datawrapper's documented range plots and benchmark markers support this form of value-versus-interval comparison: https://www.datawrapper.de/academy/examples-of-datawrapper-dot-charts . This implementation uses the website's existing local HTML/CSS/SVG/JavaScript approach. It introduces no external chart service. There is no geographic dataset requiring a map.

Validation: all 44 automated tests pass and the production site builds. Tests cover every item and reference, unique chart IDs, exact bound distances, range-position arithmetic, point/open-bound cases, currency/unit gating, per-item/global controls, filtering, held values and unchanged table markup. Existing v6/v7 preservation checks also pass. Browser layout QA is unavailable in this runtime; no rendered-browser verification is claimed.

Remaining input/external debt is unchanged: source currency and exact-scope confirmation, supplier component breakdowns, summary allowance details and the SketchUp download limit. V7 records the subsequently recovered official district PDF separately.

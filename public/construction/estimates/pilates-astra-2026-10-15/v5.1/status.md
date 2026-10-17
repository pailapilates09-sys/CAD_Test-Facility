# V5.1 status — 17 October 2026

V5.1 preserves the current V5 tables and appends three derived graphs immediately after the last detailed area table.

- **Original amount by area:** horizontal bars sum the matching table rows by area. Amounts and shares are labeled directly.
- **Largest original item amounts:** horizontal bars rank the top 10 matching items, with an option to show all matching items. Held items retain their original amounts and are labeled and colored separately.
- **Rate evidence by area:** stacked item counts distinguish same-unit references, different-unit references only, and items on hold. Each item is counted exactly once. Matching units do not establish matching scope.
- Graphs follow the same area, search and evidence filters as the detailed tables. Ranking always uses descending printed line amounts, independent of the table sort order.
- The full detailed population is 51 items in six areas, totaling **50,51,148.68** before VAT and the two summary-only allowances. Evidence counts are 36 same-unit, 9 different-unit only, and 6 held. The six held original amounts total **8,81,653.50**, included once.
- All amount axes start at zero. Source currency remains unspecified; these amount bars do not claim NPR. No mixed-unit rates are added together.
- V5's item-level public rate chart, exact reference table, six-held-item table, area tables, source details, hierarchy, SI conversions and downloads remain available. Public references reuse the snapshot retrieved 16 October 2026.
- Original source data, totals, earlier versions, CAD pages and project-progress records remain preserved. No replacement rates, revised market total, savings or new exact-scope quote are assigned.
- Currency/scope confirmation and SKP extraction/duplicate inspection remain deferred. V6, planned to add an actual image to each work item, has not started.

Implementation: `graphs.js` derives charts in the browser directly from the current table population and the existing V5 comparison register. No external chart service or tracking is added. Narrow screens can scroll each labeled SVG horizontally; the graph containers are keyboard focusable. SVG titles and descriptions expose the plotted values.

Validation: all 32 automated tests and the production build pass. Tests reconcile amounts and categorical counts, exercise held-only and empty filters, verify graph placement after the detailed tables, and compare V5 and V5.1 rendered table markup exactly under the same filters. Browser visual QA is unavailable in this runtime. Deployment and live asset verification are reported separately in the delivery message.

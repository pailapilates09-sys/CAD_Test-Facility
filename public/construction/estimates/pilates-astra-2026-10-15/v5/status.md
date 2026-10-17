# V5 milestone status

## Current milestone M1 — 17 October 2026

All comparison versions (v5, v5.1, v6, v7) now share permanent original-rate markers where units match, every-item range comparisons, the range-position overview and original-cost treemap. NPR is visibly assumed because the original source currency is unspecified. Original tables/values, six holds and source data remain intact. V6/v7 retain the images; v7 retains component research/calculation tools. No replacement rate or accepted original component allocation is created.

All source and conversion versions remain available with synchronized navigation. See [version/milestone register](../milestone.html), [version JSON](../versions.json) and [milestone JSON](../milestone.json) for current coverage, release links and remaining debt. Public prices remain the preserved 16 October snapshot; the recovered official PDF is used separately in v7.

The source currency, matching supplier scope/component splits, six user holds, two allowance breakdowns, the SKP download size limit and unavailable browser layout QA remain explicit. These are not marked resolved by the milestone.

---

## Earlier delivery record (historical)

# V5 status — 17 October 2026

V5 implements the user's instruction to proceed while six unpriced items are on hold and existing currency/scope and model-input issues remain deferred.

- Original PDF values, SI values, total, VAT and previous versions remain intact.
- All 51 detailed items remain available. 45 have public numeric references; 36 have at least one reference with a compatible measurement unit. Measurement compatibility does not establish matching labour, materials, design, VAT or availability.
- Six held items retain original rates and amounts: reception-005, reception-016, coffee-lounge-004, coffee-lounge-010, locker-space-010, washroom-002. Combined original amount: 881653.50. This remains included in the original total, not added again.
- Interactive item charts retain published ranges, single listed prices, starting prices and open upper bounds. Source links, dates, exclusions and original item details are inspectable.
- The source estimate currency is unspecified. Public axes are NPR. By default, the original rate is shown separately. A reader may explicitly enable an unconfirmed NPR scenario; an estimate marker is shown only for a matching measurement unit.
- No market total, arbitrary midpoint, saving, percentage difference or replacement rate is calculated. None of the held items is represented as a newly sourced market price.
- V4 research is reused as a snapshot dated 2026-10-16; no fresh-rate claim is made for v5.
- SKP geometry / duplicate extraction remains blocked by the existing 256 MiB connector limit. No new model inspection or plan claim is made.
- V6 images are not started.

Source inputs: original estimate JSON, v3 SI JSON, v4 market-rates.json. V5 exports: comparison.json and comparison.jsonl. Regeneration: `node construction/estimates/pilates-astra-2026-10-15/research/build-comparison.mjs`.

Validation: 29 automated tests pass. Functional checks passed for item selection, the six holds, default currency separation, the explicit NPR overlay, mismatched-unit guards and empty filters. All built page links resolve. The GitHub build runs the same comparison and existing-regression tests. Browser visual QA remains unavailable in this runtime. Deployment and live asset checks are reported in the chat closeout.

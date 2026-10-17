# Paila Pilates estimates — milestone M1

This milestone synchronizes the maintained estimate views and freezes their source-backed data and current limitations. It covers the Pilates estimate; CAD formwork and project-progress work remain separate.

## Delivered

- V5, v5.1, v6 and v7 all show permanent original estimate markers wherever measurement units match, visibly assuming NPR because the original currency is unspecified.
- All four comparison versions include every-item public ranges, a shared-scale range-position overview and an original-cost treemap. Source references remain separate; open bounds, single prices and incompatible units retain their actual meaning.
- Original tables, 51 exact item IDs, SI conversions, original totals and six held values are preserved. Held amounts remain included once.
- V6/v7 retain all 51 sourced image mappings and 29 local image assets. V7 retains separate labour/material evidence and its temporary calculator. Public component references do not create an accepted allocation of the original quote.
- Original, v2, v3 and v4 preserve their source/conversion/research purposes, with complete navigation to all maintained versions and the milestone register. Navigation, hub descriptions and current status records are reconciled.
- JSON version/milestone registers, data-preservation hashes and source qualifications accompany the website. Existing raw data and previous Git history remain available.

Latest full view: https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/v7/

Versions and remaining gaps: https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/milestone.html

## Evidence and limits

There are 51 detailed items, six detailed areas and two summary allowances. Public reference units match 36 items; nine have different-unit references only and six are held. Both labour and material/supply references exist for 40 items; accepted original component splits remain zero. All values stay at their original amounts; the total remains 66,45,762.90 including printed VAT, currency unspecified.

The official Kathmandu district PDF access issue is resolved and selected scanned rows are preserved/reviewed in v7. Remaining debt is explicit: source currency; matching supplier scope and labour/material breakdowns; the six user holds; flooring/electrical allowance quantities and breakdowns; the 295,205,462-byte SKP exceeding the 256 MiB connector limit; and unavailable browser layout QA. No model/duplicate conclusion, invented plan, replacement price or market saving is claimed.

Validation includes regression tests for all maintained comparison versions, exact table/source preservation, image hashes, permanent-marker behavior, range arithmetic, treemap proportions/non-overlap, filters, component calculations and release-manifest guards. The static site is built and live files are compared with the build. Browser visual QA is not claimed.

## Release behavior

Tag: `pilates-estimates-m1-2026-10-17`.

The repository workflow creates this immutable tag and published release from the exact commit only after tests/build and Pages deployment succeed. The manifest is attached to the release. Existing tags are never moved; unrelated later commits do not create another release unless the milestone manifest changes. GitHub's release/tag readback is the publication authority.

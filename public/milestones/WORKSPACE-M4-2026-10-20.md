# Workspace M4 — V11 contractor tables + Memory Posters

V11 keeps every work and its material table on one page. The new Memory Posters wall explains the result and provides the prompts to reproduce or extend it. Both are part of the existing CAD Test Facility website.

## Included

- V9 is the normalized published data register. V10 provides contractor worksheets, and v11 derives its open material sections from the v10 projection and calculation rules. Committed source changes rebuild the linked views together.
- V11 shows 51 works, 261 material lines and six areas. Its four columns are material/specification, purchase quantity, unit rate and amount. Search, area filters, same-page jumps, inline edits and printing are available. V10/v11 contractor drafts share browser storage by source revision; they remain separate from published data.
- Memory Posters is a dedicated, pinned learning wall with 11 posters in three categories. It includes a v11 recap, layout vocabulary, the v9/v10/v11 source map, a quantity × rate example, data limitations, a prompt recipe and five copyable prompts. Reading and print views are available; the main poster content stays visible without JavaScript.
- Poster examples and coverage figures derive from the same material data as v11. The poster collection is editable as JSON. Light/dark palette contrast is checked; the existing theme and Pip remain available.
- All 121 pages, 12 estimate views and three primary sections are preserved, including 51 v8 work pages and 51 v10 worksheets. Original quote values, six held works, two allowances, CAD/model workspaces and M1/M2/M3 records remain intact.
- Saved extraction progress remains at CP260 / Local/Main251/251 for MSCH, with the other lane boundaries retained in the current recovery record. This website release neither resumes extraction nor re-verifies Drive source bodies.

## Verification and release

The verified implementation source is `fe0c6dc39eee7960d3a085ed574aaf6e08f01d5e`, following the v11 implementation `b364e16413b5a1e59322f7591c2ece3c7981ed36`. The source passed 104 automated tests, built all 121 pages and resolved 3,993 local links/assets plus 36 module imports. All 31 live files checked matched the source build. The source deployment run is 39356769137.

The milestone record adds three release checks, bringing the final snapshot to 107 automated tests. Its tag is created from the exact milestone-record commit only after that commit's checks and GitHub Pages deployment succeed. The release attaches a JSON manifest with source references, coverage, verification limits and preservation hashes. Earlier tags and release records remain fixed.

Browser layout/animation and real-phone visual QA remain unverified because supported browser controls were unavailable. Source tests, palette checks and HTTP/file comparisons establish the checks actually performed; they do not mark a rendered-device review complete.

## Preserved input limits

The original quote currency and accepted labour/material split remain unconfirmed. Six held works keep original values, and two allowances remain unsplit. Material quantities include authored planning assumptions. Only 63 of 261 material lines have both default quantity and price; subtotals remain partial until take-offs, specifications, supplier prices, taxes and delivery are confirmed.

Reference images remain illustrative rather than confirmed project photographs. SKP geometry and duplicate inspection remain blocked by the source download size limit. The earlier owner-reported link-opening issue was not reproduced by HTTP delivery checks; its exact device/browser error remains unknown. Four-lane source-stage gates are preserved in the saved progress record and were not re-verified in Drive for this release.

[Memory Posters](https://pailapilates09-sys.github.io/CAD_Test-Facility/memory-posters/) · [V11 material tables](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/v11/) · [Versions + milestone](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/milestone.html)

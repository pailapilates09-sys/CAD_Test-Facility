# Workspace M3 — Responsive mobile layouts + extraction roadmap

The same website now adapts to phones with readable work cards, larger touch inputs, contained chart scrolling and a smaller free-flying Pip. Full-size desktop screens retain the established desktop presentation. The current extraction roadmap and saved CP218 boundary are included in this snapshot.

## Included

- Mobile styles activate only for narrow screens or smaller touch devices. Existing desktop styles remain intact, and switching screen sizes does not change the source data or calculations.
- Simple tables use labelled work cards on phones while retaining their original cells, controls, values, filters and held states. Complex tables, charts and drawings remain scrollable within their own regions.
- Phone inputs and navigation have larger touch targets. Text wraps within cards, and Pip uses compact flight bounds on phones and touch landscape screens.
- All 66 pages, three primary sections, nine estimate views and 51 v8 work pages remain available. Original values, six held works, two allowances, material quantity assumptions and the CAD/model workspaces remain preserved.
- The Progress page includes the four-lane roadmap and its current gates. The saved MSCH boundary is CP218 / Local/Main209/209, with 2,968 catalogue records and 557 pending folders. Source-content extraction has not started in MSCH; this milestone does not claim a new extraction run or verification of source bodies.

## Verification

The deployed source snapshot is `fd8f9a014b9ef1e426b830e50b05599ad19c8d2e`, including mobile implementation `671b8ff89a3ac56734e9946ce005a518e1772715` and the separately served roadmap styles. That source passed 78 automated tests, built all 66 pages, resolved 1,779 local links/assets, and matched all 92 live files checked against the build. Its GitHub Actions deployment completed successfully.

The milestone record adds three release checks, bringing the release snapshot to 81 automated tests. The tag points to the exact milestone-record commit after its own checks and GitHub Pages deployment succeed. The attached JSON manifest records the source commit, coverage, verification limits and preservation hashes. Existing M1/M2 tags, releases and manifests remain unchanged.

Browser animation/layout and real-phone visual QA remain unverified because supported browser controls were unavailable. The owner's reported link-opening problem was not reproduced by HTTP checks; the exact browser error remains unknown. Successful HTTP responses and byte comparisons establish delivery, rather than a completed visual review on the owner's device.

## Preserved limits

The original quote currency and exact supplier labour/material splits remain unconfirmed. Six held works retain original values; two allowances lack detailed quantities. V8 quantity models use explicit planning assumptions requiring supplier/site confirmation. Reference images are not confirmed project photographs. SKP geometry and duplicate inspection remain blocked by the download size limit.

The four-lane gates remain documented: MSCS hashing eligibility, LSA's two-file historical baseline discrepancy, AEC's missing original terminal checkpoint and MSCH's unfinished FIFO catalogue. Saved progress evidence is preserved as reported; it is not newly reverified in Drive by this website release.

[Open the workspace](https://pailapilates09-sys.github.io/CAD_Test-Facility/) · [Versions + milestone](https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/milestone.html) · [Progress roadmap](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/#extraction-roadmap)

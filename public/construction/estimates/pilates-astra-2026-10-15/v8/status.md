# V8 — Materials inside each work

Prepared 18 October 2026, after milestone M1. V7 remains the full estimate/comparison/labour view; V8 adds material drill-down pages without changing source values or earlier pages. M1 remains frozen.

## Published scope

- 51 work detail pages, grouped in the existing six detailed areas.
- 257 material checklist rows. The checklist identifies known material families and unresolved components; it is not an approved complete procurement schedule.
- 20 works have at least one default quantity with a public supply price, including the zero-quantity glass door. There are 23 default priced rows; all subtotals are partial.
- Rates can be available even when a quantity is unknown, particularly for plywood, laminate, glue and hinges.
- Materials tables show purchase units, quantities, low/high rates, amounts, source evidence, derivations and missing inputs.
- Editing quantities/rates, adding a material, resetting, sheet-count calculation, JSON draft download and print controls. Edits are temporary in the open tab; downloads retain the source snapshot, overrides and effective calculations.
- Existing reference images and attribution retained; no new project photographs or geometry inferred.
- Six holds locked, with their original rates/amounts retained. No new material allocation to them.
- Flooring and electrical remain two unsplit summary allowances.

## Quantity assumptions

Source feet and square feet convert exactly to metres and square metres. Surface examples use one layer and 10% cutting allowance, explicitly provisional. Cabinet face area is not used as a carcass cut list. Partition face/layer counts remain unknown. Curtain cloth metres require fabric width, height, fullness and a cutting layout. Service quantities require measured routes.

Wall putty uses manufacturer code 8079 coverage of 20–25 ft²/kg/coat, read visually on PDF page 1. The conservative example uses 20, two coats, 10% extra, and whole 40 kg bags. Confirm the retailer's ambiguously described bag is the same product. Paint uses the general contractor-guide example of 50 ft²/L for two coats, 10% extra and whole 1 L packs. This coverage is not a verified performance claim for the selected Tractor Advanced product.

No generic percentage allocates the original quote. No installed package is recategorized as material. Original estimate currency is still unspecified. All public calculation inputs are NPR references; no new VAT assumption or delivery cost is invented. Individual rows may be named supply products containing factory labour.

## Sources and gaps

See material-catalog.json for 20 evidence records. Eighteen sources were retrieved on 18 October; some report that no numeric supply rate is published. S19 is the verified 17 October official district-board snapshot. S20 is the 16 October decorative-mirror snapshot; today's refresh hit the supplier's verification screen, so its date is not refreshed.

Material-takeoff.json and the 51 pages are generated reproducibly by scripts/material-v8.mjs during the normal site build. Source catalog, recipes, calculations and all historical estimate registers are retained in GitHub. No SKP extraction or duplicate analysis was performed in this version.

Remaining: cabinet cut lists, approved board/stone/fabric/fixture grades, partition and ceiling framing, electrical/plumbing routes, hardware schedules, unpriced accessories, current supplier quotations, currency confirmation and actual contractor splits. Browser layout verification remains unavailable in this runtime; automated and live-file verification are separate from visual owner approval.

# V8 — Materials inside each work

Prepared 18 October 2026, after milestone M1. V7 remains the full estimate/comparison/labour view; V8 adds material drill-down pages without changing source values or earlier pages. M1 remains frozen.

## Published scope

- 51 work detail pages, grouped in the existing six detailed areas.
- 261 material checklist rows. The checklist identifies known material families and unresolved components; it is not an approved complete procurement schedule.
- 33 works have at least one default quantity with a public supply price, including the zero-quantity glass door. There are 63 default priced rows; all subtotals are partial. 147 material rows have quantity estimates, including 109 from explicit planning models.
- Rates can be available even when a quantity is unknown, particularly for plywood, laminate, glue and hinges.
- Materials tables show purchase units, quantities, low/high rates, amounts, source evidence, derivations and missing inputs.
- Editable quantity-model inputs, recalculation, direct quantity/rate edits, added materials, resetting, sheet-count calculation, JSON draft download and print controls. Edits are temporary in the open tab; downloads retain the source snapshot, overrides and effective calculations.
- Existing reference images and attribution retained; no new project photographs or geometry inferred.
- Six holds locked, with their original rates/amounts retained. No new material allocation to them.
- Flooring and electrical remain two unsplit summary allowances.

## Quantity assumptions

Source feet and square feet convert exactly to metres and square metres. Surface examples use one layer and 10% cutting allowance, explicitly provisional. Cabinet front area now feeds an editable reference height/depth/module/shelf model, which derives board cut areas, sheets, laminate, adhesive packs, hinges and edge lengths. Partition face/layer counts, ceiling rectangles and hanger layouts, curtain fabric dimensions/fullness, sofa dimensions and service routes are explicit authored assumptions. They are not surveyed data. Source points still need a ceiling-area input. Undefined mixed-component kits remain null.

Wall putty uses manufacturer code 8079 coverage of 20–25 ft²/kg/coat, read visually on PDF page 1. The conservative example uses 20, two coats, 10% extra, and whole 40 kg bags. Confirm the retailer's ambiguously described bag is the same product. Paint uses the general contractor-guide example of 50 ft²/L for two coats, 10% extra and whole 1 L packs. This coverage is not a verified performance claim for the selected Tractor Advanced product.

No generic percentage allocates the original quote. No installed package is recategorized as material. Original estimate currency is still unspecified. All public calculation inputs are NPR references; no new VAT assumption or delivery cost is invented. Individual rows may be named supply products containing factory labour.

## Sources and gaps

See material-catalog.json for 20 evidence records. Eighteen sources were retrieved on 18 October; some report that no numeric supply rate is published. S19 is the verified 17 October official district-board snapshot. S20 is the 16 October decorative-mirror snapshot; today's refresh hit the supplier's verification screen, so its date is not refreshed.

Material-takeoff.json and the 51 pages are generated reproducibly by scripts/material-v8.mjs during the normal site build. Source catalog, recipes, calculations and all historical estimate registers are retained in GitHub. No SKP extraction or duplicate analysis was performed in this version.

Remaining: verify assumed dimensions and usage factors against cabinet cut lists, approved board/stone/fabric/fixture grades, partition and ceiling framing, electrical/plumbing routes, hardware schedules, unpriced accessories, current supplier quotations, currency confirmation and actual contractor splits. Browser layout verification remains unavailable in this runtime; automated and live-file verification are separate from visual owner approval.

## Text and format repair

The supplied screenshot showed material-header notes inheriting the workspace no-wrap rule, and an unstyled hidden caption. V8 now has scoped normal white-space and anywhere wrapping for cells and notes, explicit fixed table columns, wrapping amount outputs, constrained inputs, accessible hidden captions, responsive model controls and print overrides. Earlier versions do not inherit these changes. Continuous purchase quantities round up to three decimals and converted prices to two decimals; subtotals calculate from these displayed inputs.

The model parameters and formulas are in quantity-models.js and are included in material-takeoff.json and draft exports. Recalculating preserves entered rate overrides. Geometry and route assumptions are labelled separately from published price evidence. These models are budgeting scenarios, not installation or structural/electrical design instructions.

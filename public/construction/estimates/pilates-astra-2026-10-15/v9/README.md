# Shared estimate source v9

`register.json` is the sole editable register for the current v5–v10 views. It was assembled from the existing v8-era source inputs without adding prices, accepted quantities or approved quote splits.

- `works` and `areas`: stable source IDs and quoted values. Original PDF/raw extraction remain the evidence archive.
- `market`: unique sources and observations; `work_links` associates observations with works.
- `components`: independent labour/material observations and work links. Entries with `market_observation_id` or `market_source_id` derive from the corresponding market record; edit the market record once.
- `materials`: unique material definitions, price inputs and source records.
- `work_materials`: assembly relationships by work/material ID, without copied names or prices.
- `model_parameters`: editable planning defaults, not surveyed quantities. Physical quantities and partial amounts are computed using the shared models.
- `images`: unique image assets and work-to-image links. Assets are physically stored once under v6.

Every normal GitHub Actions build reads this register and generates the focused views, v8 work pages and the all-field v10 tables together. Generated JSON compatibility exports and generated HTML are outputs, not extra inputs. Edit the register or shared calculation rules, then commit; the existing deployment workflow publishes the resulting views.

V8 browser scenario edits remain temporary drafts. They do not modify the published source register. All fields in the published source and the derived quantities/amounts are visible in v10 without opening work pages.

Earlier dated research exports and M1/M2/M3 release manifests remain unchanged as historical evidence. Public references retain their original dates and qualifications; this restructuring does not refresh prices or inspect the SketchUp geometry.

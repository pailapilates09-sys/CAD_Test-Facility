# CAD Test Facility · shared website organisation

The website groups projects, drawings/design tools, and records/learning without relocating project source files or historical URLs.

## Ownership

- `site-model.js` defines navigation groups, project ownership and search matching.
- `interface.css` styles the shared shell and project-oriented landing pages. Project-specific controls and drawings retain their existing styles and controllers.
- `interface.js` enhances the mobile menu, local contents, page search and catalogue filters. Server-rendered links and complete lists remain available without JavaScript.
- `references.json` contains the fifteen-product review. Every page's bottom footer cites all fifteen products; `/guide/organization/` explains observations, applications and limitations.
- `scripts/workspace-organization.mjs` owns the generated homepage, Paila hub, drawing library, directory, source/export library, guide and shared shell.

`prepareWorkspaceOrganization` runs after project builders and before the existing theme decorator. `applyWorkspaceOrganization` then replaces duplicated global navigation, adds breadcrumbs/related links and decorates local contents. The original drawing controls and project content remain in place. Do not hand-edit these generated pages in `dist/`.

## Checks and preservation

`npm run check` runs the original calculation/geometry tests plus navigation/search checks and a full site build. The build verifies all local section links, the complete page catalogue, footer citations, retained page/section addresses and project table counts.

`node scripts/verify-site-organization.mjs --preserve-baseline` additionally requires the dated source and non-HTML output hashes to match. `preservation-baseline.json` is the comparison for this presentation release, based on the current CP523/Run35 provider commit. It is not a rule that prevents later authorised project-data updates: future data changes should be documented in a new dated comparison. The original source evidence must not be silently rewritten to make an audit pass.

The existing Actions workflow continues to run the repository checks and deploy Pages. This redesign does not change engineering assumptions, prices, sanctioned loads, fabrication status or approval requirements.

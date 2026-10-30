# CAD Test Facility · shared website organisation

The website groups Workspace utilities, Projects, Drawings & tools, Progress & source files, and Learning & guides without relocating project source files or historical URLs.

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

## Category refinement - 31 October 2026

`PAGE_KINDS` and `pageKind` in `site-model.js` classify every HTML page as a hub/directory, original quotation, versioned workspace, individual work detail, drawing/tool or reference page. The directory defaults to main pages; the All pages and Individual work details filters expose the complete catalogue. Global search opens all page types. Project and page-type selections remain in the URL. The library includes recognized gzip-compressed exports with an explicit format label.

The dated 29 October comparison is retained. The current navigation review compares against provider commit `2c8ff8a93da8b7fef0bd1a244d1f1d919919dcad`; see `QA_2026-10-31.md`. Navigation work does not change the extraction checkpoint, engineering model, source PDFs, original quote values or source archives.

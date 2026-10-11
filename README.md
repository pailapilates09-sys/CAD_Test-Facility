# CAD Test Facility

Interactive product drawings for the browser, published with GitHub Pages and Actions. First product: a preliminary column formwork assembly, 16 in x 16 in clear, with 96 in panel height. All displayed dimensions are inches.

## What is included

- Three.js r180 viewer: orbit/zoom, assembled and timber-frame presets, separated faces, layer controls, piece inspection, assembly steps and PNG export.
- Five dimensioned SVG drawings: plywood cuts, battens and nail positions, top plan, support elevation and corner detail.
- The inch-only shop drawing PDF, material CSV and machine-readable inch specification.
- A plain-language guide to HTML, CSS, JavaScript, TypeScript, SVG and Three.js.
- Ten reviewed open-source drawing projects, linked to their primary GitHub repositories with license labels and intended uses.
- Drive links to compiled drawings and release packages in the connected pailapilates09 account.

## Build and preview

Node 20 or newer is sufficient. No npm dependencies need installing.

```sh
npm run check
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve the multi-file site over HTTP; loading its modules directly with file:// is unsupported by browsers.

For a single-file preview that does open directly in a browser, run `npm run export` and open `releases/Column_Formwork_Interactive_Preview.html`. Three.js, the model, vector drawings, PDF and cut-list downloads are embedded. Drive links still require Internet access.

## Publish

1. The GitHub connection must have write access to pailapilates09-sys/CAD_Test-Facility and permission to write workflows. The initially connected account was pailapilates10-cmd and the provider reported push=false.
2. In repository Settings -> Pages, choose **GitHub Actions** as the source. Ensure Actions is allowed under Settings -> Actions -> General.
3. Push these files to main. `.github/workflows/pages.yml` verifies geometry, builds the static files, uploads the Pages artifact and deploys it. The Actions deployment output provides the verified live URL.

The expected project Pages address is https://pailapilates09-sys.github.io/CAD_Test-Facility/ . This README does not claim it is live until a deployment succeeds and the URL is checked.

## Edit products

Edit `src/spec.mjs` for geometry and quantities. Both the 3D model and SVG sheets consume that specification. `src/drawings.mjs` generates vectors; `src/model.mjs` builds the assembly; `src/app.mjs` wires the user interface. `public/style.css` sets the responsive visual design.

Geometry uses inch coordinates throughout. The original supplied plywood thickness is converted once to 0.4724409449 in; it is **not** assumed to be exactly 0.5 in. A panels are 16 in wide; B panels are 16 in plus two measured ply thicknesses (approximately 16.945 in).

Type declarations in `src/spec.d.ts` document the data contract. Current runtime code is JavaScript modules; no TypeScript transpilation is required for this release.

## Drive project folders

- [CAD Test Facility](https://drive.google.com/drive/folders/1BVsrqqG5I_1XA_9YaZOnBHVfoaext6lU)
- [Column Formwork](https://drive.google.com/drive/folders/1F_Fb3o_ODn8-RUTY3-s8CXx_bwianVt3)
- [Compiled Drawings](https://drive.google.com/drive/folders/1NLG6wdnuT88crenF2SxSYo7sQ5CmWuZU)
- [Website Releases](https://drive.google.com/drive/folders/1_kngq75CEOJGsmkb9XxfP-CEF3Dxagir)

These are links to project files. Drive access uses the user's existing sharing settings; embedding a link does not make a private file public.

## Engineering scope

This is a geometry, cutting and assembly guide. The timber section is assumed actual 2 in x 3 in. The proposed support spacings, timber/ply capacity, collar corner fasteners, brace end joints and substrate anchors are not designed or approved here. A site engineer must verify them against the actual materials, concrete pressure and pour procedure before use.

204 nails count only the proposed plywood-retaining nails, not structural connection fixings. The 28-stock-timber cutting example is geometric: joint allowances, final anchorage material and procurement spare are additional once detailed.

## Open-source notices

Three.js r180 and OrbitControls are bundled locally under the MIT license. See `vendor/THREE-LICENSE.txt`. The ten-project review is in `src/spec.mjs` and the downloadable JSON. Other reviewed libraries are not installed in this release.

# Pilates room workspace

The page presents the main studio room as a linked 2D footprint projection, 3D model and four-column item schedule. Selecting a model item in any view highlights the same definition and all its room placements in the other views. Search filters all three; focus, isolation, plan pan/zoom and an open-wall view are available. The shared website theme, appearance settings and mascot controls are preserved.

`studio-room.scene.json` derives from the checksum-verified native JSONL archive. It includes 242 native root placements and one item for loose room geometry, grouped into 106 source item types. Repeated geometry uses instanced Three.js meshes. The display mesh is reduced from 2,488,618 source triangles to 238,779 definition triangles (946,789 after visible placement expansion). These are optimized display meshes; use the original source for engineering measurements. Five invalid/non-planar source faces were omitted from display, with counts recorded in the scene metadata.

The source DWG reference, distant alternate placement and extreme-scale tea-table object are deliberately excluded from this room projection. Their source IDs/reasons remain in the scene metadata; nothing was removed from the preserved SKP or full archives. The previous `architectural-base.scene.json` and its M5 inspection report remain available. The inspection tables, audit panels, thumbnail gallery and export instructions have been removed from the working page, while their files remain preserved here.

Item counts refer to placed model components, rather than a contractor's bill of materials. Size columns show axis-aligned model extents (with ranges for differently scaled/rotated placements), and finish labels come from the model's appearance records. Items without decoded visible faces use labelled placement markers, rather than an invented physical shape. No construction rates or estimate quantities have changed.

## Room navigation — 22 October 2026

`room-navigation.json` is a source-linked overlay over the unchanged scene. All 106 item types retain their native definition IDs and original searchable names. Readable source names and names supported by nested definitions are distinguished from 39 provisional geometry/location labels and 20 unresolved model elements. The latter show “suggested name” or “name to confirm” in the table. Original names and label evidence appear in each item button's tooltip. The overlay is the single place to edit these names; the generated table and both browser views use it.

Five approximate navigation areas cover training studio, lockers/changing, coffee/lounge, reception and entrance/circulation. Filtering uses each root placement's XY extent (or source origin for placement-only markers), including shared assemblies that touch several areas. These are navigation extents, not approved architectural room boundaries. Counts and size ranges use only matching placements; partial counts show “of” the room total. Area sums are not additive because shared assemblies may appear in several areas. Geometry is filtered by placement without cutting individual components at a zone boundary.

Fourteen original source camera presets restore the source eye, target and field of view, converting raw camera coordinates from inches to metres with 0.0254. The remote “Scene 1” camera is outside the selected studio scope and is retained only in the source hierarchy. Interactive camera controls keep world Z upright; saved source roll, SketchUp styles and renderer lighting are not reproduced. A source viewpoint clears search/isolation, shows the entire room as context, frames the associated area in the plan and turns off the wall cutaway. Choosing an area uses its overview and filters all three views. Top view and room overview are also available. URL parameters retain a chosen area/preset when the page is reopened.

The approved layout is frozen in [workspace M6](https://github.com/pailapilates09-sys/CAD_Test-Facility/releases/tag/workspace-m6-2026-10-22). Navigation continues on `work/studio-navigation-after-m6`; source archives, the shared website theme, estimate records and progress boundary retain their existing source of truth.

## Rebuild the display projection

Install `numpy`, `mapbox-earcut==2.0.0` and `fast-simplification==0.1.13`, restore the verified `geometry.jsonl.gz` archive, then run:

```sh
python tools/sketchup/build-room-preview.py geometry.jsonl.gz public/construction/models/pilates-sketchup public/construction/models/pilates-sketchup/studio-room.scene.json
npm run check
```

The rebuild reads original archives without modifying them. The generated scene keeps source definition IDs, instance transforms and archive hashes. `room-model.js` is the shared projection for the server-rendered table and browser views; `three-model.js` keeps instance selection/filtering testable without a WebGL renderer.

3D requires WebGL. A browser without WebGL retains the 2D view and full table with a clear 3D message. The managed QA browser has WebGL disabled; source geometry, Three.js ray picking, highlight/filter state and item consistency are tested separately.

---

# Pilates native SketchUp extraction — 21 October 2026

The actual uploaded `PILATES.skp` has been read. Its 295,205,462 bytes match the previously recorded Drive size. SHA-256 of the uploaded source: `ad5c8a00a563d4336a5ea4bdd72907aba7e427f0c842e21196386d944af4b0ec`. This does not establish a byte comparison with the older Drive copy; the unchanged uploaded source is preserved with this extraction.

The incremental VFF reader decoded 1,641,952 vertices, 4,070,637 edges, 2,458,434 faces and 1,917 local instance records. There are 1,114 definitions and 4,786 placed occurrences (245 at model root). Indexed/decoded counts agree, SQLite quick_check passed, and all supported geometry/definition references resolve. See [inspection.json](inspection.json) for the current source-backed results.

There is one SKP document. This is not a count of physical studio layouts. The hierarchy has 44 coincident same-definition pairs, 264 reused definitions and 425 unplaced definitions. Nothing was deleted or purged. Separated placements and equal geometry under different definitions still need review. One non-unit homogeneous transform and extreme nested envelopes require Desktop inspection before any overall dimensions or construction quantities are trusted.

## Preserved outputs

[Drive extraction folder](https://drive.google.com/drive/folders/1Asat9JD6oCrr2KQI-npg1AmGc4Wml1HF) contains numbered parts of the compressed JSONL, SQLite and SQL derivatives, plus a ZIP of inspection JSON/CSV, unchanged embedded assets and reproducible scripts. Unzip the inspection bundle beside all parts, run `python restore-archives.py` to verify/reassemble them, then unpack `.gz`. The unchanged native SKP remains in the existing preserved parent Drive folder. The binary original remains necessary for full SketchUp fidelity.

- [hierarchy.json](hierarchy.json): shared definitions, original transforms, source IDs, model tags and saved cameras.
- [definitions.csv](definitions.csv), [instances.csv](instances.csv): definition and occurrence registers.
- [materials.json](materials.json), [materials.csv](materials.csv): 443 rendering-material records. These are not procurement work items or purchase quantities.
- [saved-views.json](saved-views.json): 14 original camera thumbnails for 15 decoded cameras.
- [native-container-manifest.json](native-container-manifest.json): all 1,335 embedded member records, including the native model.dat.
- [architectural-base.scene.json](architectural-base.scene.json): explicitly selected Group#2 and four nested definitions, 402 faces / 1,414 triangles. Selected polygon areas, including holes, match emitted triangles. This is not the entire studio model.

Both browser views read the same published partition in metres. Source coordinates in the JSONL remain in inches; SQLite vertex coordinates and derived affine translations use 0.0254 metres per inch. All 13 original transform values are retained; the derived affine matrices normalize the reciprocal homogeneous-scale scalar. The source includes extreme nested geometry, so global envelopes are not measured studio dimensions.

## Reproduce

Use an isolated Python environment with `openskp==1.3.0` (including its NumPy, mapbox-earcut and defusedxml dependencies):

```sh
python tools/sketchup/prepare-native-assets.py PILATES.skp new-output
python tools/sketchup/extract-vff-stream.py PILATES.skp new-output
python tools/sketchup/finalize-pilates.py new-output 136690
```

The normal full-object reader exceeded the available memory. The incremental reader maps an unchanged, CRC-checked model.dat in a private temporary file and decodes one geometry entity at a time directly to JSONL and SQLite. The output covers supported vertex/edge/face/instance records, face-loop/normal/material/visibility/UV-transform data, model tags and camera records. Unknown/native features and plugin rendering remain in the original; full SketchUp SDK fidelity is not claimed. Large geometry archives remain in Drive rather than Git blobs.

The existing `paila_export.rb` and `ingest-scene.py` Desktop route remains available for independent SDK validation or a reviewed full-model browser export. The Ruby exporter has not been executed against this file here. Both scripts preserve the original and never purge candidates.

## References

- Decoder: https://github.com/iamahsanmehmood/openskp
- SketchUp transform scalar: https://developer.sketchup.com/article-making-a-parametric-object
- Official Ruby APIs: https://ruby.sketchup.com/Sketchup/Face.html and https://ruby.sketchup.com/Sketchup/ComponentInstance.html

The Fabin Gurung reference was read only. All implementation changes belong to `pailapilates09-sys/CAD_Test-Facility`. Estimate values, held items, labour/material rates, the theme and milestone tags are preserved.

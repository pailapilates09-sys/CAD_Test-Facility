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

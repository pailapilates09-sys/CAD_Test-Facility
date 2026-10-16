# SketchUp preservation and linked viewing

The PILATES.skp file has been copied to the requested Drive destination. Its bytes could not be downloaded: the connector limit is 256 MiB and this file is 281.53 MiB; the public download redirects to sign-in. Source geometry, duplicates, scene hierarchy and materials remain uninspected. The scripts below are prepared tools, not evidence that this file was extracted.

## Read-only export in SketchUp Desktop

1. Download `paila_export.rb` and keep the original SKP.
2. Open the source in SketchUp Desktop. In its Ruby Console run:
   `load UI.openpanel('Choose paila_export.rb', '', '*.rb')`
3. Choose a new output folder. The script writes a new timestamped directory without editing, saving or purging the source model.
4. Preserve the whole export directory: scene.json, entities.jsonl, materials.json, definitions.json, components.csv, texture binaries, README.txt and manifest.json.
5. Load scene.json in the new Pilates model webpage. Both views derive from the same definitions and placements in metres. The plan is an XY projection, not a semantic floor plan.
6. Run `python ingest-scene.py scene.json NEW_OUTPUT_FOLDER` to create model.sqlite, model.sql, instance-occurrences.jsonl, duplicate-report.json and source checksum.

The native exporter uses the documented SketchUp Ruby API (SketchUp Desktop 2019+ recommended). It has not been run against PILATES.skp in this environment. Model data cannot be claimed until the export is received and verified. The Python inspector is tested against synthetic fixtures, which are not Pilates geometry.

The scene data retains shared component definitions, placed instance transforms and flags. Raw JSONL retains face loops, triangulation, normals, UVQ, front/back material IDs, edge endpoints and attributes. Texture image files are exported separately where supported. Some plugin-specific attributes are retained as string representations; imported images are metadata only. Saved scene camera metadata does not preserve every SketchUp rendering/page setting. The original SKP remains the only full-fidelity native source.

Duplicate inspection reports coincident occurrences of the same definition at the same world transform. Repeated components elsewhere are not deleted. Equal geometry in different definitions, spatially separated alternative layouts and intentional overlaps need further geometric and human review. One SKP model document can legitimately contain many components; no component count is assumed for the unread file.

## Official API references

- https://ruby.sketchup.com/Sketchup/Face.html (mesh flags and area)
- https://ruby.sketchup.com/Sketchup/ComponentInstance.html (transformation)
- https://ruby.sketchup.com/Sketchup/Texture.html (texture write)

Reference site was read only: https://fabingurung.github.io/JP_Computer-Aided-Drawings/ . No source from or writes to that repository are used. New files live only in pailapilates09-sys/CAD_Test-Facility.

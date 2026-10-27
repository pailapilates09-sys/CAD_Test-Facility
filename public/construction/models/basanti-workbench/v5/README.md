# Basanti v5 — proposed fabrication basis

V5 derives its workspace/controller/drawing shell from v4 at build time. The canonical building JSON, original PDF, base IFC and v1–v4 calculation modules remain unchanged. Proposed values are held in one exported BASIS record in proposed-model.js. Generated design-basis.json is a projection, not a second editable master.

The proposed geometry uses a labelled M25/Fe500 calculation basis, 40/30/50 mm covers for columns/beams/formed footings on PCC, rounded bar paths, 6φ assumed inside mandrels and source 10φ straight hoop tails. The source Ø8 outer column hoop fails a separate conditional NBC105 Eq4.3.3 check at85 mm pitch. V5 explicitly proposes Ø16 outer hoops, retains Ø8 diamonds and fits the source longitudinal bars inside the rounded bend interiors. This is a new proposed cage, not an asserted source detail or structural approval. Full-height close pitch is a planning choice; joints and foundation confinement remain outside these pieces.

Nominal projected cuts sum tangent straights plus centreline arcs. The overlapping closing-hook projection has no designed physical end offset/allowance; it cannot be treated as a manufacturable released shape. Display polylines sample the same arcs; they are not added to untrimmed corner legs. Longitudinal runs, incomplete source cages and unresolved development/connection details remain fabrication holds. The 12 m stock example includes only explicit bent pieces, separates3 mm kerf and cannot become a whole-project order.

Twenty distinct primary/technical documents are referenced, with publisher, section, application and applicability limits. Foreign templates are not automatically adopted in Nepal. Material bend/rebend-test mandrels do not establish fabrication radii. Mill/test ductility evidence, exposure/fire basis, concrete-bearing/shear/joint design and signed placing details remain necessary for site execution.

The viewer reports the renderer actually used and can test context loss/retry where WebGL is available. A vector pass is not called a hardware WebGL pass. The built page offers a local device-report download; it sends no report data anywhere.

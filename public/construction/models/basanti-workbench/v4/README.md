# Basanti v4 — checked detailing and BBS study

V4 is derived at build time from v3's page/controller, with explicit v4 model, drawing and interface overrides. V3 remains available. Both versions read the same preserved building JSON; there is no second editable project model.

The mathematics audit corrects EF1 plan orientation, three footing marks, stair steel pitch, distribution spacing along the slope, and tie-beam joint double counting. Known missing internal/roof framing becomes a quantity completeness hold, not a zero quantity. Source link zones are no longer generated from arbitrary quarter spans or unconfirmed floor-to-floor column heights.

The page compares source notes with verified NBC105:2025 rules and offers an explicit conditional trial. No trial cover is assigned by default. The trial button enters40mm column /25mm beam /50mm rectangular-footing cover as labelled assumptions, not adopted Basanti details or a transplanted NBC205 template. Effective depth uses the actual trial bottom-bar centroid; model face heights, lo/2d boundaries, link stations, 2D/3D and grouped path quantities share those inputs. Geometry tests inspect the produced coordinates.

The BBS study reports source/display roles, path counts and nominal path mass. Grades remain unassigned; development lengths require an actual verified table row. Lap checks use steel area, not merely bar count. Cutting arithmetic requires explicit tangent straights, additional lengths and centreline arcs. No final cuts, order counts or structural compliance certificate are issued.

Primary code URLs, exact clauses/PDF pages, qualifications and unconfirmed project inputs are in `code-references.json`. Eight source/mathematics findings and their v4 dispositions are in `math-audit.json`. Generated data lives in `data/`. The original PDF, canonical JSON, earlier versions and base IFC remain preserved; the IFC does not contain v4-only corrections.

Use the ordinary `npm run check` / GitHub Pages workflow. Hardware rendering, end-user downloads and real-device usability are reported only to the extent actually verified in the QA record.

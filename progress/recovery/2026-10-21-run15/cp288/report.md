# Four-project extraction — Run 15, CP288

Recovered from CP274 / Local/Main265/265. 14 FIFO checkpoints, CP275–CP288, passed provider byte/hash readback and Local registration. Main projections and reciprocal acknowledgements reconcile at **279/279**, **N233 ACKED**, with no acknowledgement debt.

MSCH advanced from **3818 to 3840 metadata records**: **859 folders and 2981 files**. Added **22 identities (2 folders, 20 files)** and **9279 metadata-reported bytes**. **533 folders remain queued**; the complete corpus denominator is unknown. Next: **B289 — sources**. Do not replay the completed batches.

The verified run record covers 42.01 minutes within the maximum60-minute window; source checkpoint work ended at 2026-10-21T01:33:14.896Z. This is metadata cataloguing. Source text/OCR, video transcription, model execution and semantic extraction remain pending. Original source objects, permissions and scheduler state were unchanged. AEC G075 checkpoint access was verified; no matching G076 terminal was recovered in bounded filename discovery.

## Four-lane roadmap

| Lane | Boundary | Next | Gate |
| --- | --- | --- | --- |
| MSCS | AQ-CP87 | B076 — Oversized or Google-native files | Current Tier 3 eligibility is zero:798 oversized files and 10 Google-native files remain deferred. |
| LSA | CP80 | B081 reconciliation — Historical identity inventory for the two baseline discrepancies | Historical baseline differs by 2 files /9,304 bytes: one file /4,652 bytes each in NEA Class files and Standard files-Package. The expected identities are unknown. |
| AEC | G075 closed / G076 PART1 | G076 recovery — Original terminal checkpoint and original lock | G075 checkpoint is readable. G076 still lacks a recovered terminal checkpoint matching the preserved rate evidence; terminal closure remains incomplete. |
| MSCH | CP288 | B289 — sources | 533 FIFO folders remain; complete corpus denominator is unknown. Source-content extraction is a later stage. |

The route remains inventory → integrity → approved content extraction → validated knowledge → use and maintenance. No supported overall completion percentage or finish date is available.

## Verification and recovery

All four CP274 CURRENT files matched the saved checkpoint hashes. Each new folder was confirmed by independent listings and exact child parent metadata; capped text views were checked through a second full direct list. Each batch PRE, four same-ID CURRENT files and checkpoint passed exact complete-byte/SHA-256 readback. Local registrations, Main projections and reciprocal ACKs passed exact native-cell readback. Native Local/Main PRE and POST snapshots and finite terminal registrations were verified.

A missing CP279 checkpoint download was recovered by exact readback before registration. CP285 promotion timed out; provider readback identified the applied manifest and only the three unmatched CURRENT files were written. Main PRE/POST copy errors were resolved through exact-title discovery and bounded retries. No source batch, Main artifact or event was replayed.

Whole-run rollback uses the run-start CP274 raw set in B275 PRE together with the matching native Local/Main PRE snapshots at sequence265. Intermediate raw PRE files retain the previous source boundary and local evidence; do not pair a later raw boundary with run-start ledgers. The Local POST precedes finite terminal artifact registration; the Main POST follows those registrations and excludes only its own self-registration, which is verified separately. No acknowledgement or audit-only business event was manufactured.

The Progress projection preserves earlier checkpoint reports, construction estimates, drawings, mobile/desktop styles, the mascot and existing milestone tags.

Incomplete / Remaining: source-content extraction, the MSCH FIFO and the three source-stage gates above.

## What the extraction enables

The recent continuation runs mainly build metadata inventories and integrity evidence. A catalogue entry records a file; it does not mean its text, tables, video or engineering model has been interpreted. AEC also contains existing structured rate observations, which are a more advanced content product than an inventory.

| Available evidence now | Derivation supported now | Limit |
| --- | --- | --- |
| File identities, paths, types, sizes and scan queues | Searchable corpus map; storage and format profile; processing priorities; discovered coverage gaps | The full MSCH corpus denominator is still unknown; MIME labels/extensions are metadata, not byte-level format validation |
| MSCS source checksums and extraction status | Integrity checks and duplicate candidates among files with verified source hashes | Only 1,059 of 1,867 files are recorded hashed; a manifest hash verifies the manifest, not every source file |
| Local/Main events, source IDs and checkpoints | Provenance, change tracking, reliable continuation and recovery | Acknowledged ledgers establish synchronization, not semantic correctness of source contents |
| AEC unit/rate/source/date/location/status/confidence columns | Source-linked rate lookup and compatible rate comparisons; cost build-ups when quantities and components are complete | Match specification, unit, locality, effective period, tax and transport basis; G076 terminal reconciliation remains open |

| Lane | Useful subsequent knowledge products | Work still needed |
| --- | --- | --- |
| MSCS | Cited literature search, topic maps, formula registry, study guides and evidence-backed question answering | Extract/OCR eligible documents, classify topics, preserve page citations and validate formulas; resolve oversized/native hashing policy |
| LSA | Syllabus coverage map, lecture search, revision notes and checked practice-question banks | Reconcile two missing historical identities; extract document text and transcribe lectures with timestamps; validate answers against sources |
| AEC | Material/labour benchmarks, rate-analysis components, quantity-times-rate estimates and scenario comparisons | Reconcile G076; normalize compatible units/specifications/dates/locations and preserve source/confidence before combining observations |
| MSCH | Dataset register, rainfall/runoff series, watershed summaries, parameter comparisons and reproducible model-result comparisons | Finish inventory, parse structured datasets, validate units/coordinates/time steps/missingness, and execute/calibrate models in a suitable environment |

These are possible products, not completed findings. File presence alone does not establish an engineering result, an exam answer or a supported current market price.

## Formats actually stored and why

| Output format | Verified role in this project | Why it is kept |
| --- | --- | --- |
| JSONL / NDJSON (.jsonl) | MSCS, LSA and MSCH machine manifests; queues, batch deltas or event logs where applicable | One structured record per line; supports incremental processing, streaming, validation and resumable batches |
| JSON (.json) | Progress, state, checkpoint evidence and source/page maps | Explicit structured state and nested evidence that code can validate and the website can consume |
| SQLite (.sqlite) | MSCS query index alongside its JSONL manifest | Portable relational queries and consistency checks without loading an entire manifest into a spreadsheet |
| Markdown (.md) | Read-first files, checkpoints, recovery and progress reports | Human-readable explanations and handoffs; easy to version and compare |
| Native Google Sheets | Local/Main registers; LSA occurrence register; AEC material and rate tables | Human review and structured rows with preserved native formatting and links |
| SHA-256 text (.sha256) | MSCS checksum list; checkpoint records also carry SHA-256 values | Detect byte changes for the specific object actually hashed; supports integrity checking |
| ZIP (.zip) | PRE rollback sets and run closeout archives | Package exact saved evidence for recovery; it is not the analytical database |
| HTML/CSS/JavaScript | Published Progress and roadmap projection | Readable presentation of the saved structured status, not a replacement for source evidence |

Original sources remain in their original formats. The inventories include PDFs, DOCX/ODT, XLSX/XLS/XLSM/CSV, presentations, images, MP4/MKV/MOV, archives, R/Python/notebooks, GIS files and HEC-HMS-related files. These have been catalogued to differing levels; they have not all been converted into text or JSON content. The independently read LSA manifest lists 266 MP4 and 68 MKV files; MSCS marks all 1,867 files not started or pending content extraction. These counts describe catalogue metadata, not completed transcripts or extracted document bodies.

The next useful transition is from inventory to a bounded, page- or timestamp-cited content batch, then normalized tables and validated derivations. Keep the original evidence, structured extraction and human-facing report linked rather than repeatedly copying the same information between formats.


⟦GOVTRACE | Controls: READ | Provider: VERIFIED | Mutation: YES | Readback: PASS | ProjectState: UPDATED | LocalLibrary: UPDATED | MainSync: SYNCED | Closeout: COMPLETE_FOR_THIS_RUN⟧

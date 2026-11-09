# Four-project extraction and investigation · Run 49

Run 49 resumed from Run 48 and reached verified Local/Main closeout in 23.2 minutes. The run window was capped at 60 minutes.

| Lane | Verified result | Local/Main | Next |
| --- | --- | --- | --- |
| MScH Hydropower | CP559/B559 added six file records and 18,383 metadata-reported bytes. The catalogue has 7,120 records and 562 folders queued. | 550/550 | B560, folder 52 |
| MSc Structural Engineering | AQ-CP103/B091 verified three original PDFs and 7,945,839 bytes. 1,107 of 1,867 files have original-byte hashes. | 23/23 | B092 |
| Lok Sewa | The CP80/B080 observed inventory is indexed. Three new proofs bring the provisional index to 51 verified occurrences and 31 distinct hashes. | 48/48 | B081 historical reconciliation |
| AEC Cost and Rate | G076 Part 16 added RO-2480 through RO-2484. Two unit deferrals closed. 995 prior VAT fields and 86 notes were reconciled. | 28/28 | Part 17, RO-2485 |

## Kaski source and corrections

The complete saved SRC-0005 PDF contains 14,346,379 bytes and has SHA-256 4ac52c49879355413fadbbcb1ec4e74c98e37f4a2724c8e58ea081cea8373947. The District Administration Office download reports the same byte count, and the District Coordination Committee lists the same fiscal year. The source page readings and hash come from the complete saved PDF. The public download size exceeded the research reader’s limit, so independent public-byte equality remains unverified. [District Administration Office](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-sa-va-ka-ta-ja-l-l-tharara-ta) · [District Coordination Committee](https://dcckaski.gov.np/detail/53)

The headings distinguish FY 2081/82, 2082/83 and 2083/84. Run 48’s NPR 500.00 bee-catching bag rate belongs to 2083/84. NPR 509.30 belongs to the two older columns. The cover and signed committee minutes establish approval on 2083-03-30 BS. The exact rate effective day and transport treatment were left unasserted.

| Observation | Source material | NPR/kg | Printed / PDF page | Decision |
| --- | --- | ---: | --- | --- |
| RO-2480 | Jetho Budho paddy seed | 219.00 | 35 / 40 | Verified current-year source row |
| RO-2481 | Masuli, Khumal and other paddy seed | 109.50 | 35 / 40 | Verified current-year source row |
| RO-2482 | Ram Dhan paddy seed, improved grade | 68.00 | 35 / 40 | Verified current-year source row |
| RO-2483 | Layer poultry manure | 9.27 | 34 / 39 | Recovered deferred unit from its own row |
| RO-2484 | Broiler poultry manure | 7.21 | 34 / 39 | Recovered deferred unit from its own row |

The two poultry rows on printed page 34 have separate kg cells. The material master retains one poultry manure identity with distinct rate variants. The two zero-valued seed headings on printed page 35 have blank unit cells and serve as section labels.

Other Decisions item 6 on printed page 75 (PDF page 80) excludes VAT from the listed rates. This corrected 995 previously unknown VAT flags on current, published SRC-0005 observations and set the same flag on five new rates. The 86 notes with earlier tax uncertainty now cite item 6. Twenty source-tagged rows lack the current and published labels used for the reconciliation. Other taxes and transport remain unasserted for the five new observations.

## Issue decisions

| Issue | Status | Evidence and what would close it |
| --- | --- | --- |
| Layer and broiler manure units | **RESOLVED** | The standalone kg cells are visible on printed p34 / PDF p39. RO-2483 is NPR 9.27/kg and RO-2484 is NPR 7.21/kg. Both rates passed canonical readback. |
| Kaski published-rate VAT basis | **RESOLVED** | Other Decisions item 6 on printed p75 / PDF p80 excludes VAT. Corrected 995 earlier published rows and 86 notes. The five new rates record the same VAT basis. |
| Kaski year columns and bee-catching bag | **RESOLVED** | Printed p35 / PDF p40 labels the three columns by fiscal year. NPR 500.00 is FY 2083/84 and NPR 509.30 belongs to the two earlier years. The current observation retains its source year and unit. |
| Two historical Lok Sewa NEA identities | **UNRESOLVED** | The earlier aggregate differs by two files and 9,304 bytes. Sixty-two new historical evidence files supplied no matching IDs. Find a Phase 1A identity export or provider event record. |
| Kaski goat manure unit | **UNRESOLVED** | The NPR 6.00 row has a blank unit on printed p34 / PDF p39. The reviewed searches yielded no authoritative correction. A same-district FY 2083/84 issuer clarification can close this row. |
| Kaski hive-with-colony unit | **UNRESOLVED** | The NPR 9,500.00 row has its own blank unit cell on printed p35 / PDF p40. Find an applicable correction or written issuer clarification. |
| Kaski chemical fertilizer rates | **UNRESOLVED** | Section 14(b) refers to the Government of Nepal rate. The source gives no numeric figure or product grade. Find the applicable government product, grade, price basis and effective period. |
| Kaski exact effective day | **UNRESOLVED** | The signed minutes show approval on 2083-03-30 BS. The source and posting review did not establish a distinct effective day. Find a notice or issuer decision specifying the effective date. |
| Transport basis for the new Kaski rates | **UNRESOLVED** | The reviewed material rows and general decisions do not establish transport treatment for these five observations. Find source terms for the specific materials. |
| MScS remaining integrity proofs | **INCOMPLETE** | 750 stored files still need original-byte hashes. Ten native files need format- and revision-labelled export proofs. Continue B092 with stored bytes and keep native export provenance separate. |
| MScH corpus coverage | **INCOMPLETE** | CP559 leaves 562 known folders queued. The full corpus denominator is unknown. Continue FIFO at B560, folder 52, and record newly discovered folders. |
| Corpus text, OCR and model work | **INCOMPLETE** | The current corpus evidence covers catalogue entries and selected original-byte integrity. Verify source coverage and retain page, recording or model provenance in the later content stage. |

## Lok Sewa investigation history

- The CP80 audit compared 140 live folder listings with the current manifest. Both had 1,242 observed records. The older aggregate expected 1,244, with one 4,652-byte difference in NEA Class files and one in NEA Standard files-Package.
- Run 47 compared the pre-B080 archive with all current IDs. Run 48 extended the comparison to 14 backups before B066 through B079. Both comparisons returned zero historical-only identities.
- Run 49 verified the bytes of 62 additional evidence files labelled B001 through B065. These included 51 manifests or deltas and 11 ZIP bundles. The comparison keyed on Drive IDs and checked names, MIME types, sizes and parents. It found zero archive-only IDs, zero shared metadata conflicts and no candidate for either 4,652-byte gap.
- Public searches using the corpus names and branch labels led to study material and NEA recruitment curricula. None of the reviewed public references identified the two historical private Drive occurrences. B081 needs the Phase 1A identity export or provider event evidence. [NEA curricula](https://www.nea.org.np/en/recruitment/open/ocurriculum) · [Run 48 report](https://github.com/pailapilates09-sys/CAD_Test-Facility/blob/f8c064ffc52807ff313bf673e48cb7f1990bf805/progress/recovery/2026-11-09-run48/cp558/report.md)

## MScS and MScH evidence boundaries

MScS selected three pending stored PDFs under the three-file, 5 MB per file and 10 MB cumulative policy. It checked parent and size, hashed the complete files, and reconciled the JSONL and SQLite identities and digests. The 760 pending occurrences include 750 stored files and ten Google-native files. Google documents stored binary downloads separately from Workspace exports, and its SHA-256 file field excludes Docs Editors files. Native export proofs need format and revision provenance. [Download and export](https://developers.google.com/workspace/drive/api/guides/manage-downloads) · [Drive file fields](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)

MScH compared two independent listings of FIFO folder 51 and appended six previously unseen stable IDs. It verified four current control files by exact bytes. The 562 queued entries describe the known folders pending review. Bulk text extraction, OCR, transcription and model interpretation remain incomplete across the three corpora.

## Search and validation log

| Topic | What was checked | Result |
| --- | --- | --- |
| Kaski source | District Administration and District Coordination postings, FY headers, signed minutes and PDF pages 39, 40 and 80 | Two units and the VAT rule resolved. Approval date recorded separately. |
| Kaski corrections | Same-district searches for an FY 2083/84 corrigendum and earlier rate postings | No authoritative correction located for the goat manure or hive-with-colony unit. Older periods and other districts could not establish the Kaski FY 2083/84 unit. |
| Chemical fertilizer | Government and agricultural-input price searches alongside the printed reference in 14(b) | No schedule was verified with the applicable product, grade, price basis and period for this line. |
| Lok Sewa | NEA recruitment curricula, exact archive and branch names, earlier manifests and prior live tree | The historical aggregate and observed tree reconcile only to their respective counts. The two IDs stay open. |
| MScS | Google Drive API file checksum and export guidance, original file hashes and canonical index agreement | Three stored PDFs advanced. Native proof requirements recorded separately. |

| Nepal time | Recorded event |
| --- | --- |
| 2026-11-09 10:35:42 NPT | Started Run 49 and opened the Run 48 publication boundary. |
| 2026-11-09 10:42:29 NPT | Confirmed scoped source and register predecessors. |
| 2026-11-09 10:44:04 NPT | Verified nine native PRE copies against their scoped source values and text. |
| 2026-11-09 10:49:07 NPT | Verified eight prepared rollback, normalization and historical comparison artifacts. |
| 2026-11-09 10:51:03 NPT | Read back all four prepared checkpoint receipts and the row-level VAT plan. |
| 2026-11-09 10:52:49 NPT | Read back five AEC rate rows, 995 VAT fields and 86 note repairs, then verified the master POST snapshot. |
| 2026-11-09 10:56:26 NPT | Verified source files, canonical writes and four lane closeout receipts. |
| 2026-11-09 10:58:11 NPT | Read back four Local registrations awaiting Main import. |
| 2026-11-09 10:58:19 NPT | Read back eight Main artifacts and nine lineage edges. |
| 2026-11-09 10:58:19 NPT | Recorded reciprocal acknowledgements at 550, 23, 48 and 28. |
| 2026-11-09 10:58:57 NPT | Verified all five Local/Main POST snapshots. |

The initial Pages build stopped when the issue register added a table to the protected progress page. The issue register now uses an expandable list so the existing table count passes the preservation check. The live check verifies the rendered issue states and published report, status, chart data and reference files. [Live dashboard](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/#evidence-dashboard) · [Pages workflow](https://github.com/pailapilates09-sys/CAD_Test-Facility/actions/workflows/pages.yml) · [Checkpoint version history](https://github.com/pailapilates09-sys/CAD_Test-Facility/commits/main/src/live-phase.mjs)

# Four-project extraction and investigation · Run 50

Run 50 resumed from the verified Run 49 boundary. Local and Main closeout took 18.0 minutes within the 60-minute run window.

| Lane | Verified result | Local/Main | Next |
| --- | --- | --- | --- |
| MScH Hydropower | CP560/B560 added four records and 20,760 metadata-reported bytes. The catalogue has 7,124 records and 561 queued folders. | 551/551 | B561, folder 53 |
| MSc Structural Engineering | AQ-CP104/B092 verified three stored PDFs. 1,110 of 1,857 stored originals have SHA-256 checksums. All ten Google-native exports have separate proof. | 24/24 | B093 |
| Lok Sewa | Three more originals verified. The provisional index has 54 verified occurrences and 34 distinct digests. | 49/49 | B081 historical reconciliation |
| AEC Cost and Rate | G076 Part 17 verified three improved-grade paddy seed rates, RO-2485 to RO-2487. | 29/29 | Part 18, RO-2488 |

## Sources compared and decisions applied

| Issue | Options reviewed | Selected action and outcome |
| --- | --- | --- |
| MScS native proof | Original file checksum field, decoded revision text, CSV, and supported Office-format exports | Selected DOCX and XLSX. Verified all ten exports against an unchanged visible Drive revision and modified time before and after capture. Archived and verified the exact bytes privately. |
| Lok Sewa historical identities | Blank mirror rows, older binary revisions, previously preserved manifests, and folder-scoped activity | The mirror rows contain zero IDs and sit between APEX records. Two historical revision requests returned HTTP 403. Prepared a folder-scoped Drive Activity query as the strongest remaining route. The current connection has no activity access. |
| Kaski fertilizer | Current Kaski source, government supplier notice effective 2080-04-01 BS, earlier Pokhara FY 2081/82 decision and market listings | Kept the dated references as evidence. The reviewed sources do not establish the applicable product and price basis for the FY 2083/84 Kaski line. |
| Kaski units and dates | Signed current-year district schedule, issuer listings and corrigendum searches, older schedules, and Nepal’s fiscal-year definition | Applied explicit units to the three current rows. The fiscal-year definition gives context for the year label. The two blank units and exact effective day still need issuer evidence. |

### MScS native exports

Google lists DOCX and XLSX as supported export formats and limits CSV to the first sheet. The available revision read returned decoded content in both probes. The selected supported export route returned files that could be hashed and preserved. Before and after each capture, the observed Drive revision, visible revision list, modified time, identity and parent agreed. ZIP CRC and required Open XML parts passed for seven DOCX and three XLSX files. The 218,838 export bytes are recorded separately from stored-original SHA-256 checksums. [Google export formats](https://developers.google.com/workspace/drive/api/guides/ref-export-formats) · [Export method](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/export) · [Revision list](https://developers.google.com/workspace/drive/api/reference/rest/v3/revisions/list) · [Drive checksum field](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)

The archive still contains 1,867 observed files. The dashboard’s stored-original denominator now counts the 1,857 stored files. Of these, 1,110 are verified and 747 are pending. The ten native files are shown in their own export-proof count. The three new original files contributed 8,118,225 verified bytes.

### Lok Sewa historic identity check

The August Phase 1A record is aggregate evidence. The two branch differences are 4,652 bytes each. CP80 observed 1,242 records. Run 48’s 14 backups and Run 49’s 62 older evidence files yielded no historic-only IDs. Run 50 checked both blank rows across the sixteen native manifest columns and the two raw revisions. Drive listed 78 revisions, none marked Keep Forever. Google limits downloads of older binary revisions to those with that retention flag. The two 403 responses establish an access limit for the attempted reads. [Drive revision guidance](https://developers.google.com/workspace/drive/api/guides/manage-revisions) · [Run 49 report](https://github.com/pailapilates09-sys/CAD_Test-Facility/blob/779c5ca9f3c2add8026305bc69c167c92adb115b/progress/recovery/2026-11-09-run49/cp559/report.md)

The preferred next evidence is an authorized, folder-scoped export of MOVE, DELETE and RESTORE events for the two branches from the August audit through the October reconciliation. It must identify the file target and link it to the historical occurrence. An original Phase 1A inventory with stable IDs is equally direct evidence. The issue remains unresolved. [Drive Activity query](https://developers.google.com/workspace/drive/activity/v2/reference/rest/v2/activity/query) · [Drive Activity target fields](https://developers.google.com/workspace/drive/activity/v2/reference/rest/v2/activity/driveitem)

### Kaski Part 17 source and interpretation

The official postings identify the FY 2083/84 Kaski schedule. The saved SRC-0005 PDF was read in full for byte verification. Its SHA-256 is 4ac52c49879355413fadbbcb1ec4e74c98e37f4a2724c8e58ea081cea8373947. The rightmost fiscal-year column on printed page 35 (PDF page 40) supplies the three values below. Each row prints kg. The VAT-excluded basis comes from printed page 75 (PDF page 80), Other Decisions item 6. [Kaski District Administration Office](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-sa-va-ka-ta-ja-l-l-tharara-ta) · [Kaski District Coordination Committee](https://dcckaski.gov.np/detail/53)

| Observation | Improved-grade seed | NPR/kg | Printed / PDF page |
| --- | --- | ---: | --- |
| RO-2485 | Sunalo Sugandha paddy seed, improved grade | 80.00 | 35 / 40 |
| RO-2486 | Sabitri paddy seed, improved grade | 78.00 | 35 / 40 |
| RO-2487 | Jetho Budho paddy seed, improved grade | 200.00 | 35 / 40 |

Jetho Budho retains one variety identity with two distinct observations. Part 16’s grade-unspecified rate is NPR 219.00/kg. Part 17’s improved-grade rate is NPR 200.00/kg.

The government supplier notice is titled as effective from 2080-04-01 BS. The Pokhara report concerns the FY 2081/82 distribution programme and a depot-distance price basis. The Kaski FY 2083/84 row refers to the Government of Nepal rate without an amount. The exact effective day, transport terms, goat manure unit and hive-with-colony unit remain unresolved. [Supplier notice](https://kscl.gov.np/content/47/ship-price-of-chemical-fertilizer-which-has/) · [Pokhara historical report](https://gorkhapatraonline.com/news/118241) · [Nepal Law Commission fiscal procedures act](https://lawcommission.gov.np/content/13412/economic-procedures-and-financial-affairs-act--2076/)

## Issue register

| Issue | State | Evidence and closure requirement |
| --- | --- | --- |
| Layer and broiler manure units | **RESOLVED** | The standalone kg cells are visible on printed p34 / PDF p39. RO-2483 is NPR 9.27/kg and RO-2484 is NPR 7.21/kg. Both rates passed canonical readback. |
| Kaski published-rate VAT basis | **RESOLVED** | Other Decisions item 6 on printed p75 / PDF p80 excludes VAT. Corrected 995 earlier published rows and 86 notes. The five new rates record the same VAT basis. |
| Kaski year columns and bee-catching bag | **RESOLVED** | Printed p35 / PDF p40 labels the three columns by fiscal year. NPR 500.00 is FY 2083/84 and NPR 509.30 belongs to the two earlier years. The current observation retains its source year and unit. |
| Two historical Lok Sewa NEA identities | **UNRESOLVED** | The two blank mirror rows have no IDs and sit between APEX rows. Two older raw manifest revision reads returned HTTP 403. The historical NEA identities remain unresolved. Obtain an authorized folder-scoped Activity export or the Phase 1A identity inventory. |
| Lok Sewa blank mirror rows | **RESOLVED** | Rows 345 and 355 have zero file IDs in the 16 manifest columns. Adjacent records are APEX entries. Keep the blanks outside source identity counts. |
| Kaski goat manure unit | **UNRESOLVED** | The NPR 6.00 row’s unit cell is blank on printed p34 / PDF p39. Current issuer and corrigendum searches did not establish its unit. Find a same-district FY 2083/84 issuer clarification. |
| Kaski hive-with-colony unit | **UNRESOLVED** | The NPR 9,500.00 row’s unit cell is blank on printed p35 / PDF p40. The reviewed current issuer sources leave it open. Find an applicable written correction or issuer clarification. |
| Kaski chemical fertilizer rates | **UNRESOLVED** | The Kaski source gives a government-rate reference without a number. The supplier notice is dated from 2080-04-01 BS and the Pokhara decision concerns FY 2081/82. Find the applicable product, grade, channel, price basis and effective period for FY 2083/84. |
| Kaski exact effective day | **UNRESOLVED** | The approval date is 2083-03-30 BS. The fiscal-year definition explains the year label. The reviewed Kaski postings did not establish a distinct rate effective day. Find an issuer decision specifying the date. |
| Transport basis for the new Kaski rates | **UNRESOLVED** | The source rows specify kg and rates. Reviewed material rows and general decisions leave transport unspecified for these three observations. Find source terms for the specific seed rows. |
| MScS native export verification | **RESOLVED** | All ten native files have verified exports, seven DOCX and three XLSX. Drive revision and modified time matched across capture. Exact export bytes are archived privately. Use the separate native proof ledger for these files. |
| MScS stored original checksums | **INCOMPLETE** | 1,110 of 1,857 stored files have original-byte checksums. 747 are pending. Ten native files have a separate proof count. Continue the bounded B093 stored-byte batch. |
| MScH corpus coverage | **INCOMPLETE** | CP560 leaves 561 known folders queued. The full corpus denominator is unknown. Continue B561, folder 53. |
| Corpus text, OCR and model work | **INCOMPLETE** | The corpus evidence now includes catalogue entries, selected byte proofs and a verified native-export set. Bulk text extraction, OCR and model work remain incomplete. Verify source coverage and retain page, recording or model provenance in the later content stage. |

## Run timeline

| Nepal time | Recorded event |
| --- | --- |
| 2026-11-10 19:12:33 NPT | Started Run 50 from the verified Run 49 boundary. |
| 2026-11-10 19:17:03 NPT | Verified the bytes of 27 source and control inputs. |
| 2026-11-10 19:18:33 NPT | Verified nine native PRE snapshots. |
| 2026-11-10 19:23:34 NPT | Read back nine prepared artifacts, including the ten native exports and proof index. |
| 2026-11-10 19:25:43 NPT | Read back all four prepared lane receipts and confirmed stable predecessor metadata. |
| 2026-11-10 19:26:15 NPT | Verified three new AEC rate rows and the master POST snapshot. |
| 2026-11-10 19:28:24 NPT | Verified canonical source bytes and all four lane closeout receipts. |
| 2026-11-10 19:29:39 NPT | Verified four Local registrations awaiting Main import. |
| 2026-11-10 19:29:47 NPT | Verified eight Main artifacts and nine lineage edges. |
| 2026-11-10 19:29:47 NPT | Recorded reciprocal acknowledgements at 551, 24, 49 and 29. |
| 2026-11-10 19:30:30 NPT | Verified all five Local/Main POST snapshots. |

The published issue register and this report are checked by the Pages build and deployment workflow. [Live issue register](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/#extraction-issues) · [Checkpoint version history](https://github.com/pailapilates09-sys/CAD_Test-Facility/commits/main/src/live-phase.mjs)

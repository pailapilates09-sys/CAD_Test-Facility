# Four-in-one extraction · Run 52

14 November 2026, Nepal time. Run 52 advanced all four lanes from the verified Run 51 checkpoint. The source receipts, Local and Main acknowledgements, and native POST snapshots were verified by 11:12:09 NPT. The run opened at 10:50:39 NPT with a cutoff of 11:50:39 NPT.

[Live dashboard](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/) · [Issue register](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/#extraction-issues) · [Run 51 report](https://github.com/pailapilates09-sys/CAD_Test-Facility/blob/925ac235255d3eb9cbae05b45c01d60a050ed339/progress/recovery/2026-11-13-run51/cp561/report.md) · [GitHub Actions](https://github.com/pailapilates09-sys/CAD_Test-Facility/actions/workflows/pages.yml)

| Lane | Verified result | Local / Main | Resume |
| --- | --- | ---: | --- |
| MScH Hydropower | CP562/B562 consumed FIFO folder 54 after two complete direct listings agreed. Added 15 files and 52,608 metadata-reported bytes. The catalogue has 7,146 records, comprising 5,987 files and 1,159 folders. The scan queue has 554 scanned and 559 pending folders. | 553 / 553 | B563, folder 55 |
| MSc Structural Engineering | AQ-CP106/B094 verified three stored PDFs and 7,928,317 original bytes. All three checksums match content already represented by other stable IDs. Original-byte coverage is 1,116 of 1,857, with 741 pending. Ten Google-native files have separate export proofs. | 26 / 26 | B095 |
| Lok Sewa | The CP80/B080 inventory retains 1,242 records. Three additional PDF occurrences brought the provisional index to 60 verified occurrences and 35 distinct hashes. Two historical NEA identities remain open. | 51 / 51 | B081 historical reconciliation |
| AEC Cost and Rate | G076 Part 19 wrote five foundation-grade paddy seed observations from Kaski's current district schedule. All five rows and the source note passed exact native readback. | 31 / 31 | Part 20, RO-2502, wheat seed |

## Kaski foundation-grade paddy seed

The signed FY 2083/84 schedule gives the rate and kg unit on printed page 35 (PDF page 40), section 14(d), in the rightmost year column. The preceding year's DCC schedule corroborates the five figures in its own FY 2082/83 column. The observations use the current schedule and reuse five existing material IDs. Other Decisions item 6 (printed p75 / PDF p80) excludes VAT from the district schedule. Effective day and transport remain unresolved. [Current District Administration Office schedule](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-sa-va-ka-ta-ja-l-l-tharara-ta) · [Current DCC publication](https://dcckaski.gov.np/detail/53) · [Predecessor PDF, page 40](https://dcckaski.gov.np/dcc-notice-file/Notices-202508031300507062.pdf#page=40)

| Observation | Variety | NPR/kg |
| --- | --- | ---: |
| RO-2497 | Ram Dhan | 94.00 |
| RO-2498 | Sunalo Sugandha | 94.05 |
| RO-2499 | Jetho Budho | 285.00 |
| RO-2500 | Sabitri | 90.00 |
| RO-2501 | Other paddy | 89.00 |

## Research decisions

| Issue | State | Evidence and result |
| --- | --- | --- |
| Kaski goat manure unit | **UNRESOLVED** | Current printed p34 / PDF p39 gives NPR 6.00 and leaves the unit cell blank. The predecessor's same subsection has no corresponding goat-manure entry. The neighbouring explicit kg labels belong to other items. The district issuer would need to identify the unit for the exact row. [Current schedule](https://dcckaski.gov.np/detail/53) · [Predecessor PDF, page 39](https://dcckaski.gov.np/dcc-notice-file/Notices-202508031300507062.pdf#page=39) |
| Kaski hive-with-colony unit | **UNRESOLVED** | The current and predecessor schedules both print NPR 9,500.00 for this item and leave the unit cell blank. Both give a unit to a separate hive-only row. The recurring blank rules out using the predecessor to fill the unit. [Current schedule](https://dcckaski.gov.np/detail/53) · [Predecessor PDF, page 39](https://dcckaski.gov.np/dcc-notice-file/Notices-202508031300507062.pdf#page=39) |
| Kaski district chemical fertilizer price | **UNRESOLVED** | Both district schedules defer to a Government of Nepal rate and give no numeric rate in section 14(b). The signed ministry procedure distinguishes import-point, depot and outlet prices. Pokhara's published workbook establishes a city farmer-outlet price at 1 km. The Kaski row still needs an applicable instruction specifying the district price tier, products and effective period. [Current schedule](https://dcckaski.gov.np/detail/53) · [Predecessor PDF, page 39](https://dcckaski.gov.np/dcc-notice-file/Notices-202508031300507062.pdf#page=39) · [Ministry procedure](https://moald.gov.np/content/318/grant-manufacturing-management-procedure--2082/) · [Pokhara notice](https://www.pokharakrishi.com/notice) |
| Pokhara fertilizer per-50 kg calculator | **UNRESOLVED** | The original workbook's B6:B8 and C6:C8 read the external price sheet's B:D and E:G respectively, at the distance in C3. The embedded cache contains 30 distances. Displaying values to two decimals, 50 times the per-kg column exceeds the cached bag column in all 90 comparisons, by NPR 64.00–177.40. At 1 km the cached bag prices equal the static depot amounts B14:D14. Keep the existing farmer kg observations under SRC-0008. A corrected workbook or municipal explanation is needed for a farmer bag-price observation. [City notice](https://www.pokharakrishi.com/notice) · [Published workbook](https://www.pokharakrishi.com/sites/default/files/Chemical%20fertilizer%20rate%20list%202083.84.xlsx) |
| Kaski exact commencement day | **UNRESOLVED** | The signed minutes on PDF pp6–7 give an approval date of 2083-03-30 BS. The issuer pages record publication for FY 2083/84. A separate commencement instruction for these rates was unverified. [District Administration Office](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-sa-va-ka-ta-ja-l-l-tharara-ta) · [District Coordination Committee](https://dcckaski.gov.np/detail/53) |
| Kaski seed transport | **UNRESOLVED** | The individual foundation-grade entries give kg and rates. The compared seed tables and current general decisions yielded no item-specific transport terms. The five native rows retain Unknown for transport. [Current schedule](https://dcckaski.gov.np/detail/53) · [Predecessor PDF, page 40](https://dcckaski.gov.np/dcc-notice-file/Notices-202508031300507062.pdf#page=40) |
| Two Lok Sewa historical NEA identities | **UNRESOLVED** | The provisional FTS5 index retains every observed identity. The current 1,242-record inventory and older aggregate differ by two files and 9,304 bytes. Past revision probes returned HTTP 403 and the blank mirror rows contain no IDs. A fresh search did not find an identity-level Phase 1A inventory. A folder-scoped Activity export with item IDs is the best remaining route. Workspace Drive log events may supply those IDs if the owner has applicable records and access. [Drive Activity query](https://developers.google.com/workspace/drive/activity/v2/reference/rest/v2/activity/query) · [Drive revisions](https://developers.google.com/workspace/drive/api/guides/manage-revisions) · [Workspace Drive log events](https://support.google.com/a/answer/4579696) |
| Corpus coverage and content | **INCOMPLETE** | The known hydropower queue has 559 folders. MScS has 741 stored files awaiting original-byte hashes. Ten native exports remain separately verified. Corpus OCR, transcripts, semantics and model execution remain pending. |

## Checkpoint and history

| Nepal time | Verified event |
| --- | --- |
| 10:50:39 | Opened the bounded run and checked the published Run 51 checkpoint against provider evidence. |
| 11:02:34 | Read back the last of the changed MScH inventory and queue documents during source promotion. The project state and checkpoint receipt followed. |
| 11:05:48 | The last of the four lane receipts passed exact byte readback. |
| 11:09:45 | Main artifacts, lineage edges and the four notices passed exact range readback. |
| 11:10:20 | Verified all four reciprocal Local delivery rows. |
| 11:12:09 | Verified the last of nine native POST snapshots. |

MScH's two listings agreed on all 15 new IDs, names, types and sizes. MScS's canonical JSONL and SQLite agree on all 1,116 stored-source hashes. Lok Sewa's current and previous SQLite occurrence tables match exactly. The updated query layer passed SQLite integrity, foreign-key, source-size join and FTS row-count checks. The AEC master readback compared the original previous row, the five new rows and the appended source note. Main readback verified eight artifacts, nine lineage edges and four acknowledged notices.

| Lane receipt | Bytes | SHA-256 |
| --- | ---: | --- |
| MScH CP562/B562 | 13,860 | `dfc601a68adab14ebd32382361e850ab0dc418030ae93ab057a048123d62c694` |
| MScS AQ-CP106/B094 | 9,266 | `8ab745e75ea035fd5be8b5edb4dea921e030aebd9cae2815345947e3d3b3c552` |
| Lok Sewa Run 52 | 3,871 | `82abcbaa38eaab2d99e1a070b70b666b0cce5172333071eb0c311296c87f73ad` |
| AEC G076 Part 19 | 8,167 | `04893507cdc939b215af5d9cd37fa88aa46b5a65431951f80b056eae081d32e4` |
| Kaski current publisher PDF | 14,346,379 | `4ac52c49879355413fadbbcb1ec4e74c98e37f4a2724c8e58ea081cea8373947` |
| Kaski predecessor DCC PDF | 15,500,193 | `7ec907b0088f4a3e4e03fc84722328bd52e51409894549794770e713975fe3a3` |
| Pokhara publisher workbook | 15,000 | `872a7b0948d23dddcb076129cbbe4f2be3a64d8c6ab087df209b8f0bcfd0edca` |

[Run 51 publication commit](https://github.com/pailapilates09-sys/CAD_Test-Facility/commit/925ac235255d3eb9cbae05b45c01d60a050ed339) · [Published checkpoint history](https://github.com/pailapilates09-sys/CAD_Test-Facility/commits/main/src/live-phase.mjs)

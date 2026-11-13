# Four-in-one extraction · version 6 · Run 51

13 November 2026, Nepal time. Version 6 resumed Run 51 after the previous chat reached its length limit. The four source checkpoints survived in Drive. Their Local and Main registers and the public dashboard still showed Run 50 at the start of this recovery. The source pass and the recovery are distinct events in the timeline.

[Dashboard](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/) · [Issue register](https://pailapilates09-sys.github.io/CAD_Test-Facility/progress/#extraction-issues) · [Run 50 report](https://github.com/pailapilates09-sys/CAD_Test-Facility/blob/87d5ce0dc40d9b0d77298ced7d98015cb0d1f6b6/progress/recovery/2026-11-10-run50/cp560/report.md) · [GitHub Actions](https://github.com/pailapilates09-sys/CAD_Test-Facility/actions/workflows/pages.yml)

| Lane | Recovered and verified | Local / Main | Resume |
| --- | --- | ---: | --- |
| MScH Hydropower | CP561/B561 added seven file records and 25,164 metadata bytes. The manifest has 7,131 records, comprising 5,972 files and 1,159 folders. The known queue has 553 scanned and 560 pending folders. | 552 / 552 | B562, folder 54 |
| MSc Structural Engineering | AQ-CP105/B093 added three original PDF checksums and 7,594,631 verified bytes. Original-byte coverage is 1,113 of 1,857 stored files, with 744 pending. Ten Google-native export proofs are recorded separately. | 25 / 25 | B094 |
| Lok Sewa | CP80/B080 inventory still has 1,242 records. Three more original PDFs raised verified occurrences to 57. Each matched an existing digest, leaving 34 distinct hashes. Two historical NEA identities remain unresolved. | 50 / 50 | B081 historical reconciliation |
| AEC Cost and Rate | G076 Part 18 contains six Kaski paddy seed rates and three Pokhara fertilizer rates. All nine canonical rows passed source and spreadsheet readback. | 30 / 30 | Part 19, RO-2497 |

## Source decisions

### Kaski seed rates

The signed district schedule identifies the FY 2083/84 figures in the rightmost year column of printed page 35 (PDF page 40). Section 14(d) supplies the seed grade and kg unit. Other Decisions item 6 on printed page 75 (PDF page 80) excludes VAT from the district schedule. Seed transport and the exact effective day stay unasserted. [District Administration Office schedule](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-ta-ja-l-l-tharara-ta) · [District Coordination Committee posting](https://dcckaski.gov.np/detail/53)

| Observation | Variety | Grade | NPR/kg |
| --- | --- | --- | ---: |
| RO-2488 | Other paddy | Improved | 73.00 |
| RO-2489 | Ram Dhan | Certified | 84.00 |
| RO-2490 | Sunalo Sugandha | Certified | 86.00 |
| RO-2491 | Sabitri | Certified | 84.00 |
| RO-2492 | Jetho Budho | Certified | 275.50 |
| RO-2493 | Other paddy | Certified | 84.00 |

### Pokhara fertilizer rates

The city’s 26 August 2026 notice links the workbook for the 2083-04-28 BS committee decision. The published workbook and the archived copy had identical SHA-256. The static farmer sale row, Sheet1 B21:D21, has the 1 km depot-to-outlet basis in row 18. Row 10 excludes the plastic bag. Tax treatment and the exact effective day remain unspecified. These observations use the Pokhara source ID SRC-0008. [Official notice](https://www.pokharakrishi.com/notice) · [Original workbook](https://www.pokharakrishi.com/sites/default/files/Chemical%20fertilizer%20rate%20list%202083.84.xlsx)

| Observation | Product | Farmer NPR/kg | 50 × farmer price, derived NPR | Calculator C6:C8 at 1 km, NPR |
| --- | --- | ---: | ---: | ---: |
| RO-2494 | Urea | 19.45 | 972.50 | 908.50 |
| RO-2495 | DAP | 48.45 | 2,422.50 | 2,358.50 |
| RO-2496 | Potash | 36.45 | 1,822.50 | 1,758.50 |

Rows 14–20 independently support the static farmer prices. For urea, NPR 908.50 ÷ 50 plus NPR 0.20/kg handling, NPR 0.077/kg transport at 1 km and NPR 1/kg management gives NPR 19.447/kg, which rounds to NPR 19.45/kg. The same calculation reproduces the other two prices. The calculator’s externally linked bag cells equal the three depot prices at 1 km. All three are NPR 64 below the respective 50 × farmer price. The derived figures are arithmetic checks. The issuer must confirm the calculator’s intended bag price. [Original workbook](https://www.pokharakrishi.com/sites/default/files/Chemical%20fertilizer%20rate%20list%202083.84.xlsx)

The signed national procedure distinguishes the import point, distributor sales offices and local outlet sale. Section 11(3)–(4) assigns local outlet pricing to local committees using distributor prices, transport and a management allowance. The older supplier notice, national procedure and current Pokhara workbook describe different price bases. Kaski section 14(b) refers to the Government of Nepal rate. The applicable government or district order must identify which tier and period it means. [Signed procedure, section 11](https://www.thahakhabar.com/uploads/pdf/ministy-1777634858.pdf#page=6) · [Ministry publication register](https://moald.gov.np/category/chemical-feces/?page=3) · [Earlier supplier notice](https://kscl.gov.np/content/47/ship-price-of-chemical-fertilizer-which-has/)

## Open issues reviewed

| Issue | State | Evidence and next step |
| --- | --- | --- |
| Two historical NEA file identities | **UNRESOLVED** | The current occurrence inventory and SQLite agree. The earlier baseline gives one 4,652-byte variance in each NEA branch. The new PDF hashes match known content. The two blank mirror rows carry no IDs and older revision probes were forbidden. An authorized branch-scoped Drive Activity export or the original Phase 1A stable-ID inventory is needed. [Activity query](https://developers.google.com/workspace/drive/activity/v2/reference/rest/v2/activity/query) · [Revision rules](https://developers.google.com/workspace/drive/api/guides/manage-revisions) |
| Kaski goat manure unit | **UNRESOLVED** | PDF p39 shows NPR 6.00 and a blank unit cell. Nearby kg entries have explicit cells. Searches of the district issuer and agricultural notices yielded no correction for this row. [Kaski schedule](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-sa-va-ka-ta-ja-l-l-tharara-ta) |
| Kaski hive with colony unit | **UNRESOLVED** | PDF p40 shows NPR 9,500.00 and a blank unit cell. The older Rupa beekeeping program describes its own scope. A written clarification for the district schedule row is needed. [Kaski schedule](https://dcckaski.gov.np/detail/53) · [Rupa program](https://www.rupamun.gov.np/) |
| Kaski district-wide fertilizer applicability | **UNRESOLVED** | District section 14(b) gives no number. Keep the verified Pokhara prices at their city-specific price tier until an applicable government or district order is found. [Kaski schedule](https://dcckaski.gov.np/detail/53) · [National procedure](https://www.thahakhabar.com/uploads/pdf/ministy-1777634858.pdf#page=6) |
| Pokhara fertilizer calculator bag prices | **UNRESOLVED** | The workbook displays the depot figures in the bag column at 1 km. The static per-kg farmer prices reconcile against the workbook inputs. A corrected workbook or written issuer explanation would close the bag-price issue. [Official workbook](https://www.pokharakrishi.com/sites/default/files/Chemical%20fertilizer%20rate%20list%202083.84.xlsx) |
| Kaski exact effective day and seed transport | **UNRESOLVED** | The signed minutes on PDF pp6–7 record approval on 2083-03-30 BS. The district publication dates and fiscal-year label are separate. Neither the reviewed seed rows nor the general terms give row-specific seed transport or an exact commencement date. [District Administration Office](https://daokaski.moha.gov.np/post/ka-sa-ka-ja-l-l-ka-aa-va-ka-sa-va-ka-ta-ja-l-l-tharara-ta) · [District Coordination Committee](https://dcckaski.gov.np/detail/53) |
| MScH folder coverage and MScS original hashes | **INCOMPLETE** | MScH has 560 known folders queued. MScS has 744 stored originals awaiting hashes. The 10 native export proofs remain verified. |
| Corpus text, OCR, transcripts and models | **INCOMPLETE** | This closeout covers inventory, byte verification and AEC source rows. Full content extraction and model work remain pending. |

## Verification and history

| Nepal time | Recorded event |
| --- | --- |
| 18:07:41 | Run 51 source receipts recorded the saved four-lane boundary. |
| 18:21:45 | Version 6 recovery started. Pages and GitHub main still projected Run 50. |
| 18:40:17 | Registered the four recovered Local events once, after matching evidence to the predecessor controls. |
| 18:42:04 | Imported eight Main artifacts and nine lineage edges, then read back the four notices. |
| 18:44:56 | Verified reciprocal Local acknowledgement and delivery rows. |
| 18:47:20 | Verified all nine native POST snapshots, including the AEC master and the three MScS control documents. |

The recovery rehashed all six source PDFs. MScH’s seven occurrence IDs agree with the source folder listing and the prior manifest differs only in those additions and folder 53’s scanned status. MScS JSONL and SQLite agree on 2,187 identities and their checksum fields. Lok Sewa’s two SQLite versions agree on all 1,242 observed records. The latest SQLite passes integrity and foreign-key checks. The AEC master was compared against the before snapshot and the nine saved observations.

| Evidence receipt | Bytes | SHA-256 |
| --- | ---: | --- |
| MScH CP561/B561 | 8,595 | `3e4242007639366d1065ba128af1736cf93e1457227e94e4c084f6646c6eac8b` |
| MScS AQ-CP105/B093 | 10,051 | `d0fc818041dc46933f446eab2a816ffcf796381b9c91df296c68333cc7cbc85e` |
| Lok Sewa Run 51 | 17,355 | `b2c4c1ac5266030ee5f89932a759d87289027508924ea31c43b4a4b9f59198cd` |
| AEC G076 Part 18 | 17,911 | `5c6898dabcc3a625fd2e14005822044499d2d5cf72f47d2eb5f413df83f23c12` |
| Pokhara publisher workbook | 15,000 | `872a7b0948d23dddcb076129cbbe4f2be3a64d8c6ab087df209b8f0bcfd0edca` |
| Kaski official schedule | 14,346,379 | `4ac52c49879355413fadbbcb1ec4e74c98e37f4a2724c8e58ea081cea8373947` |

[Run 50 dashboard commit](https://github.com/pailapilates09-sys/CAD_Test-Facility/commit/87d5ce0dc40d9b0d77298ced7d98015cb0d1f6b6) · [Run 49 report](https://github.com/pailapilates09-sys/CAD_Test-Facility/blob/779c5ca9f3c2add8026305bc69c167c92adb115b/progress/recovery/2026-11-09-run49/cp559/report.md) · [Checkpoint commit history](https://github.com/pailapilates09-sys/CAD_Test-Facility/commits/main/src/live-phase.mjs)

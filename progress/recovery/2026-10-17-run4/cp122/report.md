# Four-project extraction — verified run closeout

The user-authorized source window lasted 60.01 minutes.

The initial30 pending MSCH events (Local66–95) were acknowledged without replay. Recovered CP104 held1549 records. This run has saved 18 new checkpoints and added108 catalogue records.

| Lane | Current stage | Local/Main | Remaining |
|---|---|---|---|
| MSCH | CP122 / 1657 records: 344 folders +1313 files | 113/113 | 184 FIFO folders; next B123 Duration_graph |
| LSA | CP80 /1242 occurrences |31/31|Historical2-file /9304-byte discrepancy|
| MSCS |AQ-CP87 /1059 hashed|6/6|808 files deferred; policy gate|
| AEC CR02 |Existing G076 PART1 rows retained|11/11|Original terminal unavailable; lock reconciliation|

## New source checkpoints

| Batch | Checkpoint | New records | Records after | Main ACK |
|---|---|---:|---:|---|
|B105|CP105|0|undefined|ACKED|
|B106|CP106|19|undefined|ACKED|
|B107|CP107|15|undefined|ACKED|
|B108|CP108|6|undefined|ACKED|
|B109|CP109|4|undefined|ACKED|
|B110|CP110|2|undefined|ACKED|
|B111|CP111|1|undefined|ACKED|
|B112|CP112|20|undefined|ACKED|
|B113|CP113|1|undefined|ACKED|
|B114|CP114|3|undefined|ACKED|
|B115|CP115|1|undefined|ACKED|
|B116|CP116|12|undefined|ACKED|
|B117|CP117|11|undefined|ACKED|
|B118|CP118|4|undefined|ACKED|
|B119|CP119|1|undefined|ACKED|
|B120|CP120|1|undefined|ACKED|
|B121|CP121|3|undefined|ACKED|
|B122|CP122|4|undefined|ACKED|

CURRENT files retain their stable IDs and pass exact provider byte/SHA-256 readback. Source PRE archives include raw source metadata and Local CellData rollback snapshots; Local POST snapshots pass ZIP CRC and exact provider hashes. Complete folder lists are independently confirmed, children checked by exact ID/parent and new child folders appended to FIFO. A verified empty folder closes a queue item and adds no records.

This run advances metadata cataloguing, not document/video/semantic content extraction. No source object, source body, executable model, permission or scheduler was changed. LSA/MSCS/AEC source-stage gates remain. Private source IDs and raw engineering/rate data are excluded from this public report.

## Preservation

Earlier CAD, estimate versions and progress snapshots remain available. Rollback branch: rollback/before-recovered-extraction-run4-20261017.

Incomplete / Remaining: 0 MSCH acknowledgements; 184 FIFO folders; LSA baseline reconciliation; MSCS oversized/native hashing policy; AEC original terminal recovery; source-content extraction and semantic QA.


## Runtime incident and continuation

The host executor/file-transfer runtime disconnected during the final combined ACK POST upload. Source checkpoints and their Local records were already saved. The failed upload was checked for existence; the final ACK POST was recovered as five native Sheets tables with exact provider readback. Local/Main113/113 and N109 ACK were verified.

49 exact-ID/parent source items in four upcoming FIFO folders are preserved as unpromoted preflight evidence. Canonical CP122 remains unchanged; B123 is next. Restore file-transfer access before promoting those raw CURRENT changes. Source objects and source bodies were unchanged.

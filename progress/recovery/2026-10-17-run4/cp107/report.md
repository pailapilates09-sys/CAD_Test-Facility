# Four-project extraction — saved active checkpoint

This is an intermediate saved checkpoint; the minimum60-minute source window is still running.

The initial30 pending MSCH events (Local66–95) were acknowledged without replay. Recovered CP104 held1549 records. This run has saved 3 new checkpoints and added34 catalogue records.

| Lane | Current stage | Local/Main | Remaining |
|---|---|---|---|
| MSCH | CP107 / 1583 records: 298 folders +1285 files | 98/98 | 153 FIFO folders; next B108 Saved data for R programming |
| LSA | CP80 /1242 occurrences |31/31|Historical2-file /9304-byte discrepancy|
| MSCS |AQ-CP87 /1059 hashed|6/6|808 files deferred; policy gate|
| AEC CR02 |Existing G076 PART1 rows retained|11/11|Original terminal unavailable; lock reconciliation|

## New source checkpoints

| Batch | Checkpoint | New records | Records after | Main ACK |
|---|---|---:|---:|---|
|B105|CP105|0|1549|ACKED|
|B106|CP106|19|1568|ACKED|
|B107|CP107|15|1583|ACKED|

CURRENT files retain their stable IDs and pass exact provider byte/SHA-256 readback. Source PRE archives include raw source metadata and Local CellData rollback snapshots; Local POST snapshots pass ZIP CRC and exact provider hashes. Complete folder lists are independently confirmed, children checked by exact ID/parent and new child folders appended to FIFO. A verified empty folder closes a queue item and adds no records.

This run advances metadata cataloguing, not document/video/semantic content extraction. No source object, source body, executable model, permission or scheduler was changed. LSA/MSCS/AEC source-stage gates remain. Private source IDs and raw engineering/rate data are excluded from this public report.

## Preservation

Earlier CAD, estimate versions and progress snapshots remain available. Rollback branch: rollback/before-recovered-extraction-run4-20261017.

Incomplete / Remaining: 0 MSCH acknowledgements; 153 FIFO folders; LSA baseline reconciliation; MSCS oversized/native hashing policy; AEC original terminal recovery; source-content extraction and semantic QA.

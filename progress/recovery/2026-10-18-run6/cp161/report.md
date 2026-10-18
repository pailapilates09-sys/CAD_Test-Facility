# Four-project extraction — verified continuation closeout

The authorized maximum is60 minutes. 49.88 minutes are recorded. The extraction window is closed.

The run resumed from verified CP140 /1852 records /Local/Main131/131. Raw PRE, stable-ID CURRENT, checkpoint and POST transfers passed exact provider readbacks. No saved source batch was replayed.

21 new source checkpoints added 212 metadata records.

| Lane | Saved stage | Local/Main | Remaining |
|---|---|---|---|
| MSCH | CP161 /2064 records; 412 folders +1652 files |152/152|213 FIFO folders; next B162 PythonSavedFiles|
| LSA | CP80 /1242 occurrences |31/31|Historical2-file /9304-byte discrepancy|
| MSCS |AQ-CP87 /1059 hashed|6/6|808 files deferred; hashing-policy gate|
| AEC CR02 |Existing G076 PART1 rows retained|11/11|Original terminal still404; lock reconciliation|

## New checkpoints

| Batch | Checkpoint | Added records | Records after | Main ACK |
|---|---|---:|---:|---|
|B141|CP141|3|1855|ACKED|
|B142|CP142|3|1858|ACKED|
|B143|CP143|1|1859|ACKED|
|B144|CP144|1|1860|ACKED|
|B145|CP145|5|1865|ACKED|
|B146|CP146|8|1873|ACKED|
|B147|CP147|5|1878|ACKED|
|B148|CP148|4|1882|ACKED|
|B149|CP149|1|1883|ACKED|
|B150|CP150|0|1883|ACKED|
|B151|CP151|1|1884|ACKED|
|B152|CP152|7|1891|ACKED|
|B153|CP153|3|1894|ACKED|
|B154|CP154|8|1902|ACKED|
|B155|CP155|3|1905|ACKED|
|B156|CP156|98|2003|ACKED|
|B157|CP157|2|2005|ACKED|
|B158|CP158|39|2044|ACKED|
|B159|CP159|2|2046|ACKED|
|B160|CP160|6|2052|ACKED|
|B161|CP161|12|2064|ACKED|

Each checkpoint preserves source metadata, a PRE rollback archive, four stable CURRENT file identities and exact provider SHA/byte readbacks, Local CellData snapshots, lineage, and bounded Main reconciliation. Source folder lists are independently confirmed and child IDs/parents checked; new child folders remain at the FIFO tail. The complete corpus denominator is unknown.

This run advances metadata cataloguing. Document/video/semantic extraction and model execution remain pending. Source objects/bodies, sharing, schedules, CAD outputs and estimate versions were unchanged. LSA/MSCS progress files were freshly checked and remain at the prior stage; AEC's original terminal was retested and still returned404.

Prior history remains available. Rollback branch: rollback/before-extraction-run6-20261018.

Incomplete / Remaining: 0 MSCH acknowledgement events; 213 FIFO folders; LSA baseline reconciliation; MSCS hashing-policy transition; AEC original terminal recovery; source-content extraction and semantic QA.

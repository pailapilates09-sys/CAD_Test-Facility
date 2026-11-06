# Four-project extraction — Run 40

All four lanes advanced and were acknowledged in the local and main registers. Source work took 37.33 minutes; register closeout took the elapsed total to 40.82 minutes. The final receipt separately records the live deployment checks.

| Lane | Verified work | Local/Main |
| --- | --- | --- |
| MSCS | 3 new source hashes;1,080/1,867 files hashed | 14/14 |
| LSA | 3 new hashes;24 cumulative proofs;provisional SQLite/CSV metadata search refreshed | 39/39 |
| AEC | G076 PART7:3 rates with separate piece, colony and kilogram units | 19/19 |
| MSCH | 6 inventory checkpoints; 33 file records added | 542/542 |

## New AEC rates

Kaski government benchmarks, FY2083/84, PDF page 39 (printed 34), section 14(c), items 1.2.2, 2 and 3. The colony requires a minimum of five frames. Units are separate; taxes, transport and the exact Gregorian effective day are unasserted.

| Observation | Source item | NPR | Unit |
| --- | --- | --- | --- |
| RO-2453 | Cerana hive, Newton B, Tuni wood | 4500.00 | piece |
| RO-2454 | Cerana bee colony, minimum five frames | 5000.00 | colony |
| RO-2455 | Comb foundation | 1400.00 | kg |

Earlier deferrals and the Napier set correction remain intact.

## Saved next steps

| Lane | Checkpoint | Next | Remaining |
| --- | --- | --- | --- |
| MSCS | AQ-CP94 | B083 | 787 source files remain; native export hashes remain separate from original-byte hashes. |
| LSA | CP80 | B081 reconciliation | The observed 1,242-row tree matches the prior audit, but its historical baseline has 2 additional files /9,304 bytes whose identities are unknown. This blocks full freeze and semantic extraction; it did not prevent the verified read-only subset integrity pass. |
| AEC | G076 PART7 | G076 PART8 | Unknown-unit rows and14(b) fertilizer without a numeric value remain deferred. The colony minimum of five frames is recorded. Dimensions and the exact Gregorian effective day remain unasserted; further rows need fresh source review. |
| MSCH | CP551 | B552 | 570 FIFO folders remain; full corpus denominator unknown. Content parsing and model execution are later stages. |

## Coverage and checks

MScS verified three original PDFs and now has 1,080 of 1,867 files hashed, with 787 pending. LSA refreshed its provisional index of 1,242 observed records and now has 24 verified file occurrences covering 16 distinct hashes. Its historical two-file gap remains open. MScH added 33 file metadata records; 570 folders remain queued. These file and search counts do not measure full-text, OCR or model interpretation.

The saved Run 39 archive was recovered and verified after a short download. AEC closeout resumed after a truncated local manifest read, without replaying the verified native rows. The original source files and scheduler were unchanged. All four registers agree.

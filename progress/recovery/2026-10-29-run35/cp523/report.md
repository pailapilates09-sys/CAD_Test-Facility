# Four-project extraction — Run35

All four lanes completed verified work. Source work stopped after 37.28 minutes; native closeout after 47.16 minutes. Deployment timing is recorded separately in the final receipt.

| Lane | New work | Local/Main |
| --- | --- | --- |
| MSCS | 3 new source hashes; 1,065/1,867 files hashed | 9/9 |
| LSA | 3 new hashes; provisional SQLite/CSV index of 1,242 records | 34/34 |
| AEC | G076 PART2: 3 new materials and 3 source-verified rates | 14/14 |
| MSCH | 2 inventory checkpoints; 14 file records added | 514/514 |

## Next steps

| Lane | Saved checkpoint | Next | Remaining work |
| --- | --- | --- | --- |
| MSCS | AQ-CP89 | B078 | 802 source files remain; Google-native export hashes remain separate from original-byte hashes. |
| LSA | CP80 | B081 reconciliation | The observed 1,242-row tree matches the prior audit, but its historical baseline has 2 additional files /9,304 bytes whose identities are unknown. This blocks full freeze and semantic extraction; it did not prevent the verified read-only subset integrity pass. |
| AEC | G076 PART2 | G076 PART3 | Unknown-unit rows remain deferred. FY2083/84 retained; exact Gregorian effective day unasserted. Further source rows require fresh verification. |
| MSCH | CP523 | B524 | 598 FIFO folders remain; full corpus denominator unknown. Content parsing and model execution are later stages. |

## Source-derived AEC rates

Government published benchmarks, FY2083/84, PDF page39 /printed34, section14(a). Poultry manure NPR6.70/kg; earthworm manure NPR30.00/kg; compost manure NPR25.00/kg. These are three distinct new materials and RO-2438 to RO-2440. Exact Gregorian effective day is unasserted. Unknown-unit entries remain deferred.

## Meaning and limits

MSCS now has1,065 of1,867 files hashed (802 pending),706,169,125 hashed bytes, with complete five-file canonical readback and JSONL/SQLite agreement. LSA has9 physical byte/hash proofs and a provisional SQLite/CSV index of1,242 observed metadata identities; its2-file/9,304-byte historical identity gap remains. This is metadata indexing, not OCR or full text extraction. MScH has6,907 inventory records and598 queued folders after two checkpoints adding14 files. Source content parsing/model execution remains pending.

All four Local/Main cursors agree and notices are ACKED. Source originals and scheduler were unchanged. Coordinated lane PRE copies, raw/current byte hashes, native POST snapshots and finite audit registrations were verified. Main POST excludes only its own self-registration, checked separately. No overall completion percentage or finish date is established.

# Four-project recovery — 16 October 2026

The work is recoverable from its Drive records and Git history. The source session stopped on **15 October 2026 at 10:59 NPT**, with 61 completed phases recorded. Its final session contains 20 source checkpoints. This recovery independently re-read the current data on **16 October 2026 at 07:39 NPT**.

## Verified status

| Lane | Last completed checkpoint | Current measured work | Remaining / blocker | Next |
|---|---|---|---|---|
| MSCS — Structural | AQ-CP87 / B075 | 1,059 of 1,867 files have source hashes (56.7%); 2,187 physical identities | 808 deferred; current Tier3 eligibility exhausted | B076 requires the separately governed oversized/native hashing policy |
| LSA — Lok Sewa | CP65 / B065 | 1,029 of 1,244 catalogue rows (82.7%): 907 files + 122 folder/root rows | 215 rows against the recorded target | B066 — Property Valuation |
| AEC — Cost rates | G075 closed; G076 PART1 | RO-2436 and RO-2437 remain present in the canonical master | Original lock still records G075; original terminal checkpoint returns 404 | Resolve the original terminal checkpoint and reconcile in place |
| MSCH — Hydropower | CP59 / B059 | 1,074 catalogue entries: 229 folders + 845 files | 132 pending FIFO folders; overall denominator unknown | B060 — VolumeFrequencyAnalysisResults |

These are stage-specific measurements. Metadata cataloguing and byte hashing do **not** mean the source documents, videos, equations, CAD files or scientific contents have been extracted.

Compared with the 12 October onboarding snapshot, MSCS has **44 more hashed files**, LSA has **613 more catalogue records**, and MSCH has **574 more catalogue entries**. These increments predate this recovery; no new source batch was performed here.

## Recovery evidence

- MSCS CURRENT JSONL: 2,253,033 bytes; 2,187 unique physical IDs; 1,059 populated source SHA-256 values. Progress JSON and the Main N3 notice agree. Existing hash values were counted; source bodies were not rehashed.
- LSA CURRENT JSONL: 605,179 bytes; 1,029 unique physical IDs. SHA-256 `3c3e7d04baf14319ef5dfb285ec92d6ab199171bda2653f404a46c221e28aed2` and byte length match the immutable CP65 record.
- MSCH CURRENT JSONL: 573,606 bytes; 1,074 unique physical IDs. SHA-256 `ff105e5b1159395969098810e1555e8717e34d181c090843a001b91951e4d1fb` and byte length match CP59. The current project-state counts agree.
- AEC: bounded canonical-sheet read confirms both G076 row IDs; the original lock still expects RO-2436 following G075. The exact original terminal metadata request returns 404. This cannot establish whether it is missing or inaccessible.

MSCH source/control links, private source bodies, rates, contacts and temporary download credentials are excluded from this public report.

## Main acknowledgement debt

All four Local SyncState rows were re-read and compared with Main's consumed cursor and pending notices.

| Lane | Local sequence | Main consumed | Unconsumed sequences | Latest notice |
|---|---:|---:|---:|---|
| MSCS | 6 | 3 | 3 | N3 pending |
| LSA | 16 | 5 | 11 | N12 pending |
| AEC | 11 | 10 | 1 | Existing pending sync; no new notice manufactured |
| MSCH | 50 | 3 | 47 | N46 pending |

Main's older status/high-water columns still describe the prior acknowledged state in several rows. Its newer notice fields report the latest Local work. A pending notice is **not** a Main acknowledgement. These gaps remain open.

## Why the webpage looked stale

The page's latest session panel used `src/live-phase.mjs`, while the project map, charts, cards and cursor bars used the separate **12 October onboarding snapshot** in `src/progress-data.mjs`. That snapshot was explicitly historical. The latest panel focused on MSCH and did not provide one concise current summary of all four lanes.

The recovery adds a unified current summary above the historical sections. The old source data and phase history are retained. This diagnosis explains the presentation mismatch; it does not establish the cause of every reported failure in the archived chats.

## Resume from this point

1. Re-read current controls and project authority before any new source work.
2. Keep the recorded rotation: **LSA → AEC → MSCH → MSCS**. B066 and B060 are the next ready metadata batches. Check idempotency before either.
3. Handle AEC's unavailable original terminal and MSCS's hashing-policy gate as explicit blockers. Do not replay B065, B059, B075 or existing AEC rates.
4. Reconcile the proven Local-to-Main sequences in their owning governance workflow. Do not mark Main ACK complete merely because a notice exists.
5. Retain **one verified checkpoint per phase**, **20 minutes maximum**, **14 work units plus 6 protected closeout units**.
6. Scheduler: the historical handover records user-requested disablement. This recovery created or restarted no automation; originating-account scheduler state was not queried.

JP Cost remains a separate pipeline: the historical handover reports 6 sources and 697 raw pages at M02 v0.5.14, with semantic review pending. Its archives were not reverified in this recovery.

## Version and reproducibility

- [Recovered source-session commit](https://github.com/pailapilates09-sys/CAD_Test-Facility/commit/3ea40881bf64f8910cf58ef8fe7fee0594b9564c)
- [Pre-recovery website commit](https://github.com/pailapilates09-sys/CAD_Test-Facility/commit/f92b3242a3949ff63cd4a57a488110c79bf5652f)
- [Structured recovery record](status.json)
- [Current recovery pointer](../current.json)

The dated JSON record is the source for the new website summary. The build publishes its JSON and this report together. Future updates should add a dated recovery record, advance the pointer, and retain the prior snapshots. Raw source data stays in its existing Drive authority; GitHub holds the status projection and code.

Verification for this recovery: CURRENT manifests independently downloaded and parsed; LSA/MSCH checkpoint byte/hash agreement; four Local SyncState reads; Main notice/cursor read; original AEC lock/terminal/rate-row reads. Website checks and deployment are verified separately in the publishing run.


export const livePhase = {
  "phase": "01",
  "title": "MSCH B013 live catalogue continuation",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-12T09:32:04.674834+05:45",
  "checkpoint": "MSCH-CORPUS-CP13 / B013",
  "before": {
    "rows": 500,
    "folders": 149,
    "files": 351,
    "pending": 99
  },
  "after": {
    "rows": 501,
    "folders": 150,
    "files": 351,
    "pending": 99
  },
  "completedBatches": 1,
  "scope": "One FIFO folder; physical metadata only. No source-content extraction, source mutation or scheduler actions.",
  "providerReadback": "Four same-ID CURRENT artifacts and finalized CP13 passed exact SHA/byte readback. PRE rollback archive passed exact bytes and CRC.",
  "localRegistration": "PENDING",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "maxMinutes": 20,
    "workUnits": 14,
    "closeoutReserve": 6,
    "stopNewWorkMinutes": 14,
    "stop": "First verified checkpoint, work budget, time limit, concurrency change or two provider failures - earliest wins."
  },
  "phases": [
    {
      "phase": "01",
      "lane": "MSCH",
      "work": "B013: scan one Test folder",
      "stop": "CP13 + provider readback",
      "status": "Complete - stopped"
    },
    {
      "phase": "02",
      "lane": "MSCH / Local",
      "work": "Register CP13 and PRE/POST lineage in the owning Local Library; send its bounded Main notice",
      "stop": "Local readback + PENDING Main notice; Main cursor unchanged",
      "status": "Next - pending"
    },
    {
      "phase": "03",
      "lane": "MSCS",
      "work": "B073 hash population; at most 20 eligible files and 10 MB, fewer if required to close safely",
      "stop": "One deeply verified hash checkpoint; extraction remains false",
      "status": "Queued"
    },
    {
      "phase": "04",
      "lane": "LSA",
      "work": "B055: catalogue one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "05",
      "lane": "AEC",
      "work": "Resolve the unavailable original terminal checkpoint; close existing G076 records in place",
      "stop": "Verified existing lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "06",
      "lane": "MSCH",
      "work": "B014: first remaining FIFO folder",
      "stop": "One catalogue checkpoint + provider readback",
      "status": "Queued after earlier phases"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits."
};

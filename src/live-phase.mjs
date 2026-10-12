export const livePhase = {
  "phase": "02",
  "title": "MSCH B014 - stopped at verified CP14",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-12T10:37:06.132825+05:45",
  "checkpoint": "MSCH-CORPUS-CP14 / B014",
  "before": {
    "rows": 501,
    "folders": 150,
    "files": 351,
    "pending": 99
  },
  "after": {
    "rows": 504,
    "folders": 152,
    "files": 352,
    "pending": 100
  },
  "completedBatches": 1,
  "scope": "One FIFO folder; three physical metadata entries added: two folders and one PNG (470,990 known bytes).",
  "providerReadback": "Four original CURRENT file IDs passed exact byte/SHA readback; PRE archive passed SHA and CRC. CP13/CP14 Local records and pending Main notice passed provider readback.",
  "localRegistration": "LOCAL_FINAL",
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
      "work": "Register CP13 and CP14 with PRE/POST lineage in the existing Local Library; publish its bounded Main notice",
      "stop": "Local readback + PENDING Main notice; Main cursor unchanged",
      "status": "Complete - Local seq5; Main cursor3; notice pending"
    },
    {
      "phase": "03",
      "lane": "MSCS",
      "work": "B073 hash population; at most 20 eligible files and 10 MB, fewer if required to close safely",
      "stop": "One deeply verified hash checkpoint; extraction remains false",
      "status": "Queued - requires a separate bounded byte-update package"
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
      "work": "B014: catalogue Upload problems files (3 direct children)",
      "stop": "CP14 + exact CURRENT readback + Local registration",
      "status": "Complete in live phase 02"
    },
    {
      "phase": "07",
      "lane": "MSCH",
      "work": "B015: first remaining FIFO folder (.Rproj.user)",
      "stop": "One catalogue checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 5,
  "mainCursor": 3,
  "nextBatch": "B015",
  "nextTarget": ".Rproj.user",
  "newRows": 3,
  "newFolders": 2,
  "newFiles": 1
};

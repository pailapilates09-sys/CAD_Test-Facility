export const livePhase = {
  "phase": "03",
  "title": "MSCH B015 - stopped at verified CP15",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-12T16:25:43.135649+05:45",
  "checkpoint": "MSCH-CORPUS-CP15 / B015",
  "before": {
    "rows": 504,
    "folders": 152,
    "files": 352,
    "pending": 100
  },
  "after": {
    "rows": 507,
    "folders": 155,
    "files": 352,
    "pending": 102
  },
  "completedBatches": 1,
  "scope": "One FIFO folder (.Rproj.user); three physical child folders catalogued. No source-content extraction.",
  "providerReadback": "Four original CURRENT file IDs and CP15 passed exact byte/SHA readback. PRE archive passed SHA and CRC. Local seq6 and pending Main notice passed provider readback; native Local POST snapshots are preserved.",
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
      "work": "B013: catalogue Test",
      "stop": "CP13 + exact provider readback",
      "status": "Complete"
    },
    {
      "phase": "02",
      "lane": "MSCH / Local",
      "work": "B014: catalogue Upload problems files; register CP13/CP14",
      "stop": "CP14 + Local seq5 + pending Main notice",
      "status": "Complete"
    },
    {
      "phase": "03",
      "lane": "MSCH / Local",
      "work": "B015: catalogue .Rproj.user (3 direct subfolders)",
      "stop": "CP15 + Local seq6 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "04",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "05",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "06",
      "lane": "AEC",
      "work": "Resolve the unavailable original terminal checkpoint and close existing G076 records",
      "stop": "Verified existing lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "07",
      "lane": "MSCH",
      "work": "B016: catalogue the first remaining FIFO folder (ArcGIS)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 6,
  "mainCursor": 3,
  "nextBatch": "B016",
  "nextTarget": "ArcGIS",
  "newRows": 3,
  "newFolders": 3,
  "newFiles": 0
};

export const livePhase = {
  "phase": "04",
  "title": "MSCH B016 - stopped at verified CP16",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-12T18:54:04.145384+05:45",
  "checkpoint": "MSCH-CORPUS-CP16 / B016",
  "before": {
    "rows": 507,
    "folders": 155,
    "files": 352,
    "pending": 102
  },
  "after": {
    "rows": 508,
    "folders": 155,
    "files": 353,
    "pending": 101
  },
  "completedBatches": 1,
  "scope": "One FIFO ArcGIS folder; Flood_mapping.zip catalogued (12,510,728 metadata-reported bytes). Archive contents remain unextracted.",
  "providerReadback": "Four original CURRENT IDs and CP16 passed exact byte/SHA readback. PRE archive passed SHA and CRC. Local seq7, pending Main notice and native Local POST snapshots passed provider readback.",
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
      "lane": "MSCH / Local",
      "work": "B016: catalogue Flood_mapping.zip in the ArcGIS FIFO folder",
      "stop": "CP16 + Local seq7 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "05",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed to close safely",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "06",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "07",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint; close existing G076 records in place",
      "stop": "Verified existing lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "08",
      "lane": "MSCH",
      "work": "B017: first remaining FIFO folder (Arcgis under Python_Works)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 7,
  "mainCursor": 3,
  "nextBatch": "B017",
  "nextTarget": "Arcgis (Python_Works)",
  "newRows": 1,
  "newFolders": 0,
  "newFiles": 1,
  "newKnownBytes": 12510728
};

export const livePhase = {
  "phase": "05",
  "title": "MSCH B017 - stopped at verified CP17",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-13T05:43:36.591170+05:45",
  "checkpoint": "MSCH-CORPUS-CP17 / B017",
  "before": {
    "rows": 508,
    "folders": 155,
    "files": 353,
    "pending": 101
  },
  "after": {
    "rows": 516,
    "folders": 158,
    "files": 358,
    "pending": 103
  },
  "completedBatches": 1,
  "scope": "One FIFO Arcgis folder under Python_Works: 3 subfolders and 5 files catalogued, including the zero-byte Test.py occurrence. Added 176,697,169 metadata-reported bytes. Source contents remain unextracted.",
  "providerReadback": "Four original CURRENT IDs and CP17 passed exact byte/SHA readback. PRE archive passed SHA and CRC. Local seq8, pending Main notice and native Local POST snapshots passed provider readback.",
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
      "lane": "MSCH / Local",
      "work": "B017: catalogue Arcgis under Python_Works (8 direct occurrences)",
      "stop": "CP17 + Local seq8 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "06",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "07",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "08",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "09",
      "lane": "MSCH",
      "work": "B018: first remaining FIFO folder (basinStates under HEC HMS/Thesis_01)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 8,
  "mainCursor": 3,
  "nextBatch": "B018",
  "nextTarget": "basinStates (HEC HMS/Thesis_01)",
  "newRows": 8,
  "newFolders": 3,
  "newFiles": 5,
  "newKnownBytes": 176697169
};

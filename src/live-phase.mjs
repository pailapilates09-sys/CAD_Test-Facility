export const livePhase = {
  "phase": "06",
  "title": "MSCH B018 - stopped at verified CP18",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-13T01:17:59.563Z",
  "checkpoint": "MSCH-CORPUS-CP18 / B018",
  "before": {
    "rows": 516,
    "folders": 158,
    "files": 358,
    "pending": 103
  },
  "after": {
    "rows": 516,
    "folders": 158,
    "files": 358,
    "pending": 102
  },
  "completedBatches": 1,
  "scope": "One FIFO basinStates folder under HEC HMS/Thesis_01 verified empty by two independent provider listings. Existing folder occurrence and queue item marked SCANNED; no new entries or known bytes. Source contents remain unextracted.",
  "providerReadback": "Four original CURRENT IDs and CP18 passed exact byte/SHA readback; PRE archive passed SHA/CRC. Local seq9, Main notice N5 and five native Local POST snapshots passed provider readback.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "maxMinutes": 20,
    "workUnits": 14,
    "closeoutReserve": 6,
    "stopNewWorkMinutes": 14,
    "stop": "First verified checkpoint, work budget, time limit, concurrency change or two provider failures - earliest wins.",
    "actualUnitStatus": "Read-only authority bootstrap exceeded the work-unit allowance. Dataset and Local closure were planned as separate bounded transactions before mutation; no additional source batch was started."
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
      "lane": "MSCH / Local",
      "work": "B018: verify basinStates empty; close one FIFO item",
      "stop": "CP18 + Local seq9 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "07",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "08",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "09",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "10",
      "lane": "MSCH",
      "work": "B019: first remaining FIFO folder (Break_Point under HEC HMS/Thesis_01)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 9,
  "mainCursor": 3,
  "nextBatch": "B019",
  "nextTarget": "Break_Point (HEC HMS/Thesis_01)",
  "newRows": 0,
  "newFolders": 0,
  "newFiles": 0,
  "newKnownBytes": 0
};

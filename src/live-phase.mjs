export const livePhase = {
  "phase": "07",
  "title": "MSCH B019 - stopped at verified CP19",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-13T01:40:49.656Z",
  "checkpoint": "MSCH-CORPUS-CP19 / B019",
  "before": {
    "rows": 516,
    "folders": 158,
    "files": 358,
    "pending": 102
  },
  "after": {
    "rows": 523,
    "folders": 158,
    "files": 365,
    "pending": 101
  },
  "completedBatches": 1,
  "scope": "One FIFO Break_Point folder under HEC HMS/Thesis_01: seven direct Seti_Gandaki_Damauli file occurrences catalogued (.cpg, .dbf, .prj, .sbn, .sbx, .shp, .shx); 3,277 metadata-reported bytes added. Source contents and geometry remain unextracted.",
  "providerReadback": "Four original CURRENT IDs and immutable CP19 passed exact byte/SHA readback; PRE archive passed SHA/CRC. Local seq10, Main notice N6 and five native Local POST snapshots passed provider readback.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "maxMinutes": 20,
    "workUnits": 14,
    "closeoutReserve": 6,
    "stopNewWorkMinutes": 14,
    "stop": "First verified checkpoint, work budget, time limit, concurrency change or two provider failures - earliest wins.",
    "actualUnitStatus": "One source batch only. Dataset and Local registration were separate bounded transactions. Whole-phase wall limit remains 20 minutes; aggregate tool usage across preflight and closeout exceeds one 14+6 allowance."
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
      "lane": "MSCH / Local",
      "work": "B019: catalogue seven Break_Point files; 3,277 known bytes",
      "stop": "CP19 + Local seq10 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "08",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "09",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "10",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "11",
      "lane": "MSCH",
      "work": "B020: first remaining FIFO folder (Bulletin17Results under HEC SSP/Test_02)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 10,
  "mainCursor": 3,
  "nextBatch": "B020",
  "nextTarget": "Bulletin17Results (HEC SSP/Test_02)",
  "newRows": 7,
  "newFolders": 0,
  "newFiles": 7,
  "newKnownBytes": 3277
};

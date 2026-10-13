export const livePhase = {
  "phase": "08",
  "title": "MSCH B020 - CP20 Local closeout complete",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-13T02:33:44.507Z",
  "checkpoint": "MSCH-CORPUS-CP20 / B020",
  "before": {
    "rows": 523,
    "folders": 158,
    "files": 365,
    "pending": 101
  },
  "after": {
    "rows": 524,
    "folders": 159,
    "files": 365,
    "pending": 101
  },
  "completedBatches": 1,
  "scope": "CP20 source phase catalogued the sole Practice_1 child folder of Bulletin17Results and queued it at the FIFO tail. This closeout registered the existing checkpoint without replaying B020. No new source batch or content extraction.",
  "providerReadback": "All four live CURRENT hashes still match CP20. Existing CP20 and PRE reused; Local seq11, five native PRE facets, five native POST facets and Main notice N7 passed provider readback. Native default/color aliases were normalized for style comparison.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "maxMinutes": 20,
    "workUnits": 14,
    "closeoutReserve": 6,
    "stopNewWorkMinutes": 14,
    "stop": "First verified checkpoint, work budget, time limit, concurrency change or two provider failures - earliest wins.",
    "actualUnitStatus": "Registration-only phase: source harvesting remained off. Native mutations returned provider grid readback in their completed responses. Terminal publication/proof may require protected safety calls; stop at CP20 Local closure."
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
      "lane": "MSCH / Local",
      "work": "B020 source checkpoint plus CP20 recovery: register existing checkpoint and preserve native PRE/POST",
      "stop": "CP20 + Local seq11 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "09",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "10",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "11",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "12",
      "lane": "MSCH",
      "work": "B021: first remaining FIFO folder (Data under HEC SSP/Test_02)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 11,
  "mainCursor": 3,
  "nextBatch": "B021",
  "nextTarget": "Data (HEC SSP/Test_02)",
  "newRows": 1,
  "newFolders": 1,
  "newFiles": 0,
  "newKnownBytes": 0
};

export const livePhase = {
  "phase": "22",
  "title": "MSCH live session - MSCH-CORPUS-CP34 / Local 25",
  "status": "LIVE_SESSION_RUNNING_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-15T00:01:39.152Z",
  "checkpoint": "MSCH-CORPUS-CP34 / B034",
  "before": {
    "rows": 549,
    "folders": 164,
    "files": 385,
    "pending": 94
  },
  "after": {
    "rows": 553,
    "folders": 164,
    "files": 389,
    "pending": 92
  },
  "completedBatches": 2,
  "scope": "User-authorized minimum50-minute live session. 2 source checkpoints and Local registrations verified. FIFO folders only; source bodies not extracted, executed or modified.",
  "providerReadback": "Four CURRENT hashes, immutable source checkpoints, native Local PRE/POST and own Main notices verified through MSCH-CORPUS-CP34. Main cursor3; reconciliation/ACK remains pending.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "minimumMinutes": 50,
    "checkpointsPerPhase": 1,
    "closeoutReserveMinutes": 8,
    "stop": "Continue verified FIFO phases for the live session, then finish at a verified checkpoint. Stop new writes on concurrent state changes, repeated provider errors, or native snapshot capacity constraints.",
    "actualUnitStatus": "Earlier short phase caps superseded by the user. Account usage remaining is not observable."
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
      "lane": "MSCH / Local",
      "work": "B021 source checkpoint plus CP21 closeout: verify Data empty and register existing checkpoint with native PRE/POST",
      "stop": "CP21 + Local seq12 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "10",
      "lane": "MSCH / Local",
      "work": "B022 source checkpoint plus CP22 closeout: verify datavar empty and register existing checkpoint with native PRE/POST",
      "stop": "CP22 + Local seq13 + pending Main notice",
      "status": "Complete - stopped"
    },
    {
      "phase": "11",
      "lane": "MSCH / Local",
      "work": "B023: date; 1 folders + 10 files / 169343 metadata bytes",
      "stop": "MSCH-CORPUS-CP23 + Local seq14 + pending Main N10",
      "status": "Complete"
    },
    {
      "phase": "12",
      "lane": "MSCH / Local",
      "work": "B024: DistributionFitting; 0 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP24 + Local seq15 + pending Main N11",
      "status": "Complete"
    },
    {
      "phase": "13",
      "lane": "MSCH / Local",
      "work": "B025: DSSfiles; 0 folders + 1 files / 126192 metadata bytes",
      "stop": "MSCH-CORPUS-CP25 + Local seq16 + pending Main N12",
      "status": "Complete"
    },
    {
      "phase": "14",
      "lane": "MSCH / Local",
      "work": "B026: DurationAnalysisResults; 1 folders + 1 files / 128752 metadata bytes",
      "stop": "MSCH-CORPUS-CP26 + Local seq17 + pending Main N13",
      "status": "Complete"
    },
    {
      "phase": "15",
      "lane": "MSCH / Local",
      "work": "B027: ensemble; 0 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP27 + Local seq18 + pending Main N14",
      "status": "Complete"
    },
    {
      "phase": "16",
      "lane": "MSCH / Local",
      "work": "B028: filetoexcel; 1 folders + 3 files / 82025 metadata bytes",
      "stop": "MSCH-CORPUS-CP28 + Local seq19 + pending Main N15",
      "status": "Complete"
    },
    {
      "phase": "17",
      "lane": "MSCH / Local",
      "work": "B029: forecast; 0 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP29 + Local seq20 + pending Main N16",
      "status": "Complete"
    },
    {
      "phase": "18",
      "lane": "MSCH / Local",
      "work": "B030: frequency; 0 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP30 + Local seq21 + pending Main N17",
      "status": "Complete"
    },
    {
      "phase": "19",
      "lane": "MSCH / Local",
      "work": "B031: Hydrological Modelling; 2 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP31 + Local seq22 + pending Main N18",
      "status": "Complete"
    },
    {
      "phase": "20",
      "lane": "MSCH / Local",
      "work": "B032: incident_report_Flood_01_files; 0 folders + 5 files / 7145763 metadata bytes",
      "stop": "MSCH-CORPUS-CP32 + Local seq23 + pending Main N19",
      "status": "Complete"
    },
    {
      "phase": "21",
      "lane": "MSCH / Local",
      "work": "B033: layouts; 0 folders + 2 files / 5615 metadata bytes",
      "stop": "MSCH-CORPUS-CP33 + Local seq24 + pending Main N20",
      "status": "Complete"
    },
    {
      "phase": "22",
      "lane": "MSCH / Local",
      "work": "B034: layouts; 0 folders + 2 files / 13157 metadata bytes",
      "stop": "MSCH-CORPUS-CP34 + Local seq25 + pending Main N21",
      "status": "Complete"
    },
    {
      "phase": "23",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "24",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "25",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "26",
      "lane": "MSCH",
      "work": "B035: first remaining FIFO folder (maps)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 25,
  "mainCursor": 3,
  "nextBatch": "B035",
  "nextTarget": "maps",
  "newRows": 4,
  "newFolders": 0,
  "newFiles": 4,
  "newKnownBytes": 18772,
  "sessionStartedAt": "2026-10-14T14:46:07.345Z",
  "sessionElapsedMinutes": 53.226683333333334
};

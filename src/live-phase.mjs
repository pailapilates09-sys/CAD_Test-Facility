export const livePhase = {
  "phase": "34",
  "title": "MSCH live session - MSCH-CORPUS-CP46 / Local 37",
  "status": "LIVE_SESSION_RUNNING_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-15T00:32:31.249Z",
  "checkpoint": "MSCH-CORPUS-CP46 / B046",
  "before": {
    "rows": 549,
    "folders": 164,
    "files": 385,
    "pending": 94
  },
  "after": {
    "rows": 958,
    "folders": 185,
    "files": 773,
    "pending": 101
  },
  "completedBatches": 14,
  "scope": "User-authorized minimum50-minute live session. 14 source checkpoints and Local registrations verified. FIFO folders only; source bodies not extracted, executed or modified.",
  "providerReadback": "Four CURRENT hashes, immutable source checkpoints, native Local PRE/POST and own Main notices verified through MSCH-CORPUS-CP46. Main cursor3; reconciliation/ACK remains pending.",
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
      "lane": "MSCH / Local",
      "work": "B035: maps; 0 folders + 6 files / 159573 metadata bytes",
      "stop": "MSCH-CORPUS-CP35 + Local seq26 + pending Main N22",
      "status": "Complete"
    },
    {
      "phase": "24",
      "lane": "MSCH / Local",
      "work": "B036: maps; 0 folders + 13 files / 6328 metadata bytes",
      "stop": "MSCH-CORPUS-CP36 + Local seq27 + pending Main N23",
      "status": "Complete"
    },
    {
      "phase": "25",
      "lane": "MSCH / Local",
      "work": "B037: montecarlo; 0 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP37 + Local seq28 + pending Main N24",
      "status": "Complete"
    },
    {
      "phase": "26",
      "lane": "MSCH / Local",
      "work": "B038: MScS_Engineering; 9 folders + 28 files / 201906 metadata bytes",
      "stop": "MSCH-CORPUS-CP38 + Local seq29 + pending Main N25",
      "status": "Complete"
    },
    {
      "phase": "27",
      "lane": "MSCH / Local",
      "work": "B039: OG & B; 0 folders + 1 files / 128496 metadata bytes",
      "stop": "MSCH-CORPUS-CP39 + Local seq30 + pending Main N26",
      "status": "Complete"
    },
    {
      "phase": "28",
      "lane": "MSCH / Local",
      "work": "B040: OG & B; 0 folders + 24 files / 13745196 metadata bytes",
      "stop": "MSCH-CORPUS-CP40 + Local seq31 + pending Main N27",
      "status": "Complete"
    },
    {
      "phase": "29",
      "lane": "MSCH / Local",
      "work": "B041: optimizer; 0 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP41 + Local seq32 + pending Main N28",
      "status": "Complete"
    },
    {
      "phase": "30",
      "lane": "MSCH / Local",
      "work": "B042: Original and Backlog; 8 folders + 209 files / 1077255481 metadata bytes",
      "stop": "MSCH-CORPUS-CP42 + Local seq33 + pending Main N29",
      "status": "Complete"
    },
    {
      "phase": "31",
      "lane": "MSCH / Local",
      "work": "B043: Packages; 2 folders + 22 files / 41582 metadata bytes",
      "stop": "MSCH-CORPUS-CP43 + Local seq34 + pending Main N30",
      "status": "Complete"
    },
    {
      "phase": "32",
      "lane": "MSCH / Local",
      "work": "B044: Photos; 1 folders + 76 files / 61426451 metadata bytes",
      "stop": "MSCH-CORPUS-CP44 + Local seq35 + pending Main N31",
      "status": "Complete"
    },
    {
      "phase": "33",
      "lane": "MSCH / Local",
      "work": "B045: PlagiarismTest; 0 folders + 5 files / 27672368 metadata bytes",
      "stop": "MSCH-CORPUS-CP45 + Local seq36 + pending Main N32",
      "status": "Complete"
    },
    {
      "phase": "34",
      "lane": "MSCH / Local",
      "work": "B046: Project; 1 folders + 0 files / 0 metadata bytes",
      "stop": "MSCH-CORPUS-CP46 + Local seq37 + pending Main N33",
      "status": "Complete"
    },
    {
      "phase": "35",
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "36",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "37",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "38",
      "lane": "MSCH",
      "work": "B047: first remaining FIFO folder (R_Progamming)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 37,
  "mainCursor": 3,
  "nextBatch": "B047",
  "nextTarget": "R_Progamming",
  "newRows": 409,
  "newFolders": 21,
  "newFiles": 388,
  "newKnownBytes": 1180656153,
  "sessionStartedAt": "2026-10-14T14:46:07.345Z",
  "sessionElapsedMinutes": 53.226683333333334
};

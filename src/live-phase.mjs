export const livePhase = {
  "phase": "41",
  "title": "Four-project live session — 3 lanes advanced; AEC blocked",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-15T02:35:32.958Z",
  "checkpoint": "MSCH-CORPUS-CP50 / B050",
  "before": {
    "rows": 983,
    "folders": 189,
    "files": 794,
    "pending": 102
  },
  "after": {
    "rows": 984,
    "folders": 190,
    "files": 794,
    "pending": 102
  },
  "completedBatches": 4,
  "scope": "Minimum 50-minute four-lane live session completed. Catalogue totals above refer to MSCH. MSCS: 40 more source hashes, now1,055/1,867; LSA: 20 more metadata records, now436/1,244. AEC original terminal permissions block recovery; no new rates. Original source files and CAD preserved. No schedule created or resumed.",
  "providerReadback": "MSCS five CURRENT hashes + JSONL/SQLite/integrity; LSA native/JSONL/progress/lock; MSCH four CURRENT/PRE hashes; native Local PRE/POST and own Main notices verified. AEC original lock unchanged and prior rate rows retained. Main reconciliation remains pending.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "minimumMinutes": 50,
    "minimumWindowMet": true,
    "checkpointsPerPhase": 1,
    "elapsedAtFinalProjectionMinutes": 55.26,
    "stop": "Source work stopped at verified checkpoints; all ready lanes received phases. Original AEC recovery remains blocked. Next rotation: LSA, AEC, MSCH, MSCS.",
    "accountUsageRemaining": "Not observable"
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
      "lane": "MSCH / Local",
      "work": "B047: R_Progamming; 1 folders + 2 files / 2614 metadata bytes",
      "stop": "MSCH-CORPUS-CP47 + Local seq38 + pending Main N34",
      "status": "Complete"
    },
    {
      "phase": "36",
      "lane": "MSCH / Local",
      "work": "B048: Raster_files; 1 folders + 16 files / 2168147 metadata bytes",
      "stop": "MSCH-CORPUS-CP48 + Local seq39 + pending Main N35",
      "status": "Complete"
    },
    {
      "phase": "37",
      "lane": "MSCH / Local",
      "work": "B049: renv; 2 folders + 3 files / 35941 metadata bytes",
      "stop": "MSCH-CORPUS-CP49 + Local seq40 + pending Main N36",
      "status": "Complete"
    },
    {
      "phase": "38",
      "lane": "LSA / Local",
      "work": "B055: +1 folder /19 files; 416→436 metadata records",
      "stop": "CP55 / Local6 / Main N2 pending",
      "status": "Complete"
    },
    {
      "phase": "39",
      "lane": "MSCS / Local",
      "work": "B073: +20 source hashes /9,933,223 bytes",
      "stop": "AQ-CP85 / Local4 / Main N1 pending",
      "status": "Complete"
    },
    {
      "phase": "40",
      "lane": "MSCH / Local",
      "work": "B050: +1 folder; 983→984 catalogue entries",
      "stop": "CP50 / Local41 / Main N37 pending",
      "status": "Complete"
    },
    {
      "phase": "41",
      "lane": "MSCS / Local",
      "work": "B074: +20 source hashes /9,725,457 bytes",
      "stop": "AQ-CP86 / Local5 / Main N2 pending",
      "status": "Complete"
    },
    {
      "lane": "LSA",
      "work": "B056: fresh deterministic metadata/profile check",
      "stop": "One source checkpoint + Local + own Main notice",
      "status": "Queued",
      "phase": "42"
    },
    {
      "lane": "AEC",
      "work": "G076 recovery: original terminal document permission denied; rate rows retained",
      "stop": "Restore access to original checkpoint; never replay committed rate rows or make a replacement",
      "status": "Access blocker",
      "phase": "43"
    },
    {
      "lane": "MSCH",
      "work": "B051: next FIFO folder, Sem IV",
      "stop": "One source checkpoint + Local + own Main notice",
      "status": "Queued",
      "phase": "44"
    },
    {
      "lane": "MSCS",
      "work": "B075: next policy-bounded SHA-256 batch",
      "stop": "One source checkpoint + Local + own Main notice",
      "status": "Queued",
      "phase": "45"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 41,
  "mainCursor": 3,
  "nextBatch": "B051",
  "nextTarget": "Sem IV",
  "newRows": 1,
  "newFolders": 1,
  "newFiles": 0,
  "newKnownBytes": 0,
  "sessionStartedAt": "2026-10-14T14:46:07.345Z",
  "sessionElapsedMinutes": 53.226683333333334,
  "knownBytes": 5433731030,
  "sessionReport": {
    "startedAt": "2026-10-15T01:40:15.777Z",
    "milestones": 4,
    "advancedLanes": 3,
    "MSCS": {
      "checkpoint": "AQ-CP86 / B074",
      "beforeHashed": 1015,
      "afterHashed": 1055,
      "addedHashes": 40,
      "addedHashedBytes": 19658680,
      "pending": 812,
      "physicalRecords": 2187,
      "local": 5,
      "mainCursor": 3,
      "notice": "N2",
      "next": "B075"
    },
    "LSA": {
      "checkpoint": "CP55 / B055",
      "beforeRows": 416,
      "afterRows": 436,
      "addedFolders": 1,
      "addedFiles": 19,
      "addedMetadataBytes": 4347307871,
      "local": 6,
      "mainCursor": 5,
      "notice": "N2",
      "next": "B056"
    },
    "MSCH": {
      "checkpoint": "CP50 / B050",
      "beforeRows": 983,
      "afterRows": 984,
      "addedFolders": 1,
      "addedFiles": 0,
      "pending": 102,
      "local": 41,
      "mainCursor": 3,
      "notice": "N37",
      "next": "B051"
    },
    "AEC": {
      "status": "BLOCKED_ORIGINAL_TERMINAL_PERMISSION",
      "local": 11,
      "mainCursor": 10,
      "newRateWrites": 0
    },
    "sourceContentExtraction": false,
    "sourceMutation": "NONE",
    "nextRotation": [
      "LSA",
      "AEC",
      "MSCH",
      "MSCS"
    ],
    "remaining": [
      "AEC original terminal checkpoint access denied; no replacement or source replay.",
      "Main reconciliation/ACKs pending for notified Local high-waters; no consumed cursor advanced.",
      "Five older MSCH B009–B013 queue/manifest status discrepancies remain.",
      "LSA Sangitas ancestor occurrence gap retained for prospective deterministic traversal review."
    ]
  }
};

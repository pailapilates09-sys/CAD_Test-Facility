export const livePhase = {
  "phase": "61",
  "title": "100-minute four-project live session — stopped at verified checkpoints",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-15T05:14:35.177Z",
  "checkpoint": "MSCH-CORPUS-CP59 / B059",
  "before": {
    "rows": 1068,
    "folders": 229,
    "files": 839,
    "pending": 133
  },
  "after": {
    "rows": 1074,
    "folders": 229,
    "files": 845,
    "pending": 132
  },
  "completedBatches": 20,
  "scope": "Minimum100-minute four-lane live session completed;20 source checkpoints. Cards show the latest MSCH phase only. Session: MSCH+90 catalogue entries, now1,074; LSA+593 metadata records, now1,029/1,244; MSCS+4 verified hashes, now1,059/1,867. AEC original terminal access remains blocked. Original Drive repositories, source files and CAD preserved. No schedule created or resumed.",
  "providerReadback": "Terminal exact byte/hash/parent checks passed for12 CURRENT files,3 checkpoints and AEC's unchanged original lock. LSA native1,029 unique IDs/JSONL and1500-row grid agree; Local native PRE/POST and own Main notices verified. AEC protected rates retained. Main ACKs remain pending.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "minimumMinutes": 100,
    "minimumWindowMet": true,
    "checkpointsPerPhase": 1,
    "sourceElapsedMinutes": 103.02,
    "elapsedAtFinalProjectionMinutes": 107.19,
    "stop": "Source work stopped after20 verified checkpoints. All ready lanes advanced; AEC access-blocked and MSCS current-tier eligibility exhausted. Next rotation: LSA, AEC, MSCH, MSCS.",
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
      "phase": "42",
      "lane": "LSA / Local",
      "work": "LSA CP56 / B056: verified source milestone and Local closeout",
      "stop": "Local7 / Main N3 pending",
      "status": "Complete"
    },
    {
      "phase": "43",
      "lane": "MSCH / Local",
      "work": "MSCH CP51 / B051: verified source milestone and Local closeout",
      "stop": "Local42 / Main N38 pending",
      "status": "Complete"
    },
    {
      "phase": "44",
      "lane": "MSCS / Local",
      "work": "MSCS AQ-CP87 / B075: verified source milestone and Local closeout",
      "stop": "Local6 / Main N3 pending",
      "status": "Complete"
    },
    {
      "phase": "45",
      "lane": "LSA / Local",
      "work": "LSA CP57 / B057: verified source milestone and Local closeout",
      "stop": "Local8 / Main N4 pending",
      "status": "Complete"
    },
    {
      "phase": "46",
      "lane": "MSCH / Local",
      "work": "MSCH CP52 / B052: verified source milestone and Local closeout",
      "stop": "Local43 / Main N39 pending",
      "status": "Complete"
    },
    {
      "phase": "47",
      "lane": "LSA / Local",
      "work": "LSA CP58 / B058: verified source milestone and Local closeout",
      "stop": "Local9 / Main N5 pending",
      "status": "Complete"
    },
    {
      "phase": "48",
      "lane": "MSCH / Local",
      "work": "MSCH CP53 / B053: verified source milestone and Local closeout",
      "stop": "Local44 / Main N40 pending",
      "status": "Complete"
    },
    {
      "phase": "49",
      "lane": "LSA / Local",
      "work": "LSA CP59 / B059: verified source milestone and Local closeout",
      "stop": "Local10 / Main N6 pending",
      "status": "Complete"
    },
    {
      "phase": "50",
      "lane": "MSCH / Local",
      "work": "MSCH CP54 / B054: verified source milestone and Local closeout",
      "stop": "Local45 / Main N41 pending",
      "status": "Complete"
    },
    {
      "phase": "51",
      "lane": "LSA / Local",
      "work": "LSA CP60 / B060: verified source milestone and Local closeout",
      "stop": "Local11 / Main N7 pending",
      "status": "Complete"
    },
    {
      "phase": "52",
      "lane": "MSCH / Local",
      "work": "MSCH CP55 / B055: verified source milestone and Local closeout",
      "stop": "Local46 / Main N42 pending",
      "status": "Complete"
    },
    {
      "phase": "53",
      "lane": "LSA / Local",
      "work": "LSA CP61 / B061: verified source milestone and Local closeout",
      "stop": "Local12 / Main N8 pending",
      "status": "Complete"
    },
    {
      "phase": "54",
      "lane": "MSCH / Local",
      "work": "MSCH CP56 / B056: verified source milestone and Local closeout",
      "stop": "Local47 / Main N43 pending",
      "status": "Complete"
    },
    {
      "phase": "55",
      "lane": "LSA / Local",
      "work": "LSA CP62 / B062: verified source milestone and Local closeout",
      "stop": "Local13 / Main N9 pending",
      "status": "Complete"
    },
    {
      "phase": "56",
      "lane": "MSCH / Local",
      "work": "MSCH CP57 / B057: verified source milestone and Local closeout",
      "stop": "Local48 / Main N44 pending",
      "status": "Complete"
    },
    {
      "phase": "57",
      "lane": "LSA / Local",
      "work": "LSA CP63 / B063: verified source milestone and Local closeout",
      "stop": "Local14 / Main N10 pending",
      "status": "Complete"
    },
    {
      "phase": "58",
      "lane": "MSCH / Local",
      "work": "MSCH CP58 / B058: verified source milestone and Local closeout",
      "stop": "Local49 / Main N45 pending",
      "status": "Complete"
    },
    {
      "phase": "59",
      "lane": "LSA / Local",
      "work": "LSA CP64 / B064: verified source milestone and Local closeout",
      "stop": "Local15 / Main N11 pending",
      "status": "Complete"
    },
    {
      "phase": "60",
      "lane": "MSCH / Local",
      "work": "MSCH CP59 / B059: verified source milestone and Local closeout",
      "stop": "Local50 / Main N46 pending",
      "status": "Complete"
    },
    {
      "phase": "61",
      "lane": "LSA / Local",
      "work": "LSA CP65 / B065: verified source milestone and Local closeout",
      "stop": "Local16 / Main N12 pending",
      "status": "Complete"
    },
    {
      "lane": "LSA",
      "work": "B066: next deterministic metadata branch",
      "status": "Queued",
      "phase": "62",
      "stop": "One verified source checkpoint + Local + own Main notice"
    },
    {
      "lane": "AEC",
      "work": "Original terminal checkpoint still permission-blocked; existing rates retained",
      "status": "Access blocker",
      "phase": "63",
      "stop": "Original checkpoint access; no replacement or replay"
    },
    {
      "lane": "MSCH",
      "work": "B060: next FIFO metadata phase",
      "status": "Queued",
      "phase": "64",
      "stop": "One verified source checkpoint + Local + own Main notice"
    },
    {
      "lane": "MSCS",
      "work": "Tier3 eligible files exhausted;808 files deferred",
      "status": "Policy gate",
      "phase": "65",
      "stop": "Separately governed oversized/native policy"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 50,
  "mainCursor": 3,
  "nextBatch": "B060",
  "nextTarget": "Next FIFO folder",
  "newRows": 6,
  "newFolders": 0,
  "newFiles": 6,
  "newKnownBytes": 2825682,
  "sessionStartedAt": "2026-10-15T03:27:23.478Z",
  "sessionElapsedMinutes": 107.19498333333334,
  "knownBytes": 7041400018,
  "sessionReport": {
    "startedAt": "2026-10-15T03:27:23.478Z",
    "sourceStoppedAt": "2026-10-15T05:10:24.391Z",
    "milestones": 20,
    "advancedLanes": 3,
    "MSCS": {
      "checkpoint": "AQ-CP87 / B075",
      "beforeHashed": 1055,
      "afterHashed": 1059,
      "addedHashes": 4,
      "addedHashedBytes": 840088,
      "pending": 808,
      "physicalRecords": 2187,
      "local": 6,
      "mainCursor": 3,
      "notice": "N3",
      "tier3EligibleRemaining": 0,
      "next": "B076 gated: separate oversized/native policy"
    },
    "LSA": {
      "checkpoint": "CP65 / B065",
      "beforeRows": 436,
      "afterRows": 1029,
      "addedFolders": 55,
      "addedFiles": 538,
      "addedMetadataBytes": 21010646981,
      "local": 16,
      "mainCursor": 5,
      "notice": "N12",
      "nativeGridRows": 1500,
      "next": "B066"
    },
    "MSCH": {
      "checkpoint": "CP59 / B059",
      "beforeRows": 984,
      "afterRows": 1074,
      "addedFolders": 39,
      "addedFiles": 51,
      "addedMetadataBytes": 1607668988,
      "pending": 132,
      "local": 50,
      "mainCursor": 3,
      "notice": "N46",
      "next": "B060"
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
      "AEC original terminal access denied; no replacement/replay.",
      "MSCS oversized/native hashing requires a separately governed policy.",
      "Main reconciliation/ACKs pending; consumed cursors unchanged.",
      "Older MSCH and MSCS metadata discrepancies remain for separate review."
    ]
  }
};

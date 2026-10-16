export const livePhase = {
  "phase": "72",
  "title": "60-minute four-project extraction run — verified checkpoints",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-16T03:36:41.732Z",
  "checkpoint": "LSA CP71/B071 · MSCH CP64/B064",
  "before": {
    "rows": 1074,
    "folders": 229,
    "files": 845,
    "pending": 132
  },
  "after": {
    "rows": 1114,
    "folders": 242,
    "files": 872,
    "pending": 140
  },
  "completedBatches": 11,
  "scope": "User minimum60-minute run completed11 source checkpoints. LSA+100 records, now1129/1244. MSCH+40 entries, now1114. AEC terminal and MSCS policy remain blocked. Source bodies and schedules unchanged.",
  "providerReadback": "Raw CURRENT stable IDs/parents/bytes/SHA, PRE ZIP CRC, LSA native/JSONL IDs and Local native PRE/POST verified. Local22/Main5 and Local55/Main3; own notices pending.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "minimumMinutes": 60,
    "minimumWindowMet": true,
    "checkpointsPerPhase": 1,
    "sourceElapsedMinutes": 60.359883333333336,
    "elapsedAtFinalProjectionMinutes": 64.09779298333333,
    "stop": "Stopped at11 source checkpoints, all Local-final. Next LSA B072 and MSCH B065; AEC/MSCS gates remain. No automation created.",
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
      "phase": "62",
      "lane": "LSA / Local",
      "work": "CP66/B066 metadata checkpoint and Local closeout",
      "stop": "Local17 /Main N13 pending",
      "status": "Complete"
    },
    {
      "phase": "63",
      "lane": "MSCH / Local",
      "work": "CP60/B060 metadata checkpoint and Local closeout",
      "stop": "Local51 /Main N47 pending",
      "status": "Complete"
    },
    {
      "phase": "64",
      "lane": "LSA / Local",
      "work": "CP67/B067 metadata checkpoint and Local closeout",
      "stop": "Local18 /Main N14 pending",
      "status": "Complete"
    },
    {
      "phase": "65",
      "lane": "MSCH / Local",
      "work": "CP61/B061 metadata checkpoint and Local closeout",
      "stop": "Local52 /Main N48 pending",
      "status": "Complete"
    },
    {
      "phase": "66",
      "lane": "LSA / Local",
      "work": "CP68/B068 metadata checkpoint and Local closeout",
      "stop": "Local19 /Main N15 pending",
      "status": "Complete"
    },
    {
      "phase": "67",
      "lane": "MSCH / Local",
      "work": "CP62/B062 metadata checkpoint and Local closeout",
      "stop": "Local53 /Main N49 pending",
      "status": "Complete"
    },
    {
      "phase": "68",
      "lane": "LSA / Local",
      "work": "CP69/B069 metadata checkpoint and Local closeout",
      "stop": "Local20 /Main N16 pending",
      "status": "Complete"
    },
    {
      "phase": "69",
      "lane": "MSCH / Local",
      "work": "CP63/B063 metadata checkpoint and Local closeout",
      "stop": "Local54 /Main N50 pending",
      "status": "Complete"
    },
    {
      "phase": "70",
      "lane": "LSA / Local",
      "work": "CP70/B070 metadata checkpoint and Local closeout",
      "stop": "Local21 /Main N17 pending",
      "status": "Complete"
    },
    {
      "phase": "71",
      "lane": "MSCH / Local",
      "work": "CP64/B064 metadata checkpoint and Local closeout",
      "stop": "Local55 /Main N51 pending",
      "status": "Complete"
    },
    {
      "phase": "72",
      "lane": "LSA / Local",
      "work": "CP71/B071 metadata checkpoint and Local closeout",
      "stop": "Local22 /Main N18 pending",
      "status": "Complete"
    },
    {
      "phase": "73",
      "lane": "LSA",
      "work": "B072: next deterministic metadata branch",
      "stop": "One verified checkpoint, Local and own Main notice",
      "status": "Queued"
    },
    {
      "phase": "—",
      "lane": "AEC",
      "work": "Original terminal checkpoint unavailable; existing rows retained",
      "stop": "Original checkpoint recovery; no replay",
      "status": "Blocked"
    },
    {
      "phase": "74",
      "lane": "MSCH",
      "work": "B065: next FIFO folder",
      "stop": "One verified checkpoint, Local and own Main notice",
      "status": "Queued"
    },
    {
      "phase": "—",
      "lane": "MSCS",
      "work": "Oversized/native hashing policy gate",
      "stop": "Separately governed policy",
      "status": "Policy gate"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 55,
  "mainCursor": 3,
  "nextBatch": "B065",
  "nextTarget": ".vscode (next FIFO folder)",
  "newRows": 40,
  "newFolders": 13,
  "newFiles": 27,
  "newKnownBytes": 7743654,
  "sessionStartedAt": "2026-10-16T02:36:20.139Z",
  "sessionElapsedMinutes": 60.359883333333336,
  "knownBytes": 7049143672,
  "sessionReport": {
    "startedAt": "2026-10-16T02:36:20.139Z",
    "sourceStoppedAt": "2026-10-16T03:36:41.732Z",
    "milestones": 11,
    "advancedLanes": 2,
    "MSCS": {
      "checkpoint": "AQ-CP87 / B075",
      "beforeHashed": 1059,
      "afterHashed": 1059,
      "addedHashes": 0,
      "pending": 808,
      "physicalRecords": 2187,
      "local": 6,
      "mainCursor": 3,
      "notice": "N3",
      "tier3EligibleRemaining": 0,
      "next": "B076 policy gate"
    },
    "LSA": {
      "checkpoint": "CP71 / B071",
      "beforeRows": 1029,
      "afterRows": 1129,
      "addedFolders": 8,
      "addedFiles": 92,
      "addedMetadataBytes": 13787518532,
      "local": 22,
      "mainCursor": 5,
      "notice": "N18",
      "nativeGridRows": 1500,
      "next": "B072"
    },
    "MSCH": {
      "checkpoint": "CP64 / B064",
      "beforeRows": 1074,
      "afterRows": 1114,
      "addedFolders": 13,
      "addedFiles": 27,
      "addedMetadataBytes": 7743654,
      "pending": 140,
      "local": 55,
      "mainCursor": 3,
      "notice": "N51",
      "next": "B065"
    },
    "AEC": {
      "status": "BLOCKED_ORIGINAL_TERMINAL_UNAVAILABLE",
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
      "AEC original terminal404.",
      "MSCS oversized/native policy gate.",
      "Main ACKs pending; consumed cursors unchanged.",
      "LSA/MSCH catalogue work and all source-content extraction remain."
    ]
  },
  "scannedFolders": 5
};

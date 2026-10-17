export const livePhase = {
  "phase": "139",
  "title": "Recovered extraction — minimum60-minute window closed",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT_MAIN_ACKED",
  "completedAt": "2026-10-17T13:03:44.612Z",
  "checkpoint": "MSCH-CORPUS-CP122",
  "before": {
    "rows": 1549,
    "folders": 286,
    "files": 1263,
    "pending": 144
  },
  "after": {
    "rows": 1657,
    "folders": 344,
    "files": 1313,
    "pending": 184
  },
  "completedBatches": 18,
  "scope": "MSCH FIFO metadata extraction; other three lanes retain their source gates.",
  "providerReadback": "PASS",
  "localRegistration": "VERIFIED",
  "mainAck": "ACKED",
  "budget": {
    "minimumMinutes": 60,
    "minimumWindowMet": true,
    "checkpointsPerPhase": 1,
    "sourceElapsedMinutes": 60.01068333333333,
    "accountUsageRemaining": "Not observable"
  },
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 113,
  "mainCursor": 113,
  "nextBatch": "B123",
  "nextTarget": "Duration_graph",
  "newRows": 108,
  "newFolders": 58,
  "newFiles": 50,
  "newKnownBytes": 3749621864,
  "sessionStartedAt": "2026-10-17T12:01:24.843Z",
  "sessionElapsedMinutes": 60.01068333333333,
  "knownBytes": 21179485857,
  "sessionReport": {
    "startedAt": "2026-10-17T12:01:24.843Z",
    "sourceStoppedAt": "2026-10-17T13:01:25.484Z",
    "milestones": 18,
    "advancedLanes": 1,
    "MSCS": {
      "checkpoint": "AQ-CP87 /B075",
      "beforeHashed": 1059,
      "afterHashed": 1059,
      "addedHashes": 0,
      "pending": 808,
      "physicalRecords": 2187,
      "local": 6,
      "mainCursor": 6,
      "notice": "N3 acknowledged",
      "tier3EligibleRemaining": 0,
      "next": "B076 policy gate"
    },
    "LSA": {
      "checkpoint": "CP80 /B080",
      "beforeRows": 1242,
      "afterRows": 1242,
      "addedFolders": 0,
      "addedFiles": 0,
      "addedMetadataBytes": 0,
      "local": 31,
      "mainCursor": 31,
      "notice": "N27 acknowledged",
      "nativeGridRows": 1500,
      "next": "B081 baseline reconciliation"
    },
    "MSCH": {
      "checkpoint": "CP122 /B122",
      "beforeRows": 1549,
      "afterRows": 1657,
      "addedFolders": 58,
      "addedFiles": 50,
      "addedMetadataBytes": 3749621864,
      "pending": 184,
      "local": 113,
      "mainCursor": 113,
      "notice": "N109 ACKED",
      "next": "B123"
    },
    "AEC": {
      "status": "BLOCKED_ORIGINAL_TERMINAL_UNAVAILABLE",
      "local": 11,
      "mainCursor": 11,
      "newRateWrites": 0
    },
    "sourceContentExtraction": false,
    "sourceMutation": "NONE",
    "nextRotation": [
      "MSCH",
      "LSA",
      "AEC",
      "MSCS"
    ],
    "debtClearance": {
      "initialEvents": 30,
      "newEvents": 18,
      "totalAcknowledgedEvents": 48,
      "remainingEvents": 0,
      "recoveredEventsAcknowledged": 30,
      "newEventsAcknowledged": 18,
      "pending": 0
    },
    "remaining": [
      "LSA historical2 files /9304 bytes unresolved.",
      "AEC original terminal unavailable.",
      "MSCS oversized/native policy gate.",
      "MSCH184 FIFO folders; source-content extraction remains."
    ]
  },
  "scannedFolders": 114,
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
      "work": "B072 /CP72: NEA/Videos/Estimation Costing-Running Bill-Ebidding-Barbending Schedule; +12 records, now 1141",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "74",
      "lane": "MSCH",
      "work": "B065 /CP65: .vscode; +1 records, now 1115",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "75",
      "lane": "LSA",
      "work": "B073 /CP73: NEA/Videos/ETABS; +39 records, now 1180",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "76",
      "lane": "MSCH",
      "work": "B066 /CP66: Image; +4 records, now 1119",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "77",
      "lane": "LSA",
      "work": "B074 /CP74: NEA/Videos/Installation Videos; +9 records, now 1189",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "78",
      "lane": "MSCH",
      "work": "B067 /CP67: LatexCode; +129 records, now 1248",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "79",
      "lane": "LSA",
      "work": "B075 /CP75: NEA/Videos/Revit Videos; +19 records, now 1208",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "80",
      "lane": "MSCH",
      "work": "B068 /CP68: LatexToWord; +17 records, now 1265",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "81",
      "lane": "LSA",
      "work": "B076 /CP76: NEA/Videos/Sketchup; +7 records, now 1215",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "82",
      "lane": "MSCH",
      "work": "B069 /CP69: Module_1; +18 records, now 1283",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "83",
      "lane": "LSA",
      "work": "B077 /CP77: NEA/Videos/Sketchup & Luminon 2024 - Updating; +16 records, now 1231",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "84",
      "lane": "MSCH",
      "work": "B070 /CP70: myenv; +6 records, now 1289",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "85",
      "lane": "LSA",
      "work": "B078 /CP78: NEA/Videos/SW-DTM; +3 records, now 1234",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "86",
      "lane": "LSA",
      "work": "B079 /CP79: NEA/Videos/Property Valuation; +8 records, now 1,242",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "87",
      "lane": "MSCH",
      "work": "B071 /CP71: OnHold; +4 records, now 1293",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "88",
      "lane": "LSA",
      "work": "B080 /CP80: Full live source tree reconciliation; +0 records, now 1,242",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Audit complete; baseline gap retained"
    },
    {
      "phase": "89",
      "lane": "MSCH",
      "work": "B072 /CP72: Packages; +2 records, now 1295",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "90",
      "lane": "MSCH",
      "work": "B073 /CP73: Past; +13 records, now 1308",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "91",
      "lane": "MSCH",
      "work": "B074 /CP74: .Rproj.user; +2 records, now 1,310",
      "stop": "Source and Local readback; final Main acknowledgement verified",
      "status": "Complete"
    },
    {
      "phase": "—",
      "lane": "LSA",
      "work": "B081 historical baseline identity reconciliation",
      "stop": "Resolve2 files /9,304 bytes before Phase1B freeze",
      "status": "Blocked"
    },
    {
      "phase": "—",
      "lane": "AEC",
      "work": "Original G076 terminal remains unavailable",
      "stop": "Recover original checkpoint without rate replay",
      "status": "Blocked"
    },
    {
      "phase": "—",
      "lane": "MSCS",
      "work": "Oversized/native hashing policy gate",
      "stop": "Separately governed eligible byte policy",
      "status": "Policy gate"
    },
    {
      "phase": "92",
      "lane": "MSCH",
      "work": "Recovered CP75: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "93",
      "lane": "MSCH",
      "work": "Recovered CP76: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "94",
      "lane": "MSCH",
      "work": "Recovered CP77: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "95",
      "lane": "MSCH",
      "work": "Recovered CP78: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "96",
      "lane": "MSCH",
      "work": "Recovered CP79: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "97",
      "lane": "MSCH",
      "work": "Recovered CP80: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "98",
      "lane": "MSCH",
      "work": "Recovered CP81: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "99",
      "lane": "MSCH",
      "work": "Recovered CP82: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "100",
      "lane": "MSCH",
      "work": "Recovered CP83: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "101",
      "lane": "MSCH",
      "work": "Recovered CP84: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "102",
      "lane": "MSCH",
      "work": "Recovered CP85: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "103",
      "lane": "MSCH",
      "work": "Recovered CP86: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "104",
      "lane": "MSCH",
      "work": "Recovered CP87: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "105",
      "lane": "MSCH",
      "work": "Recovered CP88: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "106",
      "lane": "MSCH",
      "work": "Recovered CP89: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "107",
      "lane": "MSCH",
      "work": "Recovered CP90: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "108",
      "lane": "MSCH",
      "work": "Recovered CP91: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "109",
      "lane": "MSCH",
      "work": "Recovered CP92: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "110",
      "lane": "MSCH",
      "work": "Recovered CP93: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "111",
      "lane": "MSCH",
      "work": "Recovered CP94: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "112",
      "lane": "MSCH",
      "work": "Recovered CP95: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "113",
      "lane": "MSCH",
      "work": "Recovered CP96: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "114",
      "lane": "MSCH",
      "work": "Recovered CP97: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "115",
      "lane": "MSCH",
      "work": "Recovered CP98: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "116",
      "lane": "MSCH",
      "work": "Recovered CP99: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "117",
      "lane": "MSCH",
      "work": "Recovered CP100: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "118",
      "lane": "MSCH",
      "work": "Recovered CP101: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "119",
      "lane": "MSCH",
      "work": "Recovered CP102: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "120",
      "lane": "MSCH",
      "work": "Recovered CP103: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "121",
      "lane": "MSCH",
      "work": "Recovered CP104: preserved source/Local checkpoint",
      "stop": "Main acknowledgement recovered without source replay",
      "status": "Complete"
    },
    {
      "phase": "122",
      "lane": "MSCH",
      "work": "B105 /CP105: +0 records; 1549 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "123",
      "lane": "MSCH",
      "work": "B106 /CP106: +19 records; 1568 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "124",
      "lane": "MSCH",
      "work": "B107 /CP107: +15 records; 1583 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "125",
      "lane": "MSCH",
      "work": "B108 /CP108: +6 records; 1589 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "126",
      "lane": "MSCH",
      "work": "B109 /CP109: +4 records; 1593 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "127",
      "lane": "MSCH",
      "work": "B110 /CP110: +2 records; 1595 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "128",
      "lane": "MSCH",
      "work": "B111 /CP111: +1 records; 1596 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "129",
      "lane": "MSCH",
      "work": "B112 /CP112: +20 records; 1616 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "130",
      "lane": "MSCH",
      "work": "B113 /CP113: +1 records; 1617 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "131",
      "lane": "MSCH",
      "work": "B114 /CP114: +3 records; 1620 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "132",
      "lane": "MSCH",
      "work": "B115 /CP115: +1 records; 1621 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "133",
      "lane": "MSCH",
      "work": "B116 /CP116: +12 records; 1633 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "134",
      "lane": "MSCH",
      "work": "B117 /CP117: +11 records; 1644 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "135",
      "lane": "MSCH",
      "work": "B118 /CP118: +4 records; 1648 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "136",
      "lane": "MSCH",
      "work": "B119 /CP119: +1 records; 1649 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "137",
      "lane": "MSCH",
      "work": "B120 /CP120: +1 records; 1650 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "138",
      "lane": "MSCH",
      "work": "B121 /CP121: +3 records; 1653 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "139",
      "lane": "MSCH",
      "work": "B122 /CP122: +4 records; 1657 total",
      "stop": "Source/Local readback; Main ACKED",
      "status": "Complete"
    },
    {
      "phase": "140",
      "lane": "MSCH",
      "work": "B123: Duration_graph",
      "stop": "One verified checkpoint and Local closeout",
      "status": "Queued"
    }
  ]
};

export const livePhase = {
  "phase": "52",
  "title": "100-minute four-project live session — in progress",
  "status": "LIVE_CHECKPOINT_ROTATION",
  "completedAt": "2026-10-15T04:30:08.901Z",
  "checkpoint": "MSCH-CORPUS-CP55 / B055",
  "before": {
    "rows": 1054,
    "folders": 228,
    "files": 826,
    "pending": 136
  },
  "after": {
    "rows": 1056,
    "folders": 228,
    "files": 828,
    "pending": 135
  },
  "completedBatches": 11,
  "scope": "100-minute live session in progress. Cards show the latest MSCH phase only; session totals remain separate by lane. LSA790/1,244 occurrence rows; MSCS1,059/1,867 files hashed. Four-lane rotation retained: AEC access-blocked; MSCS Tier3 policy exhausted. Original repositories/CAD preserved. No schedule.",
  "providerReadback": "MSCH CP55; LSA CP60 including296 new metadata records; MSCS CP87. Source/native Local PRE/POST and own Main notices verified. Main acknowledgment separate.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "minimumMinutes": 100,
    "minimumWindowMet": false,
    "checkpointsPerPhase": 1,
    "elapsedAtLatestProjectionMinutes": 62.76,
    "stop": "Continue ready lanes to minimum100-minute window, then stop after verified source/Local checkpoints and terminal closeout.",
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
      "lane": "LSA",
      "work": "B061: residual direct metadata in NEA Class files",
      "status": "Queued",
      "phase": "53",
      "stop": "One source checkpoint + Local + own Main notice"
    },
    {
      "lane": "AEC",
      "work": "Original terminal still permission-blocked; existing rates retained",
      "status": "Access blocker",
      "phase": "54",
      "stop": "Original checkpoint access; no replay/replacement"
    },
    {
      "lane": "MSCH",
      "work": "B056: next FIFO metadata folder",
      "status": "Queued",
      "phase": "55",
      "stop": "One source checkpoint + Local + own Main notice"
    },
    {
      "lane": "MSCS",
      "work": "Tier3 eligibility exhausted;808 files deferred pending new policy",
      "status": "Policy gate",
      "phase": "56",
      "stop": "Separate governed oversized/native policy"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 46,
  "mainCursor": 3,
  "nextBatch": "B056",
  "nextTarget": "Next FIFO folder",
  "newRows": 2,
  "newFolders": 0,
  "newFiles": 2,
  "newKnownBytes": 12588020,
  "sessionStartedAt": "2026-10-15T03:27:23.478Z",
  "sessionElapsedMinutes": 62.75705,
  "knownBytes": 7007838741,
  "sessionReport": {
    "startedAt": "2026-10-15T03:27:23.478Z",
    "milestones": 11,
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
      "next": "B076 gated: new oversized/native policy required",
      "tier3EligibleRemaining": 0
    },
    "LSA": {
      "checkpoint": "CP60 / B060",
      "beforeRows": 436,
      "afterRows": 790,
      "addedFolders": 30,
      "addedFiles": 324,
      "addedMetadataBytes": 20297818884,
      "local": 11,
      "mainCursor": 5,
      "notice": "N7",
      "next": "B061",
      "APEXCoverage": "All487 physical occurrences represented"
    },
    "MSCH": {
      "checkpoint": "MSCH-CORPUS-CP55 / B055",
      "beforeRows": 984,
      "afterRows": 1056,
      "addedFolders": 38,
      "addedFiles": 34,
      "pending": 135,
      "local": 46,
      "mainCursor": 3,
      "notice": "N42",
      "next": "B056"
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
      "AEC original terminal access denied.",
      "MSCS needs a separately governed policy for oversized/native hashes.",
      "Main reconciliation/ACKs pending; no consumed cursor advanced.",
      "Five older MSCH queue/manifest status discrepancies remain."
    ]
  }
};

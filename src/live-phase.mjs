export const livePhase = {
  "phase": "37",
  "title": "MSCH live session - MSCH-CORPUS-CP49 / Local 40",
  "status": "STOPPED_AT_VERIFIED_CHECKPOINT",
  "completedAt": "2026-10-15T00:45:05.002Z",
  "checkpoint": "MSCH-CORPUS-CP49 / B049",
  "before": {
    "rows": 549,
    "folders": 164,
    "files": 385,
    "pending": 94
  },
  "after": {
    "rows": 983,
    "folders": 189,
    "files": 794,
    "pending": 102
  },
  "completedBatches": 17,
  "scope": "User-authorized minimum 50-minute live session completed. CP33–CP49: 17 source checkpoints and Local registrations verified. Metadata cataloguing only; source bodies remain unextracted and unexecuted. Workspace connection failed during B049 readback; CP49 recovered and cloud closeout completed. B050 was not started.",
  "providerReadback": "Four CURRENT SHA-256 hashes, PRE archives, checkpoint identity/count/byte chain and native Local PRE/POST verified through CP49. All17 new target statuses agree. Five older B009–B013 queue/manifest status discrepancies remain for review; 102 pending is the FIFO queue count. Main cursor3; N36 acknowledgment pending.",
  "localRegistration": "LOCAL_FINAL",
  "mainAck": "PENDING_SEPARATE_MAIN_SYNC",
  "budget": {
    "minimumMinutes": 50,
    "checkpointsPerPhase": 1,
    "minimumWindowMet": true,
    "elapsedAtFinalProjectionMinutes": 51.31,
    "stop": "CP49 verified and registered after workspace connection failure; cloud closeout passed. B050 remains queued. No schedule/background extraction.",
    "actualUnitStatus": "Account usage remaining is not observable; session completed the requested minimum live window."
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
      "lane": "MSCS",
      "work": "B073 hash population: at most20 files / 10MB, fewer if needed for safe closure",
      "stop": "One verified hash checkpoint; extraction remains off",
      "status": "Queued"
    },
    {
      "phase": "39",
      "lane": "LSA",
      "work": "B055: one complete candidate branch after footprint and idempotency checks",
      "stop": "One native/JSONL-agreed checkpoint; no video transcription",
      "status": "Queued"
    },
    {
      "phase": "40",
      "lane": "AEC",
      "work": "Recover original terminal checkpoint and close existing G076 records in place",
      "stop": "Verified original lock/checkpoint closure; no duplicate rate rows",
      "status": "Access blocker"
    },
    {
      "phase": "41",
      "lane": "MSCH",
      "work": "B050: first remaining FIFO folder (Research_01)",
      "stop": "One checkpoint + provider readback + Local registration",
      "status": "Queued"
    }
  ],
  "usageVisibility": "Account usage remaining is not observable here; fixed phase limits bound the work but do not predict exact credits.",
  "localHighWater": 40,
  "mainCursor": 3,
  "nextBatch": "B050",
  "nextTarget": "Research_01",
  "newRows": 434,
  "newFolders": 25,
  "newFiles": 409,
  "newKnownBytes": 1182862855,
  "sessionStartedAt": "2026-10-14T14:46:07.345Z",
  "sessionElapsedMinutes": 53.226683333333334,
  "knownBytes": 5433731030,
  "sessionReport": {
    "startedAt": "2026-10-14T23:53:46.525Z",
    "checkpointRange": "CP33–CP49",
    "sourceCheckpoints": 17,
    "localSequenceRange": "24–40",
    "Main": {
      "cursor": 3,
      "notice": "N36",
      "ack": "PENDING"
    },
    "terminalChecks": {
      "fourCURRENT_SHA256": "PASS",
      "checkpointChainIdentityAndAllDeltas": "PASS",
      "uniqueManifestIDs": 983,
      "uniqueQueuedFolderIDs": 143,
      "newFoldersQueued": 25,
      "all17SessionTargetsScannedInManifestAndQueue": "PASS",
      "nativePREPOST": "PASS_VALUES_AND_STYLES",
      "MainMailboxOnlyOwnPUYChanged": "PASS",
      "originalFourDriveScopes": "READABLE_SAME_IDS"
    },
    "legacyReview": "Five pre-session B009–B013 queue items retain PENDING_RECURSIVE_SCAN flags in the manifest despite SCANNED queue status. Retained without replay or repair.",
    "workspaceFailure": "Runtime disconnected during B049. Provider CP49, four CURRENT hashes and PRE hash were independently verified; native Local40/N36 closeout completed through connected cloud tools.",
    "preservation": "Original CURRENT IDs and Drive parents retained. Original source bodies, CAD facility and schedules preserved.",
    "next": {
      "batch": "B050",
      "target": "Research_01",
      "prerequisite": "Restore workspace, re-read CP49 and live SyncState. Do not replay B049."
    },
    "milestones": [
      {
        "checkpoint": "MSCH-CORPUS-CP33",
        "batch": "B033",
        "target": "layouts",
        "newFolders": 0,
        "newFiles": 2,
        "newEntries": 2,
        "metadataBytes": 5615,
        "catalogue": 551,
        "pendingFIFO": 93,
        "localSequence": 24
      },
      {
        "checkpoint": "MSCH-CORPUS-CP34",
        "batch": "B034",
        "target": "layouts",
        "newFolders": 0,
        "newFiles": 2,
        "newEntries": 2,
        "metadataBytes": 13157,
        "catalogue": 553,
        "pendingFIFO": 92,
        "localSequence": 25
      },
      {
        "checkpoint": "MSCH-CORPUS-CP35",
        "batch": "B035",
        "target": "maps",
        "newFolders": 0,
        "newFiles": 6,
        "newEntries": 6,
        "metadataBytes": 159573,
        "catalogue": 559,
        "pendingFIFO": 91,
        "localSequence": 26
      },
      {
        "checkpoint": "MSCH-CORPUS-CP36",
        "batch": "B036",
        "target": "maps",
        "newFolders": 0,
        "newFiles": 13,
        "newEntries": 13,
        "metadataBytes": 6328,
        "catalogue": 572,
        "pendingFIFO": 90,
        "localSequence": 27
      },
      {
        "checkpoint": "MSCH-CORPUS-CP37",
        "batch": "B037",
        "target": "montecarlo",
        "newFolders": 0,
        "newFiles": 0,
        "newEntries": 0,
        "metadataBytes": 0,
        "catalogue": 572,
        "pendingFIFO": 89,
        "localSequence": 28
      },
      {
        "checkpoint": "MSCH-CORPUS-CP38",
        "batch": "B038",
        "target": "MScS_Engineering",
        "newFolders": 9,
        "newFiles": 28,
        "newEntries": 37,
        "metadataBytes": 201906,
        "catalogue": 609,
        "pendingFIFO": 97,
        "localSequence": 29
      },
      {
        "checkpoint": "MSCH-CORPUS-CP39",
        "batch": "B039",
        "target": "OG & B",
        "newFolders": 0,
        "newFiles": 1,
        "newEntries": 1,
        "metadataBytes": 128496,
        "catalogue": 610,
        "pendingFIFO": 96,
        "localSequence": 30
      },
      {
        "checkpoint": "MSCH-CORPUS-CP40",
        "batch": "B040",
        "target": "OG & B",
        "newFolders": 0,
        "newFiles": 24,
        "newEntries": 24,
        "metadataBytes": 13745196,
        "catalogue": 634,
        "pendingFIFO": 95,
        "localSequence": 31
      },
      {
        "checkpoint": "MSCH-CORPUS-CP41",
        "batch": "B041",
        "target": "optimizer",
        "newFolders": 0,
        "newFiles": 0,
        "newEntries": 0,
        "metadataBytes": 0,
        "catalogue": 634,
        "pendingFIFO": 94,
        "localSequence": 32
      },
      {
        "checkpoint": "MSCH-CORPUS-CP42",
        "batch": "B042",
        "target": "Original and Backlog",
        "newFolders": 8,
        "newFiles": 209,
        "newEntries": 217,
        "metadataBytes": 1077255481,
        "catalogue": 851,
        "pendingFIFO": 101,
        "localSequence": 33
      },
      {
        "checkpoint": "MSCH-CORPUS-CP43",
        "batch": "B043",
        "target": "Packages",
        "newFolders": 2,
        "newFiles": 22,
        "newEntries": 24,
        "metadataBytes": 41582,
        "catalogue": 875,
        "pendingFIFO": 102,
        "localSequence": 34
      },
      {
        "checkpoint": "MSCH-CORPUS-CP44",
        "batch": "B044",
        "target": "Photos",
        "newFolders": 1,
        "newFiles": 76,
        "newEntries": 77,
        "metadataBytes": 61426451,
        "catalogue": 952,
        "pendingFIFO": 102,
        "localSequence": 35
      },
      {
        "checkpoint": "MSCH-CORPUS-CP45",
        "batch": "B045",
        "target": "PlagiarismTest",
        "newFolders": 0,
        "newFiles": 5,
        "newEntries": 5,
        "metadataBytes": 27672368,
        "catalogue": 957,
        "pendingFIFO": 101,
        "localSequence": 36
      },
      {
        "checkpoint": "MSCH-CORPUS-CP46",
        "batch": "B046",
        "target": "Project",
        "newFolders": 1,
        "newFiles": 0,
        "newEntries": 1,
        "metadataBytes": 0,
        "catalogue": 958,
        "pendingFIFO": 101,
        "localSequence": 37
      },
      {
        "checkpoint": "MSCH-CORPUS-CP47",
        "batch": "B047",
        "target": "R_Progamming",
        "newFolders": 1,
        "newFiles": 2,
        "newEntries": 3,
        "metadataBytes": 2614,
        "catalogue": 961,
        "pendingFIFO": 101,
        "localSequence": 38
      },
      {
        "checkpoint": "MSCH-CORPUS-CP48",
        "batch": "B048",
        "target": "Raster_files",
        "newFolders": 1,
        "newFiles": 16,
        "newEntries": 17,
        "metadataBytes": 2168147,
        "catalogue": 978,
        "pendingFIFO": 101,
        "localSequence": 39
      },
      {
        "checkpoint": "MSCH-CORPUS-CP49",
        "batch": "B049",
        "target": "renv",
        "newFolders": 2,
        "newFiles": 3,
        "newEntries": 5,
        "metadataBytes": 35941,
        "catalogue": 983,
        "pendingFIFO": 102,
        "localSequence": 40
      }
    ]
  }
};

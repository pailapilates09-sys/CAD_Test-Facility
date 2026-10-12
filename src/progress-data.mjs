export const onboarding = {
  "schema": "cad-facility.onboarding-projection.v1",
  "snapshotAt": "2026-10-12T01:33:38.657Z",
  "timezone": "Asia/Kathmandu",
  "verdict": "CROSS_ACCOUNT_ACCESS_PARTIAL",
  "mode": "Read-only onboarding",
  "proof": {
    "paragraphs": 756,
    "characters": 31854,
    "uniqueDriveIds": 71,
    "accessibleDriveIds": 70,
    "unavailableDriveIds": 1
  },
  "scope": "One-time public status projection of independently read provider state. No project ingestion, source/control edits, Main cursor changes or schedule changes.",
  "projects": [
    {
      "id": "MSCS",
      "name": "MSc Structural Engineering",
      "phase": "Source hash population",
      "checkpoint": "AQ-CP84 / B072",
      "metric": {
        "label": "Files hashed",
        "done": 1015,
        "total": 1867,
        "remaining": 852,
        "unit": "files",
        "definition": "Hashed source files divided by all files in the physical manifest; content extraction is a separate phase.",
        "source": "mscs"
      },
      "facts": [
        [
          "Inventory",
          "2,187 physical records"
        ],
        [
          "Files / folders",
          "1,867 / 320"
        ],
        [
          "Hashed bytes",
          "673,642,169"
        ],
        [
          "Content extraction",
          "Not started; prohibited by current controls"
        ]
      ],
      "boundary": "B072 is proven. B073 has not been executed here.",
      "next": "Separate authorization for B073 after fresh provider checks.",
      "stages": [
        {
          "name": "Physical inventory",
          "state": "done"
        },
        {
          "name": "Byte hashing",
          "state": "partial"
        },
        {
          "name": "Text / OCR",
          "state": "not-started"
        },
        {
          "name": "Semantic records",
          "state": "not-started"
        },
        {
          "name": "Tables / equations / CAD",
          "state": "not-started"
        }
      ],
      "source": "mscs"
    },
    {
      "id": "LSA",
      "name": "Lok Sewa Study Archive",
      "phase": "Occurrence catalogue",
      "checkpoint": "CP54 / B054",
      "metric": {
        "label": "Catalogue rows",
        "done": 416,
        "total": 1244,
        "remaining": 828,
        "unit": "rows",
        "definition": "Physical file and folder/root rows catalogued against the recorded 1,244-row target; it does not measure learning-content extraction.",
        "source": "lsa"
      },
      "facts": [
        [
          "Files represented",
          "350 / 1,104"
        ],
        [
          "Folder / root rows",
          "66 / 140"
        ],
        [
          "Represented bytes",
          "88,708,127,206"
        ],
        [
          "PDF / video extraction",
          "Not started"
        ]
      ],
      "boundary": "B054 recovery is closed. B055 remains a candidate.",
      "next": "Authorize candidate footprint and idempotency checks before B055.",
      "stages": [
        {
          "name": "Physical inventory",
          "state": "partial"
        },
        {
          "name": "Catalogue JSONL",
          "state": "partial"
        },
        {
          "name": "PDF text / OCR",
          "state": "not-started"
        },
        {
          "name": "Video transcription",
          "state": "not-started"
        },
        {
          "name": "Question normalization",
          "state": "not-started"
        }
      ],
      "source": "lsa"
    },
    {
      "id": "AEC",
      "name": "AEC Cost & Rate Intelligence",
      "phase": "Rates committed; terminal debt",
      "checkpoint": "G075 closed / G076 PART1",
      "metric": null,
      "facts": [
        [
          "G076 scientific rows",
          "RO-2436 and RO-2437 present"
        ],
        [
          "Original run lock",
          "Still at G075"
        ],
        [
          "Library sequence",
          "Local 11 / Main 10"
        ],
        [
          "Total phase denominator",
          "Not established; no completion percentage"
        ]
      ],
      "boundary": "Two G076 rows are committed. Terminal closure is incomplete.",
      "next": "Resolve the unavailable checkpoint and original lock in place only after explicit authorization; do not replay rate rows.",
      "stages": [
        {
          "name": "Source-page normalization",
          "state": "partial"
        },
        {
          "name": "G075 rate batch",
          "state": "done"
        },
        {
          "name": "G076 rate rows",
          "state": "partial"
        },
        {
          "name": "G076 terminal closure",
          "state": "blocked"
        },
        {
          "name": "Seq11 Main ACK",
          "state": "blocked"
        }
      ],
      "source": "aec"
    },
    {
      "id": "MSCH",
      "name": "MSc Hydropower Corpus",
      "phase": "Recursive physical catalogue",
      "checkpoint": "MSCH-CORPUS-CP12 / B012",
      "metric": null,
      "facts": [
        [
          "Physical rows",
          "500"
        ],
        [
          "Folders / files",
          "149 / 351"
        ],
        [
          "Pending FIFO folders",
          "99"
        ],
        [
          "Overall denominator",
          "Unknown while discovery continues"
        ]
      ],
      "boundary": "CP12 matches current catalogue. B013 / Test is next.",
      "next": "Separate authorization for B013; current state says ACTIVE, while the older HOLD reminder is stale.",
      "stages": [
        {
          "name": "Physical inventory",
          "state": "partial"
        },
        {
          "name": "FIFO queue",
          "state": "partial"
        },
        {
          "name": "Hydrology / HMS extraction",
          "state": "not-started"
        },
        {
          "name": "Engineering calculations",
          "state": "not-started"
        },
        {
          "name": "Semantic QA",
          "state": "not-started"
        }
      ],
      "source": "msch"
    },
    {
      "id": "JP Cost",
      "name": "JP Cost raw PDF pipeline",
      "phase": "Raw archive complete; semantic review pending",
      "checkpoint": "M02 v0.5.14",
      "metric": {
        "label": "Pages processed",
        "done": 697,
        "total": 697,
        "remaining": 0,
        "unit": "pages",
        "definition": "Raw page-extraction coverage reported by the freshly read checkpoint. This run independently verified the 80-page representative archive, not every page's scientific content.",
        "source": "jp",
        "basis": "Checkpoint totals + representative archive proof"
      },
      "facts": [
        [
          "Sources",
          "6"
        ],
        [
          "Detected tables",
          "1,374"
        ],
        [
          "Numeric candidates",
          "25,328"
        ],
        [
          "Approved new rates",
          "Not established by this extraction"
        ]
      ],
      "boundary": "Separate from AEC G076. Raw extraction completion does not prove semantic accuracy.",
      "next": "Authorize semantic review of QA records, source bboxes and recipe identity; no public price projection.",
      "stages": [
        {
          "name": "Raw PDF acquisition",
          "state": "reported-complete"
        },
        {
          "name": "Raw page extraction",
          "state": "reported-complete"
        },
        {
          "name": "Representative ZIP check",
          "state": "done"
        },
        {
          "name": "Semantic / recipe QA",
          "state": "pending"
        },
        {
          "name": "Price publication",
          "state": "not-authorized"
        }
      ],
      "source": "jp"
    }
  ],
  "sync": [
    {
      "scope": "MSCS",
      "local": 3,
      "localAck": 3,
      "main": 3,
      "status": "Aligned",
      "sourceId": "1F5LKNz5R56ofeu3b2hHwN734Hkb8NjvWDcFFE3KRajM",
      "sourceUrl": "https://docs.google.com/spreadsheets/d/1F5LKNz5R56ofeu3b2hHwN734Hkb8NjvWDcFFE3KRajM/edit",
      "note": "Cursors agree at 3/3; registrar notes remain at CP60/B048 while machine state is CP84/B072."
    },
    {
      "scope": "LSA",
      "local": 5,
      "localAck": 5,
      "main": 5,
      "status": "Aligned",
      "sourceId": "1m1sTSD7pFqS57Dcon9KtUajqnm0MuwL4jnls12lck_o",
      "sourceUrl": "https://docs.google.com/spreadsheets/d/1m1sTSD7pFqS57Dcon9KtUajqnm0MuwL4jnls12lck_o/edit",
      "note": "CP54/B054 and same-sequence ACK independently read."
    },
    {
      "scope": "AEC",
      "local": 11,
      "localAck": 10,
      "main": 10,
      "status": "One sequence pending",
      "sourceId": "1Sx86AXrMklFHuxq9peHyt1NfyGKFnwBFUWgdJu_Enjg",
      "sourceUrl": "https://docs.google.com/spreadsheets/d/1Sx86AXrMklFHuxq9peHyt1NfyGKFnwBFUWgdJu_Enjg/edit",
      "note": "Seq11 repository audit awaits Main ACK; G076 rate-row lock debt is separate."
    },
    {
      "scope": "MSCH",
      "local": 3,
      "localAck": 3,
      "main": 3,
      "status": "Aligned",
      "sourceId": null,
      "sourceUrl": null,
      "note": "CP12 data matches 500 manifest rows; older state headers and HOLD reminder remain."
    }
  ],
  "sources": [
    {
      "id": "handover",
      "label": "Complete JSON handover",
      "url": "https://docs.google.com/document/d/11aCRhy2vqjyrfOqgTqs-eznQ-ZPQ-vO0XP0cMpQtDMw/edit",
      "type": "Historical handover independently read",
      "evidence": "756 paragraphs; 31,854 characters; complete JSON parse.",
      "scope": "Global"
    },
    {
      "id": "controls",
      "label": "ACTIVE control map",
      "url": "https://drive.google.com/file/d/10vbBnJ4IxiZTCwvQgxczGc3UJwvQtyAe/view",
      "type": "Live Drive read",
      "evidence": "REV20261004_WORK_R06 plus six current authority document headers.",
      "scope": "Global"
    },
    {
      "id": "main",
      "label": "Main Library",
      "url": "https://docs.google.com/spreadsheets/d/18NE0GIbw0lDDlrIcflGS3_VccDZ2LZn1FoPbebSc71o/edit",
      "type": "Live Sheets read",
      "evidence": "README, AddressLookup, ControlRegister and LocalLibraryRegistry; four Local catalogues independently read.",
      "scope": "Global"
    },
    {
      "id": "mscs",
      "label": "MSCS CP84 and SQLite",
      "url": "https://drive.google.com/file/d/1t0g71v7WH2UOecQXJeBtx4AGcAvy6km9/view",
      "type": "Raw download and read-only SQLite",
      "evidence": "2,682,880 bytes; checkpoint SHA matches; integrity_check=ok; 2,187 records; 1,015 hashes.",
      "scope": "MSCS"
    },
    {
      "id": "lsa",
      "label": "LSA CP54 and CURRENT JSONL",
      "url": "https://drive.google.com/file/d/1jGuSsvcGyOJI0epYEWAetGQ7Q-RdqHqm/view",
      "type": "Raw download and JSONL parse",
      "evidence": "245,718 bytes; 416 unique physical IDs; SHA matches CP54.",
      "scope": "LSA"
    },
    {
      "id": "aec",
      "label": "AEC canonical master",
      "url": "https://docs.google.com/spreadsheets/d/1yJX1Dep0_2ZDvRftu3u-Bb6ZbDqtQWKDChQQlYCWYXY/edit",
      "type": "Live Sheets and PDF inspection",
      "evidence": "RO-2436/2437 exist; original lock still closes G075; Kaski PDF has 80 pages and p39 is image-only.",
      "scope": "AEC"
    },
    {
      "id": "msch",
      "label": "MSCH current manifest and CP12",
      "url": null,
      "type": "Raw download and JSONL parse",
      "evidence": "500 physical rows, 149 folders, 351 files, 99 pending FIFO folders; current gate ACTIVE, older HOLD reminder stale. Source links omitted from the public projection because of observed edit-link exposure.",
      "scope": "MSCH"
    },
    {
      "id": "jp",
      "label": "JP Cost v0.5.14 checkpoint",
      "url": "https://drive.google.com/file/d/1oJOes27mustzwQPota4_U7H9Tv8Q4sEE/view",
      "type": "Live checkpoint and raw ZIP check",
      "evidence": "Representative SRC-0005 ZIP: 11 total members, 10 JSONL files plus manifest; CRC passes. Six-source totals come from the freshly read checkpoint; only one archive independently downloaded here.",
      "scope": "JP Cost"
    }
  ],
  "debts": [
    {
      "id": "D01",
      "scope": "AEC",
      "priority": "High",
      "title": "Terminal checkpoint unavailable",
      "detail": "The exact Oct9 terminal-checkpoint ID returns Google Drive 404. This can mean missing or inaccessible; it does not prove deletion.",
      "state": "Blocked",
      "source": "aec"
    },
    {
      "id": "D02",
      "scope": "AEC",
      "priority": "High",
      "title": "G076 rows and original lock disagree",
      "detail": "RO-2436/2437 are already present in the canonical master, while the original lock still records G075. Any later recovery must update existing terminal records and avoid duplicate rates.",
      "state": "Pending authorization",
      "source": "aec"
    },
    {
      "id": "D03",
      "scope": "AEC",
      "priority": "Medium",
      "title": "One Local-to-Main sequence pending",
      "detail": "Both Local SyncState and Main LocalLibraryRegistry independently show Local 11 / Main consumed 10.",
      "state": "Verified debt",
      "source": "main"
    },
    {
      "id": "D04",
      "scope": "MSCS",
      "priority": "Medium",
      "title": "Registrar narrative behind machine state",
      "detail": "Main/Local cursors agree at 3/3, but Local notes still describe CP60/B048; CP84/B072 and 1,015 hashes are independently proven.",
      "state": "Verified freshness gap",
      "source": "mscs"
    },
    {
      "id": "D05",
      "scope": "MSCS",
      "priority": "Medium",
      "title": "Frozen-source preservation gaps",
      "detail": "The freshly read progress JSON retains 14 HEIC fee files and 3 routine files absent from frozen scopes. No repair or deduplication was performed.",
      "state": "Recorded in live progress",
      "source": "mscs"
    },
    {
      "id": "D06",
      "scope": "LSA",
      "priority": "Medium",
      "title": "B055 candidate footprint unverified",
      "detail": "Recursive size, parent occurrence semantics and idempotency need a later governed check. B054 must not be replayed.",
      "state": "Remaining",
      "source": "lsa"
    },
    {
      "id": "D07",
      "scope": "MSCH",
      "priority": "Medium",
      "title": "Old headers and HOLD reminder remain",
      "detail": "Live state reports hold.active=false and READ_FIRST reports ACTIVE, but older CP09/CP11 headers and the CP04 HOLD reminder remain. Current manifest and CP12 agree on 500 rows.",
      "state": "Verified stale pointers",
      "source": "msch"
    },
    {
      "id": "D08",
      "scope": "MSCH",
      "priority": "High",
      "title": "Source/control edit-link exposure",
      "detail": "Drive permission reads show anyone/writer on the MSCH source root and control folder. Permissions were not changed; exposed IDs and links are omitted from this public projection.",
      "state": "Observed security debt",
      "source": "msch"
    },
    {
      "id": "D09",
      "scope": "JP Cost",
      "priority": "High",
      "title": "Semantic acceptance unfinished",
      "detail": "25,328 numeric candidates are hypotheses, not approved prices. Table roles, recipes, units and source ambiguity still require review.",
      "state": "Review pending",
      "source": "jp"
    },
    {
      "id": "D10",
      "scope": "JP Cost",
      "priority": "Medium",
      "title": "Source registration and stale manifest",
      "detail": "The current checkpoint reports a Kaski Source Index #REF!, a source manifest behind the live master, and pending DUDBC registration. These were not repaired or independently exhaustively audited here.",
      "state": "Checkpoint-reported debt",
      "source": "jp"
    },
    {
      "id": "D11",
      "scope": "Global",
      "priority": "Medium",
      "title": "Originating-account scheduler unverified here",
      "detail": "This connected account lists zero automations. The handover says the originating master was disabled; its separate account state was not independently queried.",
      "state": "Cross-account limit",
      "source": "handover"
    },
    {
      "id": "D12",
      "scope": "Global",
      "priority": "Medium",
      "title": "Raw writes remain untested",
      "detail": "Upload/update contracts are available, but no write probe was performed under read-only onboarding. Successful downloads do not prove connector write egress.",
      "state": "Intentional verification limit",
      "source": "controls"
    }
  ],
  "tests": [
    {
      "id": "T01",
      "label": "Complete handover read and JSON parse",
      "state": "pass",
      "detail": "756 paragraphs; indexes 1–31,855; 31,854 characters; complete JSON parsed.",
      "source": "handover"
    },
    {
      "id": "T02",
      "label": "Connected Drive identity",
      "state": "pass",
      "detail": "Provider profile and A9 root writer permission independently match the user-authorized connected identity.",
      "source": "controls"
    },
    {
      "id": "T03",
      "label": "A9 root and ACTIVE controls",
      "state": "pass",
      "detail": "Root direct listing, active map and six control document headers read.",
      "source": "controls"
    },
    {
      "id": "T04",
      "label": "Main and four Local Libraries",
      "state": "pass",
      "detail": "Main key surfaces plus four Local READ_FIRST/SyncState/catalogue reads completed; AEC mismatch retained.",
      "source": "main"
    },
    {
      "id": "T05",
      "label": "LSA raw JSONL",
      "state": "pass",
      "detail": "416 records; 245,718 bytes; exact SHA f342a0d320281cc4485ab4c3af7647e9622e4b4410a235fc634bace26959fddb.",
      "source": "lsa"
    },
    {
      "id": "T06",
      "label": "MSCS read-only SQLite",
      "state": "pass",
      "detail": "PRAGMA integrity_check=ok; 2,187 records; checkpoint hash 884ed1ed9bcd12ebde38fd7dba82a816e0c76ad20183e6b35bb6f36e42a8d670 matched.",
      "source": "mscs"
    },
    {
      "id": "T07",
      "label": "Kaski PDF and page 39",
      "state": "pass",
      "detail": "80 pages; 14,346,379 bytes; page 39 rendered and visually inspected. Text extraction produced only a form-feed; no OCR acceptance claimed.",
      "source": "aec"
    },
    {
      "id": "T08",
      "label": "MSCH manifest, queue and gate",
      "state": "pass",
      "detail": "500 rows, 149 folders, 351 files; 99 PENDING folders; ACTIVE/hold=false read independently. Stale HOLD reminder retained as debt.",
      "source": "msch"
    },
    {
      "id": "T09",
      "label": "JP Cost representative ZIP",
      "state": "pass",
      "detail": "8,231,379 bytes; 11 total members = 10 JSONL + manifest; ZIP CRC passes. Only SRC-0005 independently downloaded here.",
      "source": "jp"
    },
    {
      "id": "T10",
      "label": "All handover Drive IDs",
      "state": "partial",
      "detail": "70 of 71 metadata reads pass. The exact AEC Oct9 checkpoint returns 404.",
      "source": "handover"
    },
    {
      "id": "T11",
      "label": "Raw upload/update egress",
      "state": "untested",
      "detail": "Action schemas are present; no mutations or write probes executed.",
      "source": "controls"
    },
    {
      "id": "T12",
      "label": "Originating scheduler state",
      "state": "unverified",
      "detail": "No automations in this account. Originating account's disabled-master claim remains historical.",
      "source": "handover"
    }
  ],
  "capabilities": [
    {
      "area": "Raw file read",
      "status": "Verified",
      "tool": "google_drive.fetch",
      "contract": "url + download_raw_file:true + include_base64:false → streamed file_uri; materialized authenticated bytes in scratch.",
      "proof": "JSONL, SQLite, PDF and ZIP downloaded and independently parsed.",
      "source": "controls"
    },
    {
      "area": "Raw upload",
      "status": "Available · untested",
      "tool": "google_drive.upload_file",
      "contract": "file_uri:string, file_name?, mime_type?, parent_folder_id?; schema says absolute local file path.",
      "proof": "No new Drive file created; runtime-to-connector upload egress untested.",
      "source": "controls"
    },
    {
      "area": "Raw same-ID update",
      "status": "Available · untested",
      "tool": "google_drive.update_file",
      "contract": "fileId + file_uri? + mime_type?; file_uri replaces stored non-native bytes in place. Native Workspace MIME types require dedicated editors.",
      "proof": "No source/control replacement attempted.",
      "source": "controls"
    },
    {
      "area": "Native Google Docs",
      "status": "Read verified · edits untested",
      "tool": "get_document_text / batch_update_document",
      "contract": "Reads use native document_id/document_url; editor uses native batchUpdate requests.",
      "proof": "Handover plus Local procedures and control headers read completely.",
      "source": "handover"
    },
    {
      "area": "Native Google Sheets",
      "status": "Read verified · edits untested",
      "tool": "get_spreadsheet_metadata / get_spreadsheet_cells / batch_update_spreadsheet",
      "contract": "Native spreadsheet_id + bounded existing A1 ranges; formatted cell values read.",
      "proof": "Main and four Local registrars plus AEC committed IDs read.",
      "source": "main"
    },
    {
      "area": "JSON / JSONL",
      "status": "Verified",
      "tool": "Python json + SHA-256",
      "contract": "Parse complete raw bytes; count physical IDs and compare checkpoint hashes.",
      "proof": "LSA 416 rows; MSCH 500 rows and 99 pending FIFO folders.",
      "source": "lsa"
    },
    {
      "area": "SQLite",
      "status": "Verified",
      "tool": "Python sqlite3",
      "contract": "file:…?mode=ro; PRAGMA integrity_check; read-only SELECT.",
      "proof": "MSCS 2,187 records; 1,015 populated checksums.",
      "source": "mscs"
    },
    {
      "area": "Scanned PDF",
      "status": "Render verified · OCR untested",
      "tool": "pdfinfo / pdftoppm / pdftotext / tesseract",
      "contract": "Page render and existing-text inspection work; installed OCR engine presence is not OCR correctness.",
      "proof": "Page 39 inspected as image-only. No new ingestion or OCR acceptance.",
      "source": "aec"
    },
    {
      "area": "Archive / video tools",
      "status": "ZIP verified · video untested",
      "tool": "Python zipfile / unzip / ffmpeg",
      "contract": "ZIP member/CRC read proven; ffmpeg is installed, transcription pipeline not tested.",
      "proof": "11 archive members; no unpacking into source trees; no transcription.",
      "source": "jp"
    },
    {
      "area": "GitHub and Pages",
      "status": "Existing site verified",
      "tool": "github.fetch / create_tree / create_commit / update_ref",
      "contract": "Website projection only; expected-head lease protects main; Actions deploys static dist.",
      "proof": "CAD retained as a subpage; project data and Main cursors are outside write scope.",
      "source": "controls"
    },
    {
      "area": "Automation",
      "status": "Inventory read verified",
      "tool": "automations.list",
      "contract": "Read-only inventory is account-specific. Creation, resumption and transfer are prohibited for this onboarding.",
      "proof": "Zero automations observed in this account.",
      "source": "handover"
    }
  ],
  "controls": [
    {
      "name": "Drive Library Governance",
      "version": "v2.4",
      "status": "Live body header verified"
    },
    {
      "name": "Save Router",
      "version": "v1.13_CANONICAL_OWNERSHIP_ADDRESS_FIRST",
      "status": "Live body header verified"
    },
    {
      "name": "AI Tool Control Tower",
      "version": "v0.42_CANONICAL_OWNERSHIP_ADDRESS_FIRST",
      "status": "Live body header verified"
    },
    {
      "name": "ChatGPT Control Tower",
      "version": "v0.2L_CANONICAL_OWNERSHIP_ADDRESS_FIRST",
      "status": "Live body header verified"
    },
    {
      "name": "Durable Workspace Protocol",
      "version": "v1.8",
      "status": "Live body header verified"
    },
    {
      "name": "Audit / Reproduction",
      "version": "v1.4",
      "status": "Live body header verified"
    }
  ],
  "tree": {
    "rootId": "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c",
    "nodes": [
      {
        "id": "1D50lwc33TQ8g9-95kWERrEbJyYgSAOB9",
        "driveId": "1D50lwc33TQ8g9-95kWERrEbJyYgSAOB9",
        "name": "98_INTAKE_STAGING",
        "parents": [
          "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1D50lwc33TQ8g9-95kWERrEbJyYgSAOB9",
        "restricted": false
      },
      {
        "id": "1S5EHdZfILRGaIvcFn60a5IbLjQELR8TsPzDYAY2sv1M",
        "driveId": "1S5EHdZfILRGaIvcFn60a5IbLjQELR8TsPzDYAY2sv1M",
        "name": "00_READ_FIRST__A9_INTAKE_STAGING",
        "parents": [
          "1D50lwc33TQ8g9-95kWERrEbJyYgSAOB9"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://docs.google.com/document/d/1S5EHdZfILRGaIvcFn60a5IbLjQELR8TsPzDYAY2sv1M/edit",
        "restricted": false
      },
      {
        "id": "1AYpMShaHkRBKtpfKZFyY1lzZUcDcVvZs46ReCZqrpOI",
        "driveId": "1AYpMShaHkRBKtpfKZFyY1lzZUcDcVvZs46ReCZqrpOI",
        "name": "A9_INTAKE_REGISTER_v0.1",
        "parents": [
          "1D50lwc33TQ8g9-95kWERrEbJyYgSAOB9"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/1AYpMShaHkRBKtpfKZFyY1lzZUcDcVvZs46ReCZqrpOI/edit",
        "restricted": false
      },
      {
        "id": "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c",
        "driveId": "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c",
        "name": "A9_Fabin_Gurung",
        "parents": [],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c",
        "restricted": false
      },
      {
        "id": "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg",
        "driveId": "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg",
        "name": "00_DRIVE_CONTROL_CENTER",
        "parents": [
          "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg",
        "restricted": false
      },
      {
        "id": "10vbBnJ4IxiZTCwvQgxczGc3UJwvQtyAe",
        "driveId": "10vbBnJ4IxiZTCwvQgxczGc3UJwvQtyAe",
        "name": "00_ACTIVE_CONTROL_MAP__READ_FIRST.md",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/10vbBnJ4IxiZTCwvQgxczGc3UJwvQtyAe/view",
        "restricted": false
      },
      {
        "id": "18NE0GIbw0lDDlrIcflGS3_VccDZ2LZn1FoPbebSc71o",
        "driveId": "18NE0GIbw0lDDlrIcflGS3_VccDZ2LZn1FoPbebSc71o",
        "name": "Fabin_Gurung_Drive_Index",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/18NE0GIbw0lDDlrIcflGS3_VccDZ2LZn1FoPbebSc71o/edit",
        "restricted": false
      },
      {
        "id": "1fNY5HuvOE6ANjrnrZAYjdtMR-I3yPB4IWT2E31vi4Cg",
        "driveId": "1fNY5HuvOE6ANjrnrZAYjdtMR-I3yPB4IWT2E31vi4Cg",
        "name": "DRIVE_LIBRARY_GOVERNANCE_AND_GOVERNED_CLOSEOUT_CONTROL_v2.4",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1fNY5HuvOE6ANjrnrZAYjdtMR-I3yPB4IWT2E31vi4Cg/view",
        "restricted": false
      },
      {
        "id": "1fRmQCvFvyoSwI0y-wKbOFG-esrkG61Z0dmweGoehCUU",
        "driveId": "1fRmQCvFvyoSwI0y-wKbOFG-esrkG61Z0dmweGoehCUU",
        "name": "00_SAVE_ROUTING_RULES_READ_FIRST",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1fRmQCvFvyoSwI0y-wKbOFG-esrkG61Z0dmweGoehCUU/view",
        "restricted": false
      },
      {
        "id": "1ZMql2ac5G0nTx2vukE6ezlMh8vq0RXH_RREugshJCCA",
        "driveId": "1ZMql2ac5G0nTx2vukE6ezlMh8vq0RXH_RREugshJCCA",
        "name": "00_AI_TOOL_CONTROL_TOWER_READ_FIRST__v0.42_CANONICAL_OWNERSHIP_ADDRESS_FIRST",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1ZMql2ac5G0nTx2vukE6ezlMh8vq0RXH_RREugshJCCA/view",
        "restricted": false
      },
      {
        "id": "1R3Nw8Onp4A2xQ811Z7byb1Kw56uJS2JGsuiJNq2AKo8",
        "driveId": "1R3Nw8Onp4A2xQ811Z7byb1Kw56uJS2JGsuiJNq2AKo8",
        "name": "00_CHATGPT_CONTROL_TOWER_READ_FIRST",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1R3Nw8Onp4A2xQ811Z7byb1Kw56uJS2JGsuiJNq2AKo8/view",
        "restricted": false
      },
      {
        "id": "1ZGWdS--yS4TUccie2ypt3e6ovqaevbMJmmWvT5zCqss",
        "driveId": "1ZGWdS--yS4TUccie2ypt3e6ovqaevbMJmmWvT5zCqss",
        "name": "A9_AI_CHAT_AND_DURABLE_WORKSPACE_PROTOCOL_v1.8",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1ZGWdS--yS4TUccie2ypt3e6ovqaevbMJmmWvT5zCqss/view",
        "restricted": false
      },
      {
        "id": "1xI7QTvYLojvJRJR6Duovc6UiiNPy1vmDuqLyjT0Duzk",
        "driveId": "1xI7QTvYLojvJRJR6Duovc6UiiNPy1vmDuqLyjT0Duzk",
        "name": "A9_AUDIT_TRAIL_TRACEABILITY_AND_REPRODUCTION_PROTOCOL_v1.4",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1xI7QTvYLojvJRJR6Duovc6UiiNPy1vmDuqLyjT0Duzk/view",
        "restricted": false
      },
      {
        "id": "1fxej2E-TfxnNTsIKFqRO3oTPk4_QQR39",
        "driveId": "1fxej2E-TfxnNTsIKFqRO3oTPk4_QQR39",
        "name": "LONG_RUNNING_WORK_CHECKPOINT_PROTOCOL.md",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1fxej2E-TfxnNTsIKFqRO3oTPk4_QQR39/view",
        "restricted": false
      },
      {
        "id": "1CmpS8Cueuf7M6tp8Z9Rz-cxLP5jVTGB6dlfgWAD14Is",
        "driveId": "1CmpS8Cueuf7M6tp8Z9Rz-cxLP5jVTGB6dlfgWAD14Is",
        "name": "02_STABLE_LIVE_ARTIFACT__SNAPSHOT_BEFORE_EDIT_SOP_v1.0",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1CmpS8Cueuf7M6tp8Z9Rz-cxLP5jVTGB6dlfgWAD14Is/view",
        "restricted": false
      },
      {
        "id": "1nbRKJ_vveUX5BaOveZRg2dKWjunN0YGpyvMG_8MSsrs",
        "driveId": "1nbRKJ_vveUX5BaOveZRg2dKWjunN0YGpyvMG_8MSsrs",
        "name": "ARTIFACT_LINEAGE_AND_TRACEABILITY_PROTOCOL_v1.0",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1nbRKJ_vveUX5BaOveZRg2dKWjunN0YGpyvMG_8MSsrs/view",
        "restricted": false
      },
      {
        "id": "1RWNZiNDDIL3S71RXLhbN3m7WFcY5yYURY5WnF4NzDxQ",
        "driveId": "1RWNZiNDDIL3S71RXLhbN3m7WFcY5yYURY5WnF4NzDxQ",
        "name": "CHAT_RESPONSE_READABILITY_CONTROL_v1.3",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1RWNZiNDDIL3S71RXLhbN3m7WFcY5yYURY5WnF4NzDxQ/view",
        "restricted": false
      },
      {
        "id": "restricted-node-018",
        "driveId": null,
        "name": "02_Thesis",
        "parents": [
          "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c"
        ],
        "kind": "folder",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-node-019",
        "driveId": null,
        "name": "MSCH source corpus",
        "parents": [
          "restricted-node-018"
        ],
        "kind": "folder",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-node-020",
        "driveId": null,
        "name": "MSCH_Hydropower_Research_Corpus_Control",
        "parents": [
          "restricted-node-073"
        ],
        "kind": "folder",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "1Ikx2IGPTjailf1EhALQZPqMMkf3yj2q8",
        "driveId": "1Ikx2IGPTjailf1EhALQZPqMMkf3yj2q8",
        "name": "05_AEC_Knowledge",
        "parents": [
          "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1Ikx2IGPTjailf1EhALQZPqMMkf3yj2q8",
        "restricted": false
      },
      {
        "id": "1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne",
        "driveId": "1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne",
        "name": "06_COST_RATE_INTELLIGENCE",
        "parents": [
          "1Ikx2IGPTjailf1EhALQZPqMMkf3yj2q8"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne",
        "restricted": false
      },
      {
        "id": "1WptKyLWGfcUdPSuashMn4BqMjbT5aUCC",
        "driveId": "1WptKyLWGfcUdPSuashMn4BqMjbT5aUCC",
        "name": "01_Source_Documents",
        "parents": [
          "1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1WptKyLWGfcUdPSuashMn4BqMjbT5aUCC",
        "restricted": false
      },
      {
        "id": "1ZXF3rvx_KkMez3wOkKNvYjnhF9xMJEGy",
        "driveId": "1ZXF3rvx_KkMez3wOkKNvYjnhF9xMJEGy",
        "name": "01_JSON",
        "parents": [
          "1oCCtvrlHftOht0ULbuiYD3idr9mBe4U5"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1ZXF3rvx_KkMez3wOkKNvYjnhF9xMJEGy",
        "restricted": false
      },
      {
        "id": "14LuA7OW5TkO1D6NRalUYZkMhd92X1RHl",
        "driveId": "14LuA7OW5TkO1D6NRalUYZkMhd92X1RHl",
        "name": "02_CSV",
        "parents": [
          "1oCCtvrlHftOht0ULbuiYD3idr9mBe4U5"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/14LuA7OW5TkO1D6NRalUYZkMhd92X1RHl",
        "restricted": false
      },
      {
        "id": "1oV5j_TuX4pnneiC1LTJnGDZ80CpYtW4S",
        "driveId": "1oV5j_TuX4pnneiC1LTJnGDZ80CpYtW4S",
        "name": "JP_COST__M02_RAW_EXTRACTION_FROZEN__v0.5.14__20261011__697PAGES",
        "parents": [
          "1oCCtvrlHftOht0ULbuiYD3idr9mBe4U5"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1oV5j_TuX4pnneiC1LTJnGDZ80CpYtW4S",
        "restricted": false
      },
      {
        "id": "1wtsJytC1-09WES7J_z7s5O7498JVMVwh",
        "driveId": "1wtsJytC1-09WES7J_z7s5O7498JVMVwh",
        "name": "03_MASTER_DATABASE",
        "parents": [
          "1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1wtsJytC1-09WES7J_z7s5O7498JVMVwh",
        "restricted": false
      },
      {
        "id": "10vmHOd4wlJDfp6qs6JEqwbFwmTJW98Id",
        "driveId": "10vmHOd4wlJDfp6qs6JEqwbFwmTJW98Id",
        "name": "08_MSc_Structural_Engineering",
        "parents": [
          "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/10vmHOd4wlJDfp6qs6JEqwbFwmTJW98Id",
        "restricted": false
      },
      {
        "id": "175tM48J3VuhuurwsdfMhAc5e3L6xe3uD",
        "driveId": "175tM48J3VuhuurwsdfMhAc5e3L6xe3uD",
        "name": "00_PROGRAM_SOURCE_ARCHIVE",
        "parents": [
          "10vmHOd4wlJDfp6qs6JEqwbFwmTJW98Id"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/175tM48J3VuhuurwsdfMhAc5e3L6xe3uD",
        "restricted": false
      },
      {
        "id": "15SKZXM9mUqUfVciev5vye8bE8GCentlF",
        "driveId": "15SKZXM9mUqUfVciev5vye8bE8GCentlF",
        "name": "01_AI_QUERY_LAYER",
        "parents": [
          "10vmHOd4wlJDfp6qs6JEqwbFwmTJW98Id"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/15SKZXM9mUqUfVciev5vye8bE8GCentlF",
        "restricted": false
      },
      {
        "id": "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv",
        "driveId": "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv",
        "name": "v1",
        "parents": [
          "15SKZXM9mUqUfVciev5vye8bE8GCentlF"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/15rdxMTkedzBnxr_mMzahmSL0mO80RHdv",
        "restricted": false
      },
      {
        "id": "1nGu56rz_lgyoIeB-7J9Y3U9-ZaCaxu45",
        "driveId": "1nGu56rz_lgyoIeB-7J9Y3U9-ZaCaxu45",
        "name": "00_MANIFEST",
        "parents": [
          "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1nGu56rz_lgyoIeB-7J9Y3U9-ZaCaxu45",
        "restricted": false
      },
      {
        "id": "1eENBU4LpzCDberHTaIscZ3wLZEJrptf3",
        "driveId": "1eENBU4LpzCDberHTaIscZ3wLZEJrptf3",
        "name": "01_RAW_EXTRACTIONS",
        "parents": [
          "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1eENBU4LpzCDberHTaIscZ3wLZEJrptf3",
        "restricted": false
      },
      {
        "id": "1wxFty43Ctq_tlXLZxgojGeqgY4YqTovi",
        "driveId": "1wxFty43Ctq_tlXLZxgojGeqgY4YqTovi",
        "name": "02_NORMALIZED_RECORDS",
        "parents": [
          "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1wxFty43Ctq_tlXLZxgojGeqgY4YqTovi",
        "restricted": false
      },
      {
        "id": "1VBmwTFNRIJ3f8SZ1rSIIQDPTIu-ydVtG",
        "driveId": "1VBmwTFNRIJ3f8SZ1rSIIQDPTIu-ydVtG",
        "name": "03_TABLES_FIGURES_EQUATIONS",
        "parents": [
          "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1VBmwTFNRIJ3f8SZ1rSIIQDPTIu-ydVtG",
        "restricted": false
      },
      {
        "id": "1v7_e5B2QIZyy03KXD2VdUCMOEPgvGt0b",
        "driveId": "1v7_e5B2QIZyy03KXD2VdUCMOEPgvGt0b",
        "name": "04_CAD_GEOMETRY",
        "parents": [
          "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1v7_e5B2QIZyy03KXD2VdUCMOEPgvGt0b",
        "restricted": false
      },
      {
        "id": "1EWbVTTtFgjCCHGtSLk1JMG0MBbKx8oGB",
        "driveId": "1EWbVTTtFgjCCHGtSLk1JMG0MBbKx8oGB",
        "name": "05_QUERY_DATABASE",
        "parents": [
          "15rdxMTkedzBnxr_mMzahmSL0mO80RHdv"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1EWbVTTtFgjCCHGtSLk1JMG0MBbKx8oGB",
        "restricted": false
      },
      {
        "id": "1SrCyfQFgRijosKFRh2ICXOYZ8U4XU4h_",
        "driveId": "1SrCyfQFgRijosKFRh2ICXOYZ8U4XU4h_",
        "name": "09_Professional_Engineering_and_Competitive_Exams",
        "parents": [
          "1yZ4IquFfd-9AmAsM1eaXAYFSBwONpn-c"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1SrCyfQFgRijosKFRh2ICXOYZ8U4XU4h_",
        "restricted": false
      },
      {
        "id": "1PUhOOCMquZbeORRmKCls0XXDqp9ZfNj9",
        "driveId": "1PUhOOCMquZbeORRmKCls0XXDqp9ZfNj9",
        "name": "00_CONTROL",
        "parents": [
          "1SrCyfQFgRijosKFRh2ICXOYZ8U4XU4h_"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1PUhOOCMquZbeORRmKCls0XXDqp9ZfNj9",
        "restricted": false
      },
      {
        "id": "1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi",
        "driveId": "1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi",
        "name": "01_PHASE1_MANIFESTS",
        "parents": [
          "1PUhOOCMquZbeORRmKCls0XXDqp9ZfNj9"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi",
        "restricted": false
      },
      {
        "id": "1WteslOFg3Klf_D_C3UHj2_OkmLPvaaaB",
        "driveId": "1WteslOFg3Klf_D_C3UHj2_OkmLPvaaaB",
        "name": "00_SOURCE_ARCHIVE",
        "parents": [
          "1uTwx9_KlAgwrASshAbNiT5vZM2YuLCck"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1WteslOFg3Klf_D_C3UHj2_OkmLPvaaaB",
        "restricted": false
      },
      {
        "id": "1VfPmljdCgxbhMXcsqzPh72VYKKs8IBEo",
        "driveId": "1VfPmljdCgxbhMXcsqzPh72VYKKs8IBEo",
        "name": "APEX NOTES",
        "parents": [
          "1WteslOFg3Klf_D_C3UHj2_OkmLPvaaaB"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1VfPmljdCgxbhMXcsqzPh72VYKKs8IBEo",
        "restricted": false
      },
      {
        "id": "1zMJHXLvevrhhzHt6iC5CxocBf5IhRNbD",
        "driveId": "1zMJHXLvevrhhzHt6iC5CxocBf5IhRNbD",
        "name": "NEA",
        "parents": [
          "1WteslOFg3Klf_D_C3UHj2_OkmLPvaaaB"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1zMJHXLvevrhhzHt6iC5CxocBf5IhRNbD",
        "restricted": false
      },
      {
        "id": "1t0g71v7WH2UOecQXJeBtx4AGcAvy6km9",
        "driveId": "1t0g71v7WH2UOecQXJeBtx4AGcAvy6km9",
        "name": "AQ_CP84__SOURCE_SHA256_B072__20260918_NPT.md",
        "parents": [
          "1nGu56rz_lgyoIeB-7J9Y3U9-ZaCaxu45"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1t0g71v7WH2UOecQXJeBtx4AGcAvy6km9/view",
        "restricted": false
      },
      {
        "id": "17FXHlm49mGwpjXiD23BAH_z28uN3fdWU",
        "driveId": "17FXHlm49mGwpjXiD23BAH_z28uN3fdWU",
        "name": "archive_manifest.jsonl",
        "parents": [
          "1nGu56rz_lgyoIeB-7J9Y3U9-ZaCaxu45"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/17FXHlm49mGwpjXiD23BAH_z28uN3fdWU/view",
        "restricted": false
      },
      {
        "id": "1SMDAyXphToymQsJCkbUdW6WQ8U1p-udn",
        "driveId": "1SMDAyXphToymQsJCkbUdW6WQ8U1p-udn",
        "name": "archive_manifest.sqlite",
        "parents": [
          "1EWbVTTtFgjCCHGtSLk1JMG0MBbKx8oGB"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1SMDAyXphToymQsJCkbUdW6WQ8U1p-udn/view",
        "restricted": false
      },
      {
        "id": "1cABhD0rL0OwZdX70iRia1LXmY--33zrI",
        "driveId": "1cABhD0rL0OwZdX70iRia1LXmY--33zrI",
        "name": "manifest_progress.json",
        "parents": [
          "1nGu56rz_lgyoIeB-7J9Y3U9-ZaCaxu45"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1cABhD0rL0OwZdX70iRia1LXmY--33zrI/view",
        "restricted": false
      },
      {
        "id": "1dtXHSyk4sTFU1791szeXc90H9LznqG9jE1TZKfrHSfY",
        "driveId": "1dtXHSyk4sTFU1791szeXc90H9LznqG9jE1TZKfrHSfY",
        "name": "CURRENT_STATUS.md",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1dtXHSyk4sTFU1791szeXc90H9LznqG9jE1TZKfrHSfY/view",
        "restricted": false
      },
      {
        "id": "18UoDpvXwgW_DsO7oOoJF07Oe2hJcc9mc",
        "driveId": "18UoDpvXwgW_DsO7oOoJF07Oe2hJcc9mc",
        "name": "00_LOCAL_LIBRARY",
        "parents": [
          "15SKZXM9mUqUfVciev5vye8bE8GCentlF"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/18UoDpvXwgW_DsO7oOoJF07Oe2hJcc9mc",
        "restricted": false
      },
      {
        "id": "1lHOMui0uO7rZo_9c5NpHv-EqiV8Yr9Qke6G-8hA5qNs",
        "driveId": "1lHOMui0uO7rZo_9c5NpHv-EqiV8Yr9Qke6G-8hA5qNs",
        "name": "LSA_PHASE1B_OCCURRENCE_MANIFEST_CURRENT",
        "parents": [
          "1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/1lHOMui0uO7rZo_9c5NpHv-EqiV8Yr9Qke6G-8hA5qNs/edit",
        "restricted": false
      },
      {
        "id": "1dSvp6EE4wQZk0AcBBbSAVJmGDU6omkgB",
        "driveId": "1dSvp6EE4wQZk0AcBBbSAVJmGDU6omkgB",
        "name": "LSA_PHASE1B_OCCURRENCE_MANIFEST_CURRENT.jsonl",
        "parents": [
          "1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1dSvp6EE4wQZk0AcBBbSAVJmGDU6omkgB/view",
        "restricted": false
      },
      {
        "id": "1hoX1NQwfe8H9FtGLx6YLmVCbv94eSLai",
        "driveId": "1hoX1NQwfe8H9FtGLx6YLmVCbv94eSLai",
        "name": "LSA_PHASE1B_manifest_progress_CURRENT.json",
        "parents": [
          "1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1hoX1NQwfe8H9FtGLx6YLmVCbv94eSLai/view",
        "restricted": false
      },
      {
        "id": "1jGuSsvcGyOJI0epYEWAetGQ7Q-RdqHqm",
        "driveId": "1jGuSsvcGyOJI0epYEWAetGQ7Q-RdqHqm",
        "name": "LSA_CP54__PHASE1B_MANIFEST_THROUGH_B054__20260923_NPT.md",
        "parents": [
          "1ej_fqnJYx6RvwtyXgJ2VZuX_460n9KBi"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1jGuSsvcGyOJI0epYEWAetGQ7Q-RdqHqm/view",
        "restricted": false
      },
      {
        "id": "1KzvjWFWzi0a4qC7z8NYtgqOtcZFJEhf1",
        "driveId": "1KzvjWFWzi0a4qC7z8NYtgqOtcZFJEhf1",
        "name": "LSA_HOURLY_AUTOMATION_RUN_LOCK__CURRENT.json",
        "parents": [
          "1PUhOOCMquZbeORRmKCls0XXDqp9ZfNj9"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1KzvjWFWzi0a4qC7z8NYtgqOtcZFJEhf1/view",
        "restricted": false
      },
      {
        "id": "1oE8T74eB8YjehgWBlqBVf5C0hTrxSDHq",
        "driveId": "1oE8T74eB8YjehgWBlqBVf5C0hTrxSDHq",
        "name": "00_LOCAL_LIBRARY",
        "parents": [
          "1SrCyfQFgRijosKFRh2ICXOYZ8U4XU4h_"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1oE8T74eB8YjehgWBlqBVf5C0hTrxSDHq",
        "restricted": false
      },
      {
        "id": "1Yjfaxsgnrw6NsLO6uDmYYLJWe7kxbXKG",
        "driveId": "1Yjfaxsgnrw6NsLO6uDmYYLJWe7kxbXKG",
        "name": "hydropower shankar shaud class",
        "parents": [],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1Yjfaxsgnrw6NsLO6uDmYYLJWe7kxbXKG",
        "restricted": false
      },
      {
        "id": "1RDinUWvdJXICsGUP8CDVDausf-jk_97X",
        "driveId": "1RDinUWvdJXICsGUP8CDVDausf-jk_97X",
        "name": "Kaski_District_Rate_2083_084.pdf",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1RDinUWvdJXICsGUP8CDVDausf-jk_97X/view",
        "restricted": false
      },
      {
        "id": "1yJX1Dep0_2ZDvRftu3u-Bb6ZbDqtQWKDChQQlYCWYXY",
        "driveId": "1yJX1Dep0_2ZDvRftu3u-Bb6ZbDqtQWKDChQQlYCWYXY",
        "name": "AEC_Cost_Rate_Master_v1.0",
        "parents": [
          "1wtsJytC1-09WES7J_z7s5O7498JVMVwh"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/1yJX1Dep0_2ZDvRftu3u-Bb6ZbDqtQWKDChQQlYCWYXY/edit",
        "restricted": false
      },
      {
        "id": "1jtPv4T_onl22qmTzuZpcdkjwYu1yTiIU",
        "driveId": "1jtPv4T_onl22qmTzuZpcdkjwYu1yTiIU",
        "name": "source_manifest.json",
        "parents": [
          "1ZXF3rvx_KkMez3wOkKNvYjnhF9xMJEGy"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1jtPv4T_onl22qmTzuZpcdkjwYu1yTiIU/view",
        "restricted": false
      },
      {
        "id": "1NbYTzTV9Ft0lllU18beR_scDoahnhLwTfQamtlnv7Ec",
        "driveId": "1NbYTzTV9Ft0lllU18beR_scDoahnhLwTfQamtlnv7Ec",
        "name": "POST__AEC_Cost_Rate_Master__CR02-G076_PART1_RECOVERY__20261003_NPT",
        "parents": [],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/document/d/1NbYTzTV9Ft0lllU18beR_scDoahnhLwTfQamtlnv7Ec/edit",
        "restricted": false
      },
      {
        "id": "1UhZd4g66YtJ04UzLw8QZWgz3faYTOu-dJk0TBtQreJg",
        "driveId": "1UhZd4g66YtJ04UzLw8QZWgz3faYTOu-dJk0TBtQreJg",
        "name": "Oct9 empty terminal checkpoint",
        "parents": [],
        "kind": "file",
        "status": "blocked",
        "url": "https://docs.google.com/document/d/1UhZd4g66YtJ04UzLw8QZWgz3faYTOu-dJk0TBtQreJg/edit",
        "restricted": false
      },
      {
        "id": "1yoEQSGpOyY-DZ_aiPKNn3RuTewAJ6pGM6frrVriAb14",
        "driveId": "1yoEQSGpOyY-DZ_aiPKNn3RuTewAJ6pGM6frrVriAb14",
        "name": "TRANSPORT__AEC_CR02_G076_PART1_LOCK_SYNC__20261009_NPT",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://docs.google.com/document/d/1yoEQSGpOyY-DZ_aiPKNn3RuTewAJ6pGM6frrVriAb14/edit",
        "restricted": false
      },
      {
        "id": "1d8Z3ewJtIjGV75-NADX4LftuMA4B0X37",
        "driveId": "1d8Z3ewJtIjGV75-NADX4LftuMA4B0X37",
        "name": "AUTOMATION_RUN_LOCK__CR02_SRC0005.json",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1d8Z3ewJtIjGV75-NADX4LftuMA4B0X37/view",
        "restricted": false
      },
      {
        "id": "1v4dvztgdqfFadPgNJ4WOL7Iu0b8Z4ZM6",
        "driveId": "1v4dvztgdqfFadPgNJ4WOL7Iu0b8Z4ZM6",
        "name": "00_LOCAL_LIBRARY",
        "parents": [
          "1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1v4dvztgdqfFadPgNJ4WOL7Iu0b8Z4ZM6",
        "restricted": false
      },
      {
        "id": "restricted-node-065",
        "driveId": null,
        "name": "00_READ_FIRST_MSCH_CORPUS.md",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-node-066",
        "driveId": null,
        "name": "MSCH_CORPUS_MANIFEST_CURRENT_v0.4.jsonl",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-node-067",
        "driveId": null,
        "name": "MSCH_CORPUS_SCAN_QUEUE_CURRENT_v0.4.jsonl",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-node-068",
        "driveId": null,
        "name": "MSCH_CORPUS_CHECKPOINT__CP12_B012__20260915_NPT.json",
        "parents": [],
        "kind": "file",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-node-069",
        "driveId": null,
        "name": "Test",
        "parents": [],
        "kind": "folder",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "1oJOes27mustzwQPota4_U7H9Tv8Q4sEE",
        "driveId": "1oJOes27mustzwQPota4_U7H9Tv8Q4sEE",
        "name": "JP_Cost_Extraction_Checkpoint_v0.5.14.md",
        "parents": [
          "1oV5j_TuX4pnneiC1LTJnGDZ80CpYtW4S"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1oJOes27mustzwQPota4_U7H9Tv8Q4sEE/view",
        "restricted": false
      },
      {
        "id": "1lfNTRmTOY0P-7n0-HA2tYppWMqrAmhUH",
        "driveId": "1lfNTRmTOY0P-7n0-HA2tYppWMqrAmhUH",
        "name": "SRC-0005__4ac52c498793__raw_evidence.zip",
        "parents": [
          "1oV5j_TuX4pnneiC1LTJnGDZ80CpYtW4S"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://drive.google.com/file/d/1lfNTRmTOY0P-7n0-HA2tYppWMqrAmhUH/view",
        "restricted": false
      },
      {
        "id": "1oCCtvrlHftOht0ULbuiYD3idr9mBe4U5",
        "driveId": "1oCCtvrlHftOht0ULbuiYD3idr9mBe4U5",
        "name": "02_Normalized_AI_Data",
        "parents": [
          "1J5s0R3jgURSHEWCtmeGIerR20bE2a-Ne"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1oCCtvrlHftOht0ULbuiYD3idr9mBe4U5",
        "restricted": false
      },
      {
        "id": "restricted-node-073",
        "driveId": null,
        "name": "00_PROJECT_CONTROL",
        "parents": [
          "restricted-node-019"
        ],
        "kind": "folder",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "1uTwx9_KlAgwrASshAbNiT5vZM2YuLCck",
        "driveId": "1uTwx9_KlAgwrASshAbNiT5vZM2YuLCck",
        "name": "01_Lok_Sewa_Civil_Engineer",
        "parents": [
          "1SrCyfQFgRijosKFRh2ICXOYZ8U4XU4h_"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1uTwx9_KlAgwrASshAbNiT5vZM2YuLCck",
        "restricted": false
      },
      {
        "id": "1uQLp_9IOu02MemVq7jQZbKvmGjvAgXWM",
        "driveId": "1uQLp_9IOu02MemVq7jQZbKvmGjvAgXWM",
        "name": "01_AI_TOOL_CONTROL_TOWER",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1uQLp_9IOu02MemVq7jQZbKvmGjvAgXWM",
        "restricted": false
      },
      {
        "id": "1njm2pvXSgZq7Vj3UgJxDacytQeO3fHCT",
        "driveId": "1njm2pvXSgZq7Vj3UgJxDacytQeO3fHCT",
        "name": "02_CHATGPT_CONTROL_TOWER",
        "parents": [
          "1DLMP8lRT_vQhgEgzQ6gZHkovXs-p3wzg"
        ],
        "kind": "folder",
        "status": "verified",
        "url": "https://drive.google.com/drive/folders/1njm2pvXSgZq7Vj3UgJxDacytQeO3fHCT",
        "restricted": false
      },
      {
        "id": "restricted-extra-2",
        "driveId": null,
        "name": "00_LOCAL_LIBRARY",
        "parents": [
          "restricted-node-020"
        ],
        "kind": "folder",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "18VCOFxmF9iQ4xd6PsV7_hl6KerziHO7AxFqX30ldNw0",
        "driveId": "18VCOFxmF9iQ4xd6PsV7_hl6KerziHO7AxFqX30ldNw0",
        "name": "00_LOCAL_LIBRARY_READ_FIRST__MSCS_AI_QUERY_LAYER",
        "parents": [
          "18UoDpvXwgW_DsO7oOoJF07Oe2hJcc9mc"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://docs.google.com/document/d/18VCOFxmF9iQ4xd6PsV7_hl6KerziHO7AxFqX30ldNw0/edit?usp=drivesdk",
        "restricted": false
      },
      {
        "id": "1F5LKNz5R56ofeu3b2hHwN734Hkb8NjvWDcFFE3KRajM",
        "driveId": "1F5LKNz5R56ofeu3b2hHwN734Hkb8NjvWDcFFE3KRajM",
        "name": "LOCAL_LIBRARY__MSCS_AI_QUERY_LAYER__v1.0",
        "parents": [
          "18UoDpvXwgW_DsO7oOoJF07Oe2hJcc9mc"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/1F5LKNz5R56ofeu3b2hHwN734Hkb8NjvWDcFFE3KRajM/edit?usp=drivesdk",
        "restricted": false
      },
      {
        "id": "1VP3zgI2bGO-qu8uTM8tTNZ2-9L2Jrlvn1dCZFImKG-0",
        "driveId": "1VP3zgI2bGO-qu8uTM8tTNZ2-9L2Jrlvn1dCZFImKG-0",
        "name": "00_LOCAL_LIBRARY_READ_FIRST__AEC_COST_RATE_INTELLIGENCE_CR02",
        "parents": [
          "1v4dvztgdqfFadPgNJ4WOL7Iu0b8Z4ZM6"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://docs.google.com/document/d/1VP3zgI2bGO-qu8uTM8tTNZ2-9L2Jrlvn1dCZFImKG-0/edit?usp=drivesdk",
        "restricted": false
      },
      {
        "id": "1Sx86AXrMklFHuxq9peHyt1NfyGKFnwBFUWgdJu_Enjg",
        "driveId": "1Sx86AXrMklFHuxq9peHyt1NfyGKFnwBFUWgdJu_Enjg",
        "name": "LOCAL_LIBRARY__AEC_COST_RATE_INTELLIGENCE_CR02__v1.0",
        "parents": [
          "1v4dvztgdqfFadPgNJ4WOL7Iu0b8Z4ZM6"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/1Sx86AXrMklFHuxq9peHyt1NfyGKFnwBFUWgdJu_Enjg/edit?usp=drivesdk",
        "restricted": false
      },
      {
        "id": "1IiuXfKcgI-OS9eAA4THhyIb9TvbFpcRXCtk9UbfeWGw",
        "driveId": "1IiuXfKcgI-OS9eAA4THhyIb9TvbFpcRXCtk9UbfeWGw",
        "name": "00_LOCAL_LIBRARY_READ_FIRST__LOK_SEWA_PHASE1B",
        "parents": [
          "1oE8T74eB8YjehgWBlqBVf5C0hTrxSDHq"
        ],
        "kind": "file",
        "status": "verified",
        "url": "https://docs.google.com/document/d/1IiuXfKcgI-OS9eAA4THhyIb9TvbFpcRXCtk9UbfeWGw/edit?usp=drivesdk",
        "restricted": false
      },
      {
        "id": "1m1sTSD7pFqS57Dcon9KtUajqnm0MuwL4jnls12lck_o",
        "driveId": "1m1sTSD7pFqS57Dcon9KtUajqnm0MuwL4jnls12lck_o",
        "name": "LOCAL_LIBRARY__LOK_SEWA_PHASE1B__v1.0",
        "parents": [
          "1oE8T74eB8YjehgWBlqBVf5C0hTrxSDHq"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": "https://docs.google.com/spreadsheets/d/1m1sTSD7pFqS57Dcon9KtUajqnm0MuwL4jnls12lck_o/edit?usp=drivesdk",
        "restricted": false
      },
      {
        "id": "restricted-extra-9",
        "driveId": null,
        "name": "00_LOCAL_LIBRARY_READ_FIRST__MSCH_HYDROPOWER_RESEARCH_CORPUS",
        "parents": [
          "restricted-extra-2"
        ],
        "kind": "file",
        "status": "verified",
        "url": null,
        "restricted": true
      },
      {
        "id": "restricted-extra-10",
        "driveId": null,
        "name": "LOCAL_LIBRARY__MSCH_HYDROPOWER_RESEARCH_CORPUS__v1.0",
        "parents": [
          "restricted-extra-2"
        ],
        "kind": "sheet",
        "status": "verified",
        "url": null,
        "restricted": true
      }
    ]
  },
  "scheduler": {
    "currentAccountAutomations": 0,
    "originatingMasterStatus": "Reported disabled; not verified in this account"
  },
  "publication": {
    "content": "Summary counts, phase states, protected evidence pointers and directory labels only.",
    "omitted": "Raw source bodies, prices, personal contacts, signed URLs, and exposed MSCH edit-link IDs."
  },
  "nextActions": [
    "Resolve the unavailable AEC checkpoint by exact existing identity and read-only access before any recovery.",
    "After separate authorization, complete G076 terminal records in place without replaying committed RO rows, then reconcile AEC seq11/Main10.",
    "Refresh stale registrar narratives under a separate governed scope; preserve history.",
    "Authorize B073, B055 or B013 separately with current idempotency and source-preservation checks.",
    "Authorize JP Cost semantic QA and source registration separately; no public prices or automatic BOQ approval."
  ]
};


# Catalogue preparation recipes — 16 October 2026

These are the offline recipes used for LSA B067–B071 and MSCH B060–B064. Copy them into a private working directory beside verified CURRENT manifests and exact provider-metadata inputs before running. The work-directory structure and input keys are visible in the recipes. They prepare a bounded delta, a rollback ZIP and checkpoint data.

They do not authenticate, read source bodies, execute source code or promote provider files. Live controls, exact-ID idempotency, native PRE/POST, provider readback and Local registration remain required. Private inputs and source data must stay outside this public repository. Historical run labels are intentionally retained for reproducibility.


The second run used these recipes through LSA B079 and MSCH B074. LSA B080 was a separate full-tree reconciliation audit with zero new physical rows. A folder text view can stop at 100 children; use a second complete direct listing for larger folders, record `confirmation_route: SECOND_COMPLETE_DIRECT_LIST` and the partial text-view count, and verify every exact-ID parent. The MSCH recipe records that route explicitly. Private CURRENT files, complete provider inputs and checkpoint promotion remain outside this repository.

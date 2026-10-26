# Sumita Gurung · Paila Pilates Studio Interior — v14

V14 adds the construction programme and resource view. It reads the 51 quoted works from the existing v9 shared register, the SI projection used by earlier versions, and responsibility decisions from v12. Original quantities, prices, amounts, six holds and the v13 budget comparison are preserved. The same generated material projection serves v10, v11 and the embedded v14 material panel.

The interface methods follow **14_Basanti Poudel Baral workbench v2**. None of that building's quantities, excavation, foundations, reinforcement or 241-day programme is used here.

## Inputs and derivation

- `planning-rules.json` owns productivity profiles, exact work-profile exceptions, availability pools, supplier allowances and the working calendar. It is an editable source, not an approved contractor method statement.
- `research/productivity-evidence.json` records Nepal DUDBC civil norms, DWRI 2081 electrical norms and manufacturer readiness evidence. Legacy civil norms have no verified edition year. Modern or unmatched assemblies retain visible planning assumptions.
- `research/scheduling-projects.json` pins source commits from OpenProject, TaskJuggler, GanttProject, OR-Tools and Frappe Gantt. Their principles informed an original implementation; no upstream code or runtime was copied.
- `scripts/construction-v14.mjs` joins source records by stable work ID. Each build produces `plan-data.json`, programme/resource CSVs and a coverage receipt. Generated outputs are not additional editable masters.
- `schedule-model.js` computes effort and occupied workdays, checks the dependency graph, schedules ready activities by a deterministic remaining-path priority, and reserves trade and shared-site capacity on eligible days. Intervals are half-open. Drying and supply waits consume calendar days without reserving crews. This is a feasible heuristic, not a proof of optimality.

## Programme meaning

The baseline currently has **106 activities**, **44 planned quoted works**, **six held works** and **one zero-quantity work**. The v12 ownership split remains **14 owner-managed / 37 professional**. Putty-only locker work receives no invented paint coats; five quoted ceiling points do not become five square metres; the blank couch unit is explicitly interpreted as pieces for delivery planning only.

At the default crew availability and Sunday–Friday calendar, the base scenario calculates **109 calendar days**. The dependency-only lower bound is **72 days**. The cautious and faster output sensitivity cases calculate **127 and 96 days**; these are assumptions around daily output, not observed market confidence ranges. Whole-day crew booking includes setup and can exceed fractional calculated effort. The site limit is eight trade workers; workshop labour and coordination are tracked separately.

The sequence is measured approvals and supply, frames, concealed services and inspection, board closure, drying and putty/base coats, workshop/site joinery and fixed finishes, final paint, overhead/service fittings and tests, flooring, furniture/curtains/mirrors, defects, cleaning and handover. Checks enforce every finish-to-start dependency and daily capacity; no productive crew is booked on Saturday. Public holidays and contractor leave have not been supplied.

## Conditional scope

Laminate flooring and electrical works are unmeasured allowances. The default includes an explicit **three-workday flooring reserve**, **14-calendar-day flooring supply reserve**, and **two-workday electrical first-fix reserve**. These are not quantities inferred from prices. Entering a flooring area creates a separate session scenario; it does not fill the source allowance. Actual flooring duration, product acclimation, moisture limits and procurement remain to confirm.

The default assumes existing dry substrates. The referenced Nepal Royale sheet recommends three months for new masonry; the short coating buffers do not replace masonry curing or moisture acceptance. Custom joinery, curved gypsum/cement-board assemblies, AC, mirrors, curtains and similar work need measured contractor productivity. Traditional marble and prelaminated-panel norms are qualified proxies for different quoted assemblies. Missing demolition, waterproofing, structural alterations and extra services are scope gaps, not silently added works.

No date authorises installation, electrical energisation, occupation or opening. Final scope decisions, source conflicts, supplier commitments, professional inspections and test acceptance remain necessary. Browser scenario edits are temporary; durable changes remain conversation-led GitHub edits.

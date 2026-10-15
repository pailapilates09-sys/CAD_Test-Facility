# Pilates interior estimate — Astra

Dedicated construction record for the eight-page uploaded **Pilates Estimate Final_astra(1).pdf**. The original PDF is unchanged. Consultant: Astra Engineering Consultancy Pvt. Ltd. The PDF was created on 2026-10-15; no estimate date, revision, project address or currency is printed. The date in this folder is an identifier, not an asserted estimate date.

Live department: https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/

Live estimate: https://pailapilates09-sys.github.io/CAD_Test-Facility/construction/estimates/pilates-astra-2026-10-15/

## Recommended storage

Use **UTF-8 JSON as the canonical structured record**, together with the unchanged PDF. There is no universal “lowest” format: meaningful field names, exact numbers, provenance and a documented schema make later derivation reliable. JSON is easy for applications and AI to read, diff in Git and transform. JSONL is useful for processing rows independently. SQL is an executable schema/export, while SQLite is an actual queryable database. Neither should replace the source JSON or original evidence.

Authority: original PDF → raw page/table evidence → reviewed `estimate.json` → generated CSV/SQL/SQLite and webpage. Edit the extraction/mapping and regenerate, rather than independently editing every export. Store future estimates/revisions in new stable sibling folders; retain the prior source and IDs. Future cost tracking, quantities, procurement and drawing modules can reference the document and line-item IDs without overloading the existing CAD or A9 data.

| Path | Purpose |
| --- | --- |
| `source/pilates-estimate-astra.pdf` | Original 8-page PDF; source of truth |
| `data/estimate.json` | Full metadata, summary, sections, 51 items, qualifications, validation |
| `data/estimate.schema.json` | Versioned JSON Schema contract |
| `data/pages.jsonl` | Every page's text, word positions and table cells |
| `data/tables.jsonl` | Every extracted table including headers, blanks, totals, cell text and row coordinates |
| `data/line-items.jsonl` | 51 standalone item records |
| `data/line-items.csv` | Flat item table for spreadsheet tools |
| `data/sections.csv` | All 8 cost areas and separate summary/detail totals |
| `data/full-text.txt` | Complete text with explicit page markers |
| `data/layout-text.txt` | Independent Poppler extraction preserving spatial text layout |
| `data/estimate.sqlite` | SQLite database with source evidence, exact decimals and integer amount hundredths |
| `data/estimate.sql` | SQLite-compatible schema and INSERT statements; rebuildable in SQLite |
| `data/issues.jsonl` | Ambiguities, source numbering, display precision, missing scope |
| `data/validation.json` | Count, arithmetic and coverage checks |
| `data/manifest.json` | File sizes and SHA-256 hashes for source and derivatives |
| `tools/extract.py` | Reproducible extraction and export generator |

## Coverage and reconciliation

All eight rendered pages were visually checked against the extracted tables. Page text and word coordinates preserve headings and other text outside tables. Page 1 summary has eight cost areas. Detailed coverage is 16 Reception rows (pp. 2–3), 13 Coffee lounge (p. 4), 10 Locker Space (p. 5), 8 Studio (p. 6), 2 Changing Room (p. 7) and 2 Washroom (p. 8): **51 detailed rows**.

Page-to-area mapping is explicitly inferred from summary order and matching totals; most pages have only “AOC” as a heading. Washroom has an explicit heading. Laminate Flooring (550,000.00) and Electrical Works (280,057.43) are summary-only allowances with no detailed quantities or rates. Do not fabricate those details.

Summary interior 5,601,148.68 + electrical 280,057.43 = subtotal 5,881,206.11. VAT 13% rounds from 764,556.7943 to 764,556.79. Grand total = **6,645,762.90**, in unspecified currency. All 51 displayed item amounts agree with multiplier × quantity × rate rounded half-up to two decimals.

Coffee ceiling product 84.8125 × 150 = 12,721.875, printed as 12,721.88. Coffee detail total displays 591770.9 while the item sum and summary are 591770.88. Studio detail total displays 1964709 while its item sum and summary are 1964709.40. These source representations are retained independently; they are not silently overwritten.

Duplicate SN 10 in Reception, skipped numbers in several sections, summary SN 4 used twice, a blank couch unit, a zero-quantity glass door, original spelling and “1.5 MT” AC capacity are preserved. Stable IDs use area plus row ordinal, not potentially duplicated source serials. Electrical scope overlap requires clarification because area items include lighting/AC works; no duplicate charge is asserted. “Design and Supervision” is an unpriced heading, not an invented fee.

## Numbers and missing values

Money, rates, multipliers and quantities use exact decimal strings in JSON and TEXT decimals in SQLite. `amount_minor` is the displayed amount × 100 as an integer, suitable for exact sums; it does not assert a named currency or currency denomination. Do not cast these strings to binary floating point for financial calculations. The webpage uses integer hundredths for item sums and numeric conversion for display and share bars only. Raw strings and source cell coordinates are retained for audit. Null means missing/not supplied, never zero. Unit codes supplement, rather than overwrite, source units.

## Regenerate and verify

```sh
python -m pip install pdfplumber==0.11.9
python construction/estimates/pilates-astra-2026-10-15/tools/extract.py
npm run check
```

Poppler's `pdftotext` is optional for regenerating the independent layout text. Existing layout text is retained if Poppler is absent. Extraction is a development step; the GitHub Pages build consumes committed evidence and requires only Node. The existing Pages Action runs `npm run check`, copies data/source to the isolated estimate URL and deploys the entire existing website with its CAD and progress pages preserved.

Query example (SQLite):

```sql
SELECT s.name, COUNT(i.id) AS items, SUM(i.amount_minor) AS item_amount_hundredths
FROM section s LEFT JOIN line_item i ON i.section_id = s.id
GROUP BY s.id;
```

Use `section.amount_minor` for summary totals; summing section summaries plus their detailed items would double-count. The VAT-inclusive total lives separately in `summary`. `source_page.page_json` preserves all page-level text and coordinates.

## Website integration

The page UI lives under `public/construction/estimates/pilates-astra-2026-10-15/`. `scripts/build.mjs` copies this module's `data/` and `source/` there at build time. The home page gains one Construction navigation link and one department card. Existing CAD geometry, assets, routes and A9 progress data remain unchanged. No external service, CDN, database account or new schedule is required.

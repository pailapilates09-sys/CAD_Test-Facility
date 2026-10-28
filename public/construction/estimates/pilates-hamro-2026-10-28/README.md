# Hamro Construction quotation - Paila Pilates

This is a separate supplier quotation for the same studio, linked by the user's identification. It does not replace the Astra quotation or become version 15 of the Astra dataset. Other requested work is on hold while this quotation is prepared.

`quotation.json` preserves all 19 numbered source items, descriptions, units, rates, quantities, printed amounts and printed total as decimal strings. `source/original.pdf` is the unchanged four-page attachment. Its SHA256 is `12ab232266fbd943170ffabe0c38860eaf809b0937fce80f2021fb5600f4defc`. `source/raw-pages.json` preserves full extracted page text and table cells; `source/raw-text.txt` is a reading export. Extraction can be repeated using `tools/quotations/extract_hamro.py` with pdfplumber.

The original was uploaded first into the connected PailaPilates09 Drive, in Rate analysis / Hamro Construction - Studio Quotation. The verified file ID is `1IRiB5-7mc6WL4ZLnHMfayzHEhFcl3fKr` and folder ID `1_4r5gTx1nr6PYS8g69l6Wf_dFIpVYFZn`. Sharing permissions were not changed. The website serves its preserved source copy and static derivatives; it does not live-fetch or synchronize Drive.

`client-notes.json` owns the shorter titles, explanations, included-work summaries and confirmation questions. `quote-model.js` owns exact decimal reconciliation and metric/imperial conversions. `scripts/supplier-quotation.mjs` derives the HTML, CSV and client-view JSON from those sources. The earlier financial source remains separate and unchanged.

The PDF does not identify currency, quotation date, tax/VAT or payment terms. NPR is an explicit display assumption. The 19 printed amounts sum to 3748684.95 while the printed total is 3748684.96. Twelve rows differ from their displayed rate×quantity; their displayed products sum to 3748913.9840. None is silently corrected. Extra measurement precision is a possible explanation, not an established fact.

The international foot is exactly 0.3048 m, and the square foot exactly 0.09290304 m². Quantity and rate transform reciprocally. Display values are rounded only for reading; quoted amounts are preserved. RM means running length. LS is one package. Set counts remain counts. Different wall, board, ceiling and floor work areas are never summed into a studio footprint; joinery billing methods and partition face counting are not inferred.

There are 19 separate built-in image-generation assets. They are labelled illustrative, not actual studio photographs or approved design. Exact prompts and generated-source metadata are in the two image registers and the generated `data/image-provenance.json`. JPEG assets retain the original image dimensions; no geometry or measurements come from the images. Quantity diagrams are deterministic SVGs derived from the quote, with separate area, length, set and package scales. No cutting sizes, point schedules, location plan or site-verified quantities are invented.

The shared light/dark theme and mascot controls are reused. Search, work-type filtering, table-unit selection, native expandable details, stable item anchors, CSV download and print controls are page-local. No contractor messages, supplier orders or external writes occur when browsing the page.

## Validation - 28 October 2026

- Original four-page PDF hash and all 19 extracted source rows agree. Decimal reconciliation and reciprocal imperial conversions pass.
- Full test suite: 323 passed. Final build: 136 HTML pages, 6540 local links/assets and 225 module imports verified. The existing financial source revision remains `1240677241b90579`.
- Browser checks: native work disclosures and deep item links, zero-result and keyword search, category filtering, expand/collapse, metric/imperial/both units, light/dark theme and mascot visibility control.
- Responsive frame widths 320, 375, 430 and 768 px show no document-level horizontal overflow. Coverage labels use readable HTML text rather than small scaled SVG labels. Phone disclosures stack the same four fields into cards.
- Image examples and source-quantity diagrams are labelled separately. No footprint, item locations, electrical point count, cutting dimensions or actual studio photos are inferred.

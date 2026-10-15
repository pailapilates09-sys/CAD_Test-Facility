"""Rebuild the complete evidence and portable derivatives from the unchanged PDF.

Requires Python 3.10+ and pdfplumber==0.11.9. Decimal arithmetic is intentional.
Run from any directory: python path/to/tools/extract.py
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
import csv
import hashlib
import json
import re
import sqlite3
import subprocess
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data'
PDF = ROOT / 'source/pilates-estimate-astra.pdf'
DOC_ID = 'pilates-astra-2026-10-15'
SECTIONS = [
    ('reception', 'Reception Area', [2, 3]),
    ('coffee-lounge', 'Coffee lounge', [4]),
    ('locker-space', 'Locker Space', [5]),
    ('studio', 'Studio', [6]),
    ('changing-room', 'Changing Room', [7]),
    ('washroom', 'Washroom', [8]),
    ('laminate-flooring', 'Laminate Flooring', []),
    ('electrical', 'Electrical Works', []),
]


def decimal(value):
    return Decimal(re.sub(r'[\s,]', '', str(value)))


def money(value):
    return format(Decimal(value).quantize(Decimal('.01'), rounding=ROUND_HALF_UP), '.2f')


def dump(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


def jsonl(name, rows):
    (OUT / name).write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows))


def csv_file(name, rows, fields):
    with (OUT / name).open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pages, tables, items, sections, issues = [], [], [], [], []
    with pdfplumber.open(PDF) as pdf:
        metadata = pdf.metadata
        for n, page in enumerate(pdf.pages, 1):
            found = page.find_tables()
            page_tables = []
            for ti, table in enumerate(found, 1):
                raw = table.extract()
                record = {'page': n, 'table': ti, 'bbox_points': list(table.bbox),
                          'rows': raw, 'row_bbox_points': [list(r.bbox) for r in table.rows]}
                tables.append(record)
                page_tables.append(record)
            pages.append({'page': n, 'width_points': page.width, 'height_points': page.height,
                          'text': page.extract_text(layout=False),
                          'words': page.extract_words(),
                          'tables': page_tables})
        for sid, name, page_numbers in SECTIONS:
            counts = {}
            detail_total_raw = None
            for table in tables:
                if table['page'] not in page_numbers:
                    continue
                for ri, row in enumerate(table['rows']):
                    if len(row) < 7:
                        continue
                    if str(row[0] or '').strip().isdigit() and row[1]:
                        sn, description, unit, no, quantity, rate, amount = row[:7]
                        counts[sn] = counts.get(sn, 0) + 1
                        index = sum(x['section_id'] == sid for x in items) + 1
                        normalized_unit = (unit or '').lower().replace(' ', '').replace('.', '')
                        unit_code = {'sqft': 'ft2', 'rft': 'ft', 'no': 'each', 'nos': 'each', 'point': 'point'}.get(normalized_unit)
                        calculated = decimal(no) * decimal(quantity) * decimal(rate)
                        item = {'id': f'{sid}-{index:03}', 'document_id': DOC_ID,
                                'section_id': sid, 'section_name': name, 'ordinal': index,
                                'source_sn': sn, 'description': ' '.join(description.split()),
                                'description_raw': description, 'unit_raw': unit or None,
                                'unit_code': unit_code, 'no': str(decimal(no)),
                                'quantity': str(decimal(quantity)), 'rate': str(decimal(rate)),
                                'amount': money(decimal(amount)),
                                'amount_minor': int(decimal(amount) * 100),
                                'remarks': row[7] if len(row) > 7 else None,
                                'calculated_amount_unrounded': str(calculated),
                                'calculated_amount': money(calculated),
                                'delta_amount_vs_calculated': money(decimal(amount) - Decimal(money(calculated))),
                                'source': {'page': table['page'], 'table': table['table'], 'row': ri + 1,
                                           'bbox_points': table['row_bbox_points'][ri], 'cells': row}}
                        items.append(item)
                    elif any('total' in str(cell or '').lower() for cell in row):
                        if row[6]:
                            detail_total_raw = row[6]
            summary_row = next(r for r in tables[0]['rows'] if len(r) > 3 and r[1] == name)
            section_items = [x for x in items if x['section_id'] == sid]
            line_sum = sum((Decimal(x['amount']) for x in section_items), Decimal(0))
            sections.append({'id': sid, 'name': name, 'source_sn': summary_row[0],
                             'summary_item_raw': summary_row[2], 'summary_amount': money(decimal(summary_row[3])),
                             'summary_amount_minor': int(decimal(summary_row[3]) * 100),
                             'summary_amount_raw': summary_row[3], 'detail_total_raw': detail_total_raw,
                             'detail_total': money(decimal(detail_total_raw)) if detail_total_raw else None,
                             'line_sum': money(line_sum) if section_items else None,
                             'detail_minus_summary': money(line_sum - decimal(summary_row[3])) if section_items else None,
                             'item_count': len(section_items), 'pages': page_numbers,
                             'detail_state': 'detailed' if page_numbers else 'summary_only',
                             'section_mapping': 'Page-to-summary mapping inferred from sequence and matching totals; most detail pages say only AOC.' if sid != 'washroom' else 'WASHROOM-AOC heading and matching summary total.'})
            if not page_numbers:
                issues.append({'id': f'{sid}-no-detail', 'type': 'missing_breakdown', 'section_id': sid,
                               'message': f'{name} appears on page 1 only; no quantities, rates or detailed scope are supplied.'})
            if any(v > 1 for v in counts.values()):
                issues.append({'id': f'{sid}-duplicate-sn', 'type': 'duplicate_number', 'section_id': sid,
                               'message': f'Source item numbers are duplicated: {[k for k,v in counts.items() if v > 1]}. Stable IDs use row order instead.'})
            if counts:
                missing = sorted(set(range(1, max(map(int, counts)) + 1)) - set(map(int, counts)))
                if missing:
                    issues.append({'id': f'{sid}-sn-gaps', 'type': 'numbering_gap', 'section_id': sid,
                                   'message': f'Source numbering skips {missing}; no missing line items were invented.'})
            if section_items and Decimal(sections[-1]['detail_total']) != line_sum:
                issues.append({'id': f'{sid}-display-total', 'type': 'display_precision', 'section_id': sid,
                               'message': f'Detail total printed as {detail_total_raw}; sum of displayed item amounts is {money(line_sum)}; summary is {sections[-1]["summary_amount"]}. Values are retained independently.'})
    for item in items:
        if item['unit_raw'] is None:
            issues.append({'id': item['id'] + '-unit', 'type': 'missing_unit', 'item_id': item['id'],
                           'message': 'Reception couch has a blank unit in the source; it remains null.'})
        if decimal(item['quantity']) == 0:
            issues.append({'id': item['id'] + '-zero', 'type': 'zero_quantity', 'item_id': item['id'],
                           'message': 'Glass door is listed with zero quantity and zero amount; it is retained, not omitted.'})
        if decimal(item['calculated_amount_unrounded']) != decimal(item['amount']):
            issues.append({'id': item['id'] + '-rounding', 'type': 'line_rounding', 'item_id': item['id'],
                           'message': f'Unrounded product is {item["calculated_amount_unrounded"]}; source amount is {item["amount"]}. Two-decimal half-up result is {item["calculated_amount"]}.'})
    issues.extend([
        {'id': 'currency-unspecified', 'type': 'source_ambiguity', 'message': 'Currency is not stated anywhere in this PDF. NPR is plausible from project context, but has not been assigned as a source fact.'},
        {'id': 'estimate-date-unspecified', 'type': 'source_ambiguity', 'message': 'No estimate date or revision number is printed. The document ID uses the PDF creation day (2026-10-15), not an asserted estimate date.'},
        {'id': 'unpriced-heading', 'type': 'source_ambiguity', 'message': 'Design and Supervision is an unpriced summary heading; no separate fee or inclusion/exclusion is inferred.'},
        {'id': 'summary-sn-duplicate', 'type': 'duplicate_number', 'message': 'Summary SN 4 labels both Studio and Electrical Works.'},
        {'id': 'capacity-as-printed', 'type': 'source_ambiguity', 'message': 'AC capacity 1.5 MT and source spelling are preserved. MT has not been silently converted to ton.'},
        {'id': 'electrical-scope-overlap', 'type': 'scope_review', 'message': 'Area details already include lighting and AC electrical works; the separate Electrical Works allowance has no breakdown. Confirm scope before interpreting this as duplication.'},
    ])
    summary = {'interior_total': '5601148.68', 'electrical': '280057.43', 'subtotal': '5881206.11',
               'vat_rate': '0.13', 'vat_amount': '764556.79', 'grand_total': '6645762.90', 'page': 1}
    checks = {'pages': len(pages), 'line_items': len(items), 'sections': len(sections),
              'section_item_counts': {s['id']: s['item_count'] for s in sections},
              'interior_sum': money(sum((Decimal(s['summary_amount']) for s in sections[:-1]), Decimal(0))),
              'subtotal_calculated': money(decimal(summary['interior_total']) + decimal(summary['electrical'])),
              'vat_unrounded': str(decimal(summary['subtotal']) * decimal(summary['vat_rate'])),
              'vat_calculated': money(decimal(summary['subtotal']) * decimal(summary['vat_rate'])),
              'grand_total_calculated': money(decimal(summary['subtotal']) + decimal(summary['vat_amount'])),
              'all_line_products_match_at_two_decimals': all(decimal(x['delta_amount_vs_calculated']) == 0 for x in items),
              'reviewed_pages': list(range(1, 9)), 'review_method': 'All 8 rendered pages visually reviewed against extracted tables; full text and word coordinates retained.'}
    assert len(pages) == 8 and len(items) == 51
    assert checks['interior_sum'] == summary['interior_total']
    assert checks['subtotal_calculated'] == summary['subtotal']
    assert checks['vat_calculated'] == summary['vat_amount']
    assert checks['grand_total_calculated'] == summary['grand_total']
    assert checks['all_line_products_match_at_two_decimals']
    doc = {'schema_version': '1.0.0', 'document_id': DOC_ID, 'title': 'Pilates interior estimate',
           'consultant': 'Astra Engineering Consultancy Pvt. Ltd', 'currency': None, 'estimate_date': None,
           'source': {'file': '../source/pilates-estimate-astra.pdf', 'original_filename': 'Pilates Estimate Final_astra(1).pdf',
                      'sha256': hashlib.sha256(PDF.read_bytes()).hexdigest(), 'page_count': len(pages),
                      'pdf_metadata': metadata},
           'conventions': {'money': 'Decimal strings in unspecified source currency; *_minor is amount x 100, not an asserted currency denomination.',
                           'quantity': 'Decimal strings, not binary floats; no is a separate multiplier, all source rows have no=1.',
                           'units': 'ft2=square feet; ft=running feet; each=count; point=source point; null=missing.',
                           'null': 'Unknown, not supplied or not applicable; never zero-filled.',
                           'authority': 'Original PDF > raw tables/text > reviewed JSON > generated exports and webpage.',
                           'scope': 'Estimate, not actual spend, procurement quantities, approval or a construction drawing.'},
           'summary': summary, 'sections': sections, 'line_items': items, 'issues': issues, 'validation': checks}
    dump('estimate.json', doc)
    dump('validation.json', checks)
    jsonl('pages.jsonl', pages)
    jsonl('tables.jsonl', tables)
    jsonl('line-items.jsonl', items)
    jsonl('issues.jsonl', issues)
    (OUT / 'full-text.txt').write_text('\n\n'.join(f'=== PAGE {p["page"]} ===\n{p["text"]}' for p in pages) + '\n')
    # Poppler is optional; its independently extracted visual layout aids recovery.
    try:
        subprocess.run(['pdftotext', '-layout', str(PDF), str(OUT / 'layout-text.txt')], check=True)
    except FileNotFoundError:
        pass
    csv_file('line-items.csv', [{**x, 'page': x['source']['page']} for x in items],
             ['id', 'section_id', 'section_name', 'source_sn', 'description', 'unit_raw', 'unit_code', 'no', 'quantity', 'rate', 'amount', 'amount_minor', 'remarks', 'page'])
    csv_file('sections.csv', sections, ['id', 'name', 'summary_amount', 'detail_total', 'line_sum', 'detail_minus_summary', 'item_count', 'detail_state'])
    dbfile = OUT / 'estimate.sqlite'
    dbfile.unlink(missing_ok=True)
    db = sqlite3.connect(dbfile)
    db.execute('PRAGMA foreign_keys = ON')
    db.executescript('''
CREATE TABLE document (id TEXT PRIMARY KEY, title TEXT NOT NULL, currency TEXT, source_sha256 TEXT NOT NULL, metadata_json TEXT NOT NULL);
CREATE TABLE section (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES document(id), name TEXT NOT NULL, amount_decimal TEXT NOT NULL, amount_minor INTEGER NOT NULL, detail_state TEXT NOT NULL, detail_total_decimal TEXT);
CREATE TABLE line_item (id TEXT PRIMARY KEY, section_id TEXT NOT NULL REFERENCES section(id), ordinal INTEGER NOT NULL, source_sn TEXT NOT NULL, description TEXT NOT NULL, unit_raw TEXT, unit_code TEXT, multiplier_decimal TEXT NOT NULL, quantity_decimal TEXT NOT NULL, rate_decimal TEXT NOT NULL, amount_decimal TEXT NOT NULL, amount_minor INTEGER NOT NULL, source_page INTEGER NOT NULL, source_json TEXT NOT NULL);
CREATE TABLE source_page (page INTEGER PRIMARY KEY, page_json TEXT NOT NULL);
CREATE TABLE summary (key TEXT PRIMARY KEY, value_decimal TEXT NOT NULL);
CREATE TABLE issue (id TEXT PRIMARY KEY, type TEXT NOT NULL, issue_json TEXT NOT NULL);
CREATE INDEX line_item_section ON line_item(section_id);
''')
    db.execute('INSERT INTO document VALUES (?,?,?,?,?)', (DOC_ID, doc['title'], None, doc['source']['sha256'], json.dumps(doc['source'])))
    db.executemany('INSERT INTO section VALUES (?,?,?,?,?,?,?)', [(s['id'], DOC_ID, s['name'], s['summary_amount'], s['summary_amount_minor'], s['detail_state'], s['detail_total']) for s in sections])
    db.executemany('INSERT INTO line_item VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [(x['id'], x['section_id'], x['ordinal'], x['source_sn'], x['description'], x['unit_raw'], x['unit_code'], x['no'], x['quantity'], x['rate'], x['amount'], x['amount_minor'], x['source']['page'], json.dumps(x['source'])) for x in items])
    db.executemany('INSERT INTO source_page VALUES (?,?)', [(p['page'], json.dumps(p, ensure_ascii=False)) for p in pages])
    db.executemany('INSERT INTO summary VALUES (?,?)', [(k, v) for k,v in summary.items() if k != 'page'])
    db.executemany('INSERT INTO issue VALUES (?,?,?)', [(x['id'], x['type'], json.dumps(x)) for x in issues])
    db.commit()
    assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    assert not db.execute('PRAGMA foreign_key_check').fetchall()
    (OUT / 'estimate.sql').write_text('\n'.join(db.iterdump()) + '\n')
    db.close()
    dump('manifest.json', {'document_id': DOC_ID, 'extractor': 'pdfplumber 0.11.9',
                           'files': [{'path': str(p.relative_to(ROOT)), 'bytes': p.stat().st_size,
                                      'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                                     for p in sorted(ROOT.rglob('*')) if p.is_file() and
                                     (p.parent == OUT or p.parent == PDF.parent) and p.name != 'manifest.json']})
    print(json.dumps(checks, indent=2))


if __name__ == '__main__':
    main()

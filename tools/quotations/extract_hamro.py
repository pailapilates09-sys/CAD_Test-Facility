"""Read-only PDF transcription. Preserve printed decimal strings and all page tables."""
import argparse, hashlib, json, pathlib, shutil
import pdfplumber

p = argparse.ArgumentParser()
p.add_argument('pdf'); p.add_argument('output')
a = p.parse_args(); pdf_path = pathlib.Path(a.pdf); out = pathlib.Path(a.output)
(out/'source').mkdir(parents=True, exist_ok=True)
raw = pdf_path.read_bytes(); digest = hashlib.sha256(raw).hexdigest()
pages, items, current, total = [], [], None, None
with pdfplumber.open(pdf_path) as pdf:
    for page_number, page in enumerate(pdf.pages, 1):
        tables = page.extract_tables()
        pages.append({'page': page_number, 'width_pt': page.width, 'height_pt': page.height,
                      'text': page.extract_text(), 'tables': tables})
        for table in tables:
            for row_number, row in enumerate(table, 1):
                cells = [(v or '').strip() for v in row]
                if len(cells) != 7: raise ValueError('Unexpected column count')
                if cells[0].isdigit() and 1 <= int(cells[0]) <= 19:
                    if current is not None: raise ValueError('Previous item incomplete')
                    current = {'id': 'hamro-'+cells[0].zfill(2), 'number': int(cells[0]),
                               'source_title': cells[1], 'page': page_number,
                               'title_table_row': row_number}
                elif current and cells[2] in ['SQM', 'RM', 'LS', 'Set']:
                    current.update(source_description=cells[1], unit=cells[2], rate=cells[3],
                                   quantity=cells[4], amount=cells[5], remarks=cells[6] or None,
                                   value_table_row=row_number)
                    items.append(current); current = None
                elif any(v == 'Total Cost' for v in cells): total = cells[5]
if [v['number'] for v in items] != list(range(1,20)) or total is None or current:
    raise ValueError('Incomplete quotation extraction')
quote = {'schema':'pilates-supplier-quotation-1.0','id':'pilates-hamro-2026-10-28',
         'project':'Paila Pilates studio interior','project_link_basis':'User identifies this as another quotation for the same studio.',
         'supplier':{'name':'Hamro Construction and Consultancy Pvt. Ltd.',
                     'address':'Machhindra Marga, Jawalakhel, Lalitpur'},
         'source':{'file':'source/original.pdf','uploaded_filename':pdf_path.name,'sha256':digest,
                   'bytes':len(raw),'pages':len(pages),'document_title':'Cost Estimation of Commercial Interior Work',
                   'client_written':'Pilates','location_written':'Jawalakhel, Lalitpur',
                   'quotation_date':None,'currency':None,'tax_vat':None,'imported_date':'2026-10-28',
                   'drive_url':'https://drive.google.com/file/d/1IRiB5-7mc6WL4ZLnHMfayzHEhFcl3fKr/view?usp=drivesdk',
                   'drive_file_id':'1IRiB5-7mc6WL4ZLnHMfayzHEhFcl3fKr',
                   'drive_parent_id':'1_4r5gTx1nr6PYS8g69l6Wf_dFIpVYFZn'},
         'display_currency':{'code':'NPR','status':'ASSUMED_NOT_PRINTED_IN_PDF'},
         'printed_total':total,'items':items}
shutil.copyfile(pdf_path, out/'source/original.pdf')
(out/'source/raw-pages.json').write_text(json.dumps({'pdf_sha256':digest,'pages':pages},ensure_ascii=False,indent=2)+'\n')
(out/'source/raw-text.txt').write_text('\n\f\n'.join(v['text'] for v in pages)+'\n')
(out/'quotation.json').write_text(json.dumps(quote,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'items':len(items),'pages':len(pages),'printed_total':total,'sha256':digest}))

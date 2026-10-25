"""Preserve a PDF's supported text, vector paths, layers, images and numeric tokens.

Page-space coordinates are PDF points with a top-left origin, before page rotation.
Display boxes apply the stored page rotation. Neither coordinate system is metres.
Metric interpretation belongs to data/project.json and never overwrites these records.
"""
import argparse, base64, collections, csv, gzip, hashlib, json, pathlib, re, sqlite3
import fitz

SOURCE_SHA = 'a951721f046d4321542ae0c6b386c9a54b5575bc4c0676544daaff98a9e77611'
TITLES = [
 'Location plan','Ground floor plan','First floor plan','Second floor plan','Roof plan',
 'East, north, west and south elevations','Section X-X and opening schedule',
 'Column layout and reinforcement','Footing layout and foundation sections',
 'Tie beam and floor beam layouts','Slab top and bottom reinforcement',
 'Staircase plan and reinforcement','Strap beam layout and reinforcement',
 'Tie beam reinforcement','Main beam MB reinforcement','Beam MB1 reinforcement',
 'Beam MB2 reinforcement','Stair beam SB reinforcement','Sill and lintel bands',
 'Lapping, hooks, stirrups and connection details','Septic tank and soak pit'
]

def clean(value):
 if isinstance(value, (fitz.Point,fitz.Rect,fitz.Matrix)): return list(value)
 if isinstance(value,fitz.Quad): return [list(p) for p in value]
 if isinstance(value,bytes): return {'encoding':'base64','bytes':len(value),'data':base64.b64encode(value).decode()}
 if isinstance(value,dict):return {str(k):clean(v) for k,v in value.items()}
 if isinstance(value,(tuple,list)):return [clean(v) for v in value]
 return value

def packed(path, data):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_bytes(gzip.compress(data,compresslevel=9,mtime=0))

def write_jsonl(path,records):
 packed(path, ''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records).encode())

def main():
 parser=argparse.ArgumentParser();parser.add_argument('pdf');parser.add_argument('output');a=parser.parse_args()
 raw=pathlib.Path(a.pdf).read_bytes()
 if hashlib.sha256(raw).hexdigest()!=SOURCE_SHA:raise ValueError('Unexpected original PDF hash')
 out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=True);src=out/'source';src.mkdir(exist_ok=True)
 # Binary parts remain ordinary Git blobs; build.mjs reassembles and verifies the exact PDF.
 parts=[]
 for i,start in enumerate(range(0,len(raw),1024*1024),1):
  name=f'original.pdf.part-{i:02}';data=raw[start:start+1024*1024];(src/name).write_bytes(data)
  parts.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 (src/'original-parts.json').write_text(json.dumps({'file':'original.pdf','bytes':len(raw),'sha256':SOURCE_SHA,'parts':parts},indent=2)+'\n')
 doc=fitz.open(stream=raw,filetype='pdf');pages=[];spans=[];words=[];paths=[];numbers=[];images=[];annotations=[];texts=[];layer_counts=collections.Counter()
 con=sqlite3.connect(':memory:')
 con.executescript('''
 CREATE TABLE pages(page INTEGER PRIMARY KEY,title TEXT,width_pt REAL,height_pt REAL,rotation INTEGER,metadata_json TEXT);
 CREATE TABLE text_spans(id TEXT PRIMARY KEY,page INTEGER,text TEXT,bbox_json TEXT,display_bbox_json TEXT,record_json TEXT);
 CREATE TABLE words(id TEXT PRIMARY KEY,page INTEGER,text TEXT,bbox_json TEXT,display_bbox_json TEXT);
 CREATE TABLE vector_paths(id TEXT PRIMARY KEY,page INTEGER,layer TEXT,record_json TEXT);
 CREATE TABLE numeric_observations(id TEXT PRIMARY KEY,page INTEGER,span_id TEXT,value_text TEXT,context TEXT,record_json TEXT);
 CREATE TABLE embedded_images(id TEXT PRIMARY KEY,page INTEGER,record_json TEXT);
 CREATE TABLE annotations(id TEXT PRIMARY KEY,page INTEGER,record_json TEXT);
 CREATE VIRTUAL TABLE text_search USING fts5(id UNINDEXED,page UNINDEXED,text);
 ''')
 for i,page in enumerate(doc,1):
  rawtext=page.get_text('dict',flags=fitz.TEXT_PRESERVE_WHITESPACE|fitz.TEXT_PRESERVE_LIGATURES)
  drawing=page.get_drawings();page_words=page.get_text('words');title=TITLES[i-1] if i<=len(TITLES) else f'Sheet {i}'
  info={'page':i,'title':title,'display_size_pt':list(page.rect)[2:],'media_box_pt':list(page.mediabox),'crop_box_pt':list(page.cropbox),'rotation':page.rotation,'rotation_matrix':list(page.rotation_matrix),'text_span_count':0,'word_count':len(page_words),'vector_path_count':len(drawing),'image_placements':len(page.get_images()),'source_svg':f'sheets/sheet-{i:02}.svg','text':page.get_text()}
  pages.append(info);texts.append(f'=== SHEET {i:02}: {title} ===\n'+info['text'])
  packed(src/f'sheet-{i:02}.svg.gz',page.get_svg_image(text_as_path=True).encode())
  for block in rawtext['blocks']:
   if block.get('type')!=0:continue
   for line in block.get('lines',[]):
    for span in line.get('spans',[]):
     ident=f'p{i:02}-t{info["text_span_count"]:04}';info['text_span_count']+=1
     record={'id':ident,'page':i,'line_direction':list(line['dir']),**clean(span),'display_bbox':list(fitz.Rect(span['bbox'])*page.rotation_matrix)}
     spans.append(record);con.execute('INSERT INTO text_spans VALUES(?,?,?,?,?,?)',(ident,i,span['text'],json.dumps(span['bbox']),json.dumps(record['display_bbox']),json.dumps(record,ensure_ascii=False)));con.execute('INSERT INTO text_search VALUES(?,?,?)',(ident,i,span['text']))
     for match in re.finditer(r'(?<!\w)[+-]?\d+(?:\.\d+)?',span['text']):
      number={'id':f'n{len(numbers)+1:05}','page':i,'span_id':ident,'value_text':match.group(),'context':span['text'],'character_range':[match.start(),match.end()],'bbox':span['bbox'],'display_bbox':record['display_bbox'],'semantic_status':'unassigned source token; not an accepted dimension'}
      numbers.append(number);con.execute('INSERT INTO numeric_observations VALUES(?,?,?,?,?,?)',(number['id'],i,ident,number['value_text'],number['context'],json.dumps(number,ensure_ascii=False)))
  for j,w in enumerate(page_words):
   record={'id':f'p{i:02}-w{j:04}','page':i,'text':w[4],'bbox':list(w[:4]),'display_bbox':list(fitz.Rect(w[:4])*page.rotation_matrix),'block':w[5],'line':w[6],'word':w[7]};words.append(record)
   con.execute('INSERT INTO words VALUES(?,?,?,?,?)',(record['id'],i,record['text'],json.dumps(record['bbox']),json.dumps(record['display_bbox'])))
  for j,d in enumerate(drawing):
   record={'id':f'p{i:02}-v{j:05}','page':i,**clean(d),'display_bbox':list(d['rect']*page.rotation_matrix)};paths.append(record);layer_counts[d.get('layer','')]+=1
   con.execute('INSERT INTO vector_paths VALUES(?,?,?,?)',(record['id'],i,d.get('layer',''),json.dumps(record,ensure_ascii=False)))
  for j,item in enumerate(page.get_image_info(xrefs=True)):
   record={'id':f'p{i:02}-i{j:03}','page':i,**clean(item)}
   if item.get('xref'):record['original_image']=clean(doc.extract_image(item['xref']))
   images.append(record);con.execute('INSERT INTO embedded_images VALUES(?,?,?)',(record['id'],i,json.dumps(record)))
  for j,annot in enumerate(page.annots() or []):
   record={'id':f'p{i:02}-a{j:03}','page':i,'type':annot.type,'rect':list(annot.rect),'info':annot.info};annotations.append(record);con.execute('INSERT INTO annotations VALUES(?,?,?)',(record['id'],i,json.dumps(record)))
  con.execute('INSERT INTO pages VALUES(?,?,?,?,?,?)',(i,title,page.rect.width,page.rect.height,page.rotation,json.dumps(info,ensure_ascii=False)))
 for name,records in [('text-spans',spans),('words',words),('vector-paths',paths),('numeric-observations',numbers),('embedded-images',images),('annotations',annotations)]:write_jsonl(src/(name+'.jsonl.gz'),records)
 (src/'sheets.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2)+'\n')
 (src/'all-text.txt').write_text('\n\n'.join(texts))
 con.commit()
 assert con.execute('PRAGMA quick_check').fetchone()[0]=='ok'
 packed(src/'extraction.sqlite.gz',con.serialize())
 # FTS shadow tables are implementation details; SQL export contains relational source tables.
 sql='\n'.join(s for s in con.iterdump() if 'text_search' not in s)
 packed(src/'extraction.sql.gz',sql.encode())
 with (src/'numeric-observations.csv').open('w',newline='')as f:
  writer=csv.writer(f);writer.writerow(['id','page','span_id','value_text','context','semantic_status']);writer.writerows([r['id'],r['page'],r['span_id'],r['value_text'],r['context'],r['semantic_status']]for r in numbers)
 con.close()
 register={'schema':'paila-pdf-extraction-1.0','source':{'filename':'14_Basanti_Poudel_Baral__Structural_Drawings__Ward_14__Architectural_Sheets_Included__v1.0.pdf','drive_file_id':'1h_aSf5ThFszG2-WLxaQDKmfR2ixC5DIT','sha256':SOURCE_SHA,'bytes':len(raw),'page_count':len(doc),'metadata':doc.metadata},'extractor':{'library':'PyMuPDF','version':fitz.VersionBind,'script':'tools/building/extract_pdf.py','coordinate_units':'PDF points; all page rotations retained','scope':'all 21 pages; supported text spans, word positions, drawing paths/layers, image bytes, annotations and native page SVGs. Original PDF parts preserve all remaining native content.'},'counts':{'pages':len(pages),'text_spans':len(spans),'words':len(words),'vector_paths':len(paths),'numeric_observations':len(numbers),'image_placements':len(images),'annotations':len(annotations),'cad_layers':dict(sorted(layer_counts.items()))},'interpretation':'Numeric observations are unassigned tokens. Accepted measurements, model elements and unresolved conflicts are separately recorded in data/project.json.'}
 (src/'extraction-register.json').write_text(json.dumps(register,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(register['counts']))
 print(json.dumps({'source_bytes':sum(p.stat().st_size for p in src.iterdir() if p.is_file()),'files':len(list(src.iterdir()))}))

if __name__=='__main__':main()

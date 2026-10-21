"""Preserve embedded SKP assets and rendering-material metadata, without edits.
Usage: python prepare-native-assets.py INPUT.skp NEW_OUTPUT_DIRECTORY
Requires defusedxml (installed with the pinned OpenSKP dependency).
"""
from pathlib import Path,PurePosixPath
import csv,hashlib,json,shutil,sys,zipfile
from defusedxml import ElementTree as ET

def run(source,out):
    assets=out/'native-assets';assets.mkdir(parents=True,exist_ok=True)
    files=[];views=[];members=[]
    with zipfile.ZipFile(source) as z:
        for item in z.infolist():
            members.append({'path':item.filename,'bytes':item.file_size,'compressed_bytes':item.compress_size,'crc32':f'{item.CRC:08x}'})
            if item.is_dir() or item.filename=='model.dat':continue
            rel=PurePosixPath(item.filename)
            if rel.is_absolute() or '..' in rel.parts:raise ValueError('Unsafe native asset member path')
            data=z.read(item);p=assets/str(rel);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
            row={'source_path':item.filename,'path':str(p.relative_to(out)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()};files.append(row)
            if item.filename.startswith('scene_thumbnails/'):
                name=f'scene-{len(views)+1:02d}{p.suffix.lower()}';target=out/'preview'/name;target.parent.mkdir(exist_ok=True);target.write_bytes(data)
                views.append({**row,'title':p.stem,'preview_path':'preview/'+name})
    (out/'preview').mkdir(exist_ok=True);shutil.copy2(assets/'meta/model_thumbnail.png',out/'preview/model-thumbnail.png')
    material_rows=[]
    for xml in sorted((assets/'materials').rglob('material.xml')):
        doc=ET.fromstring(xml.read_bytes());m=next((x for x in doc if x.tag.rsplit('}',1)[-1]=='material'),None)
        if m is None:continue
        material_rows.append({'source_xml':str(xml.relative_to(out)),**m.attrib,
             'texture_records':[dict(x.attrib) for x in m.iter() if x.tag.rsplit('}',1)[-1] in {'image','texture'}]})
    records={'source-intake.json':{'source_name':source.name,'source_bytes':source.stat().st_size,'source_sha256':hashlib.file_digest(source.open('rb'),'sha256').hexdigest()},
      'native-container-manifest.json':{'source':source.name,'members':members},
      'native-assets.json':{'count':len(files),'total_bytes':sum(x['bytes'] for x in files),'files':files},
      'saved-views.json':{'source':source.name,'kind':'embedded_camera_thumbnails','note':'Original saved images, not newly rendered or measured plans.','views':views},
      'materials.json':{'kind':'SketchUp rendering materials','procurement_note':'Appearance records are not a contractor bill of quantities. Rates and purchase quantities are not inferred.','materials':material_rows}}
    for name,data in records.items():(out/name).write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
    with (out/'materials.csv').open('w',newline='') as fp:
        w=csv.writer(fp);w.writerow(['name','source_xml','color_red','color_green','color_blue','has_texture','type'])
        for r in material_rows:w.writerow([r.get('name'),r['source_xml'],r.get('colorRed'),r.get('colorGreen'),r.get('colorBlue'),r.get('hasTexture'),r.get('type')])
    print(json.dumps({'assets':len(files),'saved_thumbnails':len(views),'rendering_materials':len(material_rows)}))

if __name__=='__main__':run(Path(sys.argv[1]),Path(sys.argv[2]))

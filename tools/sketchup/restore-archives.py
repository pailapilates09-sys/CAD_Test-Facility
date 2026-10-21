"""Verify and reassemble downloaded archive parts; never edits the native SKP.

Unzip the inspection bundle beside the numbered parts, then run this script.
Optional: --parts-dir DIR, --output-dir DIR, --manifest FILE, --verify-only.
Uses only Python's standard library. No network access or deletion of inputs.
"""
from pathlib import Path
import argparse,hashlib,json,os,tempfile

def run(manifest,parts_dir,output_dir,verify_only=False):
    data=json.loads(manifest.read_text())
    output_dir.mkdir(parents=True,exist_ok=True)
    for item in data['files']:
        if not item.get('parts'):continue
        name=item['path']
        if Path(name).name!=name:raise ValueError('Unsafe output filename')
        destination=output_dir/name
        if destination.exists() and not verify_only:
            with destination.open('rb') as fp:actual=hashlib.file_digest(fp,'sha256').hexdigest()
            if actual!=item['sha256']:raise FileExistsError('A different output already exists: '+str(destination))
            print('Already verified: '+name);continue
        tmp=None;total=0;full_hash=hashlib.sha256()
        try:
            if not verify_only:tmp=tempfile.NamedTemporaryFile(dir=output_dir,prefix='assemble-',delete=False)
            for part in item['parts']:
                if Path(part['name']).name!=part['name']:raise ValueError('Unsafe part filename')
                p=parts_dir/part['name'];digest=hashlib.sha256();size=0
                with p.open('rb') as fp:
                    while block:=fp.read(1024*1024):
                        digest.update(block);full_hash.update(block);size+=len(block);total+=len(block)
                        if tmp is not None:tmp.write(block)
                if size!=part['bytes'] or digest.hexdigest()!=part['sha256']:raise ValueError('Part checksum mismatch: '+part['name'])
            if total!=item['bytes'] or full_hash.hexdigest()!=item['sha256']:raise ValueError('Restored checksum mismatch: '+name)
            if tmp is not None:
                tmp.close()
                # Link atomically without overwriting an existing result.
                os.link(tmp.name,destination);Path(tmp.name).unlink();tmp=None
            print(('Verified parts: ' if verify_only else 'Restored: ')+name)
        finally:
            if tmp is not None:
                tmp.close();Path(tmp.name).unlink(missing_ok=True)

if __name__=='__main__':
    base=Path(__file__).resolve().parent
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--manifest',type=Path,default=base/'manifest.json');p.add_argument('--parts-dir',type=Path,default=base);p.add_argument('--output-dir',type=Path,default=base);p.add_argument('--verify-only',action='store_true');a=p.parse_args()
    run(a.manifest,a.parts_dir,a.output_dir,a.verify_only)

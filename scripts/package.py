"""Validate whitelist/relative entry and emit a reproducible Toy ZIP plus SHA manifest."""
from pathlib import Path
import zipfile,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1];dist=ROOT/'dist';out=ROOT/'artifacts';out.mkdir(exist_ok=True)
assert (dist/'index.html').is_file();assert (dist/'index.html').stat().st_size<=1024*1024
allowed={'.html','.js','.css','.svg','.wav','.woff2','.txt','.png','.jpg','.jpeg','.json'}
files=sorted(p for p in dist.rglob('*') if p.is_file());total=sum(p.stat().st_size for p in files)
for p in files:
 assert p.suffix in allowed,(p,'unsupported extension')
 if p.suffix in ['.html','.css']:
  text=p.read_text();assert not re.search(r'(?:src|href)=["\']/|url\(["\']?/',text),(p,'root absolute asset')
zip_path=out/'paipai-wave-toy-v1.0.0.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:
  info=zipfile.ZipInfo(p.relative_to(dist).as_posix(),(2026,10,30,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,p.read_bytes())
manifest={'version':'1.0.0','entryBytes':(dist/'index.html').stat().st_size,'uncompressedBytes':total,'zipBytes':zip_path.stat().st_size,'files':len(files),'under10MB':total<10*1024*1024,'zipSHA256':hashlib.sha256(zip_path.read_bytes()).hexdigest(),'assets':{str(p.relative_to(dist)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}}
(out/'package-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({k:v for k,v in manifest.items() if k!='assets'},indent=2))

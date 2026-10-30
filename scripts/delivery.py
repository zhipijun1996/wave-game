"""Package complete, reviewable handoff from a committed source state."""
from pathlib import Path
import subprocess,json,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'artifacts';V='v'+json.loads((ROOT/'package.json').read_text())['version']
sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
source=A/f'paipai-wave-source-{V}.zip';subprocess.run(['git','archive','--format=zip','-o',str(source),sha],cwd=ROOT,check=True)
patterns=['home-*x*.png','advanced-*x*.png','battle-gesture-*.png','gesture-*.png','skill-*.png','showcase-round-*.png','graduation-unlock.png','defeat.png','touch-*.png','toy-poster.png','toy-icon.png','rhythm-*.png','streak-*.png','advanced-locked.png','home-locked.png','anime-*.png','showcase-v2.1-*.png','post-clap-*.png','public-v2.1-*.png','showcase-dual-cutin.png','public-anonymous-game.png']
images=sorted(set(p for pattern in patterns for p in A.glob(pattern)))
logs=sorted(set(A.glob('*.json'))|set(A.glob('*.csv')))
logs=[p for p in logs if p.name!='delivery-manifest.json']
evidence=A/f'paipai-wave-evidence-{V}.zip'
with zipfile.ZipFile(evidence,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in images:z.write(p,'screenshots/'+p.name)
 for p in logs:z.write(p,'data/'+p.name)
 for p in sorted((ROOT/'docs').rglob('*')):
  if p.is_file():z.write(p,'docs/'+str(p.relative_to(ROOT/'docs')))
files=[A/f'paipai-wave-toy-{V}.zip',source,evidence,A/'paipai-wave-showcase.mp4',A/'timing-standard.webm',A/'timing-slow.webm',A/'timing-fast.webm',A/'touch-portrait.webm',A/'touch-landscape.webm']
deployment=json.loads((A/'sites-deployment-v2.1.json').read_text()) if (A/'sites-deployment-v2.1.json').exists() else {}
manifest={'version':V.lstrip('v'),'sourceCommit':sha,'deployedSourceCommit':deployment.get('sourceCommit'),'files':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files},'screenshots':len(images),'allExternalAcceptanceComplete':False,'pending':['third-party audio redistribution licenses and remaining clean stems/identity review (13 original-containing slots included)','physical-phone testing','human timing/recognition/balance playtest','Toy authorized account/container/review']}
(A/'delivery-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
full=A/f'paipai-wave-delivery-{V}.zip'
with zipfile.ZipFile(full,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.name)
 z.write(A/'delivery-manifest.json','delivery-manifest.json');z.write(ROOT/'docs/DELIVERY.md','README-DELIVERY.md')
print(json.dumps({'sourceCommit':sha,'screenshots':len(images),'fullBundleBytes':full.stat().st_size,'fullBundleSHA256':hashlib.sha256(full.read_bytes()).hexdigest()},indent=2))

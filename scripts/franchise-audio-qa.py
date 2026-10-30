"""Check actual shipped audio bytes, provenance and the fast-mode timing budget."""
from pathlib import Path
import json,wave,hashlib,math,array
R=Path(__file__).resolve().parents[1];m=json.loads((R/'data/audio-manifest.json').read_text());t=json.loads((R/'data/rhythm.json').read_text());checks=[]
for x in m['assets']:
 p=R/'public'/x['file'].removeprefix('./')
 with wave.open(str(p))as w:
  assert w.getnchannels()==1 and w.getsampwidth()==2 and w.getframerate()==22050
  duration=w.getnframes()/w.getframerate();a=array.array('h',w.readframes(w.getnframes()))
 assert abs(duration*1000-x['durationMs'])<2
 if not x['isOriginalFranchiseAudio']:continue
 assert hashlib.sha256(p.read_bytes()).hexdigest()==x['sha256']
 assert hashlib.sha256((R/x['sourceFile']).read_bytes()).hexdigest()==x['sourceFileSHA256']
 peak=max(map(abs,a))/32768;assert 0<peak<=10**(-3.99/20)
 rms=math.sqrt(sum((v/32768)**2 for v in a)/len(a));assert rms>.001
 id=x['id'];budget=(t['flight']+t['recovery'])*.7/1000;start=0
 if id.endswith('-cutin'):budget=t['cutins'][id[:-6]]/1000
 elif id=='win':budget=t['victory']/1000
 elif id in ['at-hit','psycho-hit']:budget=t['recovery']*.7/1000
 elif id in ['cylinder-in','cylinder-out','fan-return']:start=(t['fxOffset']+(0 if id=='cylinder-in'else 120))*.7/1000
 elif id in ['wave2','wave3']:start=t['flight']*.32*.7/1000
 assert start+duration<=budget+.001,(id,start,duration,budget)
 checks.append(dict(id=id,file=x['file'],duration=duration,peakDbFS=20*math.log10(peak),fastStart=start,fastBudget=budget,passed=True))
assert len(m['assets'])==37 and len(checks)==13
(R/'artifacts/franchise-audio-qa.json').write_text(json.dumps(dict(version=m['version'],checks=checks,passed=True),indent=2)+'\n')
print('13 franchise slots: source/output SHA, PCM decode, peak, non-silence and fast-mode tail budgets passed')

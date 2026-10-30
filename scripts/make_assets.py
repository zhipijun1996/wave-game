"""Original vector gesture icons and procedural audio. No downloaded sound samples."""
from pathlib import Path
import math,random,struct,wave,json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets'
skills=json.loads((ROOT/'data/skills.json').read_text())['skills']
for s in skills:
    k=s['kind'];level=s['power'] or s['cover'];ink='#303333';color='#338b86' if k=='charge' else '#cf805d' if k=='attack' else '#6c8397' if k=='guard' else '#9480a8'
    paths=''
    if k=='charge':
        paths='<path d="M12 24q-1-10 9-12l11 1m-17 8 14-2M36 40q1 10-9 12l-11-1m17-8-14 2"/><circle cx="24" cy="32" r="10" stroke="'+color+'"/>'
        if s['id']=='quick':paths+='<circle cx="40" cy="22" r="6" stroke="'+color+'"/><path d="m40 9 2 4m8 8-4 1"/>'
    elif k=='attack':
        paths='<path d="m8 45 15-8 1-16q0-5 3-5t3 5v10m0-7V13q0-4 3-4t3 4v17m0-9v-5q0-4 3-4t3 4v18l5-6q4-3 5 1l-8 14-13 2-13 9M12 35l10-9"/><path d="M47 12h10m-4-4 4 4-4 4" stroke="'+color+'"/>'
    elif k=='guard':
        paths='<path d="m9 51 5-17V21q0-4 3-4t3 4v10-18q0-4 3-4t3 4v18-13q0-4 3-4t3 4v18l5-6q4-3 5 1l-8 17-8 7M37 53l4-9 1-13V20q0-4 3-4t3 4v14l4-5q4-2 5 1l-6 17-4 7"/>'
    else:
        paths='<path d="m8 46 10-10 1-14q0-4 3-4t3 4v13l9-16q2-3 5-1t0 5l-8 15 10-10q3-3 5 0t-1 5L35 44l-12 2-8 9M53 48 39 37 25 30l-4 7 14 7 11 10"/><path d="M11 16q9-10 19-7m-4-5 5 5-6 5" stroke="'+color+'"/>'
    marks=''.join(f'<circle cx="{48+i*4}" cy="57" r="1.3" fill="{color}" stroke="none"/>' for i in range(level))
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="{ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{paths}{marks}</g></svg>'
    (OUT/'icons'/f'{s["id"]}.svg').write_text(svg)
RATE=22050;rng=random.Random(1627)
def write(name,duration,fn):
    n=int(RATE*duration);raw=[]
    for i in range(n):raw.append(max(-1,min(1,fn(i/RATE,duration))))
    with wave.open(str(OUT/'audio'/f'{name}.wav'),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(b''.join(struct.pack('<h',int(x*21000)) for x in raw))
def tone(t,f):return math.sin(2*math.pi*f*t)
def decay(t,k=16):return math.exp(-k*t)
write('select',.1,lambda t,d:tone(t,740)*decay(t,50)*.23)
for name,shift in [('clap1',0),('clap2',.013)]:write(name,.15,lambda t,d:(rng.uniform(-1,1)*.55+tone(t,1250)*.12)*decay(t,40)*(1+math.sin(t*410)*.2))
write('reveal',.18,lambda t,d:(tone(t,440)+tone(t,880)*.3)*decay(t,25)*.3)
for name,f in [('charge',520),('quick',680)]:write(name,.38,lambda t,d,f=f:(tone(t,f+t*600)+tone(t,f*1.5)*.25)*math.sin(math.pi*t/d)*.18)
for level in [1,2,3]:write('wave'+str(level),.4,lambda t,d,level=level:(rng.uniform(-1,1)*.32+tone(t,150+level*45-t*180)*.4+tone(t,65)*level*.08)*math.sin(math.pi*t/d)*decay(t,4))
write('cancel',.24,lambda t,d:(rng.uniform(-1,1)*.4+tone(t,1500-t*2200)*.2)*decay(t,17))
write('partial',.3,lambda t,d:(rng.uniform(-1,1)*.45+tone(t,110+t*250)*.3)*decay(t,12))
write('block',.22,lambda t,d:(tone(t,280)+tone(t,430)*.5)*decay(t,26)*.35)
write('break',.28,lambda t,d:(rng.uniform(-1,1)*.45+tone(t,140)*.3)*decay(t,14))
write('hit',.22,lambda t,d:(tone(t,120-t*130)+rng.uniform(-1,1)*.2)*decay(t,23)*.5)
write('reflect',.4,lambda t,d:(tone(t,300-t*180) if t<.16 else tone(t,600+(t-.16)*1600))*math.sin(math.pi*t/d)*.3)
write('interrupted',.25,lambda t,d:rng.uniform(-1,1)*decay(t,18)*.35)
for name,notes in [('win',[523,659,784,1047]),('lose',[440,392,330,262]),('unlock',[659,784,988,1319])]:
    write(name,1.0,lambda t,d,notes=notes:sum(tone(t-i*.14,f)*decay(t-i*.14,9)*.24 for i,f in enumerate(notes) if t>=i*.14))
notes=[523,0,659,784,0,659,587,0,440,0,523,659,0,587,523,0]
def music(t,d):
    val=0
    for i,f in enumerate(notes):
        dt=t-(i*.5+.08)
        if f and 0<=dt<1:val+=(tone(dt,f)+tone(dt,f*2)*.12)*decay(dt,8)*.09
    return val
write('music',8,music)
print('10 original SVGs; 20 original WAV assets generated')

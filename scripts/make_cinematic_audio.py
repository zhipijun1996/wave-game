"""Reproducible ORIGINAL temporary sound design and formant syllables, never franchise samples.
All waveforms are generated here; replace licensed franchise slots through data/audio-manifest.json.
"""
from pathlib import Path
import math, random, wave, struct, json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/audio';RATE=22050
rng=random.Random(200030);TAU=2*math.pi

def tone(t,f):return math.sin(TAU*f*t)
def env(t,d,a=.018):return min(1,t/a)*min(1,max(0,(d-t)/.06))
def noise(t):return rng.uniform(-1,1)
# Original synthetic vocal tract. Robotic syllables, NOT a cloned or imitated actor.
V={'a':(780,1150,2700),'o':(500,800,2800),'e':(500,1750,2500),'i':(330,2200,2900),'u':(350,850,2400)}
def vowel(t,v,pitch=185):
    f0=pitch*(1+.022*math.sin(t*30));fs=V[v];val=0
    for k in range(1,24):
        hz=f0*k;amp=sum(math.exp(-((hz-f)/140)**2) for f in fs)
        val+=math.sin(TAU*hz*t)*amp/(k**.33)
    return val*.16

def syllable(t,token,d):
    if not 0<=t<d:return 0
    v=next((x for x in reversed(token) if x in V),'a');lead=token[0]
    attack=.025 if lead in 'hkst' else .009
    breath=noise(t)*(.13 if lead in 'hsk' else .025)*math.exp(-t*38)
    if lead in 'dkbt' and t<.025:breath+=noise(t)*.12
    return (vowel(max(0,t-attack),v,200-t*20)+breath)*env(t,d,.03)

def chant(t,words):
    return sum(syllable(t-at,sy,d) for at,sy,d in words)

assets=[]
def write(name,d,fn,purpose,work=None,slot=None):
    vals=[fn(i/RATE,d) for i in range(int(RATE*d))];peak=max(abs(v) for v in vals) or 1
    rms=(sum(v*v for v in vals)/len(vals))**.5;gain=min(.86/peak,.13/(rms or 1))
    with wave.open(str(OUT/f'{name}.wav'),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(b''.join(struct.pack('<h',int(max(-.96,min(.96,v*gain))*32767)) for v in vals))
    assets.append({'id':name,'file':f'./assets/audio/{name}.wav','durationMs':round(d*1000),'origin':'original procedural temporary' if work else 'original procedural','workReference':work,'targetClip':slot,'source':'scripts/make_cinematic_audio.py','license':'MIT (project original generated audio)','purpose':purpose,'isOriginalFranchiseAudio':False,'peakDbFS':round(20*math.log10(peak*gain),2),'rmsDbFS':round(20*math.log10(rms*gain or 1e-8),2)})

def swell(t,d,f):return (tone(t,f+t*150)+tone(t,f*1.5)*.3)*math.sin(math.pi*t/d)*.2
write('charge',1.15,lambda t,d:(noise(t)*.1*math.sin(math.pi*min(1,t/.7)) if t<.7 else 0)+tone(t,380+t*220)*env(t,d)*.1,'短吸气、气球轻打气')
write('qi-gain',.28,lambda t,d:(tone(t,880)+tone(t,1320)*.24)*math.exp(-t*16)*env(t,d,.004),'结算点加气清脆提示')
write('quick',1.15,lambda t,d:(tone(t,210+t*1100)*.17+tone(t,700)*.07+noise(t)*.04)*env(t,d)*(.7+.3*math.sin(t*88)),'快充气流、电池双闪电')
write('wave1',.28,lambda t,d:syllable(t,'bo',.24)*1.4+tone(t,650-t*1200)*env(t,d)*math.exp(-t*17)*.16,'轻巧口技啵，含两种自然变体')
for k in [1,2]:write(f'wave1-{k}',.27,lambda t,d,k=k:syllable(t,'bo',.21)*1.2+tone(t,540+k*90-t*900)*env(t,d)*math.exp(-t*16)*.14,'小波自然变体')
write('wave2-cutin',2.2,lambda t,d:chant(t,[(.28,'ha',.28),(.77,'do',.29),(1.24,'ke',.37),(1.57,'n',.13)])+swell(t,d,150)*.45,'红头带双掌蓄力：机械合成Ha do ken（暂用）','Street Fighter / 隆','原版Ha do ken喊招')
write('wave3-cutin',2.6,lambda t,d:(tone(t,150+t*220)*.13+tone(t,330)*.06+tone(t,1280+t*100)*.05)*env(t,d)*min(1,t/.8)+(noise(t)*.11 if t>2.04 else 0)*env(t,d),'十字手臂起势、计时器汇能、光线预起射（暂用）','初代 Ultraman','斯派修姆起射原声')
write('wave2',1.15,lambda t,d:(tone(t,120-t*44)*.2+tone(t,315+t*130)*.1+noise(t)*.12)*env(t,d)*math.exp(-t*1.3),'蓝色波动拳发射、短尾迹（暂用）','Street Fighter / 隆','波动拳发射音')
write('wave3',1.45,lambda t,d:(tone(t,83)*.09+tone(t,440+t*55)*.12+tone(t,1050)*.04+noise(t)*.16)*env(t,d,.04),'白蓝光线持续流与核心（暂用），视觉持续仍只结算一次','初代 Ultraman','斯派修姆光线持续音')
write('guard1',.25,lambda t,d:(tone(t,370)*.1+tone(t,853)*.04)*env(t,d)*math.exp(-t*10),'举平底锅的轻金属声')
write('block',.48,lambda t,d:sum(tone(t,f)*a for f,a in [(540,.2),(865,.11),(1321,.08),(1979,.04)])*math.exp(-t*11)*env(t,d,.002),'清脆金属铛（成功格挡）')
write('guard2',1.2,lambda t,d:chant(t,[(.06,'e',.16),(.26,'ti',.17),(.53,'fi',.17),(.72,'ru',.16),(.9,'do',.18)])*.65+(tone(t,180+t*630)*.13+tone(t,840)*.04)*env(t,d),'AT逐层展开，机械合成A.T. Field（暂用）','Neon Genesis Evangelion / 初号机','AT力场启动/展开声')
write('guard3',1.25,lambda t,d:(tone(t,220)*.12+tone(t,330)*.08+tone(t,554)*.07+tone(t,887)*.03)*env(t,d)*(.65+.35*math.sin(t*12)**2),'白甲三盾展开、精神框架谐振（暂用）','Gundam Unicorn / 觉醒形态','精神感应场/浮游盾声')
write('reflect1',.53,lambda t,d:chant(t,[(.02,'ma',.14),(.19,'ji',.13),(.35,'ku',.15)])+tone(t,660-t*450)*env(t,d)*.08,'魔法筒发动，机械合成短喊（暂用）','Yu-Gi-Oh! / Magic Cylinder','魔法筒发动喊声')
write('cylinder-in',.32,lambda t,d:(tone(t,620-t*1200)+tone(t,910-t*900)*.3)*env(t,d)*.18,'魔法筒吸入下滑音（暂用）','Yu-Gi-Oh! / Magic Cylinder','吸入原声')
write('cylinder-out',.4,lambda t,d:(tone(t,230+t*1400)+noise(t)*.15)*env(t,d)*.16,'另一只魔法筒返射（暂用）','Yu-Gi-Oh! / Magic Cylinder','返射原声')
write('reflect2',1.18,lambda t,d:chant(t,[(.02,'u',.13),(.17,'chi',.13),(.32,'ha',.13),(.5,'ga',.15),(.7,'e',.14),(.86,'shi',.25)])+(noise(t)*.05+tone(t,160)*.04)*env(t,d),'团扇起手，机械合成Uchiha gaeshi（暂用）','Naruto / 宇智波斑','原版宇智波返し喊招')
write('fan-return',.48,lambda t,d:(noise(t)*.14+tone(t,120+t*370)*.18)*env(t,d),'团扇挥击返送气浪（暂用）','Naruto / 宇智波斑','返送效果音')
write('at-hit',.5,lambda t,d:(tone(t,540+t*210)*.15+tone(t,900)*.06+noise(t)*.07)*env(t,d)*math.exp(-t*6),'八角边缘冲击传播（暂用）','Neon Genesis Evangelion / 初号机','AT力场接触音')
write('psycho-hit',.65,lambda t,d:(tone(t,440)*.1+tone(t,660)*.08+tone(t,1100)*.05+noise(t)*.04)*env(t,d)*math.exp(-t*4),'三盾稳阵、光点散开（暂用）','Gundam Unicorn / 觉醒形态','精神力场接触声')
write('interrupted',.4,lambda t,d:(noise(t)*.08+tone(t,520-t*1000)*(.6 if t<.15 else .13))*(.5+.5*math.sin(t*250))*env(t,d)*math.exp(-t*7),'断电插头弹开，区别于普通受击')
write('break',.52,lambda t,d:(noise(t)*.2+tone(t,112)*.14+tone(t,690)*.06)*env(t,d,.002)*math.exp(-t*9),'锅凹飞/屏障碎裂/筒扇破防')
write('win',2.8,lambda t,d:sum((tone(t-at,f)+tone(t-at,f*1.5)*.19)*math.exp(-(t-at)*8)*.19 for at,f in [(0,196),(.18,246.94),(.44,293.66),(.8,392),(1.3,493.88),(1.85,392),(2.03,587.33)] if t>=at)+(noise(t)*.11*math.exp(-(t-1.85)*30) if t>=1.85 else 0),'原创亮相与定格短句（暂用），非任何JOJO原曲','JoJo’s Bizarre Adventure / 风格参考','原作亮相/定格短片段')
write('draw',1.8,lambda t,d:sum(tone(t-at,f)*math.exp(-(t-at)*9)*.18 for at,f in [(0,330),(.3,392),(.6,330),(1.1,293.66)] if t>=at),'平局两人喘气的短缓和提示')
write('egg',.3,lambda t,d:(tone(t,680+t*600)*.12+tone(t,1380)*.04)*env(t,d),'低频颠蛋笑点')
# Include unchanged original assets as explicit local files too.
existing={a['id'] for a in assets}
for file in sorted(OUT.glob('*.wav')):
    if file.stem in existing:continue
    with wave.open(str(file),'rb') as f:dur=round(f.getnframes()/f.getframerate()*1000)
    assets.append({'id':file.stem,'file':f'./assets/audio/{file.name}','durationMs':dur,'origin':'original procedural','workReference':None,'targetClip':None,'source':'scripts/make_assets.py','license':'MIT (project original generated audio)','purpose':'基础交互/战斗音效或原创背景音乐','isOriginalFranchiseAudio':False})
(ROOT/'data/audio-manifest.json').write_text(json.dumps({'version':'2.0.0','originalFranchiseClipsIncluded':0,'replacementPolicy':'文件路径与时长显式配置；接入有授权原声后同步调整rhythm特写时长并重测暂停续播。当前机械合成喊招与音效均为原创暂用，不模仿或克隆原配音。','assets':assets},ensure_ascii=False,indent=2)+'\n')
print(f'{len(assets)} local audio slots; original generated files written')

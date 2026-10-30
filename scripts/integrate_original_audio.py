"""Build the local franchise-audio replacements from the preserved source clips.

Requires Python 3 and FFmpeg. Source provenance/uncertainties remain in the manifest;
the code's MIT license does not license these third-party recordings.
"""
from pathlib import Path
from array import array
import hashlib,json,math,subprocess,wave

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'source-assets/audio'
OUT=ROOT/'public/assets/audio'
RATE=22050
manifest=json.loads((ROOT/'data/audio-manifest.json').read_text())
research=json.loads((ROOT/'data/audio-original-candidates.json').read_text())
sources={Path(x['file']).name:x for x in research['selectedClips']}

def read(name,start=0,end=None):
    cmd=['ffmpeg','-v','error','-i',str(SRC/name),'-ss',str(start)]
    if end is not None:cmd+=['-t',str(end-start)]
    return list(array('f',subprocess.check_output(cmd+['-ar',str(RATE),'-ac','1','-f','f32le','-'])))

def fit(samples,rms_db=-19):
    rms=math.sqrt(sum(x*x for x in samples)/max(1,len(samples)))
    gain=min(10**(rms_db/20)/max(rms,1e-9),10**(-4/20)/max(max(map(abs,samples),default=0),1e-9))
    a=[x*gain for x in samples]
    for i in range(min(int(.012*RATE),len(a))):a[i]*=i/(.012*RATE)
    for i in range(min(int(.025*RATE),len(a))):a[-1-i]*=i/(.025*RATE)
    return a

def composite(duration,tracks):
    out=[0.0]*round(duration*RATE)
    for offset,a,gain in tracks:
        at=round(offset*RATE)
        for i,v in enumerate(a[:max(0,len(out)-at)]):out[at+i]+=v*gain
    return out

def write(id,a,source,region,purpose,mixed=False,note=''):
    a=fit(a)
    filename=id+'-v2.1.wav'
    path=OUT/filename
    with wave.open(str(path),'wb')as w:
        w.setparams((1,2,RATE,len(a),'NONE','not compressed'))
        w.writeframes(array('h',(round(max(-1,min(1,x))*32767)for x in a)).tobytes())
    asset=next(x for x in manifest['assets']if x['id']==id)
    old=ROOT/'public'/asset['file'].removeprefix('./')
    if old!=path and old.exists():old.unlink()
    origin=sources[source]
    asset.update(file='./assets/audio/'+filename,durationMs=round(len(a)/RATE*1000),
        origin='franchise recording + original procedural layer'if mixed else 'franchise recording excerpt',
        workReference=origin['version'],targetClip=origin['title'],
        source=origin['sourcePage'],sourceFile='source-assets/audio/'+source,
        sourceFileSHA256=hashlib.sha256((SRC/source).read_bytes()).hexdigest(),
        sourceRegionSeconds=region,processing='mono 22050Hz PCM; 12ms fade-in/25ms fade-out; RMS target -19dBFS and peak <= -4dBFS; no pitch change',
        license='Third-party recording; redistribution license unconfirmed; excluded from project MIT grant',
        purpose=purpose,isOriginalFranchiseAudio=True,identityStatus=origin['identity'],
        limitations=note or origin['note'],mixedWithProcedural=mixed,
        peakDbFS=round(20*math.log10(max(map(abs,a))or 1e-9),2),
        rmsDbFS=round(20*math.log10(math.sqrt(sum(x*x for x in a)/len(a))or 1e-9),2),
        sha256=hashlib.sha256(path.read_bytes()).hexdigest())

# The spoken syllables land on the close-up's shoulder turn and palm extension.
write('wave2-cutin',composite(2.2,[(.9,fit(read('01-hadouken-classic.wav')),1)]),'01-hadouken-classic.wav',[0,None],'中波特写0.9秒起播放经典Ha do ken；完整喊招不变速')
beam=fit(read('03-ultraman-spacium.wav',.74,1.18))
write('wave3-cutin',composite(2.6,[(0,read('procedural-wave3-cutin.wav'),.6),(2.16,beam,1)]),'03-ultraman-spacium.wav',[.74,1.18],'初代光线起射叠于十字手臂特写末段',True)
write('wave3',read('03-ultraman-spacium.wav',1.18,2.33),'03-ultraman-spacium.wav',[1.18,2.33],'初代斯派修姆光线持续发射；只在一次同步交战中结算一次')
write('guard2',read('04-eva-at-field-impact.wav',0,1.05),'04-eva-at-field-impact.wav',[0,1.05],'橙色AT力场展开冲击原声候选')
write('at-hit',read('04-eva-at-field-impact.wav',.18,.78),'04-eva-at-field-impact.wav',[.18,.78],'AT力场成功挡波接触音')
write('guard3',read('05-unicorn-field-deploy-mix.wav',.35,1.5),'05-unicorn-field-deploy-mix.wav',[.35,1.5],'三盾合围时接入官方动画绿色精神感应场声音',note='官方UC结局场景混音，含原配乐；不是独立干声音轨')
write('psycho-hit',read('06-unicorn-field-block-mix.wav',2.0,2.6),'06-unicorn-field-block-mix.wav',[2.0,2.6],'精神感应场挡光束，原动画接触声',note='官方UC结局场景混音，含原配乐；不是独立干声音轨')
# Keep the complete Magic Cylinder name rather than cutting the last syllable in fast mode.
write('reflect1',read('08-cylinder-jp-game.wav',1.03,2.313878),'08-cylinder-jp-game.wav',[1.03,2.313878],'暗游戏原游戏日语マジックシリンダー；省去前段トラップ発動以适配快档')
write('cylinder-in',read('11-cylinder-anime-return-reference.wav',1.0,1.32),'11-cylinder-anime-return-reference.wav',[1.0,1.32],'魔法筒动画片段接波短音',note='取魔法筒反击动画场景；仍含少量背景声，非独立SE')
write('cylinder-out',read('11-cylinder-anime-return-reference.wav',3.6,4.0),'11-cylinder-anime-return-reference.wav',[3.6,4.0],'魔法筒动画片段返射短音',note='取魔法筒反击动画场景；仍含少量背景声，非独立SE')
write('reflect2',read('13-uchiha-gaeshi-jp-game.wav'),'13-uchiha-gaeshi-jp-game.wav',[0,None],'斑Jump Force日语宇智波返し喊招候选',note='原游戏编号#104高度匹配；保留最终人工核听待办，不冒充已核实动画直录')
write('fan-return',read('15-uchiha-en-anime-return-reference.wav',3.5,4.0),'15-uchiha-en-anime-return-reference.wav',[3.5,4.0],'团扇反击动画的气浪爆发；避开英语喊招',note='英语配音版原动画场景的非对白气浪，仍含背景声')
base=read('procedural-win.wav')
for i in range(round(.7*RATE),min(len(base),round(2.5*RATE))):base[i]*=.22
write('win',composite(2.8,[(0,base,.6),(.85,fit(read('16-jojo-jotaro-yare.wav')),1)]),'16-jojo-jotaro-yare.wav',[0,None],'JOJO胜利姿势中播放承太郎やれやれだぜ；保留原创亮相/定格重拍',True)
manifest.update(version='2.1.0',originalFranchiseClipsIncluded=sum(x['isOriginalFranchiseAudio']for x in manifest['assets']),
    replacementPolicy='用户要求合入已下载录音。来源、具体版本、裁切时码、混合层与未确认项逐文件记录；第三方录音不适用项目MIT许可。原声不变调，按快档回合预算裁切/配平；特写音轨独立暂停续播。')
(ROOT/'data/audio-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
notices=['拍拍波 v2.1 实际作品录音来源 / Third-party audio notices',
    '本目录中13个音轨槽含第三方作品录音，其余24槽为本项目原创音效。',
    '第三方录音权利归原权利人，游戏代码MIT许可不授予这些录音的权利。',
    '第三方录音再分发许可未确认；具体版本、裁切、来源和身份/干声未确认项如下及manifest.json。','']
for asset in manifest['assets']:
    if asset['isOriginalFranchiseAudio']:
        notices+=[asset['id']+' / '+asset['workReference'],asset['source'],
            '源片段: '+asset['sourceFile']+' '+str(asset['sourceRegionSeconds']),
            asset['limitations'] or '具体集数/版本以来源记录为准。','']
(OUT/'NOTICE.txt').write_text('\n'.join(notices))
print(f"{manifest['originalFranchiseClipsIncluded']} franchise-containing local audio slots / {len(manifest['assets'])} total")

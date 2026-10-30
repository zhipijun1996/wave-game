"""Align browser video to the actual WebAudio recording using disposable sync markers.
No game pixels/poses are synthesized. Markers and recorder padding are removed.
"""
from pathlib import Path
import subprocess,json
ROOT=Path(__file__).resolve().parents[1];a=ROOT/'artifacts';video=a/'showcase.webm';audio=a/'showcase-audio.webm'
def probe(p):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(p)]))['format']
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(video),'-vf','crop=10:10:0:0,scale=1:1','-f','rawvideo','-pix_fmt','rgb24','-'])
starts=[i for i in range(len(raw)//3) if raw[3*i]>180 and raw[3*i+1]<100 and raw[3*i+2]>180]
ends=[i for i in range(len(raw)//3) if raw[3*i]<100 and raw[3*i+1]>180 and raw[3*i+2]>180]
assert starts and ends,'Both capture synchronization markers are required'
start=starts[0]/25;end=ends[0]/25;duration=float(probe(audio)['duration']);ratio=(end-start)/duration
# Playwright's constant-25fps recording can quantize screencast timestamps.
# Fit its start/end markers to the actual continuous audio clock, preserving all real frames.
cut=.22;out_duration=duration-cut;assert 20<=out_duration<=40
raw_start=start+cut*ratio
filters=f'[0:v]trim=start={raw_start}:end={end},setpts=(PTS-STARTPTS)/{ratio},fps=30[v];[1:a]atrim=start={cut},asetpts=PTS-STARTPTS[a]'
out=a/'paipai-wave-showcase.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-i',str(audio),'-filter_complex',filters,'-map','[v]','-map','[a]','-t',str(out_duration),'-c:v','libx264','-preset','fast','-crf','22','-c:a','aac','-b:a','128k','-movflags','+faststart',str(out)],check=True)
meta=dict(videoMarkerStart=start,videoMarkerEnd=end,audioDuration=duration,videoClockCorrection=ratio,trimmedAudioSeconds=cut,output=probe(out),description='Actual game frames and actual recorded WebAudio; start/end marker calibration only, no synthesized poses or substituted game audio.')
(a/'recording-manifest.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta,indent=2))

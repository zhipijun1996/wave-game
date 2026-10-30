export class AudioBus {
 ctx:AudioContext|null=null;output:GainNode|null=null;buffers=new Map<string,AudioBuffer>();active=new Set<AudioBufferSourceNode>();music:AudioBufferSourceNode|null=null;musicGain:GainNode|null=null;enabled=false;sfx=.7;musicVolume=.3;
 async unlock(){
  if(!this.ctx){this.ctx=new AudioContext();this.output=this.ctx.createGain();this.output.connect(this.ctx.destination);const names=['select','clap1','clap2','reveal','charge','quick','wave1','wave2','wave3','cancel','partial','block','break','hit','reflect','interrupted','win','lose','unlock','music'];await Promise.all(names.map(async n=>{try{const r=await fetch(`./assets/audio/${n}.wav`);this.buffers.set(n,await this.ctx!.decodeAudioData(await r.arrayBuffer()));}catch{/* A silent playable fallback. */}}));}
  this.enabled=true;await this.ctx.resume();this.startMusic();
 }
 play(name:string){if(!this.enabled||!this.ctx||!this.sfx||!this.buffers.has(name)||this.active.size>=8)return;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.buffers.get(name)!;g.gain.value=this.sfx*.55;s.connect(g);g.connect(this.output!);this.active.add(s);s.onended=()=>{this.active.delete(s);s.disconnect();g.disconnect();};s.start();}
 startMusic(){if(this.music||!this.enabled||!this.ctx||!this.buffers.has('music'))return;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.buffers.get('music')!;s.loop=true;g.gain.value=this.musicVolume;s.connect(g);g.connect(this.output!);s.start();this.music=s;this.musicGain=g;}
 configure(s:{music:number;sfx:number}){this.sfx=s.sfx;this.musicVolume=s.music;if(this.musicGain)this.musicGain.gain.value=s.music;}
 stop(){this.enabled=false;for(const s of this.active){try{s.stop();}catch{}}this.active.clear();if(this.music){this.music.stop();this.music.disconnect();this.music=null;}this.musicGain?.disconnect();this.musicGain=null;void this.ctx?.suspend();}
}

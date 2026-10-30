import manifest from '../data/audio-manifest.json';
type PlayOptions={pan?:number;gain?:number;offset?:number;duck?:boolean;delay?:number};
export class AudioBus {
 ctx:AudioContext|null=null;output:GainNode|null=null;buffers=new Map<string,AudioBuffer>();active=new Set<AudioBufferSourceNode>();music:AudioBufferSourceNode|null=null;musicGain:GainNode|null=null;enabled=false;sfx=.7;musicVolume=.3;
 private input:GainNode|null=null;private epoch=0;
 private loading:Promise<void>|null=null;private ducks=0;private compressor:DynamicsCompressorNode|null=null;
 log:{name:string;file:string;offset:number;pan:number;at:number}[]=[];
 async unlock(){
  if(!this.ctx){this.ctx=new AudioContext();this.input=this.ctx.createGain();this.output=this.ctx.createGain();this.compressor=this.ctx.createDynamicsCompressor();this.compressor.threshold.value=-10;this.compressor.ratio.value=5;this.input.connect(this.compressor);this.compressor.connect(this.output);this.output.connect(this.ctx.destination);
   this.loading=Promise.all(manifest.assets.map(async a=>{try{const r=await fetch(a.file);if(!r.ok)throw Error(String(r.status));this.buffers.set(a.id,await this.ctx!.decodeAudioData(await r.arrayBuffer()));}catch{/* Manifest QA reports missing assets; gameplay remains usable. */}})).then(()=>{});
  }
  this.enabled=true;await this.ctx.resume();await this.loading;if(this.enabled)this.startMusic();
 }
 private mixMusic(){if(this.musicGain&&this.ctx)this.musicGain.gain.setTargetAtTime(this.musicVolume*(this.ducks?.24:1),this.ctx.currentTime,.06);}
 play(name:string,options:PlayOptions={}){
  if(!this.enabled||!this.ctx||!this.sfx||!this.buffers.has(name)||this.active.size>=16)return;
  const epoch=this.epoch,offset=options.offset||0,buffer=this.buffers.get(name)!;if(offset>=buffer.duration)return;
  const s=this.ctx.createBufferSource(),g=this.ctx.createGain(),p=this.ctx.createStereoPanner();s.buffer=buffer;g.gain.value=this.sfx*(options.gain??.8);p.pan.value=options.pan||0;s.connect(g);g.connect(p);p.connect(this.input!);this.active.add(s);
  if(options.duck){this.ducks++;this.mixMusic();}
  s.onended=()=>{this.active.delete(s);if(options.duck&&epoch===this.epoch){this.ducks=Math.max(0,this.ducks-1);this.mixMusic();}s.disconnect();g.disconnect();p.disconnect();};
  this.log.push({name,file:manifest.assets.find(a=>a.id===name)!.file,offset,pan:options.pan||0,at:this.ctx.currentTime+(options.delay||0)});if(this.log.length>600)this.log.shift();s.start(this.ctx.currentTime+(options.delay||0),Math.max(0,offset));
 }
 startMusic(){if(this.music||!this.enabled||!this.ctx||!this.buffers.has('music'))return;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.buffers.get('music')!;s.loop=true;g.gain.value=this.musicVolume*(this.ducks?.24:1);s.connect(g);g.connect(this.input!);s.start();this.music=s;this.musicGain=g;}
 configure(s:{music:number;sfx:number}){this.sfx=s.sfx;this.musicVolume=s.music;this.mixMusic();}
 stop(){this.enabled=false;this.epoch++;for(const s of this.active){try{s.stop();}catch{}}this.active.clear();this.ducks=0;if(this.music){this.music.stop();this.music.disconnect();this.music=null;}this.musicGain?.disconnect();this.musicGain=null;void this.ctx?.suspend();}
}

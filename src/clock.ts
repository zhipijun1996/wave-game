import {defaultAction,reason,resolve,type Resolution,type SkillId,type State} from './rules';
import timing from '../data/rhythm.json';
export const TIMING=timing;
export type TimelineEvent = {type:string;round:number;at:number;local:number;wall:number};
export class BattleClock {
  state:State; startState:State; readonly origin:State; selected:SkillId|null=null; sealed:SkillId; result:Resolution|null=null;
  time=0;roundStart=0;scale:number;nextScale:number;paused=false;finished=false;committed=false;beat2=false;windowClosed=false;fxCued=false;
  history:{actions:[SkillId,SkillId]}[]=[]; log:TimelineEvent[]=[];
  onEvent:(type:string)=>void=()=>{};
  constructor(state:State,public choose:(s:State)=>SkillId,scale=1){this.origin=structuredClone(state);this.state=structuredClone(state);this.startState=structuredClone(state);this.scale=scale;this.nextScale=scale;this.sealed=choose(structuredClone(state));this.event('start');}
  get local(){return Math.round(((this.time-this.roundStart)/this.scale)*1e6)/1e6;}
  get inputOpen(){return !this.paused&&!this.finished&&this.local>=TIMING.windowOpen&&this.local<TIMING.windowClose;}
  get locked(){return this.local>=TIMING.windowClose;}
  get missed(){return this.windowClosed&&this.selected===null;}
  get inputReason(){return this.paused?'已暂停':this.finished?'本局已结束':this.local<TIMING.windowOpen?'太早了，等第二拍拍手后亮框再点':this.local>=TIMING.windowClose?'太晚了，点击窗口已结束':'';}
  event(type:string){this.log.push({type,round:this.startState.round,at:this.time,local:this.local,wall:performance.now()});this.onEvent(type);}
  select(id:SkillId){if(!this.inputOpen||reason(this.startState.players[0],id))return false;this.selected=id;this.event('select');return true;}
  advance(delta:number){
    if(this.paused||this.finished)return;
    const target=this.time+Math.max(0,delta);
    while(!this.finished&&!this.paused){
      const threshold=!this.beat2?TIMING.secondClap:!this.windowClosed?TIMING.windowClose:!this.result?TIMING.reveal:!this.fxCued?TIMING.fx:!this.committed?TIMING.commit:TIMING.roundEnd;
      const next=this.roundStart+Math.round(threshold*this.scale*1e6)/1e6;
      if(next>target){this.time=target;break;}
      this.time=next;
      if(threshold===TIMING.secondClap){this.beat2=true;this.event('clap');this.event('window-open');}
      if(threshold===TIMING.windowClose){this.windowClosed=true;this.event('window-close');}
      if(threshold===TIMING.reveal){this.result=resolve(this.startState,[this.selected,this.sealed]);this.event('reveal');}
      if(threshold===TIMING.fx){this.fxCued=true;this.event('fx');}
      if(threshold===TIMING.commit){this.state=structuredClone(this.result!.next);this.committed=true;this.event('commit');}
      if(threshold===TIMING.roundEnd){
        this.history.push({actions:this.result!.actions});
        if(this.result!.winner!==null){this.finished=true;this.event('finish');break;}
        this.roundStart=this.time;this.startState=structuredClone(this.state);this.scale=this.nextScale;this.selected=null;this.result=null;this.committed=false;this.beat2=false;this.windowClosed=false;this.fxCued=false;this.sealed=this.choose(structuredClone(this.startState));this.event('start');
      }
    }
  }
  pause(){if(!this.paused&&!this.finished){this.paused=true;this.event('pause');}}
  resume(){if(!this.paused)return;this.paused=false;if(!this.result){this.roundStart=this.time;this.beat2=false;this.windowClosed=false;this.event('restart-beat');}this.event('resume');}
  get fallback(){return defaultAction(this.startState.players[0]);}
}

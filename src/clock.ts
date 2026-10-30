import {defaultAction,reason,resolve,type Resolution,type SkillId,type State} from './rules';
import timing from '../data/rhythm.json';
export const TIMING=timing;
export type TimelineEvent = {type:string;round:number;at:number;local:number;wall:number};
export class BattleClock {
 state:State;startState:State;readonly origin:State;selected:SkillId|null=null;sealed:SkillId;result:Resolution|null=null;
 time=0;roundStart=0;scale:number;nextScale:number;paused=false;finished=false;committed=false;beat2=false;windowOpened=false;third=false;windowClosed=false;fxCued=false;revealAt:number|null=null;
 history:{actions:[SkillId,SkillId]}[]=[];log:TimelineEvent[]=[];onEvent:(type:string)=>void=()=>{};
 constructor(state:State,public choose:(s:State)=>SkillId,scale=1){this.origin=structuredClone(state);this.state=structuredClone(state);this.startState=structuredClone(state);this.scale=scale;this.nextScale=scale;this.sealed=choose(structuredClone(state));this.event('start');}
 get local(){return Math.round((this.time-this.roundStart)/this.scale*1e6)/1e6;}
 get inputOpen(){return !this.paused&&!this.finished&&!this.result&&this.local>=TIMING.windowOpen&&this.local<TIMING.windowClose;}
 get locked(){return !!this.result||this.windowClosed;}
 get missed(){return this.windowClosed&&this.selected===null;}
 get inputDeadline(){return this.selected&&!this.result?TIMING.thirdBeat:TIMING.windowClose;}
 // The renderer keeps its reusable action clips at local 1800; actual tap time drives them.
 get visualLocal(){return this.revealAt===null?Math.min(this.local,TIMING.thirdBeat-.001):1800+(this.local-this.revealAt);}
 get inputReason(){return this.paused?'已暂停':this.finished?'本局已结束':this.result?'已出招，等待下一回合':this.local<TIMING.windowOpen?'太早了，跟着拍、拍，第三拍再点':this.local>=TIMING.windowClose?'太晚了，第三拍判定已结束':'';}
 event(type:string){this.log.push({type,round:this.startState.round,at:this.time,local:this.local,wall:performance.now()});this.onEvent(type);}
 private reveal(){if(this.result)return;this.revealAt=this.local;this.result=resolve(this.startState,[this.selected,this.sealed]);this.event('reveal');}
 select(id:SkillId){if(!this.inputOpen||reason(this.startState.players[0],id))return false;this.selected=id;this.event('select');if(this.local>=TIMING.thirdBeat)this.reveal();return true;}
 advance(delta:number){
  if(this.paused||this.finished)return;const target=this.time+Math.max(0,delta);
  while(!this.finished&&!this.paused){
   const points=[TIMING.roundEnd];
   if(!this.beat2)points.push(TIMING.secondClap);if(!this.windowOpened)points.push(TIMING.windowOpen);if(!this.third)points.push(TIMING.thirdBeat);if(!this.windowClosed)points.push(TIMING.windowClose);
   if(this.revealAt!==null){if(!this.fxCued)points.push(this.revealAt+TIMING.fxOffset);if(!this.committed)points.push(this.revealAt+TIMING.flight);}
   const threshold=Math.min(...points),next=this.roundStart+Math.round(threshold*this.scale*1e6)/1e6;
   if(next>target){this.time=target;break;}this.time=next;
   if(!this.beat2&&threshold===TIMING.secondClap){this.beat2=true;this.event('clap');}
   if(!this.windowOpened&&threshold===TIMING.windowOpen){this.windowOpened=true;this.event('window-open');}
   if(!this.third&&threshold===TIMING.thirdBeat){this.third=true;this.event('third-beat');if(this.selected)this.reveal();}
   if(!this.windowClosed&&threshold===TIMING.windowClose){this.windowClosed=true;this.event('window-close');if(!this.result)this.reveal();}
   if(this.revealAt!==null&&!this.fxCued&&Math.abs(threshold-this.revealAt-TIMING.fxOffset)<.00001){this.fxCued=true;this.event('fx');}
   if(this.revealAt!==null&&!this.committed&&Math.abs(threshold-this.revealAt-TIMING.flight)<.00001){this.state=structuredClone(this.result!.next);this.committed=true;this.event('commit');}
   if(threshold===TIMING.roundEnd){this.history.push({actions:this.result!.actions});if(this.result!.winner!==null){this.finished=true;this.event('finish');break;}this.roundStart=this.time;this.startState=structuredClone(this.state);this.scale=this.nextScale;this.selected=null;this.result=null;this.revealAt=null;this.committed=false;this.beat2=false;this.windowOpened=false;this.third=false;this.windowClosed=false;this.fxCued=false;this.sealed=this.choose(structuredClone(this.startState));this.event('start');}
  }
 }
 pause(){if(!this.paused&&!this.finished){this.paused=true;this.event('pause');}}
 resume(){if(!this.paused)return;this.paused=false;if(!this.result){this.roundStart=this.time;this.beat2=false;this.windowOpened=false;this.third=false;this.windowClosed=false;this.event('restart-beat');}this.event('resume');}
 get fallback(){return defaultAction(this.startState.players[0]);}
}

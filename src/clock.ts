import {defaultAction,reason,resolve,type Resolution,type SkillId,type State} from './rules';
import timing from '../data/rhythm.json';
export const TIMING=timing;
export type Phase='select'|'cutin'|'action'|'recover'|'victory'|'finished';
export type TimelineEvent={type:string;round:number;at:number;local:number;phase:Phase;phaseTime:number;wall:number};
const cinematic=(id:SkillId)=>id==='wave2'?TIMING.cutins.wave2:id==='wave3'?TIMING.cutins.wave3:0;
/** One owner for time, locked actions and the single state commit. Cut-ins use their own real-time axis. */
export class BattleClock {
 state:State;startState:State;readonly origin:State;selected:SkillId|null=null;sealed:SkillId;result:Resolution|null=null;
 time=0;roundStart=0;scale:number;nextScale:number;paused=false;finished=false;committed=false;
 phase:Phase='select';phaseTime=0;cutinDuration=0;beat2=false;windowOpened=true;third=false;windowClosed=false;fxCued=false;revealAt:number|null=null;
 history:{actions:[SkillId,SkillId]}[]=[];log:TimelineEvent[]=[];onEvent:(type:string)=>void=()=>{};
 constructor(state:State,public choose:(s:State)=>SkillId,scale=1){this.origin=structuredClone(state);this.state=structuredClone(state);this.startState=structuredClone(state);this.scale=scale;this.nextScale=scale;this.sealed=choose(structuredClone(state));this.event('start');}
 get local(){return this.phase==='select'?this.phaseTime:this.phase==='cutin'?TIMING.thirdBeat:this.phase==='action'?TIMING.thirdBeat+this.phaseTime:this.phase==='recover'?TIMING.thirdBeat+TIMING.flight+this.phaseTime:TIMING.roundEnd;}
 get inputOpen(){return !this.paused&&!this.finished&&this.phase==='select'&&this.phaseTime<TIMING.thirdBeat;}
 get locked(){return this.result!==null;}
 get missed(){return false;}
 get usedDefault(){return this.result!==null&&this.selected===null;}
 get inputDeadline(){return TIMING.thirdBeat;}
 get visualLocal(){return this.phase==='select'?this.local:this.phase==='cutin'?1799.999:this.phase==='action'?1800+this.phaseTime/TIMING.flight*450:2250+(this.phase==='recover'?this.phaseTime/TIMING.recovery*450:450);}
 get inputReason(){return this.paused?'已暂停':this.phase==='select'?'':'双方已锁招，下一回合再选';}
 get fallback(){return defaultAction(this.startState.players[0]);}
 get victoryDuration(){return this.result?.winner==='draw'?TIMING.draw:TIMING.victory;}
 event(type:string){this.log.push({type,round:this.startState.round,at:this.time,local:this.local,phase:this.phase,phaseTime:this.phaseTime,wall:performance.now()});this.onEvent(type);}
 select(id:SkillId){if(!this.inputOpen||reason(this.startState.players[0],id))return false;this.selected=id;this.event('select');return true;}
 private lock(){this.third=true;this.windowClosed=true;this.revealAt=TIMING.thirdBeat;this.result=resolve(this.startState,[this.selected,this.sealed]);this.cutinDuration=Math.max(...this.result.actions.map(cinematic));this.phase=this.cutinDuration?'cutin':'action';this.phaseTime=0;this.event('third-beat');this.event('reveal');this.event(this.cutinDuration?'cutin-start':'launch');}
 private nextRound(){this.roundStart=this.time;this.startState=structuredClone(this.state);this.scale=this.nextScale;this.selected=null;this.result=null;this.revealAt=null;this.phase='select';this.phaseTime=0;this.cutinDuration=0;this.committed=false;this.beat2=false;this.third=false;this.windowClosed=false;this.fxCued=false;this.sealed=this.choose(structuredClone(this.startState));this.event('start');}
 advance(delta:number){
  if(this.paused||this.finished)return;let remaining=Math.max(0,delta);
  // Only stage boundaries drive transitions. A large update cannot skip a commit or resample AI.
  while(remaining>1e-7&&!this.paused&&!this.finished){
   const phase=this.phase,rate=phase==='cutin'||phase==='victory'?1:this.scale;
   const end=phase==='select'?(!this.beat2?TIMING.secondClap:TIMING.thirdBeat):phase==='cutin'?this.cutinDuration:phase==='action'?(!this.fxCued?TIMING.fxOffset:TIMING.flight):phase==='recover'?TIMING.recovery:this.victoryDuration;
   const step=Math.min(remaining,Math.max(0,end-this.phaseTime)*rate);this.time+=step;this.phaseTime+=step/rate;remaining-=step;
   if(this.phaseTime<end-1e-7)break;this.phaseTime=end;
   if(phase==='select'){if(!this.beat2){this.beat2=true;this.event('clap');}else this.lock();}
   else if(phase==='cutin'){this.event('cutin-end');this.phase='action';this.phaseTime=0;this.event('launch');}
   else if(phase==='action'){if(!this.fxCued){this.fxCued=true;this.event('fx');}else{if(!this.committed){this.state=structuredClone(this.result!.next);this.committed=true;this.event('commit');}this.phase='recover';this.phaseTime=0;this.event('recover');}}
   else if(phase==='recover'){this.history.push({actions:this.result!.actions});if(this.result!.winner!==null){this.phase='victory';this.phaseTime=0;this.event('victory');}else this.nextRound();}
   else if(phase==='victory'){this.phase='finished';this.finished=true;this.event('finish');}
  }
 }
 pause(){if(!this.paused&&!this.finished){this.paused=true;this.event('pause');}}
 resume(){if(!this.paused)return;this.paused=false;if(!this.result){this.roundStart=this.time;this.phaseTime=0;this.beat2=false;this.event('restart-beat');}this.event('resume');}
}

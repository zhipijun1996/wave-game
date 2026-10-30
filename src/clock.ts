import {defaultAction,reason,resolve,type Resolution,type SkillId,type State} from './rules';
export type TimelineEvent = {type:string;round:number;at:number;local:number;wall:number};
export class BattleClock {
  state:State; startState:State; selected:SkillId|null=null; sealed:SkillId; result:Resolution|null=null;
  time=0;roundStart=0;scale:number;nextScale:number;paused=false;finished=false;committed=false;beat2=false;
  history:{actions:[SkillId,SkillId]}[]=[]; log:TimelineEvent[]=[];
  onEvent:(type:string)=>void=()=>{};
  constructor(state:State,public choose:(s:State)=>SkillId,scale=1){this.state=structuredClone(state);this.startState=structuredClone(state);this.scale=scale;this.nextScale=scale;this.sealed=choose(structuredClone(state));this.event('start');}
  get local(){return (this.time-this.roundStart)/this.scale;}
  get locked(){return this.result!==null;}
  event(type:string){this.log.push({type,round:this.startState.round,at:this.time,local:this.local,wall:performance.now()});this.onEvent(type);}
  select(id:SkillId){if(this.paused||this.finished||this.local>=1800||reason(this.startState.players[0],id))return false;this.selected=id;this.event('select');return true;}
  advance(delta:number){
    if(this.paused||this.finished)return;
    const target=this.time+Math.max(0,delta);
    while(!this.finished){
      const threshold=!this.beat2?900:!this.result?1800:!this.committed?2250:2700;
      const next=this.roundStart+threshold*this.scale;
      if(next>target){this.time=target;break;}
      this.time=next;
      if(threshold===900){this.beat2=true;this.event('clap');}
      if(threshold===1800){this.result=resolve(this.startState,[this.selected,this.sealed]);this.event('reveal');}
      if(threshold===2250){this.state=structuredClone(this.result!.next);this.committed=true;this.event('commit');}
      if(threshold===2700){
        this.history.push({actions:this.result!.actions});
        if(this.result!.winner!==null){this.finished=true;this.event('finish');break;}
        this.roundStart=this.time;this.startState=structuredClone(this.state);this.scale=this.nextScale;this.selected=null;this.result=null;this.committed=false;this.beat2=false;this.sealed=this.choose(structuredClone(this.startState));this.event('start');
      }
    }
  }
  pause(){if(!this.paused&&!this.finished){this.paused=true;this.event('pause');}}
  resume(){if(!this.paused)return;this.paused=false;if(!this.result){this.roundStart=this.time;this.beat2=false;this.event('restart-beat');}this.event('resume');}
  get fallback(){return defaultAction(this.startState.players[0]);}
}

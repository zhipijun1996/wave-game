import type {Resolution} from './rules';
export type MatchMode='basic'|'advanced';
export const advancedUnlocked=(completed:number)=>completed>=8;
// Current runs are transient; only per-mode best records are persisted.
export class StreakRun {
 mode:MatchMode='basic';enabled=false;running=false;wins=0;match=0;private settled=0;
 begin(mode:MatchMode,enabled:boolean){this.mode=mode;this.enabled=enabled;this.running=enabled;this.wins=0;this.match=0;this.settled=0;}
 reset(){this.begin('basic',false);}
 nextMatch(){if(this.enabled&&this.running)this.match++;}
 settle(winner:Resolution['winner']):boolean {
  if(!this.enabled||!this.running||winner===null||this.match===0||this.settled===this.match)return false;
  this.settled=this.match;if(winner===0)this.wins++;else this.running=false;return true;
 }
}

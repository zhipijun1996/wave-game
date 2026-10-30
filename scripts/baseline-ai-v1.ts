// Frozen pre-rhythm AI for reproducible comparisons; not imported by the game.
import {legal,resolve,SKILLS,type SkillId,type State} from '../src/rules';
export type History = {actions:[SkillId,SkillId]}[];
export function random(seed:number) {let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=Math.imul(x^x>>>15,1|x);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
// Only public round-start state, revealed history and independent PRNG enter this function.
export function chooseAI(state:State,side:0|1,rng:()=>number,difficulty='normal',history:History=[],personality='mixed'):SkillId {
  const me=state.players[side],them=state.players[1-side],actions=legal(me),opponent=legal(them);
  const freq=Object.fromEntries(opponent.map(id=>[id,1]));
  for(const h of history.slice(-10)) {const id=h.actions[1-side];if(id in freq)freq[id]+=difficulty==='hard'?2:1;}
  const scores=actions.map(a=>{
    let v=0,total=0;
    for(const b of opponent){const pair=(side===0?[a,b]:[b,a]) as [SkillId,SkillId];const r=resolve(state,pair);
      const weight=(difficulty==='easy'?1:freq[b])*(SKILLS[b].kind==='charge'?1.5:1);
      v+=weight*(r.damage[1-side]*(them.hp<=SKILLS[a].damage?3:1.7)-r.damage[side]*2+(r.gain[side]-r.cost[side])*0.3);total+=weight;}
    v/=total;
    if(personality==='quick'&&a==='quick')v+=0.55;
    if(personality==='reflect'&&SKILLS[a].kind==='reflect')v+=0.45;
    if(personality==='guard'&&SKILLS[a].kind==='guard')v+=0.3;
    if(personality==='big'&&(a==='charge'||a==='quick'||a==='wave3'))v+=0.35;
    const temperature=difficulty==='easy'?2.8:difficulty==='hard'?0.65:1.2;
    return Math.exp(Math.max(-12,Math.min(12,v/temperature)))+0.08;
  });
  let n=rng()*scores.reduce((a,b)=>a+b,0);return actions.find((_,i)=>(n-=scores[i])<0)??actions[0];
}

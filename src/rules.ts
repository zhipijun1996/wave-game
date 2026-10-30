import config from '../data/skills.json';
export type SkillId = 'charge'|'quick'|'wave1'|'wave2'|'wave3'|'guard1'|'guard2'|'guard3'|'reflect1'|'reflect2'|'idle';
export type Fighter = {hp:number;energy:number;blocked:boolean;skills:SkillId[]};
export type State = {round:number;players:[Fighter,Fighter]};
export type Event = {type:'hit'|'break'|'block'|'reflect'|'cancel'|'partial'|'charge'|'interrupted'|'miss';side:number;amount:number};
export type Resolution = {actions:[SkillId,SkillId];next:State;damage:[number,number];gain:[number,number];cost:[number,number];events:Event[];winner:0|1|'draw'|null};
export const CONFIG = config;
export const ALL = config.skills.map(s=>s.id as SkillId);
export const BASIC:SkillId[] = ['charge','wave1','guard1'];
export const SKILLS = Object.fromEntries([...config.skills,config.missAction].map(s=>[s.id,s])) as Record<SkillId,typeof config.skills[number]>;
export function reason(p:Fighter,id:SkillId):string {
  if(!p.skills.includes(id)) return '尚未学会';
  if(p.blocked && SKILLS[id].kind==='charge') return '过热 · 本回合禁充';
  if(id==='quick' && p.energy>=config.energyCap) return '气已满';
  if(p.energy<SKILLS[id].cost) return `需 ${SKILLS[id].cost} 气`;
  return '';
}
export const legal = (p:Fighter)=>p.skills.filter(id=>!reason(p,id));
export const defaultAction = (p:Fighter):SkillId=>!reason(p,'charge')?'charge':'guard1';
export const validAction = (p:Fighter,id?:SkillId|null):SkillId=>id && !reason(p,id)?id:defaultAction(p);
export function initial(hp:number=5,skills:SkillId[]=ALL,enemySkills:SkillId[]=skills):State {
  return {round:1,players:[{hp,energy:0,blocked:false,skills:[...skills]},{hp,energy:0,blocked:false,skills:[...enemySkills]}]};
}
export function resolve(state:State,requested:[SkillId|null,SkillId|null]):Resolution {
  const actions=state.players.map((p,i)=>validAction(p,requested[i])) as [SkillId,SkillId];
  const s=actions.map(id=>SKILLS[id]);
  const damage:[number,number]=[0,0],gain:[number,number]=[0,0],cost=s.map(x=>x.cost) as [number,number];
  const events:Event[]=[];
  if(s.every(x=>x.kind==='attack')) {
    damage[0]=Math.max(0,s[1].damage-s[0].damage);damage[1]=Math.max(0,s[0].damage-s[1].damage);
    events.push({type:s[0].damage===s[1].damage?'cancel':'partial',side:damage[0]>0?0:1,amount:Math.abs(s[0].damage-s[1].damage)});
  } else for(const i of [0,1]) {
    const j=1-i;
    if(s[i].kind!=='attack') continue;
    if(s[j].kind==='reflect' && s[j].cover>=s[i].power) {
      damage[i]=s[i].damage;events.push({type:'reflect',side:j,amount:s[i].damage});
    } else if(s[j].kind==='guard' && s[j].cover>=s[i].power) events.push({type:'block',side:j,amount:s[i].damage});
    else {damage[j]=s[i].damage;events.push({type:s[j].kind==='guard'||s[j].kind==='reflect'?'break':'hit',side:j,amount:s[i].damage});}
  }
  const players=state.players.map((p,i)=>{
    gain[i]=s[i].gain && !(s[i].hitCancelsGain && damage[i]>0)?Math.min(s[i].gain,config.energyCap-p.energy+cost[i]):0;
    if(s[i].kind==='idle') events.push({type:'miss',side:i,amount:0});
    if(s[i].kind==='charge') events.push({type:actions[i]==='quick' && damage[i]>0?'interrupted':'charge',side:i,amount:gain[i]});
    return {...p,hp:Math.max(0,p.hp-damage[i]),energy:p.energy-cost[i]+gain[i],blocked:s[i].lockCharge};
  }) as [Fighter,Fighter];
  const winner=players.every(p=>p.hp===0)?'draw':players[0].hp===0?1:players[1].hp===0?0:state.round>=config.maxRounds?'draw':null;
  return {actions,next:{round:state.round+1,players},damage,gain,cost,events,winner};
}

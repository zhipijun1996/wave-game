import fs from 'node:fs/promises';
import {ALL,initial,legal,resolve,SKILLS,CONFIG,type SkillId} from '../src/rules';
import {chooseAI,random,type History} from '../src/ai';
import {chooseAI as baseline} from './baseline-ai-v1';
import {chooseAI as zeroOnly} from './baseline-ai-zero-charge';
const n=Number(process.argv[2]||1000),output=process.argv[3]||'artifacts/skill-usage-v1.1.json';
const quantile=(a:number[],q:number)=>a.length?[...a].sort((a,b)=>a-b)[Math.floor((a.length-1)*q)]:null;
const zero=()=>({selected:0,available:0,turns:0,cost:0,damage:0,blocked:0,prevented:0,reflected:0,returned:0,empty:0,hits:0,broken:0});
const experiments=[];
for(const version of ['before','zero_only','after'] as const)for(const difficulty of ['easy','normal','hard']){
 const fn=version==='before'?baseline:version==='zero_only'?zeroOnly:chooseAI;
 const counts=Object.fromEntries(ALL.map(id=>[id,zero()])) as Record<SkillId,ReturnType<typeof zero>>;
 const turns:number[]=[],first5:number[]=[],wins=[0,0,0],strata:Record<string,Record<string,number>>={};let zeroBoth=0,zeroCharges=0,reached5=0,fightsWave3=0;
 for(let k=0;k<n;k++)for(const swapped of [false,true]){
  let state=initial(5),hist:History=[];const streams=[random(173+k*97),random((173+k*97)^0x13579)];if(swapped)streams.reverse();let hasBig=false;const seen5=[false,false];
  for(;;){
   const acts=([0,1] as const).map(side=>fn(state,side,streams[side],difficulty,hist)) as [SkillId,SkillId];
   const r=resolve(state,acts);
   for(const side of [0,1]){
    const p=state.players[side],op=state.players[1-side],id=acts[side],skill=SKILLS[id],c=counts[id];
    for(const a of ALL){counts[a].turns++;if(legal(p).includes(a))counts[a].available++;}
    c.selected++;c.cost+=r.cost[side];c.damage+=r.damage[1-side];c.hits+=Number(r.damage[1-side]>0);
    const block=r.events.find(e=>e.type==='block'&&e.side===side),ref=r.events.find(e=>e.type==='reflect'&&e.side===side);
    if(block){c.blocked++;c.prevented+=block.amount;}if(ref){c.reflected++;c.returned+=ref.amount;}
    if(['guard','reflect'].includes(skill.kind)){if(SKILLS[acts[1-side]].kind!=='attack')c.empty++;if(r.damage[side]>0)c.broken++;}
    if(!seen5[side]&&p.energy>=5){first5.push(state.round);seen5[side]=true;reached5++;}
    if(id==='wave3')hasBig=true;
    if(p.energy===0&&op.energy===0&&!p.blocked){zeroBoth++;zeroCharges+=Number(skill.kind==='charge');}
    const threats=legal(op).filter(a=>SKILLS[a].kind==='attack');const maxThreat=Math.max(0,...threats.map(a=>SKILLS[a].power));
    const key=`enemyMaxAttack=${maxThreat}/myEnergy=${p.energy}/myLowHP=${p.hp<=2}`;
    const s=strata[key]??={turns:0};s.turns++;s[id]=(s[id]||0)+1;
    for(const a of ['wave3','guard2','reflect2'] as SkillId[])if(legal(p).includes(a))s[a+'Available']=(s[a+'Available']||0)+1;
   }
   hist.push({actions:acts});state=r.next;
   if(r.winner!==null){wins[r.winner==='draw'?2:r.winner]++;turns.push(hist.length);fightsWave3+=Number(hasBig);break;}
  }
 }
 const skills=Object.fromEntries(ALL.map(id=>{const c=counts[id];return [id,{...c,share:c.selected/c.turns,whenLegal:c.selected/Math.max(1,c.available),meanPerMatch:c.selected/(n*2),effectSuccess:(c.blocked+c.reflected)/Math.max(1,c.selected),damagePerUse:c.damage/Math.max(1,c.selected),emptyRate:c.empty/Math.max(1,c.selected)}];}));
 const row={version,difficulty,matches:n*2,wins,roundMedian:quantile(turns,.5),roundP90:quantile(turns,.9),reach5Fighters:reached5,reach5Rate:reached5/(n*4),first5Median:quantile(first5,.5),bigWaveMatchRate:fightsWave3/(n*2),zeroBoth,zeroCharges,zeroChargeRate:zeroCharges/zeroBoth,skills,strata};experiments.push(row);console.log(version,difficulty,row.matches,'matches, big wave',skills.wave3.share.toFixed(4));
}
await fs.writeFile(output,JSON.stringify({version:CONFIG.version,method:'Real TypeScript AI; advanced 5hp/0 energy, 10 skills, independent RNG streams, mirrored streams per seed. Both sides same difficulty. No human timing misses in this experiment.',seeds:Array.from({length:n},(_,i)=>173+i*97),experiments},null,2));

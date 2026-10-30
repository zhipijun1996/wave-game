import test from 'node:test';import assert from 'node:assert/strict';
import cases from './rule-cases.json';
import {ALL,BASIC,CONFIG,initial,resolve,legal,type SkillId,type State} from '../src/rules';
import {BattleClock} from '../src/clock';import {chooseAI,random} from '../src/ai';
test('Python and TypeScript agree on every shared expected output',()=>{for(const c of cases)assert.deepEqual(resolve(c.state as State,c.actions as [SkillId|null,SkillId|null]),c.expected,c.name);});
test('explicit specification examples, cost and reflection only once',()=>{
 const s=initial();s.players.forEach(p=>p.energy=8);
 for(const [a,b,d,c] of [['wave2','wave1',[0,1],[3,1]],['wave3','wave1',[0,2],[5,1]],['wave3','wave2',[0,1],[5,3]],['wave2','reflect1',[0,2],[3,1]],['wave2','reflect2',[2,0],[3,2]],['wave3','guard3',[0,0],[5,2]]] as const){const r=resolve(s,[a,b]);assert.deepEqual(r.damage,d);assert.deepEqual(r.cost,c);}
});
test('charge gains and quick lock are independent of surviving a hit',()=>{
 const s=initial();s.players[0].energy=2;s.players[1].energy=5;
 for(const wave of ['wave1','wave2','wave3'] as SkillId[]){let r=resolve(s,['quick',wave]);assert.equal(r.gain[0],0);assert.equal(r.next.players[0].energy,2);assert.equal(r.next.players[0].blocked,true);assert.equal(resolve(r.next,[null,'charge']).actions[0],'idle');r=resolve(s,['charge',wave]);assert.equal(r.gain[0],1);}
 const z=initial();z.players[1].energy=1;const r=resolve(z,['quick','wave1']);assert.deepEqual(legal(r.next.players[0]),['guard1']);
});
test('cap and both quick sequences follow §4',()=>{
 let s=initial();s.players[0].energy=8;let r=resolve(s,['quick','charge']);assert.equal(r.gain[0],1);s.players[0].energy=9;assert.equal(resolve(s,['quick','charge']).actions[0],'idle');assert.equal(resolve(s,['charge','charge']).gain[0],0);
 s=initial();r=resolve(s,['charge','charge']);r=resolve(r.next,['quick','charge']);assert.equal(r.next.players[0].energy,3);assert.equal(r.next.players[0].blocked,true);
});
test('exchange symmetry, invariant bounds and damage difference uses damage rather than level',()=>{
 for(const a of ALL)for(const b of ALL){const s=initial();s.players.forEach(p=>p.energy=8);const x=resolve(s,[a,b]),y=resolve(s,[b,a]);assert.deepEqual(x.next.players,[...y.next.players].reverse());assert.deepEqual(x.damage,[...y.damage].reverse());}
 const original=CONFIG.skills.find(s=>s.id==='wave2')!.damage;CONFIG.skills.find(s=>s.id==='wave2')!.damage=1;const s=initial();s.players.forEach(p=>p.energy=8);assert.deepEqual(resolve(s,['wave1','wave2']).damage,[0,0]);CONFIG.skills.find(s=>s.id==='wave2')!.damage=original;
});
test('60-round free defense is an intentional draw',()=>{let s=initial(3,BASIC);for(let i=1;i<=60;i++){const r=resolve(s,['guard1','guard1']);assert.equal(r.winner,i===60?'draw':null);s=r.next;}});
test('AI is sealed before input, same public state/seed regardless of player selection',()=>{
 const s=initial();s.players.forEach(p=>p.energy=5);const choices=ALL.map(a=>{const c=new BattleClock(s,st=>chooseAI(st,1,random(91),'hard'));c.advance(1500);c.select(a);return c.sealed;});assert.equal(new Set(choices).size,1);
});
test('three tempos keep a stable four-beat round; queued inputs fire on beat three',()=>{
 for(const scale of [.7,1,1.5]){const c=new BattleClock(initial(3,BASIC),()=> 'guard1',scale);for(let i=0;i<20;i++){c.advance(1500*scale);assert.equal(c.select('guard1'),true);c.advance(2100*scale);}assert.equal(c.state.round,21);assert.equal(c.time,72000*scale);assert.equal(c.log.filter(e=>e.type==='commit').length,20);for(const e of c.log.filter(e=>e.type==='reveal'))assert.equal(e.local,1800);}
});
test('third-beat and late clicks reveal immediately; early clicks wait for beat three',()=>{
 for(const scale of [.7,1,1.5]){for(const at of [1350,1800,2100,2249]){const c=new BattleClock(initial(),()=> 'charge',scale);assert.equal(c.select('charge'),false);c.advance(at*scale);assert.equal(c.select('charge'),true);if(at<1800){assert.equal(c.result,null);c.advance((1800-at)*scale);}assert.ok(c.result);assert.equal(c.revealAt,Math.max(1800,at));assert.equal(c.select('guard1'),false);c.advance(450*scale);assert.equal(c.state.players[0].energy,1);}}
 const c=new BattleClock(initial(),()=> 'charge');c.advance(1349);assert.equal(c.select('charge'),false);c.advance(901);assert.equal(c.select('charge'),false);assert.equal(c.result!.actions[0],'idle');c.advance(450);assert.equal(c.state.players[0].energy,0);
});
test('pause before reveal preserves queued input and AI; after reveal commits only once',()=>{
 const c=new BattleClock(initial(),()=> 'charge');c.advance(1500);c.select('quick');const sealed=c.sealed;c.pause();c.advance(9000);assert.equal(c.time,1500);c.resume();assert.equal(c.local,0);assert.equal(c.selected,'quick');assert.equal(c.sealed,sealed);c.advance(2300);assert.equal(c.state.players[0].energy,2);c.pause();c.resume();c.advance(1300);assert.equal(c.state.players[0].energy,2);assert.equal(c.log.filter(e=>e.type==='commit').length,1);
});
test('late result survives pause and tempo changes apply on next whole round',()=>{
 let calls=0;const c=new BattleClock(initial(),()=>{calls++;return 'charge';});c.advance(2000);c.select('quick');const result=c.result;c.pause();c.nextScale=1.5;c.resume();assert.equal(c.result,result);assert.equal(c.committed,false);c.advance(1600);assert.equal(c.state.players[0].energy,2);assert.equal(c.scale,1.5);assert.equal(calls,2);assert.equal(c.log.filter(e=>e.type==='commit').length,1);
});
test('miss has neither protection nor charge and old quick lock expires',()=>{
 const s=initial();s.players[0].energy=2;s.players[0].blocked=true;s.players[1].energy=5;const r=resolve(s,[null,'wave3']);assert.deepEqual(r.damage,[3,0]);assert.equal(r.next.players[0].energy,2);assert.equal(r.next.players[0].blocked,false);assert.equal(r.gain[0],0);assert.equal(r.cost[0],0);
});
test('both zero energy AI charges when legal; paid defenses respect public threats',()=>{
 const chosen=new Set<string>();for(let seed=0;seed<200;seed++){const s=initial();for(const d of ['easy','normal','hard']){const id=chooseAI(s,1,random(seed),d);assert.ok(['charge','quick'].includes(id));chosen.add(id);}s.players[1].blocked=true;assert.equal(chooseAI(s,1,random(seed)),'guard1');}
 for(let seed=0;seed<100;seed++){const s=initial();s.players[1].energy=8;for(const d of ['normal','hard']){const id=chooseAI(s,1,random(seed),d);assert.ok(!(['guard','reflect'].includes(CONFIG.skills.find(x=>x.id===id)!.kind)&&CONFIG.skills.find(x=>x.id===id)!.cost>0));}s.players[0].energy=1;assert.ok(!['guard2','guard3','reflect2'].includes(chooseAI(s,1,random(seed),'normal')));}
 assert.deepEqual([...chosen].sort(),['charge','quick']);assert.equal(chooseAI(initial(3,BASIC),1,random(1)),'charge');
});

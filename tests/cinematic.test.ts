import test from 'node:test';import assert from 'node:assert/strict';
import {BattleClock,TIMING} from '../src/clock';import {initial,resolve,BASIC,type SkillId} from '../src/rules';
const powered=()=>{const s=initial(9);s.players.forEach(p=>p.energy=8);return s;};
test('both clap intervals accept changes, exact third beat locks and default is charge/guard',()=>{
 const c=new BattleClock(initial(),()=> 'charge');assert.equal(c.select('guard1'),true);c.advance(900);assert.equal(c.select('charge'),true);c.advance(899.999);assert.equal(c.result,null);c.advance(.001);assert.equal(c.result!.actions[0],'charge');assert.equal(c.select('guard1'),false);assert.equal(c.revealAt,1800);
 const s=powered();s.players[0].blocked=true;const d=new BattleClock(s,()=> 'wave1');d.advance(1800);assert.equal(d.result!.actions[0],'guard1');d.advance(1200);assert.equal(d.state.players[0].hp,9);assert.equal(d.state.players[0].energy,8);assert.equal(d.state.players[0].blocked,false);
 const r=resolve(initial(),[null,null]);assert.deepEqual(r.actions,['charge','charge']);assert.deepEqual(r.gain,[1,1]);
});
test('three tempos: cut-in real time is independent and battle clock/HP/energy freeze',()=>{
 for(const scale of [.7,1,1.5])for(const id of ['wave2','wave3'] as SkillId[]){const c=new BattleClock(powered(),()=> 'guard3',scale);c.select(id);c.advance(1800*scale);assert.equal(c.phase,'cutin');const local=c.local;const state=structuredClone(c.state);c.advance(c.cutinDuration-1);assert.equal(c.phase,'cutin');assert.equal(c.local,local);assert.deepEqual(c.state,state);assert.equal(c.committed,false);c.advance(1);assert.equal(c.phase,'action');assert.equal(c.phaseTime,0);c.advance(1200*scale);assert.equal(c.committed,true);assert.equal(c.state.players[0].energy,8-(id==='wave2'?3:5));assert.equal(c.log.filter(e=>e.type==='commit').length,1);}
});
test('simultaneous two cut-ins share one max-duration stage, then launch together and commit once',()=>{
 const c=new BattleClock(powered(),()=> 'wave3');c.select('wave2');c.advance(1800);assert.equal(c.cutinDuration,2600);assert.deepEqual(c.result!.actions,['wave2','wave3']);c.advance(2600);assert.equal(c.log.filter(e=>e.type==='launch').length,1);assert.equal(c.state.players[0].hp,9);c.advance(1200);assert.deepEqual(c.result!.damage,[1,0]);assert.deepEqual(c.state.players.map(p=>p.energy),[5,3]);assert.equal(c.state.players[0].hp,8);c.advance(900);assert.equal(c.startState.round,2);assert.equal(c.time,6500);assert.equal(c.history.length,1);
});
test('pause during selected prelock, cut-in, flight, recovery and victory preserves state/phase/AI',()=>{
 let choices=0;const c=new BattleClock(powered(),()=>{choices++;return 'wave3';});c.select('wave2');c.advance(1000);c.pause();c.advance(8000);assert.equal(c.time,1000);c.resume();assert.equal(c.local,0);assert.equal(c.selected,'wave2');assert.equal(choices,1);c.advance(1800);c.advance(1100);
 for(const dt of [0,1700,1050]){c.advance(dt);const before={phase:c.phase,phaseTime:c.phaseTime,state:structuredClone(c.state),result:c.result};c.pause();c.advance(12000);c.resume();assert.equal(c.phase,before.phase);assert.equal(c.phaseTime,before.phaseTime);assert.deepEqual(c.state,before.state);assert.equal(c.result,before.result);assert.equal(choices,1);}
 assert.equal(c.log.filter(e=>e.type==='commit').length,1);
 const s=powered();s.players[1].hp=1;const w=new BattleClock(s,()=> 'charge');w.select('wave2');w.advance(6100);assert.equal(w.phase,'victory');w.advance(700);w.pause();w.advance(9000);assert.equal(w.phaseTime,700);w.resume();w.advance(2099);assert.equal(w.finished,false);w.advance(1);assert.equal(w.finished,true);assert.equal(w.log.filter(e=>e.type==='finish').length,1);assert.equal(w.history.length,1);
});
test('20 rounds each tempo: two claps/third lock, no cinematic drift, exactly one commit',()=>{
 for(const scale of [.7,1,1.5]){const c=new BattleClock(initial(3,BASIC),()=> 'guard1',scale);for(let n=0;n<20;n++){c.select('guard1');c.advance(3900*scale);}assert.equal(c.startState.round,21);assert.ok(Math.abs(c.time-78000*scale)<1e-6);for(let n=1;n<=20;n++){const es=c.log.filter(e=>e.round===n);assert.deepEqual(es.filter(e=>['start','clap','third-beat','commit'].includes(e.type)).map(e=>e.local),[0,900,1800,3000]);assert.equal(es.filter(e=>e.type==='commit').length,1);}}
});
test('quick hit keeps preexisting energy; next-round default guard; ordinary charge still gains through damage',()=>{
 const s=powered();s.players[0].energy=2;let r=resolve(s,['quick','wave1']);assert.equal(r.next.players[0].energy,2);assert.equal(r.next.players[0].blocked,true);assert.equal(resolve(r.next,[null,'wave1']).actions[0],'guard1');r=resolve(s,['charge','wave1']);assert.equal(r.next.players[0].energy,3);assert.equal(r.next.players[0].hp,8);
});
test('tempo changed in cut-in applies only to next full round and is not used to scale the cinematic',()=>{
 const c=new BattleClock(powered(),()=> 'guard3');c.select('wave2');c.advance(2300);c.nextScale=.7;c.pause();c.resume();c.advance(1700);assert.equal(c.phase,'action');assert.equal(c.scale,1);c.advance(2100);assert.equal(c.scale,.7);assert.equal(c.phase,'select');assert.equal(c.local,0);
});

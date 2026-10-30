import test from 'node:test';import assert from 'node:assert/strict';
import {BattleClock,TIMING} from '../src/clock';import {initial,resolve,BASIC,type SkillId} from '../src/rules';
const powered=()=>{const s=initial(9);s.players.forEach(p=>p.energy=8);return s;};
function selectAfterClaps(c:BattleClock,id:SkillId){c.advance(TIMING.windowOpen*c.scale);assert.equal(c.select(id),true);}
function lock(c:BattleClock){c.advance((TIMING.windowClose-c.phaseTime)*c.scale);}
test('claps reject early input, third-beat window accepts changes, deadline locks/defaults',()=>{
 for(const scale of [.7,1,1.5]){
  const c=new BattleClock(initial(),()=> 'charge',scale);
  assert.equal(c.inputOpen,false);assert.equal(c.select('guard1'),false);assert.equal(c.selected,null);
  c.advance(900*scale);assert.equal(c.select('charge'),false);c.advance(449.999*scale);assert.equal(c.inputOpen,false);
  c.advance(.001*scale);assert.equal(c.inputOpen,true);assert.equal(c.select('guard1'),true);
  c.advance(450*scale);assert.equal(c.local,1800);assert.equal(c.result,null);assert.equal(c.third,true);assert.equal(c.select('charge'),true);
  c.advance(449.999*scale);assert.equal(c.select('guard1'),true);assert.equal(c.result,null);c.advance(.001*scale);
  assert.equal(c.result!.actions[0],'guard1');assert.equal(c.select('charge'),false);assert.equal(c.selected,'guard1');assert.equal(c.revealAt,2250);
  assert.equal(c.log.filter(e=>e.type==='third-beat').length,1);assert.equal(c.log.filter(e=>e.type==='reveal').length,1);
 }
 const s=powered();s.players[0].blocked=true;const d=new BattleClock(s,()=> 'wave1');d.advance(TIMING.windowClose);assert.equal(d.result!.actions[0],'guard1');d.advance(TIMING.flight);assert.equal(d.state.players[0].hp,9);assert.equal(d.state.players[0].energy,8);assert.equal(d.state.players[0].blocked,false);
 assert.deepEqual(resolve(initial(),[null,null]).gain,[1,1]);
});
test('three tempos: cut-in real time is independent and battlefield/HP/energy freeze',()=>{
 for(const scale of [.7,1,1.5])for(const id of ['wave2','wave3'] as SkillId[]){const c=new BattleClock(powered(),()=> 'guard3',scale);selectAfterClaps(c,id);lock(c);assert.equal(c.phase,'cutin');const local=c.local,state=structuredClone(c.state);c.advance(c.cutinDuration-1);assert.equal(c.phase,'cutin');assert.equal(c.local,local);assert.deepEqual(c.state,state);assert.equal(c.committed,false);c.advance(1);assert.equal(c.phase,'action');assert.equal(c.phaseTime,0);c.advance(TIMING.flight*scale);assert.equal(c.committed,true);assert.equal(c.state.players[0].energy,8-(id==='wave2'?3:5));assert.equal(c.log.filter(e=>e.type==='commit').length,1);}
});
test('simultaneous cut-ins share one stage, launch together and commit once after the late window',()=>{
 const c=new BattleClock(powered(),()=> 'wave3');selectAfterClaps(c,'wave2');lock(c);assert.equal(c.cutinDuration,2600);assert.deepEqual(c.result!.actions,['wave2','wave3']);c.advance(2600);assert.equal(c.log.filter(e=>e.type==='launch').length,1);assert.equal(c.state.players[0].hp,9);c.advance(1200);assert.deepEqual(c.result!.damage,[1,0]);assert.deepEqual(c.state.players.map(p=>p.energy),[5,3]);assert.equal(c.state.players[0].hp,8);c.advance(900);assert.equal(c.startState.round,2);assert.equal(c.time,TIMING.roundEnd+2600);assert.equal(c.history.length,1);
});
test('pause restarts prelock claps without accepting early clicks or resampling AI; locked phases resume exactly',()=>{
 let choices=0;const c=new BattleClock(powered(),()=>{choices++;return 'wave3';});selectAfterClaps(c,'wave2');c.advance(200);const beforeTime=c.time;c.pause();c.advance(8000);assert.equal(c.time,beforeTime);c.resume();assert.equal(c.local,0);assert.equal(c.inputOpen,false);assert.equal(c.select('guard1'),false);assert.equal(c.selected,'wave2');assert.equal(choices,1);lock(c);c.advance(1100);
 for(const dt of [0,1700,1050]){c.advance(dt);const before={phase:c.phase,phaseTime:c.phaseTime,state:structuredClone(c.state),result:c.result};c.pause();c.advance(12000);c.resume();assert.equal(c.phase,before.phase);assert.equal(c.phaseTime,before.phaseTime);assert.deepEqual(c.state,before.state);assert.equal(c.result,before.result);assert.equal(choices,1);}
 assert.equal(c.log.filter(e=>e.type==='commit').length,1);
 const s=powered();s.players[1].hp=1;const w=new BattleClock(s,()=> 'charge');selectAfterClaps(w,'wave2');w.advance(TIMING.roundEnd+2200-TIMING.windowOpen);assert.equal(w.phase,'victory');w.advance(700);w.pause();w.advance(9000);assert.equal(w.phaseTime,700);w.resume();w.advance(2099);assert.equal(w.finished,false);w.advance(1);assert.equal(w.finished,true);assert.equal(w.log.filter(e=>e.type==='finish').length,1);assert.equal(w.history.length,1);
});
test('20 rounds each tempo: exactly two claps, post-clap input, third cue, single reveal/commit, no drift',()=>{
 for(const scale of [.7,1,1.5]){const c=new BattleClock(initial(3,BASIC),()=> 'guard1',scale);for(let n=0;n<20;n++){selectAfterClaps(c,'guard1');c.advance((TIMING.roundEnd-TIMING.windowOpen)*scale);}assert.equal(c.startState.round,21);assert.ok(Math.abs(c.time-TIMING.roundEnd*20*scale)<1e-6);for(let n=1;n<=20;n++){const es=c.log.filter(e=>e.round===n);assert.deepEqual(es.filter(e=>['start','clap','window-open','third-beat','reveal','commit'].includes(e.type)).map(e=>e.local),[0,900,1350,1800,2250,3450]);assert.equal(es.filter(e=>e.type==='commit').length,1);assert.ok(es.filter(e=>e.type==='select').every(e=>e.local>=1350&&e.local<2250));}}
});
test('quick hit retains existing energy; next-round default guard; ordinary charge still gains when hit',()=>{
 const s=powered();s.players[0].energy=2;let r=resolve(s,['quick','wave1']);assert.equal(r.next.players[0].energy,2);assert.equal(r.next.players[0].blocked,true);assert.equal(resolve(r.next,[null,'wave1']).actions[0],'guard1');r=resolve(s,['charge','wave1']);assert.equal(r.next.players[0].energy,3);assert.equal(r.next.players[0].hp,8);
});
test('tempo edits apply to next full round; cut-ins stay on their own time axis',()=>{
 const c=new BattleClock(powered(),()=> 'guard3');selectAfterClaps(c,'wave2');lock(c);c.advance(500);c.nextScale=.7;c.pause();c.resume();c.advance(1700);assert.equal(c.phase,'action');assert.equal(c.scale,1);c.advance(2100);assert.equal(c.scale,.7);assert.equal(c.phase,'select');assert.equal(c.local,0);assert.equal(c.inputOpen,false);
});

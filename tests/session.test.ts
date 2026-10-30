import test from 'node:test';import assert from 'node:assert/strict';
import {StreakRun,advancedUnlocked} from '../src/session';
import {fresh,load,persist,clearSave} from '../src/storage';
class MemoryStorage{items=new Map<string,string>();getItem(k:string){return this.items.get(k)??null;}setItem(k:string,v:string){this.items.set(k,v);}removeItem(k:string){this.items.delete(k);}}
const memory=new MemoryStorage();Object.defineProperty(globalThis,'localStorage',{value:memory,configurable:true});
test('advanced mode unlocks only after all eight story stages',()=>{for(let i=0;i<8;i++)assert.equal(advancedUnlocked(i),false);assert.equal(advancedUnlocked(8),true);});
test('streak counts each finished match once and ends on defeat or draw',()=>{
 for(const end of [1,'draw'] as const){const r=new StreakRun();r.begin('basic',true);r.nextMatch();assert.equal(r.settle(0),true);assert.equal(r.wins,1);assert.equal(r.settle(0),false);assert.equal(r.wins,1);r.nextMatch();r.settle(0);assert.equal(r.wins,2);r.nextMatch();r.settle(end);assert.equal(r.running,false);assert.equal(r.wins,2);assert.equal(r.settle(0),false);r.begin('advanced',true);r.nextMatch();r.settle(0);assert.equal(r.wins,1);r.reset();assert.equal(r.enabled,false);assert.equal(r.wins,0);}
});
test('single matches never accumulate streak wins',()=>{const r=new StreakRun();r.begin('basic',false);r.nextMatch();assert.equal(r.settle(0),false);assert.equal(r.wins,0);});
test('v1 saves migrate without losing story, skins or tempo',()=>{
 const old={...fresh(),version:1,completed:8,skin:'cape',tutorial:true};delete (old as any).bestStreaks;old.settings.speed=.7;memory.setItem('paipai-wave.v1',JSON.stringify(old));const {save,warning}=load();assert.equal(warning,'');assert.equal(save.version,2);assert.equal(save.completed,8);assert.equal(save.skin,'cape');assert.equal(save.settings.speed,.7);assert.equal(save.tutorial,true);assert.deepEqual(save.bestStreaks,{basic:0,advanced:0});
});
test('best records persist independently; reset clears records and unlock',()=>{
 const s=fresh();s.completed=8;s.bestStreaks={basic:4,advanced:7};assert.equal(persist(s),true);assert.deepEqual(load().save.bestStreaks,{basic:4,advanced:7});clearSave();assert.deepEqual(load().save.bestStreaks,{basic:0,advanced:0});assert.equal(advancedUnlocked(load().save.completed),false);
});
test('invalid record values cannot become a high score',()=>{for(const value of [-1,1.2,'999',Number.MAX_SAFE_INTEGER+1]){const s=fresh();(s.bestStreaks.basic as any)=value;memory.setItem('paipai-wave.v1',JSON.stringify(s));assert.ok(load().warning);assert.equal(load().save.bestStreaks.basic,0);}});

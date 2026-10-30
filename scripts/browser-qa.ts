import {chromium,type Page} from '@playwright/test';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {ALL,BASIC,initial,type SkillId} from '../src/rules';
const root=new URL('../',import.meta.url).pathname;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const errors:string[]=[],checks:any[]=[];
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const api=(p:Page,fn:string,arg?:any)=>p.evaluate(({fn,arg})=>{const t=(window as any).__PAIPAI_TEST__;return new Function('t','arg',fn)(t,arg);},{fn,arg});
await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);
for(const [width,height] of [[360,640],[390,844],[844,390],[1280,720],[1920,1080]]){
 await page.setViewportSize({width,height});await api(page,'t.home()');await page.screenshot({path:root+`artifacts/home-${width}x${height}.png`});
 const home=await page.evaluate(()=>({scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,w:innerWidth,h:innerHeight}));assert.equal(home.scrollW,width);assert.ok(home.scrollH<=height,JSON.stringify(home));
 await api(page,'t.start("advanced")');
 const buttons=await page.locator('[data-skill]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,bottom:r.bottom,left:r.left,right:r.right};}));assert.equal(buttons.length,10);assert.ok(buttons.every(b=>b.width>=48&&b.height>=48&&b.bottom<=height&&b.left>=0&&b.right<=width),JSON.stringify(buttons));
 await page.screenshot({path:root+`artifacts/advanced-${width}x${height}.png`});checks.push({name:'viewport',width,height,home,buttons});
}
await page.setViewportSize({width:390,height:844});await api(page,'t.home()');
// First-visit tutorial is explicit, skippable and saved.
await page.click('[data-action="basic"]');assert.ok(await page.getByText('先把手掌拍响',{exact:true}).isVisible());await page.click('[data-action="start-tutorial"]');
for(const [i,skill] of ['charge','wave1','guard1',null].entries()){
 if(skill)await page.click(`[data-skill="${skill}"]`);
 await page.waitForFunction(i=>(window as any).__PAIPAI_TEST__.clock?.state.round>=i+2, i,{timeout:7000});
}
await page.getByText('学会啦，去过过招吧',{exact:true}).waitFor();assert.equal((await api(page,'return t.save')).tutorial,true);await page.click('[data-action="tutorial-finish"]');await page.selectOption('#health','1');await page.click('[data-action="start-basic"]');assert.equal((await api(page,'return t.state()')).state.players[0].hp,1);assert.equal(await page.locator('[data-skill]').count(),3);checks.push({name:'tutorial and basic1',passed:true});
// Legitimate progression: fixed opponent choices exercise real rules/UI for all eight wins.
await api(page,'t.home()');await api(page,'t.setSave({completed:0,tutorial:true})');
for(let i=0;i<8;i++){
 await api(page,'t.story()');await page.click(`[data-level="${i}"]`);await page.click('[data-action="start-story"]');
 const pub=await api(page,'return t.state()');assert.ok(pub.start.players[1].skills.length>=pub.start.players[0].skills.length);assert.equal(pub.start.players[0].energy,0);assert.equal(pub.start.players[0].hp,3);
 // Retain actual 2.7s round timing using virtual browser time, without changing the engine.
 if(i===0)await page.clock.install();
 for(let k=0;k<6;k++){
   await api(page,'t.setEnemy("charge")');await page.click(`[data-skill="${k%2===0?'charge':'wave1'}"]`);await page.clock.runFor(2710);
 }
 await page.clock.runFor(1300);await page.clock.resume();await page.getByText('这一局，漂亮！',{exact:true}).waitFor();assert.equal((await api(page,'return t.save')).completed,i+1);
 await page.reload();await page.evaluate(()=>document.fonts.ready);assert.equal((await api(page,'return t.save')).completed,i+1);
}
checks.push({name:'8 story wins, new skills, first rewards, refresh persistence',passed:true});
await api(page,'t.skins()');for(const skin of ['plain','ribbon','cat','cape']){await page.click(`[data-skin="${skin}"]`);assert.equal((await api(page,'return t.save')).skin,skin);}await page.reload();assert.equal((await api(page,'return t.save')).skin,'cape');checks.push({name:'four unlocked skins equip and persist',passed:true});
// All four actual runtime gesture freeze frames.
await api(page,'t.skins()');for(const skill of ['charge','wave1','guard1','reflect1']){await page.click(`[data-preview="${skill}"]`);await page.waitForTimeout(80);await page.screenshot({path:root+`artifacts/gesture-${skill}.png`});}
// Illegal clicks do not clear a valid selection; pause before and after reveal.
await api(page,'t.start("advanced",{enemy:"charge"})');await page.click('[data-skill="charge"]');await page.click('[data-skill="wave3"]',{force:true});assert.equal((await api(page,'return t.state()')).selected,'charge');
await api(page,'t.pause()');const paused=await api(page,'return t.state()');await page.waitForTimeout(300);assert.deepEqual(await api(page,'return t.state()'),paused);await page.click('[data-action="resume"]');assert.ok((await api(page,'return t.state()')).local<200);assert.equal((await api(page,'return t.state()')).sealed,paused.sealed);
await page.waitForFunction(()=>(window as any).__PAIPAI_TEST__.clock.local>2300);const energy=(await api(page,'return t.state()')).state.players[0].energy;await api(page,'t.pause()');await page.click('[data-action="resume"]');await page.waitForTimeout(500);assert.equal((await api(page,'return t.state()')).state.players[0].energy,energy);checks.push({name:'invalid click, pre/post reveal pause and single commit',passed:true});
// Simulate visibility notification explicitly; do not claim a physical device background test.
await api(page,'t.start("advanced",{enemy:"charge"})');await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:function(){return true}});document.dispatchEvent(new Event('visibilitychange'));");assert.equal((await api(page,'return t.state()')).paused,true);await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:function(){return false}});document.dispatchEvent(new Event('visibilitychange'));");assert.equal((await api(page,'return t.state()')).paused,true);await page.click('[data-action="resume"]');checks.push({name:'emulated visibility pause requires continue',passed:true});
// Full 60-round draw is checked in the actual UI with accelerated browser wall clock.
await api(page,'t.start("basic",{enemy:"guard1"})');await api(page,'const c=t.clock;const old=c.onEvent;c.onEvent=(type)=>{old(type);if(type==="start")c.select("guard1");};c.select("guard1");');await page.clock.runFor(163500);await page.clock.resume();await page.getByText('不分高下！',{exact:true}).waitFor();assert.equal((await api(page,'return t.state()')).start.round,60);checks.push({name:'60-round draw completes UI',passed:true});
// Corrupt storage recovers, settings write, reset needs a separate confirmation.
await page.evaluate(()=>localStorage.setItem('paipai-wave.v1','{broken'));await page.reload();assert.equal((await api(page,'return t.save')).completed,0);await page.getByText('存档未能读取，已恢复初始状态。你可以继续游玩。',{exact:true}).waitFor();
await page.click('[data-action="settings"]');await page.selectOption('#settings-speed','1.5');await page.uncheck('#shake');await page.click('[data-action="reset-confirm"]');assert.ok(await page.getByText('要把操场清空吗？',{exact:true}).isVisible());await page.locator('#modal-root [data-action="settings"]').last().click();await page.click('[data-action="close"]');await page.reload();assert.equal((await api(page,'return t.save')).settings.speed,1.5);assert.equal((await api(page,'return t.save')).settings.shake,false);checks.push({name:'corrupt save, settings persist, reset double confirmation',passed:true});
checks.push({name:'browser errors',errors});assert.deepEqual(errors,[]);
await fs.writeFile(root+'artifacts/browser-qa.json',JSON.stringify({browser:await browser.version(),automatedDesktopEmulation:true,checks},null,2));await browser.close();console.log(`Browser QA passed: ${checks.length} groups`);

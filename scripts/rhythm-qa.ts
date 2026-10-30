import {chromium,type Page} from '@playwright/test';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {initial,ALL} from '../src/rules';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const errors:string[]=[],checks:any[]=[];
const api=(p:Page,code:string,arg?:any)=>p.evaluate(({code,arg})=>new Function('t','arg',code)((window as any).__PAIPAI_TEST__,arg),{code,arg});
const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
try{
 await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);
 // Use controlled browser wall time for precise boundary clicks against the real app.
 await page.clock.install();
 for(const speed of [.7,1,1.5]){
  await api(page,'t.start("advanced",{speed:arg,enemy:"charge"})',speed);
  await page.click('[data-skill="charge"]',{force:true});assert.equal((await api(page,'return t.state()')).selected,null);
  let local=await api(page,'return t.clock.local');await page.clock.runFor(Math.max(0,(1000-local)*speed));
  assert.equal(await api(page,'return t.clock.inputOpen'),true);assert.ok(await page.locator('.controls.rhythm-open').isVisible());await page.click('[data-skill="charge"]',{force:true});assert.equal((await api(page,'return t.state()')).selected,'charge');
  local=await api(page,'return t.clock.local');await page.clock.runFor(Math.max(0,(1600-local)*speed));await page.click('[data-skill="guard1"]',{force:true});assert.equal((await api(page,'return t.state()')).selected,'charge');
  local=await api(page,'return t.clock.local');await page.clock.runFor(Math.max(0,(2300-local)*speed));assert.equal((await api(page,'return t.state()')).state.players[0].energy,1);
  await api(page,'t.start("advanced",{speed:arg,enemy:"charge"})',speed);await page.clock.runFor(2300*speed);const missed=await api(page,'return {r:t.clock.result,s:t.clock.state}');assert.equal(missed.r.actions[0],'idle');assert.equal(missed.s.players[0].energy,0);assert.equal(missed.s.players[0].hp,5);await page.screenshot({path:`artifacts/rhythm-miss-${speed}.png`});
  const st=initial(5,ALL);st.players[1].energy=5;await api(page,'t.start("advanced",{state:arg,speed:1,enemy:"wave3"})',st);await page.clock.runFor(2300);const hit=await api(page,'return t.clock.result');assert.equal(hit.actions[0],'idle');assert.deepEqual(hit.damage,[3,0]);assert.equal(hit.gain[0],0);checks.push({speed,windowMs:600*speed,earlyRejected:true,lateRejected:true,missedAction:missed.r.actions[0],missHitDamage:hit.damage});
 }
 // Tempo settings and backward-compatible local save.
 await api(page,'t.home()');await page.click('[data-action="settings"]');await page.selectOption('#settings-speed','0.7');await page.click('[data-action="close"]');await page.reload();assert.equal((await api(page,'return t.save')).settings.speed,.7);
 for(const [width,height] of [[360,640],[390,844],[844,390],[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});await api(page,'t.start("advanced",{speed:.7,enemy:"charge"})');await page.clock.runFor(700);assert.equal(await api(page,'return t.clock.inputOpen'),true);await page.screenshot({path:`artifacts/rhythm-open-${width}x${height}.png`});
  const rects=await page.locator('[data-skill]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,bottom:r.bottom,right:r.right};}));assert.ok(rects.every(r=>r.width>=48&&r.height>=48&&r.bottom<=height&&r.right<=width));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);checks.push({viewport:{width,height},skills:rects});
 }
 // UI tutorial now teaches deliberate misses rather than automatic charging.
 await api(page,'t.home()');await page.setViewportSize({width:390,height:844});await page.click('[data-action="basic"]');await page.click('[data-action="start-tutorial"]');
 for(const skill of ['charge','wave1','guard1',null]){if(skill){const local=await api(page,'return t.clock.local');await page.clock.runFor(Math.max(0,(1050-local)*(await api(page,'return t.clock.scale'))));await page.click(`[data-skill="${skill}"]`,{force:true});}const local=await api(page,'return t.clock.local');await page.clock.runFor(Math.max(0,(2800-local)*(await api(page,'return t.clock.scale'))));}
 await page.getByText('学会啦，去过过招吧',{exact:true}).waitFor();checks.push({tutorial:'four steps including missed-beat idle'});
 assert.deepEqual(errors,[]);await fs.writeFile('artifacts/rhythm-qa.json',JSON.stringify({browser:await browser.version(),version:'1.1.0',desktopEmulation:true,checks,errors},null,2));console.log('rhythm UI checks passed',checks.length);
}finally{await browser.close();}

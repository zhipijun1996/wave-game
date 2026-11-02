import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();const checks:any[]=[],errors:string[]=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
await page.addInitScript('window.__name=(f)=>f');
await page.goto(process.env.GAME_URL||'http://localhost:4173');await page.evaluate(()=>document.fonts.ready);
await page.clock.install();
await page.evaluate(()=>(window as any).__PAIPAI_TEST__.setSave({completed:8,tutorial:true}));
for(const [w,h] of [[568,320],[667,375],[844,390],[932,430],[1024,600],[1280,720],[1920,1080],[390,844]]){
 await page.setViewportSize({width:w,height:h});
 for(const mode of ['basic','advanced','story']){
  await page.evaluate(mode=>(window as any).__PAIPAI_TEST__.start(mode),mode);
  await page.clock.runFor(100);
  const box=await page.evaluate(()=>{
   const rect=(e:Element)=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};
   return {stage:rect(document.querySelector('.stage-wrap')!),controls:rect(document.querySelector('.controls')!),skills:[...document.querySelectorAll('[data-skill]')].map(rect),scrollWidth:document.documentElement.scrollWidth,canvas:rect(document.querySelector('canvas')!)};
  });
  assert.equal(box.scrollWidth,w);
  const unit=Math.min(box.canvas.width/(box.canvas.width/box.canvas.height<2.1?640:1000),box.canvas.height/320);
  assert.ok(box.canvas.height/unit-40-0.93*(100+0.84*215)>=0,'tallest EVA horn must fit');
  assert.ok(box.controls.y>=box.stage.bottom-1,JSON.stringify({w,h,mode,box}));
  assert.ok(box.skills.every(r=>r.width>=48&&r.height>=48&&r.bottom<=h&&r.x>=0&&r.right<=w),JSON.stringify({w,h,mode,box}));
  if(w>h)assert.equal(new Set(box.skills.map(r=>Math.round(r.y))).size,1);
  else if(mode!=='basic')assert.equal(new Set(box.skills.map(r=>Math.round(r.y))).size,2);
  // Opening the gate and selecting must not shift the row or change the sealed AI.
  const sealed=await page.evaluate(()=>(window as any).__PAIPAI_TEST__.clock.sealed);
  await page.evaluate(()=>{const t=(window as any).__PAIPAI_TEST__;t.clock.advance(1350-t.clock.local);t.clock.select('charge')});
  await page.clock.runFor(20);
  assert.equal(await page.evaluate(()=>(window as any).__PAIPAI_TEST__.clock.sealed),sealed);
  const active=await page.locator('.controls').boundingBox();assert.ok(active&&Math.abs(active.y-box.controls.y)<1);
  if(mode==='advanced')await page.screenshot({path:`artifacts/landscape-v2.1.1-${w}x${h}.png`});
  checks.push({w,h,mode,box});
 }
}
// Rotate an in-progress selection without losing it or changing the precommitted AI.
await page.evaluate(()=>{const t=(window as any).__PAIPAI_TEST__;t.start('advanced');t.clock.advance(1350);t.clock.select('charge')});
const before=await page.evaluate(()=>{const t=(window as any).__PAIPAI_TEST__;return {selected:t.clock.selected,sealed:t.clock.sealed,round:t.clock.state.round}});
await page.setViewportSize({width:844,height:390});await page.clock.runFor(20);
assert.deepEqual(await page.evaluate(()=>{const t=(window as any).__PAIPAI_TEST__;return {selected:t.clock.selected,sealed:t.clock.sealed,round:t.clock.state.round}}),before);
assert.deepEqual(errors,[]);
await fs.writeFile('artifacts/landscape-qa-v2.1.1.json',JSON.stringify({version:'2.1.1',checkedAt:new Date().toISOString(),browser:await browser.version(),desktopEmulation:true,checks,rotation:true,errors},null,2));
await browser.close();console.log(`${checks.length} landscape/portrait layout cases and active rotation passed`);

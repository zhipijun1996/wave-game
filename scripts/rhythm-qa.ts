import {chromium,type Page} from '@playwright/test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {initial,ALL} from '../src/rules';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});const p=await context.newPage();const checks:unknown[]=[],errors:string[]=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
const api=(code:string,arg?:unknown)=>p.evaluate(({code,arg})=>new Function('t','arg',code)((window as any).__PAIPAI_TEST__,arg),{code,arg});
try{
 await p.goto('http://localhost:4173');await p.clock.install({time:new Date('2030-01-01T00:00:00Z')});await p.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));await api('t.setSave({completed:8,tutorial:true})');
 for(const speed of [.7,1,1.5]){
  const s=initial(5,ALL);s.players.forEach(x=>x.energy=8);await api('t.start("advanced",{state:arg.s,enemy:"guard1",speed:arg.speed})',{s,speed});
  await p.tap('[data-skill="wave2"]',{force:true});assert.equal(await api('return t.clock.selected'),null);assert.equal(await p.locator('[data-skill="wave2"]').getAttribute('aria-disabled'),'true');
  await api('t.clock.advance(900*arg)',speed);await p.keyboard.press(String((ALL.indexOf('wave2')+1)%10));assert.equal(await api('return t.clock.selected'),null);
  await api('t.clock.advance(449.999*arg)',speed);await p.click('[data-skill="wave2"]',{force:true});assert.equal(await api('return t.clock.selected'),null);
  await api('t.clock.advance(.001*arg)',speed);assert.equal(await api('return t.clock.inputOpen'),true);assert.equal(await p.locator('.controls.rhythm-open').count(),1);assert.equal(await p.locator('[data-skill="wave2"]').getAttribute('aria-disabled'),'false');
  await p.tap('[data-skill="wave2"]',{force:true});assert.equal(await api('return t.clock.selected'),'wave2');
  await api('t.clock.advance(450*arg)',speed);await p.click('[data-skill="guard2"]');assert.equal(await api('return t.clock.result'),null);assert.equal(await api('return t.clock.selected'),'guard2');assert.equal(await api('return t.clock.sealed'),'guard1');
  await api('t.clock.advance(449.999*arg)',speed);await p.keyboard.press(String((ALL.indexOf('wave2')+1)%10));assert.equal(await api('return t.clock.selected'),'wave2');
  await api('t.clock.advance(.001*arg)',speed);assert.deepEqual(await api('return t.clock.result.actions'),['wave2','guard1']);assert.equal(await api('return t.clock.phase'),'cutin');await p.tap('[data-skill="guard1"]',{force:true});assert.equal(await api('return t.clock.selected'),'wave2');
  const log=await api('return t.clock.log');checks.push({speed,passed:true,name:'early mouse/touch/keyboard rejected; opening/third/late/deadline correct; AI hidden until deadline',log});
 }
 for(const mode of ['basic','advanced','story','tutorial']){await api('t.start(arg,{speed:1,enemy:"charge"})',mode);assert.equal(await api('return t.clock.inputOpen'),false);await p.click('[data-skill="charge"]',{force:true});assert.equal(await api('return t.clock.selected'),null);await api('t.clock.advance(1350)');await p.click('[data-skill="charge"]');assert.equal(await api('return t.clock.selected'),'charge');checks.push({name:'mode uses same post-clap input gate',mode,passed:true});}
 for(const [w,h]of [[360,640],[390,844],[844,390],[1280,720],[1920,1080]]){await p.setViewportSize({width:w,height:h});await api('t.start("advanced",{speed:1});t.clock.advance(1350)');await p.clock.runFor(17);const rects=await p.locator('[data-skill]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height,b:r.bottom,l:r.left,r:r.right}}));assert.ok(rects.every(x=>x.w>=48&&x.h>=48&&x.b<=h&&x.l>=0&&x.r<=w));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),w);await p.screenshot({path:`artifacts/post-clap-open-${w}x${h}.png`});checks.push({name:'open window readable and controls fit',viewport:[w,h],passed:true});}
 assert.deepEqual(errors,[]);await fs.writeFile('artifacts/rhythm-qa.json',JSON.stringify({version:'2.1.0',checks,errors,browser:await browser.version(),desktopTouchEmulation:true},null,2));console.log(checks.length+' post-clap UI checks passed');
}finally{await browser.close();}

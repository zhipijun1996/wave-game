import{chromium,type Page}from'@playwright/test';import fs from'node:fs/promises';import assert from'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const run=process.argv[2]||'all';
const api=(p:Page,fn:string,arg?:any)=>p.evaluate(({fn,arg})=>new Function('t','arg',fn)((window as any).__PAIPAI_TEST__,arg),{fn,arg});
const sequence:[string|null,string][]=[['charge','charge'],['wave1','wave1'],[null,'quick'],['quick','guard1'],['guard1','charge'],['guard1','wave2'],['quick','charge'],['wave3','wave1'],['charge','charge'],['reflect1','wave1'],[null,'charge'],['charge','guard1'],['guard1','charge'],['charge','guard1'],['wave1','guard1'],[null,'charge'],['quick','charge'],[null,'guard1'],['guard1','charge'],['charge','guard1']];
async function timing(speed:number){
 const name=speed===1?'standard':'slow';const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:root+'artifacts/raw',size:{width:390,height:844}}});const page=await context.newPage();
 await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);await page.click('[data-action="settings"]');await page.click('[data-action="close"]');await api(page,'t.start("advanced",{enemy:"charge",speed:arg})',speed);
 for(let i=0;i<20;i++){
  await page.waitForFunction(n=>(window as any).__PAIPAI_TEST__.clock.startState.round===n,i+1);
  await api(page,'t.setEnemy(arg)',sequence[i][1]);
  if(sequence[i][0])await page.click(`[data-skill="${sequence[i][0]}"]`);
  if(i===11){await page.click('[data-skill="guard1"]');await page.click('[data-skill="charge"]');}
  await page.waitForFunction(n=>(window as any).__PAIPAI_TEST__.clock.state.round===n,i+2,{timeout:8000});
 }
 await page.waitForFunction(()=>(window as any).__PAIPAI_TEST__.clock.startState.round===21,null,{timeout:6000});await api(page,'t.pause()');
 const data=await api(page,'return {log:t.clock.log,history:t.clock.history,frames:t.frameTimes,state:t.clock.state,seed:t.seed}');
 const logs=data.log.filter((e:any)=>e.round<=20&&['start','clap','reveal','commit'].includes(e.type));
 for(let round=1;round<=20;round++){const ls=logs.filter((e:any)=>e.round===round);assert.deepEqual(ls.map((e:any)=>e.local),[0,900,1800,2250]);assert.equal(ls[0].at,(round-1)*2700*speed);}
 assert.equal(data.history.length,20);assert.ok(data.history.some((h:any)=>h.actions[0]==='reflect1'));
 await fs.writeFile(root+`artifacts/timing-${name}.json`,JSON.stringify({browser:await browser.version(),viewport:{width:390,height:844},speed,automatedDesktopEmulation:true,...data},null,2));
 const video=page.video()!;await context.close();await video.saveAs(root+`artifacts/timing-${name}.webm`);console.log('timing complete',name);
}
async function showcase(){
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:root+'artifacts/raw',size:{width:1280,height:720}}});const page=await context.newPage();await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);
 await api(page,'t.setSave({completed:7,tutorial:true,skin:"ribbon"})');await page.click('[data-action="settings"]');await page.click('[data-action="close"]');
 await page.evaluate(`(async()=>{const a=window.__PAIPAI_TEST__.audio;await a.unlock();const dest=a.ctx.createMediaStreamDestination();a.output.connect(dest);window._captureChunks=[];window._captureRecorder=new MediaRecorder(dest.stream,{mimeType:'audio/webm;codecs=opus'});window._captureRecorder.ondataavailable=e=>window._captureChunks.push(e.data);window._captureRecorder.start();window._captureAudioAt=performance.now();})()`);
 await page.waitForTimeout(800);await page.click('[data-action="story"]');await page.click('[data-level="7"]');await page.waitForTimeout(1000);await page.click('[data-action="start-story"]');
 const checks=[];
 for(let i=0;i<10;i++){
  await page.waitForFunction(n=>(window as any).__PAIPAI_TEST__.clock.startState.round===n,i+1);
  await api(page,'t.setEnemy(arg)',sequence[i][1]);if(sequence[i][0])await page.click(`[data-skill="${sequence[i][0]}"]`);
  await page.waitForFunction(n=>(window as any).__PAIPAI_TEST__.clock.state.round===n,i+2,{timeout:6000});
  const c=await api(page,'return {actions:t.clock.result.actions,damage:t.clock.result.damage,events:t.clock.result.events,energy:t.clock.state.players.map(p=>p.energy),log:t.clock.log}');checks.push(c);
  if([1,5,7,9].includes(i))await page.screenshot({path:root+`artifacts/showcase-round-${i+1}.png`});
 }
 await page.getByText('这一局，漂亮！',{exact:true}).waitFor();await page.waitForTimeout(1300);await page.screenshot({path:root+'artifacts/graduation-unlock.png'});
 // A separate 1-heart basic match demonstrates the real defeat and retry feedback.
 await api(page,'t.start("basic",{enemy:"charge",health:1})');await page.click('[data-skill="charge"]');
 await page.waitForFunction(()=>(window as any).__PAIPAI_TEST__.clock.startState.round===2);await api(page,'t.setEnemy("wave1")');await page.click('[data-skill="charge"]');
 await page.getByText('差一点，再试试！',{exact:true}).waitFor();await page.waitForTimeout(400);await page.screenshot({path:root+'artifacts/defeat.png'});

 const audioData=await page.evaluate(`(()=>new Promise(resolve=>{window._captureRecorder.onstop=async()=>{const b=new Blob(window._captureChunks,{type:'audio/webm'});resolve({data:Array.from(new Uint8Array(await b.arrayBuffer())),duration:(performance.now()-window._captureAudioAt)/1000})};window._captureRecorder.stop();}))()`) as any;
 await fs.writeFile(root+'artifacts/showcase-audio.webm',Buffer.from(audioData.data));await fs.writeFile(root+'artifacts/showcase-log.json',JSON.stringify({description:'Actual production build, fixed-action acceptance replay from graduation story start; real inputs and normal 2.7s clock. Opponent actions sealed by local fixture before player input.',rounds:checks,audioDuration:audioData.duration},null,2));
 const video=page.video()!;await context.close();await video.saveAs(root+'artifacts/showcase.webm');console.log('showcase complete');
}
async function mobile(width:number,height:number){
 const name=width<height?'portrait':'landscape';const c=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,recordVideo:{dir:root+'artifacts/raw',size:{width,height}}});const p=await c.newPage();await p.goto('http://localhost:4173');await api(p,'t.setSave({tutorial:true})');await p.tap('[data-action="basic"]');await p.tap('[data-action="start-basic"]');await api(p,'t.setEnemy("charge")');await p.tap('[data-skill="charge"]');await p.waitForFunction(()=>(window as any).__PAIPAI_TEST__.clock.startState.round===2);await api(p,'t.setEnemy("charge")');await p.tap('[data-skill="wave1"]');await p.waitForFunction(()=>(window as any).__PAIPAI_TEST__.clock.startState.round===3);await api(p,'t.setEnemy("wave1")');await p.tap('[data-skill="guard1"]');await p.waitForTimeout(2500);await p.screenshot({path:root+`artifacts/touch-${name}.png`});await fs.writeFile(root+`artifacts/touch-${name}.json`,JSON.stringify({browser:await browser.version(),desktopTouchEmulation:true,viewport:{width,height},log:await api(p,'return t.clock.log')},null,2));const v=p.video()!;await c.close();await v.saveAs(root+`artifacts/touch-${name}.webm`);console.log('touch complete',name);
}
try{
 if(run==='all'||run==='timing')await Promise.all([timing(1),timing(1.5)]);
 if(run==='all'||run==='showcase')await showcase();
 if(run==='all'||run==='mobile')await Promise.all([mobile(390,844),mobile(844,390)]);
}finally{await browser.close();}

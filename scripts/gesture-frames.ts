import{chromium}from'@playwright/test';import{ALL,initial}from'../src/rules';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('http://localhost:4173');await p.evaluate(()=>document.fonts.ready);
for(const id of ['charge','wave1','guard1','reflect1']){
 const s=initial(5,ALL);s.round=12;s.players.forEach(x=>x.energy=8);
 await p.evaluate(({s,id})=>(window as any).__PAIPAI_TEST__.start('advanced',{state:s,enemy:id==='charge'||id==='wave1'?'guard1':'wave1'}),{s,id});await p.click(`[data-skill="${id}"]`);await p.waitForFunction(()=>(window as any).__PAIPAI_TEST__.clock.local>2150);await p.evaluate(()=>(window as any).__PAIPAI_TEST__.clock.pause());await p.waitForTimeout(60);await p.screenshot({path:`artifacts/battle-gesture-${id}.png`});
}
await b.close();console.log('four battle gesture frames saved');

import fs from'node:fs/promises';import{initial,resolve}from'../src/rules';import{chooseAI,random}from'../src/ai';
const seed=173,origin=initial(),ai=random(seed),player=random(2002),history:any[]=[],turns=[];let state=origin;
for(;;){const enemy=chooseAI(state,1,ai,'hard',history);const action=chooseAI(state,0,player,'normal',history);const r=resolve(state,[action,enemy]);turns.push({start:state,player:action,sealed:enemy,result:r});history.push({actions:r.actions});state=r.next;if(r.winner!==null)break;}
await fs.writeFile('artifacts/seeded-ai-replay.json',JSON.stringify({version:'1.0.0',seed,mode:'advanced',difficulty:'hard',origin,actions:history.map(h=>h.actions[0]),sealed:history.map(h=>h.actions[1]),turns},null,2));console.log('seeded real-AI replay saved',turns.length,'turns');

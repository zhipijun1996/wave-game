import fs from 'node:fs/promises';import{initial,resolve}from'../src/rules';import{chooseAI,random}from'../src/ai';import{STORY,learned}from'../src/content';
const results=[];
for(let level=0;level<8;level++){
 for(const diff of ['easy','normal','hard']){
 const wins=[0,0,0],turns=[];
 for(let n=0;n<200;n++){
 let s=initial(3,learned(level),learned(level+1));const hist:any[]=[],rng=[random(173+n*97),random((173+n*97)^0x13579)];
 for(;;){const a=chooseAI(s,0,rng[0],'normal',hist);const b=chooseAI(s,1,rng[1],diff,hist,STORY[level].personality);const r=resolve(s,[a,b]);hist.push({actions:r.actions});s=r.next;if(r.winner!==null){wins[r.winner==='draw'?2:r.winner]++;turns.push(hist.length);break;}}
 }
 results.push({level:level+1,enemyDifficulty:diff,samples:200,playerWins:wins[0],enemyWins:wins[1],draws:wins[2],roundMedian:turns.sort((a,b)=>a-b)[100]});
 }
}
await fs.writeFile('artifacts/ai-calibration.json',JSON.stringify(results,null,2));console.log(results);

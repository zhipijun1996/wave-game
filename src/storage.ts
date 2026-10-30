export type Save = {version:2;completed:number;skin:string;tutorial:boolean;bestStreaks:{basic:number;advanced:number};settings:{music:number;sfx:number;shake:boolean;reduced:boolean;speed:number}};
// Keep the existing key so v1 story progress and settings migrate in place.
const key='paipai-wave.v1';
export const fresh=():Save=>({version:2,completed:0,skin:'plain',tutorial:false,bestStreaks:{basic:0,advanced:0},settings:{music:.3,sfx:.7,shake:true,reduced:false,speed:1}});
export function load():{save:Save;warning:string}{
 try{const raw=localStorage.getItem(key);if(!raw)return {save:fresh(),warning:''};const s=JSON.parse(raw);
  if(![1,2].includes(s.version)||!Number.isInteger(s.completed)||s.completed<0||s.completed>8||!['plain','ribbon','cat','cape'].includes(s.skin)||typeof s.tutorial!=='boolean'||!s.settings||![.7,1,1.5].includes(s.settings.speed)||!['music','sfx'].every(k=>typeof s.settings[k]==='number'&&s.settings[k]>=0&&s.settings[k]<=1)||!['shake','reduced'].every(k=>typeof s.settings[k]==='boolean'))throw Error('Invalid');
  const best=s.version===1?{basic:0,advanced:0}:s.bestStreaks;
  if(!best||!['basic','advanced'].every(k=>Number.isSafeInteger(best[k])&&best[k]>=0))throw Error('Invalid streak record');
  const unlock:Record<string,number>={plain:0,ribbon:2,cat:5,cape:8};if(s.completed<unlock[s.skin])s.skin='plain';return {save:{...s,version:2,bestStreaks:{basic:best.basic,advanced:best.advanced}},warning:''};
 }catch{return {save:fresh(),warning:'存档未能读取，已恢复初始状态。你可以继续游玩。'};}
}
export function persist(save:Save):boolean {try{localStorage.setItem(key,JSON.stringify(save));return true;}catch{return false;}}
export function clearSave(){localStorage.removeItem(key);}

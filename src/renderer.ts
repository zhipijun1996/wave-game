import {Spectacle} from './spectacle';
import type {Phase} from './clock';
import motions from '../data/motions.json';
import {SKILLS,type SkillId,type Resolution} from './rules';
export type ActorStyle={skin?:string;enemy?:number;accent?:string};
type Pose=number[];
const P=motions.poses as Record<string,Pose>;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
const mix=(a:Pose,b:Pose,n:number)=>a.map((v,i)=>v+(b[i]-v)*ease(n));
export class Renderer {
 ctx:CanvasRenderingContext2D;fx:Spectacle; width=1000;height=400;
 constructor(public canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;this.fx=new Spectacle(this.ctx);}
 fit(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}}
 line(points:number[],color='#292c2d',width=4){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.stroke();}
 circle(x:number,y:number,r:number,fill:string,stroke?:string,width=3){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 hand(x:number,y:number,kind:string,second:boolean,accent:string){
  const c=this.ctx;c.save();c.translate(x,y);c.lineWidth=3;c.strokeStyle='#292c2d';c.fillStyle='#faf6ed';
  if(kind==='charge'){
   c.rotate(second?Math.PI:0);c.beginPath();c.moveTo(-12,0);c.quadraticCurveTo(-8,-9,2,-9);c.lineTo(12,-6);c.quadraticCurveTo(17,-3,10,-1);c.lineTo(2,-2);c.lineTo(-2,2);c.stroke();
   this.line([2,-10,12,-8],undefined,2);this.line([0,-13,10,-11],undefined,2);
  }else if(kind==='reflect'){
   c.rotate(second?-.22:.22);c.beginPath();c.roundRect(-7,-8,14,14,5);c.fill();c.stroke();for(let i=0;i<3;i++)this.line([-5+i*4,-4,-1+i*4,-14],undefined,2);
  }else if(kind==='attack'||kind==='guard'){
   c.rotate(kind==='attack'?.15:0);c.beginPath();c.roundRect(-5,-14,11,24,5);c.fill();c.stroke();for(let i=0;i<3;i++)this.line([-4+i*4,-9,-4+i*4,-22+(i===1?-3:0)],undefined,2);this.line([4,2,12,-7],undefined,2.5);
  }else if(kind==='clap'){
   c.rotate(second?.12:-.12);c.beginPath();c.roundRect(-5,-15,10,25,4);c.fill();c.stroke();for(let i=0;i<3;i++)this.line([-3+i*3,-13,-3+i*3,-22],undefined,1.8);
  }else {c.beginPath();c.ellipse(0,2,6,8,-.2,0,Math.PI*2);c.fill();c.stroke();}
  c.restore();
 }
 actor(x:number,y:number,scale:number,facing:number,pose:Pose,handKind:string,style:ActorStyle,time:number,emotion='idle'){
  const c=this.ctx,accent=style.accent||'#338b86';
  c.save();c.translate(x,y);c.scale(scale*facing,scale);c.lineCap='round';c.lineJoin='round';
  c.save();c.scale(1,.18);this.circle(0,6,65,'#403b2e12');c.restore();
  let p=[...pose];if(emotion==='idle'){const b=Math.sin(time*.002)*1.6;p[1]+=b;p[3]+=b;p[5]+=b;}
  const [hx,hy,nx,ny,headX,headY,elx,ely,wlx,wly,erx,ery,wrx,wry,klx,kly,flx,fly,krx,kry,frx,fry]=p;
  if(style.skin==='cape') {c.fillStyle=accent+'cc';c.beginPath();c.moveTo(nx-3,ny+6);c.quadraticCurveTo(hx-65,hy+18,hx-50,hy+26);c.lineTo(hx+2,hy+7);c.fill();}
  const lw=style.enemy===5?6:4.8;
  this.line([hx,hy,klx,kly,flx,fly,flx+15,fly],undefined,lw);this.line([hx,hy,krx,kry,frx,fry,frx+15,fry],undefined,lw);
  this.line([hx,hy,nx,ny],undefined,lw+0.4);
  this.line([nx,ny+5,elx,ely,wlx,wly],undefined,lw);this.line([nx+3,ny+8,erx,ery,wrx,wry],undefined,lw);
  if(style.enemy===3){this.line([elx-6,ely-5,elx+6,ely+5],accent,10);this.line([erx-6,ery-5,erx+6,ery+5],accent,10);}
  this.circle(headX,headY,29,'#faf6ed','#292c2d',lw-0.5);
  // The same local facial design is mirrored with the skeleton.
  this.circle(headX+10,headY-2,emotion==='surprised'?4:2.3,'#292c2d');this.circle(headX+21,headY-3,emotion==='surprised'?4:2.3,'#292c2d');
  if(emotion==='serious'){this.line([headX+5,headY-8,headX+14,headY-5],undefined,2.5);this.line([headX+16,headY-6,headX+24,headY-10],undefined,2.5);}
  if(emotion==='lose'||emotion==='hit'){this.line([headX+6,headY-4,headX+14,headY],undefined,2);this.line([headX+15,headY-5,headX+23,headY-1],undefined,2);}
  c.strokeStyle='#292c2d';c.lineWidth=2;c.beginPath();c.arc(headX+15,headY+5,6,emotion==='lose'?Math.PI:0,emotion==='lose'?Math.PI*2:Math.PI);c.stroke();
  if(style.skin==='ribbon'||style.enemy===0||style.enemy===2||style.enemy===7){this.line([headX-27,headY-10,headX+25,headY-14],accent,6);this.line([headX-24,headY-10,headX-48,headY-5-Math.sin(time*.008)*4],accent,4);this.line([headX-24,headY-10,headX-43,headY+6],accent,3);}
  if(style.enemy===0)this.line([headX-14,headY-26,headX-18,headY-38,headX-5,headY-28,headX,headY-40,headX+7,headY-28,headX+13,headY-36,headX+19,headY-25],undefined,3);
  if(style.enemy===1){for(const dx of [8,23]){c.beginPath();c.arc(headX+dx,headY-2,8,0,Math.PI*2);c.stroke();}this.line([headX+15,headY-3,headX+17,headY-3],undefined,2);}
  if(style.enemy===4){c.fillStyle='#292c2d';c.beginPath();c.moveTo(headX-20,headY-21);c.lineTo(headX+20,headY-23);c.lineTo(headX-4,headY-3);c.closePath();c.fill();}
  if(style.enemy===6){c.fillStyle='#c5d3cb';c.beginPath();c.arc(headX,headY-2,32,Math.PI,Math.PI*2);c.lineTo(headX+37,headY-2);c.lineTo(headX-34,headY-2);c.fill();this.line([headX-33,headY-2,headX+37,headY-2],undefined,4);this.line([headX-2,headY-31,headX-2,headY-6],undefined,3);}
  if(style.skin==='cat'){c.fillStyle=accent;c.beginPath();c.moveTo(headX-26,headY-16);c.lineTo(headX-25,headY-45);c.lineTo(headX-6,headY-28);c.lineTo(headX+10,headY-29);c.lineTo(headX+29,headY-44);c.lineTo(headX+28,headY-12);c.quadraticCurveTo(headX,headY-26,headX-26,headY-16);c.fill();this.line([headX-24,headY-43,headX-7,headY-28],undefined,2);}
  this.hand(wlx,wly,handKind,false,accent);this.hand(wrx,wry,handKind,true,accent);
  c.restore();
 }
 pose(local:number,id:SkillId|null,result:Resolution|null,side:number,finished:boolean,time:number):{pose:Pose;hand:string;emotion:string}{
  if(finished&&result){const e=result.winner==='draw'?'draw':result.winner===side?'win':'lose';return {pose:mix(P.idle,P[e],clamp((time)/450)),hand:'idle',emotion:e};}
  if(!id||local<1800){const t=local%900;const p=t<220?mix(P.clap,P.open,t/220):mix(P.open,P.idle,(t-220)/450);return {pose:p,hand:t<170?'clap':'idle',emotion:'idle'};}
  const s=SKILLS[id],u=(local-1800)/450;let target=P[id]||P.charge,prep=P.wavePrep;
  if(s.kind==='idle'){target=P.idle;prep=P.idle;}
  if(s.kind==='charge'){target=P[id==='quick'?'quick':'charge'];prep=P.chargePrep;}
  if(s.kind==='guard'){target=P[id];prep=P[id];}
  if(s.kind==='reflect'){target=id==='reflect2'?P.fanSend:P[id];prep=id==='reflect2'?P.fanCatch:P.reflectPrep;}
  if(id==='wave3')prep=P.rayPrep;
  let p=u<.18?mix(P.idle,prep,u/.18):u<.32?mix(prep,target,(u-.18)/.14):target;
  if(id==='reflect2')p=u<.47?mix(P.idle,P.fanCatch,u/.3):u<.7?mix(P.fanCatch,P.fanSend,(u-.47)/.23):P.fanSend;
  let emotion='idle',hand=s.kind;
  if(u>=1&&result){const e=result.events.find(e=>e.side===side&&['break','block','reflect'].includes(e.type));
   if(result.damage[side]>0){emotion='hit';const hit=e?.type==='break'?P.broken:P.hit;p=mix(target,hit,clamp((u-1)/.22));const lag=mix(target,hit,clamp((u-1-35/450)/.22));p[4]=lag[4];p[5]=lag[5];if(u>1.5)p=mix(hit,P.idle,(u-1.5)/.5);hand=e?.type==='break'?'idle':hand;
    if(id==='charge'&&u<1.65){p[8]=target[8]-14;p[9]=target[9];p[12]=target[12]-14;p[13]=target[13];hand='charge';}
    if(result.events.some(e=>e.type==='reflect'&&e.side===1-side)&&u<1.65)emotion='surprised';}
   else if(e?.type==='block'){const compressed=[...target];compressed[0]-=9;compressed[2]-=11;compressed[1]+=6;compressed[3]+=6;p=mix(target,compressed,Math.sin(clamp((u-1)*2)*Math.PI));}
   if(emotion!=='hit'&&u>1.2)p=mix(p,P.idle,(u-1.2)/.8);
  }
  if(emotion==='idle')emotion='serious';return {pose:p,hand,emotion};
 }
 orb(x:number,y:number,r:number,color:string,time:number,power=1){
  const c=this.ctx;c.save();c.shadowBlur=16;c.shadowColor=color;this.circle(x,y,r,color+'28',color,2.5);this.circle(x-2,y-2,r*.62,'#fff9',color+'88',1.5);c.shadowBlur=0;
  for(let i=0;i<3;i++){const a=time*.006+i*2.094;this.line([x+Math.cos(a)*r*1.1,y+Math.sin(a)*r*1.1,x+Math.cos(a+.3)*r*1.4,y+Math.sin(a+.3)*r*1.4],color,1.7);}
  if(power>1){c.beginPath();c.ellipse(x,y,r*1.3,r*.75,-.3,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=1.5;c.stroke();}c.restore();
 }
 draw(o:{local:number;time:number;result:Resolution|null;finished?:boolean;finishTime?:number;styles:[ActorStyle,ActorStyle];preview?:SkillId|null;home?:boolean;reduced?:boolean;phase?:Phase;phaseTime?:number;cutinDuration?:number;round?:number;winnerHP?:number}){
  this.fit();const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
  const worldW=w/h<2.1?640:1000,unit=w/worldW,worldH=h/unit,baseY=worldH-40;
  c.setTransform(unit,0,0,unit,0,0);c.clearRect(0,0,worldW,worldH);c.lineCap='round';c.lineJoin='round';
  this.line([30,baseY+9,worldW-30,baseY+9],'#c9c9b8',1.2);
  this.line([45,baseY+9,65,baseY+2,worldW-80,baseY+2,worldW-45,baseY+9],'#d7d7c6',1);
  c.strokeStyle='#a8b5a21c';c.lineWidth=2;c.beginPath();c.ellipse(worldW/2,baseY+21,worldW*.19,28,0,Math.PI,Math.PI*2);c.stroke();
  const scale=.93,xs=[worldW*.24,worldW*.76];let local=o.local;
  if(!o.reduced&&local>=2250&&local<2269)local=2250;
  const actions=o.result?.actions??[null,null],u=(local-1800)/450,joke=o.result?this.fx.joke(o.result,o.round||1):null;
  for(let i=0;i<2;i++){
   let p=this.pose(local,actions[i],o.result,i,false,o.finishTime||0);
   if(p.emotion==='surprised'&&joke!=='surprised')p.emotion='hit';
   if(o.result?.winner!==null&&o.result?.winner!==undefined&&o.result.winner!=='draw'&&o.result.winner!==i&&u>1.4){p={pose:mix(p.pose,P.lose,(u-1.4)/.6),hand:'idle',emotion:'lose'};}
   if(o.home)p={pose:P.idle,hand:'idle',emotion:'idle'};
   if(o.preview)p={pose:P[o.preview]||P.charge,hand:SKILLS[o.preview].kind,emotion:'serious'};
   if(joke==='stretch'&&u>1.12&&actions[i]&&SKILLS[actions[i]!].kind==='reflect'){p={pose:mix(p.pose,P.stretch,Math.sin(clamp((u-1.12)/.8)*Math.PI)),hand:'idle',emotion:'idle'};}
   c.save();c.translate(xs[i],baseY);c.scale(scale,scale);this.fx.backProp(o.preview||actions[i]||'idle',0,0,i===0?1:-1,o.preview?.8:u);c.restore();
   this.actor(xs[i],baseY,scale,i===0?1:-1,p.pose,p.hand,o.styles[i],o.time,p.emotion);
   if(o.result&&local>=1800){c.save();c.translate(xs[i],baseY);c.scale(scale,scale);this.fx.props(o.result,i,0,0,i===0?1:-1,u,o.time,joke);c.restore();}
   if(o.preview){const fake={actions:[o.preview,o.preview],events:[],damage:[0,0],gain:[0,0]} as unknown as Resolution;c.save();c.translate(xs[i],baseY);c.scale(scale,scale);this.fx.props(fake,i,0,0,i===0?1:-1,.85,o.time,null);c.restore();}
  }
  if(o.result&&local>=1800)this.fx.fight(o.result,u,o.time,xs,baseY,o.round||1);
  if(o.phase==='cutin'&&o.result)this.fx.cutin(o.result.actions,o.phaseTime||0,o.cutinDuration||2200,worldW,worldH,o.reduced);
  if((o.phase==='victory'||o.phase==='finished')&&o.result)this.fx.victory(worldW,worldH,o.phaseTime||0,o.result.winner!,o.winnerHP||1,o.round||1,o.reduced);
 }
}

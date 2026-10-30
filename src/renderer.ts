import motions from '../data/motions.json';
import {SKILLS,type SkillId,type Resolution} from './rules';
export type ActorStyle={skin?:string;enemy?:number;accent?:string};
type Pose=number[];
const P=motions.poses as Record<string,Pose>;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
const mix=(a:Pose,b:Pose,n:number)=>a.map((v,i)=>v+(b[i]-v)*ease(n));
export class Renderer {
 ctx:CanvasRenderingContext2D; width=1000;height=400;
 constructor(public canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;}
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
  this.circle(headX+10,headY-2,2.3,'#292c2d');this.circle(headX+21,headY-3,2.3,'#292c2d');
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
  if(s.kind==='reflect'){target=P[id];prep=P.reflectPrep;}
  let p=u<.2?mix(P.idle,prep,u/.2):u<.7?mix(prep,target,(u-.2)/.5):target;
  let emotion='idle',hand=s.kind;
  if(u>=1&&result){const e=result.events.find(e=>e.side===side&&['break','block','reflect'].includes(e.type));
   if(result.damage[side]>0){emotion='hit';const hit=e?.type==='break'?P.broken:P.hit;p=mix(target,hit,clamp((u-1)/.22));const lag=mix(target,hit,clamp((u-1-35/450)/.22));p[4]=lag[4];p[5]=lag[5];if(u>1.5)p=mix(hit,P.idle,(u-1.5)/.5);hand=e?.type==='break'?'idle':hand;}
   else if(e?.type==='block'){const compressed=[...target];compressed[0]-=9;compressed[2]-=11;compressed[1]+=6;compressed[3]+=6;p=mix(target,compressed,Math.sin(clamp((u-1)*2)*Math.PI));}
   if(emotion!=='hit'&&u>1.2)p=mix(p,P.idle,(u-1.2)/.8);
  }
  return {pose:p,hand,emotion};
 }
 orb(x:number,y:number,r:number,color:string,time:number,power=1){
  const c=this.ctx;c.save();c.shadowBlur=16;c.shadowColor=color;this.circle(x,y,r,color+'28',color,2.5);this.circle(x-2,y-2,r*.62,'#fff9',color+'88',1.5);c.shadowBlur=0;
  for(let i=0;i<3;i++){const a=time*.006+i*2.094;this.line([x+Math.cos(a)*r*1.1,y+Math.sin(a)*r*1.1,x+Math.cos(a+.3)*r*1.4,y+Math.sin(a+.3)*r*1.4],color,1.7);}
  if(power>1){c.beginPath();c.ellipse(x,y,r*1.3,r*.75,-.3,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=1.5;c.stroke();}c.restore();
 }
 draw(o:{local:number;time:number;result:Resolution|null;finished?:boolean;finishTime?:number;styles:[ActorStyle,ActorStyle];preview?:SkillId|null;home?:boolean;reduced?:boolean}){
  this.fit();const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
  const worldW=w/h<2.1?640:1000,unit=w/worldW,worldH=h/unit,baseY=worldH-65;
  c.setTransform(unit,0,0,unit,0,0);c.clearRect(0,0,worldW,worldH);c.lineCap='round';c.lineJoin='round';
  this.line([30,baseY+9,worldW-30,baseY+9],'#c9c9b8',1.2);
  this.line([45,baseY+9,65,baseY+2,worldW-80,baseY+2,worldW-45,baseY+9],'#d7d7c6',1);
  // Deliberately faint playground chalk, away from the hands.
  c.strokeStyle='#a8b5a21c';c.lineWidth=2;c.beginPath();c.ellipse(worldW/2,baseY+21,worldW*.19,28,0,Math.PI,Math.PI*2);c.stroke();
  for(const x of [60,worldW-60]){this.line([x,baseY-160,x,baseY+1],'#bdc6b14a',1.5);this.line([x-25,baseY-160,x+25,baseY-160],'#bdc6b14a',1.5);}
  const scale=.97, xs=[worldW*.245,worldW*.755];
  let local=o.local;
  // A brief visual hold does not affect the clock, input or state commit.
  if(!o.reduced&&local>=2250&&local<2300)local=2250;
  const actions=o.result?.actions??[null,null];
  for(let i=0;i<2;i++){
    let p=this.pose(local,actions[i],o.result,i,!!o.finished,o.finishTime||0);
    if(o.home){p={pose:P.idle,hand:'idle',emotion:'idle'};}
    if(o.preview){p={pose:P[o.preview]||P.charge,hand:SKILLS[o.preview].kind,emotion:'idle'};}
    this.actor(xs[i],baseY,scale,i===0?1:-1,p.pose,p.hand,o.styles[i],o.time,p.emotion);
    if((o.result&&local>=1800&&local<2550)||o.preview){const id=o.preview||actions[i]!;const s=SKILLS[id];const u=o.preview?.9:(local-1800)/450;
      if(s.kind==='charge'&&u>.2){const interrupted=o.result?.events.some(e=>e.type==='interrupted'&&e.side===i)&&u>=1;const a=interrupted?clamp(1-(u-1)*3):clamp(u*1.5)*clamp(2-u);if(interrupted&&u<1.45){const f=i===0?1:-1;for(let k=0;k<7;k++){const angle=k*Math.PI*2/7,radius=25+(u-1)*80;this.line([xs[i]+f*58+Math.cos(angle)*radius,baseY-122+Math.sin(angle)*radius,xs[i]+f*58+Math.cos(angle)*(radius+6),baseY-122+Math.sin(angle)*(radius+6)],(o.styles[i].accent||'#338b86')+'88',2);}}if(a>0){c.save();c.globalAlpha=a;const f=i===0?1:-1;this.orb(xs[i]+f*58,baseY-122,id==='quick'?24:19,o.styles[i].accent||'#338b86',o.time);if(id==='quick')this.orb(xs[i]+f*58,baseY-104,11,o.styles[i].accent||'#338b86',o.time);c.restore();}}
    }
  }
  if(o.result&&local>=1800&&!o.finished)this.effects(o.result,local,o.time,xs,baseY,o.styles);
 }
 effects(r:Resolution,local:number,time:number,xs:number[],y:number,styles:[ActorStyle,ActorStyle]){
  const c=this.ctx,u=(local-1800)/450,sy=y-125,mid=(xs[0]+xs[1])/2;
  const both=r.actions.every(a=>SKILLS[a].kind==='attack'),equal=both&&SKILLS[r.actions[0]].damage===SKILLS[r.actions[1]].damage;
  for(let i=0;i<2;i++){
   const s=SKILLS[r.actions[i]];if(s.kind!=='attack'||u<.32||u>1.22)continue;
   const j=1-i,f=i===0?1:-1,from=xs[i]+f*104,to=xs[j]-f*57,col=styles[i].accent||'#338b86';
   const reflect=r.events.find(e=>e.type==='reflect'&&e.side===j);let x=from,power=s.damage;
   if(reflect){if(u<.45)x=from+(to-from)*clamp((u-.32)/.13);else x=to+(xs[i]-to)*clamp((u-.45)/.55);}
   else if(both){const collision=equal?1:.65;if(u<collision)x=from+(mid-from)*clamp((u-.32)/(collision-.32));else{if(equal||r.damage[j]===0)continue;power=r.damage[j];x=mid+(xs[j]-mid)*clamp((u-collision)/(1-collision));}}
   else x=from+(to-from)*clamp((u-.32)/.68);
   if(u>1)x=reflect?xs[i]:to;
   c.save();c.globalAlpha=u>1?clamp(1-(u-1)*5):1;this.line([x-f*(30+power*13),sy,x-f*10,sy],col+'66',5+power*2);this.orb(x,sy,12+power*8,col,time,power);c.restore();
  }
  if(u>=.64&&u<=1.35&&both){const coll=equal?1:.65;if(u>=coll){const a=clamp((u-coll)/.35);for(let k=0;k<12;k++){const ang=k*Math.PI/6;this.line([mid+Math.cos(ang)*a*50,sy+Math.sin(ang)*a*50,mid+Math.cos(ang)*(a*50+8),sy+Math.sin(ang)*(a*50+8)],'#c49a55'+Math.round((1-a)*255).toString(16).padStart(2,'0'),2);}}}
  if(u>=.65&&u<1.55)for(const e of r.events){const x=xs[e.side]+(e.side===0?56:-56),color=styles[e.side].accent||'#338b86';
    if(e.type==='block'||e.type==='reflect'){c.save();c.globalAlpha=clamp((1.55-u)*2);c.strokeStyle=color;c.lineWidth=e.type==='block'?5:3;c.beginPath();c.ellipse(x,sy,20+Math.sin(u*5)*3,51,0,-Math.PI*.48,Math.PI*.48);c.stroke();if(e.type==='reflect'){this.line([x-13,sy-54,x+6,sy-47,x-12,sy-37],color,3);}c.restore();}
    if(e.type==='break'&&u>=1){for(let k=0;k<5;k++){const a=(u-1)*50;this.line([x+(k-2)*12,sy-40+a*k,x+(k-2)*15+4,sy-30+a*k],color,3);}}
  }
  if(u>=1&&u<2){for(let i=0;i<2;i++){const dmg=r.damage[i],gain=r.gain[i];if(!dmg&&!gain)continue;c.save();c.globalAlpha=clamp((2-u)*1.5);c.font='bold 25px "WenKai", sans-serif';c.textAlign='center';c.fillStyle=dmg?'#be644b':'#338b86';c.fillText(dmg?`−${dmg} ♥`:`+${gain} 气`,xs[i],y-235-(u-1)*25);c.restore();}}
 }
}

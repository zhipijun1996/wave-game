import {SKILLS,type Resolution,type SkillId} from './rules';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
const ink='#292c32',paper='#faf6ed';
/** Hand-inked props and manga cameras. These read the resolved events; they never decide combat. */
export class Spectacle {
 constructor(public c:CanvasRenderingContext2D){}
 path(p:number[],fill?:string,stroke=ink,lw=3,close=true){const c=this.c;c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);if(close)c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
 line(p:number[],col=ink,lw=3){this.path(p,undefined,col,lw,false);}
 ellipse(x:number,y:number,rx:number,ry:number,fill:string,stroke=ink,lw=3){const c=this.c;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();}}
 text(str:string,x:number,y:number,size=18,col=ink,align:CanvasTextAlign='center'){const c=this.c;c.font=`700 ${size}px WenKai, sans-serif`;c.textAlign=align;c.fillStyle=col;c.fillText(str,x,y);}
 octagon(x:number,y:number,r:number,col:string,lw=3,rotation=Math.PI/8){const pts=[];for(let k=0;k<8;k++){const a=rotation+k*Math.PI/4;pts.push(x+Math.cos(a)*r*.49,y+Math.sin(a)*r);}this.path(pts,undefined,col,lw);}
 spark(x:number,y:number,r:number,col:string,count=10,seed=0){for(let k=0;k<count;k++){const a=k*Math.PI*2/count+seed;this.line([x+Math.cos(a)*r*.35,y+Math.sin(a)*r*.35,x+Math.cos(a)*r,y+Math.sin(a)*r],col,2+(k%3));}}
 speedlines(w:number,h:number,t:number,reduced=false,col='#35333d22'){for(let k=0;k<30;k++){const a=k*.73,dx=Math.cos(a),dy=Math.sin(a),r=110+(k%4)*12;const pulse=reduced?0:Math.sin(t*.003+k)*9;this.line([w/2+dx*r,h*.48+dy*r*.45,w/2+dx*(r+150+pulse),h*.48+dy*(r+150+pulse)*.55],col,k%4===0?3:1);}}
 mech(type:'eva'|'unicorn',x:number,y:number,scale:number,t:number,alpha=.42){
  const c=this.c;c.save();c.translate(x,y);c.scale(scale,scale);c.globalAlpha=alpha;
  const lift=ease(t/450),eva=type==='eva',armor=eva?'#79639c':'#f4f6ed',edge=eva?'#453c62':'#65777a',frame='#7fe9a6';
  // Long pointed shoulders, layered breast plates and articulated arms.
  this.path([-53,-50,-78,-116,-95,-129,-106,-61,-92,-12,-59,6],armor,edge,3);
  this.path([53,-50,78,-116,95,-129,106,-61,92,-12,59,6],armor,edge,3);
  this.path([-64,-60,-28,-85,28,-85,64,-60,48,27,24,53,-24,53,-48,27],armor,edge,4);
  this.path([-45,-51,-12,-33,0,-7,-29,4,-46,-9],eva?'#45345e':'#e7eeec',edge,2);
  this.path([45,-51,12,-33,0,-7,29,4,46,-9],eva?'#45345e':'#e7eeec',edge,2);
  for(const side of [-1,1]){this.line([side*53,-65,side*42,-40],frame,8);this.line([side*28,-19,side*14,5,side*16,34],frame,5);this.path([side*68,-43,side*(93+Math.sin(t*.005)*2),-13-lift*55,side*67,6-lift*42,side*57,-13],armor,edge,3);}
  // Helmet silhouette: EVA's single horn versus awakened Unicorn's golden V.
  this.path([-33,-105,-27,-151,0,-171,27,-151,33,-105,12,-85,-12,-85],armor,edge,4);
  if(eva){this.path([-8,-150,3,-215,12,-151],'#82709e',edge,3);this.path([-26,-139,-9,-126,-26,-122],frame,edge,2);this.path([26,-139,9,-126,26,-122],frame,edge,2);this.path([-15,-113,0,-98,15,-113],'#e8e9db',edge,2);this.line([-19,-155,-24,-143],frame,5);}
  else {this.path([-7,-157,-49,-199,-24,-160,0,-142,24,-160,49,-199,7,-157],'#dfba54','#8a793c',2);this.line([-24,-138,-8,-133],frame,7);this.line([24,-138,8,-133],frame,7);this.path([-15,-121,0,-104,15,-121],'#dce4dc',edge,2);this.line([0,-123,0,-110],edge,2);this.line([-31,-111,-20,-108],frame,5);this.line([31,-111,20,-108],frame,5);}
  c.restore();
 }
 pan(x:number,y:number,t:number,broken=false,egg=false){const c=this.c;c.save();c.translate(x,y);if(broken){c.translate(-t*55,-t*105);c.rotate(t*7);}else c.rotate(Math.sin(t*30)*.025);this.line([-7,26,-30,69],'#504b48',12);this.line([-7,26,-30,69],ink,3);this.ellipse(0,0,28,37,'#747a7b',ink,3);this.ellipse(1,-1,20,28,broken?'#515857':'#cbd2ce','#40474a',2);if(broken){this.line([-18,-14,3,-6,-9,7,15,13],'#20252c',4);}if(egg){const ey=-5-Math.sin(clamp(t)*Math.PI)*65;this.ellipse(0,ey,15,11,'#fffdf1','#d4c7aa',1);this.ellipse(1,ey-1,6,5,'#ecc25c','',0);}c.restore();}
 shield(x:number,y:number,rot:number,s=1,bright=false){const c=this.c;c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);this.path([0,-46,19,-31,23,23,0,49,-23,23,-19,-31],'#fbfcf2','#597b72',3);this.path([0,-34,11,-25,13,17,0,33,-13,17,-11,-25],bright?'#9affe1':'#77d9af','#54a38c',2);this.path([-9,-13,0,-20,9,-13,0,10],paper,'#537e6e',2);this.line([0,12,0,29],'#faffdc',4);c.restore();}
 cylinder(x:number,y:number,rot:number,t:number,broken=false){const c=this.c;c.save();c.translate(x,y);c.rotate(rot);this.path([-23,-33,23,-33,26,30,-26,30],'#92739d',ink,3);this.line([-14,-27,-14,23],'#c7b7d5',4);this.line([14,-27,14,23],'#584563',3);this.ellipse(0,-33,23,10,'#b3a3b7',ink,3);this.ellipse(0,-33,15,6,'#4e415e','#deb87b',2);this.ellipse(0,30,26,11,'#b69cbe',ink,3);this.ellipse(0,30,17,7,'#3f354e','#d9bd7e',2);for(let k=0;k<3;k++)this.line([-19+k*18,-14,-14+k*18,-6,-19+k*18,2],'#eedca5',2);if(broken){this.path([-29,-10,0,-1,-12,11,28,19],undefined,'#fff2da',5,false);this.spark(0,0,48,'#ce845b',7,t);}c.restore();}
 fan(x:number,y:number,angle:number,t:number,broken=false){const c=this.c;c.save();c.translate(x,y);c.rotate(angle);this.line([0,21,0,76],'#b1a185',12);this.line([0,21,0,76],ink,3);c.beginPath();c.moveTo(0,36);c.bezierCurveTo(-64,26,-61,-9,-27,-24);c.bezierCurveTo(-65,-71,-10,-93,0,-66);c.bezierCurveTo(18,-93,61,-60,27,-24);c.bezierCurveTo(61,-8,60,28,0,36);c.closePath();c.fillStyle='#dcdad4';c.fill();c.strokeStyle=ink;c.lineWidth=4;c.stroke();this.ellipse(0,-18,22,25,'#a75e5c',ink,2);this.path([-22,-16,22,-16,18,4,0,13,-18,4],paper,ink,2);this.line([0,10,0,26],ink,3);if(broken)this.line([-31,-31,4,-11,-9,9,24,19],'#faf3dc',5);c.restore();}
 backProp(id:SkillId,x:number,y:number,f:number,u:number){if(u<0||u>1.8)return;if(id==='guard2'||id==='guard3'){const c=this.c;c.save();c.translate(x,y);c.scale(f,1);const a=clamp(u*5)*clamp((1.8-u)*2);this.mech(id==='guard2'?'eva':'unicorn',-28,-100,.84,u*1000,.58*a);c.restore();}}
 props(r:Resolution,side:number,x:number,y:number,f:number,u:number,time:number,joke:string|null){
  const c=this.c,id=r.actions[side],s=SKILLS[id],bad=r.events.some(e=>e.type==='break'&&e.side===side),blocked=r.events.some(e=>e.type==='block'&&e.side===side),ref=r.events.some(e=>e.type==='reflect'&&e.side===side),hit=r.damage[side]>0;
  if(u<.08||u>1.98)return;c.save();c.translate(x,y);c.scale(f,1);const fade=clamp(u*5)*clamp((2-u)*3);c.globalAlpha=fade;
  if(id==='charge'||id==='quick'){
   const interrupted=id==='quick'&&hit&&u>=1,carry=u>=1?clamp((u-1)/.7):0,px=58-carry*25,py=-124-carry*53;
   if(id==='charge'){
    c.save();c.globalAlpha*=1-carry*.85;this.ellipse(px,py,10+ease(u/.8)*13,10+ease(u/.8)*16,'#9bd6bb55','#4b9f8c',2.5);this.line([px-7,py-9,px-3,py-12],'#fafff1',3);c.restore();
    if(u>1&&r.gain[side]>0){for(let k=0;k<4;k++)this.ellipse(px-k*6,py-k*8,3,3,'#4eaa91','',0);}
   }else {
    const cy=-127;c.save();c.translate(58,cy);c.rotate(Math.sin(time*.035)*.035);this.path([-21,-18,21,-18,21,18,-21,18],interrupted?'#a0a49a':'#a3d8ac',ink,3);this.path([21,-8,28,-8,28,8,21,8],interrupted?'#909a92':'#dfb15f',ink,2);
    for(const dx of [-12,6])this.path([dx+3,-12,dx-4,1,dx+3,1,dx-3,12,dx+11,-3,dx+3,-3],interrupted?'#71786d':'#fff5ac',undefined,0);
    const unplug=interrupted?clamp((u-1)*5):0;this.line([26+unplug*25,5+unplug*40,40+unplug*25,5+unplug*40,44+unplug*25,18+unplug*40],'#8a8371',3);this.line([31+unplug*25,-2+unplug*40,31+unplug*25,7+unplug*40],ink,2);this.line([37+unplug*25,-2+unplug*40,37+unplug*25,7+unplug*40],ink,2);if(!interrupted){for(let k=0;k<5;k++){const t=(time*.002+k*.2)%1;this.line([-76+t*43,-20+k*9,-67+t*43,-20+k*9],'#4d9f83',2);}}c.restore();
    if(u>=1){for(let k=0;k<3;k++){const sy=-171-(u-1)*42-k*8;this.ellipse(43+k*10+Math.sin(time*.003+k)*4,sy,7+k*2,5+k*2,'#87938545','',0);}this.text('过热',48,-186,15,'#ae7953');}
   }
  }
  if(id==='wave2'){if(u>.09&&u<.31){const px=-5+ease((u-.18)/.14)*110;this.ellipse(px,-116,11,13,'#9fcef355','#7bafce',2);}
   this.line([13,-193,54,-188],'#b55e55',6);this.line([13,-193,-32,-204,-45,-195],'#b55e55',4);this.path([14,-146,33,-131,50,-146,37,-106,18,-119],paper,ink,2);}
  if(id==='wave3'){
   this.path([13,-154,33,-146,57,-157,50,-119,27,-124],'#d75f5b',ink,2);this.line([35,-145,34,-128],'#dce5e4',7);this.ellipse(34,-132,5,7,'#8cdeee','#476e85',1.5);this.line([35,-171,43,-169],'#e5f5c8',5);this.line([52,-172,58,-173],'#e5f5c8',5);
   // Flat emitting core at the upright wrist; crossed arms are in the shared skeleton.
   if(u>.3&&u<1.12)this.ellipse(99,-128,7+Math.sin(time*.04)*2,21,'#f5ffff','#b7e3ee',2);
  }
  if(id==='guard1'){const bt=bad&&u>.9?(u-.9)*2.5:0;this.pan(66,-126,joke==='egg'&&u>1.13?clamp((u-1.13)/.7):bt||(blocked?Math.max(0,u-.85):0),bad&&u>.9,joke==='egg'&&u>1.13);if(joke==='both-pans'&&u>1.15)this.text('?',-8,-227,24,'#ac9b75');}
  if(id==='guard2'){
   const start=clamp((u-.12)*3),breakT=bad?clamp((u-.91)*5):0;const cy=-130;
   if(breakT<1){c.globalAlpha*=1-breakT*.7;for(let k=0;k<5;k++){const kOpen=clamp(start*1.5-k*.13),rad=(46+k*9)*kOpen;this.octagon(79+k*.7,cy,rad,'#e6a15b'+(k%2?'aa':'dd'),k===4?4:2);}
    this.text('A.T. FIELD',35,-231,13,'#b8834c');
    if(blocked&&u>.75){this.spark(102,cy,20+Math.sin(u*30)*8,'#fff3b3',8);for(let k=0;k<3;k++)this.octagon(80,cy,54+k*12,'#f4c77faa',2);
     const travel=clamp((u-.75)/.36)*8,edge=Math.floor(travel)%8,part=travel-Math.floor(travel),a=Math.PI/8+edge*Math.PI/4,b=a+Math.PI/4;
     const ax=80+Math.cos(a)*37,ay=cy+Math.sin(a)*76,bx=80+Math.cos(b)*37,by=cy+Math.sin(b)*76;this.line([ax,ay,ax+(bx-ax)*part,ay+(by-ay)*part],'#fff5ca',5);}
    if(bad&&u>.9){this.line([96,-203,68,-164,94,-146,70,-112,92,-57],'#fcf4df',4);this.line([70,-164,58,-132,42,-126],'#fff5de',3);}}
   if(breakT>0){c.globalAlpha=1-breakT;for(let k=0;k<10;k++){const angle=k*.8;const px=85+Math.cos(angle)*breakT*90,py=cy+Math.sin(angle)*breakT*120;this.path([px,py,px+8,py-12,px+16,py+8],'#ecc08b','#be8c59',1);}}
  }
  if(id==='guard3'){
   const op=ease((u-.08)/.45),ripple=blocked&&u>.78?Math.sin((u-.78)*15)*3:0;
   c.save();c.globalAlpha*=.35;this.ellipse(82,-130,35*op,91*op,'#94e6be','#60bfa0',3);c.restore();
   for(let k=0;k<3;k++){const a=k*Math.PI*2/3+(.45-op)*1.3;const xx=82+Math.cos(a)*25*op,yy=-130+Math.sin(a)*53*op;this.shield(xx+ripple,yy,(k-1)*.35+(1-op)*.9,.64+op*.1,blocked&&u>.8);}
   this.text('PSYCHO FIELD',23,-247,12,'#589c85');if(blocked&&u>.85){for(let k=0;k<12;k++){const a=k*.9,rr=(u-.85)*160;this.ellipse(126+Math.cos(a)*rr*.3,-130+Math.sin(a)*rr,2+(k%3),2,'#77d3ae','',0);}}
  }
  if(id==='reflect1'){
   const bt=bad&&u>.95;this.cylinder(62,-149,-.13,u,bt);this.cylinder(92,-82,.17,u,bt);if(ref&&u>.45&&u<1.08){const entering=u<.57;this.spark(entering?66:92,entering?-181:-51,12,'#efd989',6,u);this.text(entering?'IN':'OUT',entering?26:122,entering?-182:-52,12,'#896691');}
  }
  if(id==='reflect2'){const turn=u<.48?-.5:ease((u-.48)/.25)*1.15-.5;this.fan(77,-132,turn,u,bad&&u>.95);if(ref&&u>.52&&u<1.2){for(let k=0;k<4;k++){const a=(u-.52)*220;this.line([64+a*.15,-210+k*25,91+a,-199+k*25,124+a,-174+k*22],'#a8bba080',3-k*.4);}}}
  c.restore();
 }
 joke(r:Resolution,round:number):string|null{
  // Quiet recovery gags, with a three-round minimum cadence and a deterministic variation.
  if(round%4!==2)return null;const a=r.actions,both=a.every(id=>id==='guard1');
  if(both)return 'both-pans';if(a.some((id,i)=>id==='guard1'&&SKILLS[a[1-i]].kind!=='attack'))return 'egg';
  if(a.some((id,i)=>SKILLS[id].kind==='reflect'&&SKILLS[a[1-i]].kind!=='attack'))return 'stretch';
  if(r.events.some(e=>e.type==='cancel'))return 'smoke';if(r.events.some(e=>e.type==='reflect'))return 'surprised';return null;
 }
 projectile(id:SkillId,x:number,y:number,f:number,power:number,t:number,returning=false,beamLength=70){
  const c=this.c,col=id==='wave3'?'#97d9ed':id==='wave2'?'#75bbed':'#7fbfab';c.save();c.translate(x,y);c.scale(f,1);
  if(id==='wave3'){
   const thickness=6+power*7;const g=c.createLinearGradient(-beamLength,0,4,0);g.addColorStop(0,'#badfea00');g.addColorStop(.35,'#8acbdf99');g.addColorStop(1,'#dbfbff');c.fillStyle=g;c.fillRect(-beamLength,-thickness,beamLength+9,thickness*2);c.fillStyle='#fcffff';c.fillRect(-beamLength*.75,-thickness*.28,beamLength*.75+10,thickness*.56);
   for(let k=0;k<4;k++){const yy=(k-1.5)*thickness*.48;this.line([-beamLength+(t*.15+k*25)%Math.max(1,beamLength),yy,4,yy],'#edffffaa',1.2);}
   this.ellipse(4,0,7,thickness,'#f5ffff','#9bcddd',2);
  }else{
   for(let k=3;k>=1;k--){c.save();c.globalAlpha=.11*(4-k);this.ellipse(-k*(16+power*3),0,12+power*7,9+power*7,col,'',0);c.restore();}
   this.ellipse(0,0,12+power*7,9+power*7,col+'66',col,2.5);this.ellipse(1,-2,6+power*4,5+power*4,'#f9fff5',col,1.5);this.line([-20-power*8,0,-8-power*3,0],col,3);
   for(let k=0;k<3;k++){const a=t*.008+k*2.1;this.line([Math.cos(a)*(15+power*7),Math.sin(a)*(10+power*6),Math.cos(a+.2)*(22+power*7),Math.sin(a+.2)*(14+power*6)],col,2);}
  }
  if(returning){this.line([-30,-33,-15,-29,-25,-20],'#ad779c',2.5);}c.restore();
 }
 fight(r:Resolution,u:number,time:number,xs:number[],y:number,round:number){
  const c=this.c,sy=y-125,mid=(xs[0]+xs[1])/2,both=r.actions.every(id=>SKILLS[id].kind==='attack'),equal=both&&SKILLS[r.actions[0]].damage===SKILLS[r.actions[1]].damage;
  for(let i=0;i<2;i++){
   const id=r.actions[i],s=SKILLS[id];if(s.kind!=='attack'||u<.29||u>1.16)continue;const j=1-i,f=i===0?1:-1,from=xs[i]+f*(id==='wave3'?100:103),to=xs[j]-f*66;const reflect=r.events.some(e=>e.type==='reflect'&&e.side===j);let x=from,power=s.damage,returning=false,sy2=sy;
   if(reflect){if(u<.47){x=from+(to-from)*clamp((u-.29)/.18);if(r.actions[j]==='reflect1')sy2=sy-55*clamp((u-.29)/.18);}else if(u<.57){continue;}else{x=to+(xs[i]-to)*clamp((u-.57)/.43);returning=true;if(r.actions[j]==='reflect1')sy2=sy+73*(1-clamp((u-.57)/.43));}}
   else if(both){const contact=equal?1:.57;if(u<contact)x=from+(mid-from)*clamp((u-.29)/(contact-.29));else{if(equal||r.damage[j]===0)continue;power=r.damage[j];x=mid+(to-mid)*clamp((u-contact)/(1-contact));}}
   else x=from+(to-from)*clamp((u-.29)/.71);
   c.save();c.globalAlpha=u>1?clamp((1.16-u)/.16):1;
   const length=id==='wave3'?Math.abs(x-(returning?to:from))+20:70;this.projectile(id,x,sy2,returning?-f:f,power,time,returning,length);c.restore();
  }
  if(both&&u>=(equal?1:.57)&&u<1.18){const p=clamp((u-(equal?1:.57))/.4);c.save();c.globalAlpha=1-p;this.spark(mid,sy,20+p*70,'#d4af69',12,p);if(equal){this.ellipse(mid,sy,13+p*18,8+p*12,'#e0dacc33','#b0aea3',2);}c.restore();}
  if(u>=1&&u<1.75){for(let i=0;i<2;i++){const dx=xs[i]+(i===0?35:-35);if(r.damage[i]){this.spark(dx,sy,36,'#c48566',8,u);this.text(`−${r.damage[i]} ♥`,xs[i]-7,y-238-(u-1)*25,24,'#b45f4e');}if(r.gain[i])this.text(`+${r.gain[i]} 气`,xs[i]+(r.damage[i]?55:0),y-222-(u-1)*25,21,'#318e7f');if(r.actions[i]==='quick'&&r.gain[i]===0&&r.damage[i])this.text('新增 +0 · 原有气保留',xs[i],y-203,11,'#977255');}}
  if(this.joke(r,round)==='smoke'&&u>1.2){c.save();c.globalAlpha=clamp((2-u)*2);this.ellipse(mid,sy-(u-1)*15,20,9,'#eeeadb44','#b7b5a8',2);c.restore();}
 }
 portrait(id:SkillId,w:number,h:number,p:number,side:number,t:number){
  const c=this.c,ultra=id==='wave3',k=Math.min(w/390,h/260),cx=w*.45,cy=h*.38;
  c.save();c.translate(cx,cy);c.scale(k*(side===0?1:-1),k);
  // Expressive close-up, with complete shoulder turn and independent hands.
  const turn=ease((p-.42)/.4),headX=-42+turn*12,headY=-18;
  this.path([-65,36,-91,84,-63,159,49,159,70,83,16,34],ultra?'#d9e2df':paper,ink,4);
  if(ultra){this.path([-62,43,-15,66,10,44,46,62,35,143,-3,125,-52,144],'#c7645c',ink,2);this.path([-15,64,3,81,19,62,13,126,-3,118,-17,129],'#e7eddf','',0);this.ellipse(0,85,9,12,'#92ddf4','#576a74',3);}
  else {this.path([-67,40,-32,61,-4,43,22,36,10,65,-22,101,-37,72],paper,ink,3);this.line([-23,98,-1,145],ink,2);this.line([-53,124,21,124],ink,7);}
  if(ultra){
   this.path([headX-36,headY-42,headX-6,headY-58,headX+27,headY-39,headX+33,headY+15,headX+7,headY+38,headX-25,headY+28,headX-38,headY], '#d3dedc',ink,4);
   this.path([headX-6,headY-57,headX+1,headY-73,headX+7,headY-49,headX+3,headY+25],'#f1f3e8','#778a8e',2);
   this.path([headX-30,headY-16,headX-8,headY-10,headX-10,headY+1,headX-29,headY-2],'#f7ffce','#778c8e',2);
   this.path([headX+9,headY-10,headX+29,headY-19,headX+28,headY-4,headX+10,headY+1],'#f7ffce','#778c8e',2);this.line([headX-10,headY+18,headX+12,headY+16],'#687b7f',2);
  }else {
   this.ellipse(headX,headY,37,43,paper,ink,4);this.line([headX-34,headY-17,headX+34,headY-20],'#be665b',9);this.path([headX-34,headY-19,headX-99-Math.sin(t*.006)*8,headY-33,headX-65,headY-9,headX-101,headY+3,headX-32,headY-11],'#b86359','',0);
   this.line([headX-14,headY-3,headX-1,headY+1],ink,4);this.line([headX+9,headY+2,headX+24,headY-5],ink,4);this.ellipse(headX-3,headY+6,3,4,ink,'',0);this.ellipse(headX+18,headY+5,3,4,ink,'',0);this.line([headX+4,headY+23,headX+20,headY+20],ink,3);
   for(let i=0;i<5;i++)this.line([headX-20+i*6,headY+14,headX-19+i*6,headY+20],'#898377',1);
  }
  if(ultra){
   const crossed=ease((p-.16)/.44);const wx=18+crossed*55,wy=86-crossed*22;
   this.line([-55,59,-42+crossed*35,111,wx+18,wy],'#d4dedb',20);this.line([-55,59,-42+crossed*35,111,wx+18,wy],ink,4);
   this.line([35,55,76,103,wx+2,wy-45*crossed],'#d4dedb',20);this.line([35,55,76,103,wx+2,wy-45*crossed],ink,4);
   this.path([wx-5,wy-47,wx+10,wy-46,wx+11,wy-16,wx-4,wy-16],paper,ink,3);
   this.path([wx+7,wy-4,wx+42,wy-7,wx+45,wy+4,wx+8,wy+8],paper,ink,3);
   if(p>.48){c.save();c.globalAlpha=ease((p-.48)/.2);this.spark(wx+12,wy-14,27+(p-.48)*55,'#a2dce9',12,p);this.ellipse(wx+12,wy-14,7,18,'#faffff','#a8dfef',3);c.restore();}
   if(p>.83){c.save();c.globalAlpha=ease((p-.83)/.12);this.projectile('wave3',wx+130,wy-14,1,3,t,false,120);c.restore();}
  }else {
   const push=ease((p-.62)/.35),handX=20+push*72,handY=104-push*25;
   this.line([-67,63,-82+push*60,114,handX,handY-14],ink,12);this.line([30,58,44+push*10,115,handX,handY+14],ink,12);
   this.ellipse(handX,handY-16,17,9,paper,ink,3);this.ellipse(handX,handY+16,17,9,paper,ink,3);for(let k=0;k<3;k++){this.line([handX+5+k*4,handY-22,handX+8+k*4,handY-32],ink,2);this.line([handX+5+k*4,handY+22,handX+8+k*4,handY+29],ink,2);}
   const r=8+ease(p/.7)*26;this.ellipse(handX+18,handY,r,r,'#8ebfeb55','#70accf',3);this.ellipse(handX+20,handY-2,r*.55,r*.55,'#f4ffff','#acd9e4',2);if(p>.58)this.spark(handX+18,handY,r*1.5,'#8cbbd5',8,p);
  }
  c.restore();
 }
 cutin(actions:[SkillId,SkillId],elapsed:number,duration:number,w:number,h:number,reduced=false){
  const c=this.c,entries=actions.map((id,side)=>({id,side})).filter(x=>x.id==='wave2'||x.id==='wave3'),dual=entries.length===2,p=clamp(elapsed/duration);
  c.save();c.fillStyle=paper;c.fillRect(0,0,w,h);
  for(let idx=0;idx<entries.length;idx++){
   const {id,side}=entries[idx],pw=w/entries.length,x=idx*pw;c.save();c.beginPath();c.rect(x,0,pw,h);c.clip();c.translate(x,0);
   c.fillStyle=id==='wave3'?'#eaf1ee':'#f5ece4';c.fillRect(0,0,pw,h);this.speedlines(pw,h,elapsed,reduced,id==='wave3'?'#7198aa33':'#9c7d7033');
   const reveal=ease(p/.14);c.globalAlpha=reveal;this.portrait(id,pw,h,p,side,elapsed);
   c.fillStyle='#faf6edee';c.fillRect(0,h-54,pw,54);this.text(id==='wave2'?'波 动 拳':'斯 派 修 姆 光 线',pw/2,h-27,dual?19:25,id==='wave2'?'#577f9f':'#5b8391');this.text(id==='wave2'?'HA · DO · KEN !':'SPACIUM RAY',pw/2,h-8,dual?11:13,'#89918a');
   this.text(side===0?'你 · 已锁招':'对手 · 已锁招',14,24,13,'#68766f','left');c.restore();
  }
  this.path([1,1,w-1,1,w-1,h-1,1,h-1],undefined,ink,3);if(dual)this.line([w/2+6,0,w/2-6,h],ink,5);
  // An unmistakable cinematic strip; stage time and the HUD remain frozen.
  c.restore();
 }
 victory(w:number,h:number,elapsed:number,winner:0|1|'draw',hp:number,variant:number,reduced=false){
  const c=this.c,p=clamp(elapsed/(winner==='draw'?1800:2800));c.save();c.fillStyle=winner==='draw'?'#f0eee3':'#efe8e3';c.fillRect(0,0,w,h);this.speedlines(w,h,elapsed,reduced,'#5c45692c');
  if(winner==='draw'){this.text('还、还能打！',w/2,38,26,'#7a7e71');for(const s of [0,1]){const x=w*(s?.72:.28);this.ellipse(x,h*.41,24,27,paper,ink,3);this.line([x,h*.41+27,x-6,h*.75],ink,4);this.line([x,h*.54,x-26,h*.66,x-36,h*.58],ink,4);this.line([x,h*.54,x+20,h*.62,x+29,h*.51],ink,4);this.line([x-6,h*.75,x-23,h-25],ink,4);this.line([x-6,h*.75,x+21,h-25],ink,4);this.text('…',x+28,h*.36,19,'#9e9686');}this.text('平局 · 下课铃先响了',w/2,h-6,17,'#93917c');c.restore();return;}
  const sx=Math.min(w/620,h/310),cx=w*.48,base=h-35;c.save();c.translate(cx,base);c.scale(sx,sx);if(winner===1)c.scale(-1,1);
  const settle=ease(p/.25),twist=ease((p-.18)/.36),freeze=p>.68,headX=10+twist*18,neckX=-8+twist*27,hipX=-12-twist*12,legJitter=hp===1&&freeze&&!reduced?Math.sin(elapsed*.035)*2:0;
  // A stepped base, pronounced counter-rotation, then pointing to camera / overhead variation.
  this.line([hipX,-78,-55+legJitter,-38,-83+legJitter,0,-62+legJitter,0],ink,6);this.line([hipX,-78,37-legJitter,-44,68-legJitter,0,88-legJitter,0],ink,6);this.line([hipX,-78,neckX,-169],ink,7);
  this.ellipse(headX,-208-settle*3,30,34,paper,ink,4);this.line([headX+3,-215,headX+15,-212],ink,4);this.line([headX+21,-213,headX+27,-219],ink,3);this.ellipse(headX+13,-207,2.5,3,ink,'',0);this.line([headX+10,-195,headX+25,-198],ink,2.5);
  const wristX=variant%2?89:112,wristY=variant%2?-239:-177;this.line([neckX,-164,48+twist*22,-139-twist*20,25+(wristX-25)*twist,-103+(wristY+103)*twist],ink,6);this.ellipse(25+(wristX-25)*twist,-103+(wristY+103)*twist,8,7,paper,ink,3);this.line([25+(wristX-25)*twist,-108+(wristY+103)*twist,42+(wristX-18)*twist,-119+(wristY+103)*twist],ink,4);
  this.line([neckX,-164,-54,-139,-22+twist*8,-85-twist*22],ink,6);this.line([-28,-109,-13,-110],ink,5);
  // Cross-hatching is drawn with the body rather than pasted as a screen label.
  for(let k=0;k<7;k++)this.line([headX-19+k*4,-215+k%2*4,headX-13+k*4,-201+k%2*4],'#5d5666',1.3);for(let k=0;k<6;k++)this.line([-12-k*2,-147+k*8,5-k*2,-150+k*8],'#665967',1.5);
  if(hp===1&&freeze){this.text('腿有点抖…',106,-17,12,'#998a78');}c.restore();
  if(p>.25){c.save();c.globalAlpha=ease((p-.25)/.15);this.text('ゴ ゴ ゴ',w*.19,h*.31,Math.min(33,h*.13),'#8b7593');this.text('ゴ ゴ',w*.84,h*.68,Math.min(37,h*.14),'#8b7593');c.restore();}
  this.text(freeze?'下课之前，我是最强！':'这一招……收得漂亮。',w/2,h-4,Math.min(21,w*.034),'#796781');this.text(winner===0?'胜 · 操场上的奇妙姿势':'对手胜 · 下次轮到你',w-15,23,14,'#917b88','right');c.restore();
 }
}

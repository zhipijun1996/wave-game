import './style.css';
import {ALL,BASIC,SKILLS,CONFIG,initial,reason,type SkillId,type State} from './rules';
import {BattleClock,TIMING} from './clock';
import {chooseAI,random} from './ai';
import {Renderer,type ActorStyle} from './renderer';
import {AudioBus} from './audio';
import {load,persist,clearSave,type Save} from './storage';
import {STORY,SKINS,learned} from './content';
import {platform} from './platform';
import {StreakRun,advancedUnlocked,type MatchMode} from './session';
const app=document.querySelector<HTMLDivElement>('#app')!,modalRoot=document.querySelector<HTMLDivElement>('#modal-root')!;
const loaded=load();let save:Save=loaded.save;const audio=new AudioBus();audio.configure(save.settings);
let screen='home',renderer:Renderer|null=null,battle:BattleClock|null=null;
let mode:'basic'|'advanced'|'story'|'tutorial'='basic',difficulty='normal',health=3,level=0,seed=1,maxHP=3;
let preview:SkillId|null=null,skinPreview=save.skin,finishAt=0,endShown=false,lastFrame=performance.now(),pausedVisualTime=0;
let tutorialStep=0,tutorialComplete=false,afterTutorial=()=>openSetup('basic'),toastTimer=0;
const streak=new StreakRun();let storyFirstWin=false;
let battleChoiceOverride:((s:State)=>SkillId)|null=null;
const q=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s);
function toast(msg:string){const e=q('#toast')!;e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>e.classList.remove('show'),2800);}
function saveNow(){if(!persist(save))toast('浏览器未能保存进度，本次仍可正常游玩。');void platform.backup(JSON.stringify(save));}
function icon(id:SkillId){return `<img src="./assets/icons/${id}.svg" alt="" draggable="false">`;}
function header(sub='',back=false){return `<header><button class="brand" data-action="home" aria-label="拍拍波首页"><span class="brand-mark">波</span>拍拍波${!back?'<small>放学后的操场</small>':''}</button>${back?`<button class="back" data-action="home">← 返回操场</button>`:`<nav class="toplinks"><button class="icon-button" data-action="skins" aria-label="皮肤">♧ <span>皮肤</span></button><button class="icon-button" data-action="settings" aria-label="设置">☷ <span>设置</span></button></nav>`}</header>${sub}`;}
function footer(){return '<footer class="site-foot"><span>一双手，一口气，<b>一整个童年。</b></span><span class="foot-detail">PAPER PLAYGROUND CLUB · 2026</span><span>本地单机 · 公平暗选</span></footer>';}
function mountCanvas(){renderer=new Renderer(q<HTMLCanvasElement>('canvas')!);}
function closeModal(){modalRoot.innerHTML='';}
let modalReturnFocus:HTMLElement|null=null;
function modal(title:string,body:string,closeAction='close',wide=false){
 modalReturnFocus=document.activeElement as HTMLElement;
 modalRoot.innerHTML=`<div class="modal-shade"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${title}"><div class="modal-top"><h2>${title}</h2>${closeAction?`<button class="modal-close" data-action="${closeAction}" aria-label="关闭">×</button>`:''}</div>${body}</section></div>`;
 requestAnimationFrame(()=>modalRoot.querySelector<HTMLElement>('button,input,select')?.focus());
}
function goHome(){streak.reset();battle=null;renderer=null;screen='home';preview=null;endShown=false;closeModal();if(audio.ctx&&!document.hidden)void audio.unlock();
 app.innerHTML=header()+`<main class="home"><section class="home-copy"><div class="eyebrow">操场见，老朋友</div><h1>拍<span class="title-wave">拍波</span></h1><p class="home-subtitle">拍拍手，攒一口气。</p><div class="home-stage"><canvas aria-label="两名火柴人在操场上轻轻呼吸待机"></canvas><span class="versus">vs.</span><span class="doodle-caption">放学了，再来一局！</span></div><div class="home-bottom"><span>跟着拍手</span><i class="dot"></i><span>亮框再点</span><i class="dot"></i><span>一起出手</span></div></section><section class="menu"><span class="menu-note">今天，学点新招 ↙</span><button class="mode-card primary" data-action="story"><span class="mode-icon">☀</span><div><h2>故事模式</h2><p>从第一颗小波，到操场高手 · ${save.completed}/8</p></div><span class="arrow">↗</span></button><button class="mode-card" data-action="basic"><span class="mode-icon">✌</span><div><h2>开始游戏</h2><p>三招过招 · 最高连胜 ${save.bestStreaks.basic} 场</p></div><span class="arrow">→</span></button><button class="mode-card advanced ${advancedUnlocked(save.completed)?'':'locked'}" data-action="advanced" aria-disabled="${!advancedUnlocked(save.completed)}"><span class="mode-icon">${advancedUnlocked(save.completed)?'✧':'锁'}</span><div><h2>进阶游戏</h2><p>${advancedUnlocked(save.completed)?`十招对决 · 最高连胜 ${save.bestStreaks.advanced} 场`:`通关故事解锁 · 当前 ${save.completed}/8`}</p></div><span class="arrow">→</span></button><p class="mode-foot"><span class="leaf">♧</span> 不用登录，没有等待，随时开一局。</p></section></main>`+footer();mountCanvas();
}
function showStory(){streak.reset();screen='story';battle=null;closeModal();renderer=null;
 app.innerHTML=header('',true)+`<main><div class="page-heading"><span class="eyebrow">放学后的八次相遇</span><h1>操场上的小小高手</h1><p>和同学过过招，把新本领带回家。</p></div><div class="story-grid">${STORY.map((s,i)=>`<button class="story-card ${i>save.completed?'locked':''}" data-level="${i}" aria-label="第${i+1}关 ${s.name}${i>save.completed?' 未解锁':''}"><span class="number">CHAPTER 0${i+1}</span>${i<save.completed?'<span class="complete-mark">✓ 已过关</span>':i>save.completed?'<span class="complete-mark">锁</span>':''}<h2>${s.name}</h2><p>${s.title}</p><div class="reward">${s.skill?`新招 · ${SKILLS[s.skill].name}`:'毕业战 · 操场传说'}</div></button>`).join('')}</div><p class="story-summary">已学会 ${learned(save.completed).length} / 10 招 · 每场重新恢复 3 颗心与 0 气 · 已解锁关卡可重玩</p></main>`+footer();
}
function storyIntro(i:number){if(i>save.completed){toast('先和前面的同学过过招吧。');return;}level=i;const s=STORY[i];modal(`第 ${i+1} 关 · ${s.name}`,`<div class="eyebrow">${s.title}</div><p>“${s.intro}”</p><div class="intro-card"><div class="skill-feature">${s.skill?icon(s.skill):'<span class="mode-icon">✧</span>'}<div><h3>${s.skill?SKILLS[s.skill].name:'十招毕业战'}</h3><p>${s.hint}</p></div></div></div><div class="button-row"><button class="secondary-button" data-action="close">等一下</button><button class="primary-button" data-action="start-story">拍拍手，开始！</button></div>`);}
function speedOptions(detail=false){return TIMING.speeds.map(x=>`<option value="${x.scale}" ${save.settings.speed===x.scale?'selected':''}>${x.name}${detail?` · 每拍 ${Number((.9*x.scale).toFixed(2))} 秒 / 窗口 ${Math.round(900*x.scale)}ms`:''}</option>`).join('');}
function lockedAdvanced(){modal('进阶游戏尚未解锁',`<p>通关故事模式的全部8关，成为操场高手，就能解锁十招进阶对战。</p><div class="intro-card"><p>当前故事进度：${save.completed} / 8</p></div><div class="button-row"><button class="secondary-button" data-action="close">知道了</button><button class="primary-button" data-action="story">去挑战故事</button></div>`);}
function startConfigured(kind:MatchMode){if(kind==='advanced'&&!advancedUnlocked(save.completed)){lockedAdvanced();return;}const enabled=q<HTMLSelectElement>('#battle-format')?.value==='streak';readSetup();streak.begin(kind,enabled);startBattle(kind);}
function openSetup(kind:'basic'|'advanced'){
 if(kind==='advanced'&&!advancedUnlocked(save.completed)){lockedAdvanced();return;}
 const begin=()=>modal(kind==='basic'?'来场轻松的三招对战':'十招齐开，尽管出手',`<p>${kind==='basic'?'经典三招，简单却总有新花样。':'故事已通关，十招解锁。双方固定5颗心。'}</p><label class="field">对战形式<select id="battle-format"><option value="single">单局</option><option value="streak">连战 · 胜后满血</option></select></label><p class="streak-description">连战最高 ${save.bestStreaks[kind]} 场 · 败或平结束本轮。每胜后满血、气归零继续。</p>${kind==='basic'?'<label class="field">这次打几颗心？<select id="health"><option value="3">3 血 · 试探与反击</option><option value="1">1 血 · 一招定胜负</option></select></label>':''}<label class="field">对手难度<select id="difficulty"><option value="easy">简单</option><option value="normal" selected>普通</option><option value="hard">困难</option></select></label><label class="field">对战节奏<select id="setup-speed">${speedOptions(true)}</select></label><div class="button-row"><button class="secondary-button" data-action="tutorial">再学一下</button><button class="primary-button" data-action="start-${kind}">拍拍手，开始！</button></div>`);
 if(!save.tutorial){afterTutorial=begin;openTutorialIntro();}else begin();
}
function openTutorialIntro(){modal('先把手掌拍响',`<p>跟着「拍、拍、出」：前两拍只跟拍，第三拍「出」时点击立即发动。标准容错为第三拍前后各450ms，稍早会等到第三拍，稍晚也能接上。</p><div class="intro-card"><p>① 充气攒能量　② 小波打对手<br>③ 防御挡小波　④ 错过点击窗口会空过</p></div><p style="margin-top:14px;font-size:12px">教学使用固定示范动作。正式对战中，电脑在你选招前已经独立暗选。</p><div class="button-row"><button class="secondary-button" data-action="skip-tutorial">跳过教学</button><button class="primary-button" data-action="start-tutorial">跟着做一遍</button></div>`);}
function startTutorial(){tutorialStep=0;tutorialComplete=false;startBattle('tutorial');}
function playerStyle(id=save.skin):ActorStyle{const s=SKINS.find(x=>x.id===id)||SKINS[0];return {skin:s.id,accent:s.color};}
function enemyStyle():ActorStyle {const s=STORY[level];return mode==='story'?{enemy:level,accent:s.color}:{enemy:1,accent:'#cf805d'};}
function startBattle(kind:typeof mode,custom?:State,customChoice?:((s:State)=>SkillId),fixedSeed?:number){
 if(kind==='advanced'&&!advancedUnlocked(save.completed)){lockedAdvanced();return;}
 if(kind!=='basic'&&kind!=='advanced')streak.reset();else if(streak.enabled&&(!streak.running||streak.mode!==kind))streak.begin(kind,true);
 streak.nextMatch();storyFirstWin=false;
 closeModal();mode=kind;screen='battle';preview=null;endShown=false;finishAt=0;maxHP=kind==='advanced'?5:kind==='basic'?health:3;
 const skills=kind==='basic'||kind==='tutorial'?BASIC:kind==='story'?learned(save.completed):ALL;
 const enemies=kind==='story'?Array.from(new Set([...skills,...learned(level+1)])):skills;
 seed=fixedSeed??crypto.getRandomValues(new Uint32Array(1))[0];const rng=random(seed);battle=null;battleChoiceOverride=customChoice||null;
 const ai=(s:State)=>customChoice?customChoice(s):kind==='tutorial'?(tutorialStep===2?'wave1':'charge'):chooseAI(s,1,rng,difficulty,battle?.history||[],kind==='story'?STORY[level].personality:'mixed');
 battle=new BattleClock(custom||initial(maxHP,skills,enemies),ai,save.settings.speed);lastFrame=performance.now();pausedVisualTime=0;
 renderBattle();battle.onEvent=battleEvent;audio.play('clap1');syncBattle();
}
function renderBattle(){const b=battle!;
 app.innerHTML=`<header class="battle-header"><button class="brand" data-action="leave"><span class="brand-mark">波</span>拍拍波</button><span class="battle-title">${mode==='basic'?'经典三招':mode==='advanced'?'进阶 · 十招对决':mode==='tutorial'?'教学示范 · 固定动作':`故事 ${level+1}/8 · ${STORY[level].title}`}</span><button class="icon-button" data-action="pause" aria-label="暂停">Ⅱ</button></header>${streak.enabled?`<div class="streak-banner" id="streak-banner">连战 · 当前 ${streak.wins} 连胜　最高 ${save.bestStreaks[streak.mode]} 连胜</div>`:''}<section class="hud"><div class="fighter-panel" id="player-hud"></div><div class="round-counter">第 <strong id="round-number">1</strong> 回合<div class="round-cap">60 回合上限</div></div><div class="fighter-panel enemy" id="enemy-hud"></div></section>${mode==='tutorial'?'<div class="tutorial-callout" id="tutorial-task"></div>':''}<main class="battle-body"><div class="stage-wrap"><div class="rhythm" aria-label="拍、拍、出、收"><span class="beat live">拍</span><span class="beat-line"></span><span class="beat">拍</span><span class="beat-line"></span><span class="beat out">出</span><span class="beat-line"></span><span class="beat">收</span></div><canvas class="stage-canvas" aria-label="双方火柴人对战"></canvas><div class="stage-result" id="stage-result" aria-live="polite"></div></div><section class="controls"><div class="selection-line"><span class="selection-status"><i class="status-dot"></i><strong id="selection-label"></strong></span><div class="countdown"><i></i></div></div><div class="skill-grid ${mode==='basic'||mode==='tutorial'?'basic':''}">${(mode==='basic'||mode==='tutorial'?BASIC:ALL).map(id=>`<button class="skill" data-skill="${id}" aria-label="${SKILLS[id].name}：${SKILLS[id].description}">${icon(id)}<span class="skill-name">${SKILLS[id].name}</span><span class="skill-value"></span></button>`).join('')}</div><div class="deck-foot"><span>${mode==='basic'||mode==='tutorial'?'第三拍点击 · 错过就空过':'快充受击不加气，下回合禁充'}</span><button class="text-button" data-action="skill-guide">招式小抄 ↗</button></div></section></main><div class="skill-inspector" id="skill-info"></div><div class="battle-help">先听两拍，第三拍点击；错过窗口就空过。<button class="opponent-skills" data-action="enemy-skills">对手已学招式 ↗</button></div>`;mountCanvas();syncBattle();
}
function hudHTML(side:number){const b=battle!,p=b.committed?b.state.players[side]:b.startState.players[side];return `<div class="fighter-name">${side===0?'你':mode==='story'?STORY[level].name:mode==='tutorial'?'教学搭档':difficulty==='easy'?'小伙伴':difficulty==='hard'?'操场老手':'练习搭档'}<small>${side===0?'PLAYER':'同学'}</small></div><div class="hearts" aria-label="${p.hp} 颗心">${Array.from({length:maxHP},(_,i)=>`<span class="heart ${i>=p.hp?'empty':''}">♥</span>`).join('')}</div><div class="energy"><span>气 <b>${p.energy}</b><span style="opacity:.55"> / ${CONFIG.energyCap}</span></span><span class="qi-dots" aria-hidden="true">${Array.from({length:CONFIG.energyCap},(_,i)=>`<i class="qi-dot ${i<p.energy?'on':''}"></i>`).join('')}</span></div><div class="blocked-tag">${p.blocked?`${b.committed?'下回合':'本回合'}禁充 · 双充暂停`:p.energy===CONFIG.energyCap?'气已满':''}</div>`;}
function syncBattle(){const b=battle;if(!b||screen!=='battle')return;
 q('#player-hud')!.innerHTML=hudHTML(0);q('#enemy-hud')!.innerHTML=hudHTML(1);q('#round-number')!.textContent=String(b.startState.round);
 const p=b.startState.players[0];
 for(const btn of document.querySelectorAll<HTMLButtonElement>('[data-skill]')){const id=btn.dataset.skill as SkillId,s=SKILLS[id],why=reason(p,id);btn.classList.toggle('unavailable',!!why);btn.classList.toggle('selected',b.selected===id);btn.classList.toggle('timing-closed',!b.inputOpen);btn.setAttribute('aria-pressed',String(b.selected===id));btn.setAttribute('aria-disabled',String(!!why||!b.inputOpen));btn.title=s.description+(why?`（${why}）`:'');
 const gain=Math.min(s.gain,CONFIG.energyCap-p.energy);btn.querySelector('.skill-value')!.textContent=why|| (s.kind==='charge'?id==='quick'?`未受击 +${gain}气`:`${gain===0?'气已满 · ':''}+${gain} 气`:`${s.cost} 气`);}
 q('.controls')!.classList.toggle('rhythm-open',b.inputOpen);q('.controls')!.classList.toggle('rhythm-missed',b.missed);
 q('#selection-label')!.textContent=b.result?(b.selected?'已出招，等待下一拍':'错过节拍 · 空过'):b.locked?(b.selected?`✓ ${SKILLS[b.selected].name}已锁定`:'错过节拍 · 本回合空过'):b.inputOpen?(b.selected?`✓ ${SKILLS[b.selected].name}已准备，第三拍发动`:b.local<TIMING.thirdBeat?'准备第三拍 · 容错窗口已开':`出！现在点击 · ${Math.round((b.inputDeadline-b.local)*b.scale)}ms`):b.selected?`✓ 保留${SKILLS[b.selected].name}，等拍点`:'跟着拍、拍，第三拍点击';
 if(!b.result)q('#stage-result')!.textContent=b.missed?'错过窗口，这回合什么也不做':b.inputOpen?'第三拍「出」时点击！':b.locked?'选招结束，等待一起出手':'拍、拍……准备第三拍';
 if(mode==='tutorial')q('#tutorial-task')!.textContent=['第 1 步：跟着拍、拍，第三拍点「充气」。','第 2 步：第三拍点「小波」，把气推出去。','第 3 步：第三拍点「防御」，挡住小波。','第 4 步：这回不点，错过窗口后会空过。','做得好！你已经学会啦。'][tutorialStep];
}
function advanceWall(now=performance.now()){if(battle&&!document.hidden&&!battle.paused&&!battle.finished)battle.advance(Math.max(0,now-lastFrame));lastFrame=now;}
function selectSkill(id:SkillId){advanceWall();const b=battle;if(!b)return;const why=reason(b.startState.players[0],id);q('#skill-info')!.textContent=SKILLS[id].description+(why?`（${why}）`:'');if(b.select(id)){audio.play('select');syncBattle();}else if(why)toast(`${SKILLS[id].name}：${why}`);else if(b.inputReason)toast(b.inputReason);}
function battleEvent(type:string){const b=battle!;
 if(type==='start'||type==='restart-beat'){audio.play('clap1');q('#stage-result')!.textContent='';syncBattle();}
 if(type==='clap')audio.play('clap2');
 if(type==='window-open'||type==='window-close'){if(type==='window-close'&&b.missed)audio.play('interrupted');syncBattle();}
 if(type==='third-beat'){audio.play('reveal');syncBattle();}
 if(type==='reveal'){const a=b.result!.actions;for(const id of new Set(a)){const s=SKILLS[id];if(s.kind==='charge'||s.kind==='attack')audio.play(id==='charge'?'charge':id);}syncBattle();}
 if(type==='fx'&&b.result?.events.some(e=>e.type==='reflect'))audio.play('reflect');
 if(type==='commit'){
  const r=b.result!,priority=['interrupted','reflect','partial','cancel','break','block','hit','miss','charge'];const e=[...r.events].sort((a,b)=>priority.indexOf(a.type)-priority.indexOf(b.type))[0];
  const labels:Record<string,string>={interrupted:'快充被打断',reflect:'反弹成功',partial:`余波命中 · ${Math.max(...r.damage)} 点伤害`,cancel:'两波抵消',break:'破防！',block:'挡住了',hit:'命中！',miss:'错过节拍，本回合空过',charge:r.gain.some(x=>x>0)?'气在掌心，慢慢聚起':'稳住，再看下一招'};
  q('#stage-result')!.textContent=e?labels[e.type]:'都在等下一次机会';q('#stage-result')!.classList.toggle('impact',r.damage.some(x=>x>0));if(e&&e.type!=='charge'&&e.type!=='reflect'&&e.type!=='miss')audio.play(e.type==='hit'?'hit':e.type);
  if(r.damage.some(x=>x>0)&&save.settings.shake&&!save.settings.reduced){q('.stage-wrap')!.classList.remove('shake');void (q('.stage-wrap') as HTMLElement).offsetWidth;q('.stage-wrap')!.classList.add('shake');}
  if(mode==='tutorial'){const expect:((SkillId|null))[]=['charge','wave1','guard1',null];if((tutorialStep===3&&b.selected===null)||(tutorialStep<3&&r.actions[0]===expect[tutorialStep]&&b.selected===expect[tutorialStep]))tutorialStep++;if(tutorialStep===4){tutorialComplete=true;save.tutorial=true;saveNow();} }
  syncBattle();
 }
 if(type==='finish'){
  if(mode==='story'&&b.result!.winner===0&&level>=save.completed){save.completed=Math.min(8,level+1);storyFirstWin=true;saveNow();}
  if(streak.settle(b.result!.winner)){if(streak.wins>save.bestStreaks[streak.mode]){save.bestStreaks[streak.mode]=streak.wins;saveNow();}if(q('#streak-banner'))q('#streak-banner')!.textContent=`${streak.running?'连战继续':'本轮连战结束'} · ${streak.wins} 连胜　最高 ${save.bestStreaks[streak.mode]} 连胜`;}
  finishAt=performance.now();audio.play(b.result!.winner===0?'win':b.result!.winner==='draw'?'cancel':'lose');}
 if(type==='start'&&mode==='tutorial'&&tutorialComplete){b.pause();modal('学会啦，去过过招吧',`<p>你已经亲手完成了充气、小波、防御，也看到了错过窗口时空过。</p><p>正式对战的电脑会在第一拍前独立暗选，别让它猜透你！</p><button class="primary-button wide-button" data-action="tutorial-finish">去操场试试</button>`,'');}
}
function showResult(){const b=battle!;if(endShown)return;endShown=true;const win=b.result!.winner===0,draw=b.result!.winner==='draw';
 let reward='',first=false;
 if(mode==='story'&&win){first=storyFirstWin;if(first)audio.play('unlock');const s=STORY[level];reward=`<p style="margin-top:15px">“${s.outro}”</p>${first?`<div class="reward-card">${s.skill?icon(s.skill):'<span class="mode-icon">♧</span>'}<div><b>${s.skill?`学会了「${SKILLS[s.skill].name}」`:'毕业啦！操场传说'}</b><p>${level===1?'同时解锁 · 追风发带':level===4?'同时解锁 · 猫耳同学':level===7?'已解锁进阶游戏与最终皮肤 · 操场传说':s.skill?SKILLS[s.skill].description:'八次相遇，十招在手。随时回来过招！'}</p></div></div>`:'<p style="margin-top:12px">重温的招式，一样有新收获。</p>'}`;}
 modal('',`<div class="result-heading"><div class="result-seal">${win?'胜':draw?'和':'再来'}</div><h2>${win?'这一局，漂亮！':draw?'不分高下！':'差一点，再试试！'}</h2><p>${b.startState.round} 回合 · ${win?'拍拍手，下次再见。':draw?'60 回合内都站到了最后。':'每一次猜招，都在积攒经验。'}</p>${reward}${streak.enabled?`<div class="reward-card streak-reward"><div><b>${win?`达成 ${streak.wins} 连胜！`:`本轮 ${streak.wins} 连胜`}</b><p>最高纪录 ${save.bestStreaks[streak.mode]} 场 · ${win?'下一场双方满血、气归零':'败或平结束连战，最高纪录保留'}</p></div></div>`:''}</div><div class="button-row"><button class="secondary-button" data-action="${mode==='story'?'story':'home'}">${mode==='story'?'关卡地图':'返回操场'}</button><button class="primary-button" data-action="${streak.enabled&&win?'next-streak':mode==='story'&&win&&level<7?'next-level':'rematch'}">${streak.enabled?(win?'满血继续':'重新挑战连战'):mode==='story'&&win&&level<7?'去见下一位同学':'再来一局'}</button></div>${mode==='story'&&win&&level===7?'<button class="primary-button wide-button" data-action="advanced">进阶游戏已解锁 · 去过招</button><button class="secondary-button wide-button" data-action="skins">看看我的毕业皮肤</button>':''}`,'');
}
function pause(){if(!battle||battle.finished)return;advanceWall();battle.pause();pausedVisualTime=performance.now();audio.stop();pauseMenu();}
function pauseMenu(){modal('歇一口气',`<p>回合已暂停。还没亮招时，继续会从这一回合的第一拍重新开始，保留刚才的选择。</p><label class="field">下一完整回合的节奏<select id="pause-speed">${speedOptions(true)}</select></label><div class="button-row"><button class="secondary-button" data-action="battle-settings">设置</button><button class="primary-button" data-action="resume">继续</button></div><button class="text-button wide-button" data-action="confirm-leave">结束本场，返回操场</button>`,'resume');}
function resume(){closeModal();void audio.unlock();lastFrame=performance.now();battle?.resume();syncBattle();}
function settings(fromBattle=false){if(fromBattle&&battle&&!battle.paused)pause();modal('把操场调成你的样子',`<label class="field">背景音乐<input id="music" type="range" min="0" max="1" step="0.05" value="${save.settings.music}" aria-label="音乐音量"></label><label class="field">音效音量<input id="sfx" type="range" min="0" max="1" step="0.05" value="${save.settings.sfx}" aria-label="音效音量"></label><label class="field">屏幕震动<input id="shake" type="checkbox" ${save.settings.shake?'checked':''}></label><label class="field">减弱动效<input id="reduced" type="checkbox" ${save.settings.reduced?'checked':''}></label><label class="field"><span>对战节奏<small>${fromBattle?'从下一完整回合生效':'下次开局使用'}</small></span><select id="settings-speed">${speedOptions(false)}</select></label><hr class="setting-divider"><button class="secondary-button wide-button" data-action="rules">规则说明</button><button class="danger-button wide-button" data-action="reset-confirm">重置故事与设置</button><p style="font-size:11px;margin-top:12px;text-align:center">本地自动保存 · 不需要网络或账号</p>`,fromBattle?'pause-menu':'close');}
function guide(enemy=false){const wasPaused=!!battle?.paused;if(battle&&!battle.finished&&!wasPaused){advanceWall();battle.pause();audio.stop();}const ids=enemy?battle!.startState.players[1].skills:ALL;modal(enemy?'对手会这些招式':'招式小抄',`<p style="font-size:12px">快充受击不加气，成功或失败后都禁充一回合。波对撞按伤害相减。</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">${ids.map(id=>`<div class="intro-card" style="margin:0;padding:12px"><div class="skill-feature" style="gap:7px">${icon(id)}<h3 style="font-size:15px">${SKILLS[id].name}</h3></div><p style="font-size:12px">${SKILLS[id].description}</p></div>`).join('')}</div><button class="primary-button wide-button" data-action="${battle&&!battle.finished?'resume':'close'}">记住了</button>`,battle&&!battle.finished?'resume':'close',true);}
function showRules(){modal('两次拍手，一起出招',`<ol class="rule-list"><li>跟着前两次拍手，第三拍点击；标准窗口围绕第三拍前后各450ms，共900ms；慢速1350ms、快档630ms。第三拍点击立即同时发动，稍早输入等待第三拍，稍晚输入立即发动。</li><li>充气加 1 气，受击仍加气。快充未受击加 2 气，受击加 0 气；下回合两种充气都禁用。</li><li>小 / 中 / 大波花 1 / 3 / 5 气，伤害 1 / 2 / 3。波相撞按伤害差扣血；同伤害完全抵消。</li><li>防御按等级完全挡住来波；强度超出覆盖时承受完整伤害。反弹成功时，原攻击者承受原波伤害，只反送一次。</li><li>错过窗口或没有有效点击，本回合空过：不加气、不扣气、不防御。气上限 9，满气普通充气仍可选但加 0 气。</li><li>一方血量归零则结束；60 回合仍存活则和局。连战胜利后满血、气归零，败或平结束本轮；普通与进阶分别保存最高连胜。进阶需故事8关通关解锁。</li><li>电脑只看公开状态与揭晓历史，在你选招前封存；双方0气时，若能充气，必选普通充气或快充。</li></ol><button class="primary-button wide-button" data-action="${battle?.paused?'pause-menu':'settings'}">明白了</button>`,battle?.paused?'pause-menu':'settings');}
function showSkins(){streak.reset();battle=null;screen='skins';preview=null;skinPreview=save.skin;closeModal();app.innerHTML=header('',true)+`<main><div class="page-heading"><span class="eyebrow">换个样子，快乐不变</span><h1>我的操场衣橱</h1><p>外观只装点心情，招式与力量始终一样。</p></div><div class="skin-layout"><section class="skin-preview"><canvas aria-label="皮肤与手势实时预览"></canvas><div class="preview-actions">${(['charge','wave1','guard1','reflect1'] as SkillId[]).map(id=>`<button class="chip" data-preview="${id}">${SKILLS[id].name}</button>`).join('')}</div></section><div><div class="skin-cards">${SKINS.map(s=>`<button class="skin-card ${s.id===save.skin?'active':''}" data-skin="${s.id}"><span class="skin-tag">${s.id===save.skin?'✓ 已装备':save.completed>=s.at?'可装备':`第 ${s.at} 关首胜解锁`}</span><h2>${s.name}</h2><p>${s.desc}</p></button>`).join('')}</div><div class="skin-status" id="skin-status">点选皮肤，立即预览；已解锁的外观会自动装备。</div></div></div></main>`;mountCanvas();}
function readSetup(){difficulty=q<HTMLSelectElement>('#difficulty')?.value||'normal';health=Number(q<HTMLSelectElement>('#health')?.value||3);save.settings.speed=Number(q<HTMLSelectElement>('#setup-speed')?.value||save.settings.speed);saveNow();}
const actions:Record<string,()=>void>={
 home:goHome,story:showStory,skins:showSkins,basic:()=>openSetup('basic'),advanced:()=>openSetup('advanced'),settings:()=>settings(!!battle?.paused),close:()=>{closeModal();modalReturnFocus?.focus();},
 'start-basic':()=>startConfigured('basic'),'start-advanced':()=>startConfigured('advanced'),'start-story':()=>{difficulty=level<2?'easy':level<6?'normal':'hard';startBattle('story');},
 tutorial:()=>{afterTutorial=()=>openSetup('basic');openTutorialIntro();},'start-tutorial':startTutorial,'skip-tutorial':()=>{save.tutorial=true;saveNow();afterTutorial();},'tutorial-finish':()=>{battle=null;afterTutorial();},
 pause,'pause-menu':pauseMenu,resume,'battle-settings':()=>settings(true),rules:showRules,'skill-guide':()=>guide(),'enemy-skills':()=>guide(true),
 leave:()=>{if(battle&&!battle.finished){pause();}else goHome();},'confirm-leave':()=>modal('这一局先到这里？','<p>离开会结束本场与当前连战；最高连胜、已学会的招式和皮肤会保留。</p><div class="button-row"><button class="secondary-button" data-action="pause-menu">再想想</button><button class="primary-button" data-action="home">返回操场</button></div>','pause-menu'),
 'next-streak':()=>{if(streak.enabled&&streak.running&&battle?.finished&&battle.result?.winner===0)startBattle(streak.mode);},
 rematch:()=>{if(mode==='tutorial'){startTutorial();return;}if(streak.enabled)streak.begin(streak.mode,true);startBattle(mode);},'next-level':()=>{closeModal();level++;storyIntro(level);},
 'reset-confirm':()=>modal('要把操场清空吗？','<p>这会清除故事进度、最高连胜、皮肤和设置。这个决定无法撤销。</p><div class="button-row"><button class="secondary-button" data-action="settings">保留进度</button><button class="danger-button" data-action="reset-do">确认重置全部</button></div>','settings'),
 'reset-do':()=>{clearSave();save=load().save;audio.configure(save.settings);goHome();toast('已重置，可以重新认识操场上的朋友。');}
};
document.addEventListener('click',ev=>{
 const target=(ev.target as Element).closest<HTMLElement>('button');if(!target)return;
 if(target.dataset.action){audio.play('select');actions[target.dataset.action]?.();return;}
 if(target.dataset.skill){selectSkill(target.dataset.skill as SkillId);return;}
 if(target.dataset.level!==undefined){storyIntro(Number(target.dataset.level));return;}
 if(target.dataset.preview){preview=target.dataset.preview as SkillId;document.querySelectorAll('[data-preview]').forEach(e=>e.classList.toggle('active',(e as HTMLElement).dataset.preview===preview));return;}
 if(target.dataset.skin){const s=SKINS.find(s=>s.id===target.dataset.skin)!;skinPreview=s.id;if(save.completed>=s.at){save.skin=s.id;saveNow();document.querySelectorAll<HTMLElement>('[data-skin]').forEach(e=>{e.classList.toggle('active',e.dataset.skin===s.id);const sk=SKINS.find(s=>s.id===e.dataset.skin)!;e.querySelector('.skin-tag')!.textContent=sk.id===save.skin?'✓ 已装备':save.completed>=sk.at?'可装备':`第 ${sk.at} 关首胜解锁`;});q('#skin-status')!.textContent=`已装备「${s.name}」。一起去操场吧。`;}else{q('#skin-status')!.textContent=`正在预览「${s.name}」 · 首次通过第 ${s.at} 关解锁。`;}}
});
document.addEventListener('input',ev=>{const t=ev.target as HTMLInputElement|HTMLSelectElement;
 if(['music','sfx'].includes(t.id)){save.settings[t.id as 'music'|'sfx']=Number(t.value);audio.configure(save.settings);saveNow();}
 if(t.id==='shake'||t.id==='reduced'){save.settings[t.id]=(t as HTMLInputElement).checked;saveNow();}
 if(['settings-speed','pause-speed'].includes(t.id)){save.settings.speed=Number(t.value);if(battle)battle.nextScale=save.settings.speed;saveNow();}
});
document.addEventListener('pointerdown',()=>{void audio.unlock();},{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(battle&&!battle.finished&&!battle.paused)pause();audio.stop();}else{lastFrame=performance.now();if(!battle)void audio.unlock();}});
window.addEventListener('keydown',ev=>{
 if(modalRoot.firstChild){if(ev.key==='Tab'){const f=Array.from(modalRoot.querySelectorAll<HTMLElement>('button,input,select'));if(!f.length)return;const index=f.indexOf(document.activeElement as HTMLElement);if(ev.shiftKey&&index<=0){f[f.length-1].focus();ev.preventDefault();}else if(!ev.shiftKey&&index===f.length-1){f[0].focus();ev.preventDefault();}}return;}
 if(screen==='battle'){if(ev.code==='Space'){ev.preventDefault();pause();return;}const index='1234567890'.indexOf(ev.key);const ids=mode==='basic'||mode==='tutorial'?BASIC:ALL;if(index>=0&&ids[index])selectSkill(ids[index]);}
});
const frameTimes:number[]=[];
function frame(now:number){const elapsed=now-lastFrame;advanceWall(now);if(elapsed<200)frameTimes.push(elapsed);if(frameTimes.length>600)frameTimes.shift();
 if(renderer){if(screen==='battle'&&battle){const b=battle;const visualTime=b.paused?pausedVisualTime:now;renderer.draw({local:b.visualLocal,time:visualTime,result:b.result,finished:b.finished,finishTime:finishAt?now-finishAt:0,styles:[playerStyle(),enemyStyle()],reduced:save.settings.reduced});
 const beat=b.local<900?0:b.local<1800?1:b.local<2700?2:3;document.querySelectorAll('.beat').forEach((e,i)=>e.classList.toggle('live',i===beat));q<HTMLElement>('.countdown')?.style.setProperty('--progress',String(b.inputOpen?Math.max(0,(b.inputDeadline-b.local)/900):0));
 if(b.inputOpen&&!b.selected)q('#selection-label')!.textContent=b.local<TIMING.thirdBeat?'准备第三拍 · 容错窗口已开':`出！现在点击 · ${Math.ceil((b.inputDeadline-b.local)*b.scale/10)*10}ms`;
 if(b.finished&&finishAt&&now-finishAt>1000&&!endShown)showResult();
 }else renderer.draw({local:now%2700,time:now,result:null,styles:[playerStyle(screen==='skins'?skinPreview:save.skin),{enemy:0,accent:'#cf805d'}],preview:screen==='skins'?preview:null,home:screen!=='battle'});}
 requestAnimationFrame(frame);
}
goHome();if(loaded.warning)setTimeout(()=>toast(loaded.warning),350);requestAnimationFrame(frame);
// Localhost-only inspection and seeded replay hooks; no debug controls in the shipped UI.
if(['localhost','127.0.0.1'].includes(location.hostname))Object.assign(window,{__PAIPAI_TEST__:{
 get clock(){return battle;},get streak(){return {enabled:streak.enabled,running:streak.running,wins:streak.wins,match:streak.match,mode:streak.mode};},get audio(){return audio;},get save(){return structuredClone(save);},get seed(){return seed;},exportReplay:()=>({version:CONFIG.version,rhythmVersion:TIMING.version,seed,mode,level,health,difficulty,speed:battle?.scale,origin:battle?.origin,actions:battle?.history.map(h=>h.actions[0]),sealed:battle?.history.map(h=>h.actions[1])}),get frameTimes(){return [...frameTimes];},
 start:(kind:typeof mode,options:{state?:State;enemy?:SkillId;level?:number;speed?:number;health?:number;difficulty?:string;seed?:number;streak?:boolean}={})=>{if(options.speed){save.settings.speed=options.speed;}if(options.level!==undefined)level=options.level;if(options.health)health=options.health;if(options.difficulty)difficulty=options.difficulty;if(kind==='basic'||kind==='advanced')streak.begin(kind,!!options.streak);startBattle(kind,options.state,options.enemy?()=>options.enemy!:undefined,options.seed);},
 select:selectSkill,pause,resume,home:goHome,story:showStory,skins:showSkins,intro:storyIntro,
 setSave:(s:Partial<Save>)=>{save={...save,...s};saveNow();},
 setEnemy:(id:SkillId)=>{if(battle&&!battle.locked)battle.sealed=id;},
 state:()=>({state:battle?.state,start:battle?.startState,selected:battle?.selected,sealed:battle?.sealed,local:battle?.local,log:battle?.log,paused:battle?.paused}),
 replay:(choices:[SkillId|null,SkillId][])=>{let index=0;const s=initial(5,ALL);startBattle('advanced',s,()=>choices[index]?.[1]||'guard1');const original=battle!.onEvent;battle!.onEvent=t=>{original(t);if(t==='window-open'&&choices[index]?.[0]){battle!.select(choices[index][0]!);syncBattle();}if(t==='finish')return;if(t==='start'){index++;battle!.sealed=choices[index]?.[1]||'guard1';syncBattle();}};syncBattle();},
 }});

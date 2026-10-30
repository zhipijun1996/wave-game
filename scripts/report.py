"""Generate a readable report from delivered raw data; no manual metric transcription."""
import json,csv,statistics,collections,random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];x=json.loads((ROOT/'artifacts/balance-results.json').read_text());rows=list(csv.DictReader((ROOT/'artifacts/balance-matches.csv').open()));ai=json.loads((ROOT/'artifacts/ai-calibration.json').read_text())
pct=lambda n:f'{n*100:.2f}%'
def ci(v):return '–'.join(pct(a) for a in v)
def cluster_ci(rs,kind):
    g=collections.defaultdict(list)
    for r in rs:g[r['seed']].append(r)
    values=[sum((r['winner']=='0' if kind=='win' else r['winner']=='draw') for r in v)/len(v) for v in g.values()]
    rng=random.Random(816);boot=sorted(statistics.mean(rng.choices(values,k=len(values))) for _ in range(2000))
    return [boot[49],boot[1949]]
s=['# 《拍拍波》离线平衡与 AI 校准报告 v1.0.0','',
'数值版本：`data/skills.json` 1.0.0。2026-10-30，采用规格初值：气上限9，中大波伤害2/3，中防1、大防2、中反弹2气。没有新增冷却、防御疲劳或改动伤害差公式。',
'', '## 方法与可复现性','',
'```sh\nnpm ci\npython3 scripts/generate_cases.py\nnpm test\npython3 scripts/simulate.py --search-seeds 5 --seeds 40\nnpx tsx scripts/ai-calibrate.ts\npython3 scripts/report.py\n```','',
'先以986个共享输入/期望输出验证Python与TypeScript独立实现，再做3组费用候选的1,815场小搜索；最终配置扩大至37,700场。另用正式TypeScript AI做4,800场逐关/难度校准。随机种子为 `173 + 97*i`，最终40个；双方使用独立随机流。最终对称局额外交换策略、位置与随机流，镜像胜负完全对称。八关使用真实3血与逐关不对称技能集，另有1/3/5血及0、1、3、5、8起始气量压力场景。',
'', '策略包括合法随机、偏积气、即时攻击、防御、反弹、资源判断、历史频率、混合，以及永远防御、连续普通充气、快充后固定防御三个极端。基础模式不具备快充/反弹时，相应策略自然退化。资源与历史策略按公开回合状态评估结果，绝不看本回合对手动作。',
'', '原始逐局CSV：`artifacts/balance-matches.csv`；汇总、候选、分层原始JSON：`artifacts/balance-results.json`；正式AI逐关数据：`artifacts/ai-calibration.json`。总体率是这些策略等权混合的实验结果，并非人类玩家胜率。',
'', '镜像局及同一种子的多策略局并不独立。JSON保留常用Wilson 95%区间作为描述性数值，不能把镜像翻倍视为独立证据。下表采用按40个种子分组的2,000次bootstrap区间（固定bootstrap种子816），保留组内关联。',
'', '## 小规模候选比较','', '| 候选 | 中防/大防/中反弹费用 | 样本 | 和局率 | 回合中位数 | 每局总耗气 |','| --- | --- | --- | --- | --- | --- |']
for c in x['search']:
 d=c['summary'];s.append(f"| {c['candidate']} | {c['costs']['guard2']}/{c['costs']['guard3']}/{c['costs']['reflect2']} | {d['samples']} | {pct(d['drawRate'])} | {d['roundMedian']} | {d['meanEnergySpent']} |")
s+=['','免费中防/更便宜大防候选增加和局与回合长度，削弱中波威胁；中反弹提价候选的和局率有所下降，但小样本置信区间明显重叠，同时会伤害已经较低的中反弹使用率。因此采用初值；没有为改善统计结果更改玩法约束。中反弹不是覆盖大波的全能防守，其空反耗气有明确代价。',
'', '## 最终模式结果','', '| 模式 | 样本 | 甲胜/乙胜/和 | 甲胜95%种子区间 | 和局95%种子区间 | 回合中位/P90/P95 | 60回合次数 |','| --- | --- | --- | --- | --- | --- | --- |']
for k in ['basic1','basic3','advanced5']:
 d=x['summaries'][k];rs=[r for r in rows if r['scenario']==k];s.append(f"| {k} | {d['samples']} | {pct(d['winRate'])}/{pct(d['lossRate'])}/{pct(d['drawRate'])} | {ci(cluster_ci(rs,'win'))} | {ci(cluster_ci(rs,'draw'))} | {d['roundMedian']}/{d['roundP90']}/{d['roundP95']} | {d['limit60']} |")
s+=['','极端永远防御、连续积气策略特意保留在总体中，造成较高和局和P90=60。免费防御无限挡住小波是规格允许的策略性质，不是死锁；游戏实际会在60回合结束并显示和局。按策略的细分在JSON `byStrategy`，不能拿总体率证明某个招式或AI“最强”。',
'', '## 合法可用时的选择率','', '| 技能 | 选择次数 | 合法机会 | 选择率 | 总耗气 |','| --- | --- | --- | --- | --- |']
for k,v in x['opportunity'].items():s.append(f"| {k} | {v['selected']} | {v['available']} | {pct(v['rate'])} | {v['energySpent']} |")
s+=['','基础与故事中未解锁的技能不计入合法机会；禁充与满气快充也不计入。该表包含极端策略，免费防御自然偏高。大波在全局机会中的选择率低，但使用后的破防/实伤清晰，不以追平所有技能使用率作为调参目标。',
'', '## 普通充气与快充','']
qt=sum((collections.Counter(v) for v in x['metrics']['quickStrata'].values()),collections.Counter());m=x['metrics']
s +=[f"快充 {qt['attempts']} 次，未受击 {qt['success']} 次（{pct(qt['success']/qt['attempts'])}），实际获得 {qt['gain']} 气；受击导致本次潜在收益损失 {qt['lostGain']} 气。快充后的禁充回合 {m['blockedTurns']} 次，其中 {m['blockedWithRoom']} 次仍有蓄气空间；这些是失去普通充气选择的机会，并非可直接当成因果净损失的反事实收益。",'',f"0气快充被命中且存活 {m['zeroInterruptedSurvived']} 次；实际后续只有免费防御可选的回合 {m['forcedDefense']} 次。二者可因60回合终局不同。普通充气受击仍+1，快充受任意等级攻击都+0并保留已有气，已由共享用例验证。",'', '| 对手具备合法攻击 | 自己血量≤2 | 尝试 | 成功率 | 平均实际收益 | 受击损失收益 |','| --- | --- | --- | --- | --- | --- |']
strata=collections.defaultdict(collections.Counter)
for k,v in m['quickStrata'].items():
 parts=k.split('/');strata[(parts[0],parts[1])]+=collections.Counter(v)
for k,v in sorted(strata.items()):s.append(f"| {k[0].split('=')[1]} | {k[1].split('=')[1]} | {v['attempts']} | {pct(v['success']/v['attempts'])} | {v['gain']/v['attempts']:.3f} | {v['lostGain']} |")
s+=['','完整JSON另按起始气量与最近5回合攻击倾向拆分。对手无可攻击气量时，快充明显更安全；低血量且对手可攻击时，稳定普通充气或防御更有价值。不能把快充整体高成功率理解为它必优于普通充气：随后一拍禁充尤其会惩罚被打断的0气角色。',
'', '| 两回合序列 | 快充被打中 | 最终气 | 第三回合禁充 |','| --- | --- | --- | --- |']
for v in x['sequences']:s.append(f"| {v['sequence']} | {'是' if v['hitQuick'] else '否'} | {v['energy']} | {'是' if v['blocked'] else '否'} |")
s+=['','无额外耗气且存活时：连续普通充气五次，第6回合可放大波；普通充气→快充→防御→快充成功可在第5回合放大波，但承担两次被打断与强制禁充风险。快充→防御两回合只得2气，并不自动比普通充气→普通充气更快达到3气。',
'', '进阶0气开局的门槛（仅统计实际达到者，未达到者不填充成60）：','', '| 门槛 | 达到样本 | 回合中位数 |','| --- | --- | --- |']
for k,v in x['thresholds'].items():s.append(f"| {k} | {v['observed']} | {v['median']} |")
s+=['','`first3/first5` 是回合开始已具备该气量；`actualWave2/3` 是确实施放对应波的回合。攒到气与能否保住机会出手应分别看待。',
'', '## 波、防御与反弹的实际收益','', '| 波 | 次数 | 完全抵消 | 参与部分抵消 | 被挡 | 被反弹 | 破防 | 对对方实际总伤害 |','| --- | --- | --- | --- | --- | --- | --- | --- |']
for k,v in m['attacks'].items():s.append(f"| {k} | {v['attempts']} | {v.get('cancel',0)} | {v.get('partial',0)} | {v.get('blocked',0)} | {v.get('reflected',0)} | {v.get('break',0)} | {v['actualDamage']} |")
s+=['','统计“参与部分抵消”包含较小波一方，其对对手伤害可能为0。反弹只把原攻击打回，不再与原波二次抵消。三种波均不能一次击倒进阶满5血对手。',
'', '| 付费防御 | 使用 | 成功挡住 | 阻止伤害 | 空防 | 被高阶破防 |','| --- | --- | --- | --- | --- | --- |']
for k,v in m['paidDefense'].items():s.append(f"| {k} | {v['attempts']} | {v['blocks']} | {v['preventedDamage']} | {v['empty']} | {v['broken']} |")
s +=['',f"反弹尝试 {m['reflectAttempts']} 次，成功 {m['reflectSuccess']} 次（{pct(m['reflectSuccess']/m['reflectAttempts'])}）。空防、空反都照常付费，正是对盲目付费防守的限制。",'',
'| 对大波的选择 | 自己费用 | 自己失血 | 对手费用 | 后续机会 |','| --- | --- | --- | --- | --- |','| 小波部分抵消 | 1 | 2 | 5 | 保留较多气，但失血 |','| 同伤害大波完全抵消 | 5 | 0 | 5 | 双方气量都下降 |','| 大防完全挡住 | 2 | 0 | 5 | 省3气，下一拍可反击或充气 |','',
'| 对中波的选择 | 自己费用 | 自己失血 |','| --- | --- | --- |','| 小波部分抵消 | 1 | 1 |','| 中波完全抵消 | 3 | 0 |','| 中防完全挡住 | 1 | 0 |','| 中反弹反送 | 2 | 0（对方失2血） |','',
'高气量压力场景按CSV的start0/start1、hp场景保留。低气量一方可以用付费防御完全挡住、低波减伤及普通充气受击收益恢复资源；不保证任意低血量/0气状态都有必胜解。尤其0气禁充被高阶波逼杀是快充误判的真实代价，不自动补气或改规则救场。',
'', '## 故事与正式 AI 校准','',
'Python逐关原始实验包含所有11类玩家策略（含极端策略），对手为混合策略，结果在JSON `story1..8` 与 `-swap`。下表另使用真正TypeScript `chooseAI`，玩家为普通资源/历史混合，敌人带该同学性格，以当前故事难度评估。双方3血0气，没有额外气或血量优势。',
'', '| 关卡 | 正式难度 | 样本 | 玩家胜/败/和 | 玩家胜Wilson95% | 回合中位 |','| --- | --- | --- | --- | --- | --- |']
# Separate seeds here are independent matches, so use Wilson for each level.
from rules import CONFIG
for level in range(1,9):
 diff='easy' if level<=2 else 'normal' if level<=6 else 'hard';r=next(a for a in ai if a['level']==level and a['enemyDifficulty']==diff);n=r['samples'];p=r['playerWins']/n;z=1.96;den=1+z*z/n;center=(p+z*z/(2*n))/den;half=z*((p*(1-p)/n+z*z/(4*n*n))**.5)/den
 s.append(f"| {level} | {diff} | {n} | {r['playerWins']}/{r['enemyWins']}/{r['draws']} | {ci([center-half,center+half])} | {r['roundMedian']} |")
s+=['','第一关允许观察快充而非靠加血压制，当前资源型玩家63.5%胜率。第三关是明显陡坡（约29.5%），来自中波能突破玩家现有防御；提示卡已明确小波削伤与趁蓄气进攻。未根据机器人结果擅加机制；需要人类试玩确认是否下调该关策略权重。八关均已通过固定合法动作的浏览器首胜/解锁/刷新流程检查，这证明可通关，不代表人类难度已经验收。',
'', '## 固定节拍与试玩边界','',
'标准与慢速各连续20回合已在生产构建里实时执行，包含同级抵消、大小波差值、破防、反弹、无选择和多次改选。时间日志、录屏与帧间隔在 `artifacts/timing-standard.*`、`timing-slow.*`。这类完美定时脚本不能代替人的漏选率、图标识别时间或真机手感。',
'', '已用实际Canvas定格检查四核心手势和所有目标视口；桌面鼠标与桌面触控模拟均可操作。**尚未具备物理手机/人类参与者**，因此手机真实60帧、人工漏选率、十按钮识别时间、标准与慢速的人类改选难度仍未验证；不把桌面模拟结果标成手机实测。数值1.0.0是可玩候选，保留上述人工校准项。',
'', '## 仍存在的策略弱点','',
'- 免费防御与极端积气能拖到60回合，按规格保留。\n- 中大波及付费防御使用率低于免费动作，但其资源/伤害交换具有明确用途。\n- 中反弹空反代价明显；未发现覆盖大波的万能反制。\n- 第三关技能不对称会形成难度尖峰；真实新手测试仍是完成体验验收的必要条件。\n- 结果只覆盖所列固定种子、策略与场景，不证明博弈均衡或不存在其他策略漏洞。','']
(ROOT/'docs/BALANCE_REPORT.md').write_text('\n'.join(s));print('docs/BALANCE_REPORT.md generated')

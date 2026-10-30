"""Generate the current AI usage report from actual TypeScript AI experiment counts."""
from pathlib import Path
import json,csv,math
R=Path(__file__).resolve().parents[1];x=json.loads((R/'artifacts/skill-usage-v1.1.json').read_text());generic=json.loads((R/'artifacts/balance-results.json').read_text());p=lambda n:f'{100*n:.2f}%'
name={'wave3':'大波','guard2':'中防','reflect2':'中反弹'}
rows=[]
for e in x['experiments']:
 for id,s in e['skills'].items():rows.append({'policy':e['version'],'difficulty':e['difficulty'],'matches':e['matches'],'skill':id,**s})
with (R/'artifacts/skill-usage-v1.1.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys(),lineterminator='\n');w.writeheader();w.writerows(rows)
normal={e['version']:e for e in x['experiments'] if e['difficulty']=='normal'}
a,b,c=normal['before'],normal['zero_only'],normal['after']
text=['# 《拍拍波》v1.1 节奏版与正式AI技能使用报告','',
'结论：大波确实罕见，主要是AI很少攒到5气；中防和中反弹在旧AI中更多是在空防/空反。新AI保留技能数值，强制双方0气时选择普通充气或快充，并在普通/困难档排除公开状态下没有收益的付费防守。使用次数没有被人为拉平。','',
'## 这次规则改动','',
'- 第二拍拍手后才可点击：标准窗口[900,1500)ms，慢速[1350,2250)ms，快档[630,1050)ms。\n- 无窗口内合法点击就空过：不花气、不加气、无防护，照常受击；不再自动充气或防御。\n- 快档每拍630ms，每回合1.89秒；其他档位和技能统一同比缩放。\n- 双方0气且充气合法时，AI必选普通充气或快充；禁充时不绕过限制。\n- 普通/困难不花气防御无法攻击的对手；若更便宜的同类技能覆盖对手所有合法攻击，也不多花气。简单档保留明显失误。','',
'## 实验方法','',
'直接调用网页使用的TypeScript `chooseAI` 与 `resolve`，不是另写一个近似AI。每组进阶5血、0气、完整10招，固定1,000个种子（173+97×i），两套独立随机流，并交换随机流镜像重打，共每组2,000场。旧AI、仅加0气规则、最终AI各测简单/普通/困难，合计18,000场。镜像并不是独立样本；包含大波的对局比例置信区间按1,000个独立种子计算。','',
'本实验假设AI按时成功输入，不模拟人类漏点，也不把统计解释成人类使用率。规则本身的空过和窗口边界另有1007个TS/Python共享用例、13项单位测试与生产构建浏览器验证。','',
'```sh\nnpm ci\nnpm run usage\npython3 scripts/usage_report.py\n```','',
'原始计数/分层JSON：`artifacts/skill-usage-v1.1.json`；便于表格查看的CSV：`artifacts/skill-usage-v1.1.csv`。旧策略冻结在`scripts/baseline-ai-v1.ts`，只加0气规则的中间策略冻结在`scripts/baseline-ai-zero-charge.ts`。游戏只导入最终AI。','',
'## 普通AI：改动前后','',
'“全部动作占比”=选择次数÷双方全部回合动作；“合法时选择率”=选择次数÷该技能已解锁、气量足够等合法机会。次数包含双方与镜像，用于对照，不能把每次动作当作独立样本。','',
'| 技能 | 旧AI：动作占比 | 仅0气规则 | 最终AI：动作占比 | 旧→最终：合法时选择率 | 最终次数/合法机会 |','| --- | --- | --- | --- | --- | --- |']
for id in name:
 old,mid,new=a['skills'][id],b['skills'][id],c['skills'][id]
 text.append(f"| {name[id]} | {p(old['share'])} | {p(mid['share'])} | {p(new['share'])} | {p(old['whenLegal'])} → {p(new['whenLegal'])} | {new['selected']}/{new['available']} |")
text+=['','### 为什么大波少','',
f"旧AI只有{p(a['reach5Rate'])}的角色曾到5气；最终AI为{p(c['reach5Rate'])}。但大波一旦合法，最终AI有{p(c['skills']['wave3']['whenLegal'])}的机会会用，旧版也有{p(a['skills']['wave3']['whenLegal'])}。因此不是攒好5气后一直不用，而是多数对局中资源已被小波、中波及防守花掉。",'',
f"至少用过一次大波的对局从{p(a['bigWaveMatchRate'])}增加到{p(c['bigWaveMatchRate'])}；大波每次对对手造成的实际伤害均值从{a['skills']['wave3']['damagePerUse']:.2f}到{c['skills']['wave3']['damagePerUse']:.2f}。它仍然少见，尤其困难AI偏好更快的低耗气施压。5气换3伤害本身就比小波1气换1伤害更难攒；部分抵消和反弹/防御风险还影响蓄气机会。",'',
'### 中防、中反弹：次数与有效性分开看','',
'| 技能 | 旧成功率 | 最终成功率 | 旧空防/空反率 | 最终空防/空反率 | 最终有效总量 |','| --- | --- | --- | --- | --- | --- |']
for id in ['guard2','reflect2']:
 old,new=a['skills'][id],c['skills'][id];effect=f"挡住{new['blocked']}次、阻止{new['prevented']}点伤害" if id=='guard2' else f"反弹{new['reflected']}次、返还{new['returned']}点伤害"
 text.append(f"| {name[id]} | {p(old['effectSuccess'])} | {p(new['effectSuccess'])} | {p(old['emptyRate'])} | {p(new['emptyRate'])} | {effect} |")
text+=['',
'空防/空反指对手本回合没有发波；失败也可能是被更高等级波突破，所以两列不必相加为100%。旧AI的付费防守次数不少，但大量无效。新AI在没有对应威胁时省气，次数下降、成功率上升；不能把单纯增加按钮出现次数当成平衡改善。',
'', '按对手公开的最高合法攻击强度拆分（最终普通AI）：','',
'| 对手最高可出波 | 中防：次数/合法机会（选择率） | 中反弹：次数/合法机会（选择率） |','| --- | --- | --- |']
for strength in range(4):
 group=[v for k,v in c['strata'].items() if k.startswith(f'enemyMaxAttack={strength}/')];parts=[]
 for id in ['guard2','reflect2']:
  count=sum(v.get(id,0) for v in group);available=sum(v.get(id+'Available',0) for v in group);parts.append(f'{count}/{available}（{p(count/max(1,available))}）')
 text.append(f'| {strength} | {parts[0]} | {parts[1]} |')
text+=['','当对手最多小波时，免费防御已经够用，1气反弹比2气中反弹覆盖同样的实际威胁；中防/中反弹少用有合理原因。对手能放中波后，这两招才有明确额外价值；对手能放大波时，它们也并非万能防守。',
'', '## 不同难度的最终结果','',
'| 难度 | 场次 | 回合中位数 | 大波/中防/中反弹动作占比 | 角色达到5气比例 | 对局出现大波比例（95%区间） |','| --- | --- | --- | --- | --- | --- |']
for e in x['experiments']:
 if e['version']!='after':continue
 n=len(x['seeds']);r=e['bigWaveMatchRate'];z=1.96;den=1+z*z/n;mid=(r+z*z/(2*n))/den;half=z*math.sqrt(r*(1-r)/n+z*z/(4*n*n))/den
 text.append(f"| {e['difficulty']} | {e['matches']} | {e['roundMedian']} | {' / '.join(p(e['skills'][id]['share']) for id in name)} | {p(e['reach5Rate'])} | {p(r)}（{p(max(0,mid-half))}–{p(min(1,mid+half))}） |")
text+=['',
'三种最终AI在“双方0气且充气合法”的全部观测中，充气类选择率均为100%。这不要求每次都普通充气：有快充且未禁充时两者均会出现；禁充回合仍只能选合法动作。',
'', '## 数值决定与后续方向','',
'本次不修改波费用1/3/5、伤害1/2/3或中防/中反弹费用1/2；快充、伤害差碰撞、反弹和5血规则也不改。只修正节拍与AI决策。若目标是让大波成为更常见的对局主题，下一轮应优先比较带资源规划的AI、不同对手性格和中后期局面，再考虑经对照验证的数值调整；不通过硬塞大波或把所有技能率调成相同来掩盖资源问题。',
'', '## 多策略离线回归','',
f"另重新运行Python {generic['totalMatches']:,}场最终多策略场景及1,815场候选搜索，包含基础1血/3血、进阶5血、八关不对称与高低气压力场景。这里的11类实验策略不等于正式AI；永远防御等极端策略刻意保留，不受正式AI的0气选择规则约束，用于找循环。普通随机/资源等实验策略已加入0气充气规则。原始CSV/JSON仍在`artifacts/balance-*`。",'',
'| 模式 | 样本 | 胜/败/和率 | 回合中位/P90 |','| --- | --- | --- | --- |']
for key in ['basic1','basic3','advanced5']:
 e=generic['summaries'][key];text.append(f"| {key} | {e['samples']} | {p(e['winRate'])}/{p(e['lossRate'])}/{p(e['drawRate'])} | {e['roundMedian']}/{e['roundP90']} |")
text+=['',
'历史v1.0报告保存在 `docs/archive/BALANCE_REPORT_v1.0.md`，不能将其中旧默认动作/AI统计当作当前版本。',
'', '## 体验验证范围','',
'窗口前后点击、截止边界、失拍受击、三档设置保存、暂停/后台恢复和五视口均由实际生产构建检查。三档各20回合的实时日志与录屏用于核对共同时间轴。尚未取得物理手机或人类试玩样本；这份报告不声称测得人的识别速度、漏点率或手机真实帧率。新窗口可能进一步影响人类蓄气率，需要实测，不能从完美点击AI反推。','']
(R/'docs/BALANCE_REPORT.md').write_text('\n'.join(text));print('current v1.1 balance/usage report and CSV generated')

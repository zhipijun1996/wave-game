# 原声音频核查与替换清单

核查日期：2026-10-30。此文记录来源核实，不是使用授权，也不是已接入音频清单。实际采用的文件、时长、事件与混音见 `data/audio-manifest.json` 和 `docs/ASSETS.md`（以交付时文件为准）。

## 本次追加：原作录音已实际下载

按用户“继续都找出来，然后下载”的指示，已从可访问的公开声效文件、游戏语音包、动画公开片段和高达官方推文视频取得七类本地录音候选，并整理17条可直接试听的WAV。详情、文件版本、原包路径及裁切时间见 [AUDIO_DOWNLOADS.md](AUDIO_DOWNLOADS.md)；机器可读来源和SHA-256见 `data/audio-original-candidates.json`。

魔法筒已定位日语游戏独立喊招及动画喊招；斑的Jump Force日语#104为高度匹配的“宇智波返し”候选，仍保留最终人工核听待办，另有已定位英语动画喊招。独角兽已实际下载官方结局“三层精神感应场挡光束”视频，并按画面对照裁出展开与挡光束声音，但包含原配乐、对白，不能说已拿到独立干声。通用Newtype提示音另作相关备选，不冒充独角兽专属技能。

本轮交付是录音搜集、下载和试听整理；当前公开游戏仍使用此前37个暂用文件。再分发许可、干声缺口及最终人工核听状态逐项记录，未将原作录音放入公开游戏资产或MIT素材中。以下为此前v2.0发布时的许可核查记录，其中“未选定文件”等描述属于该次发布快照；最新下载状态以本节和AUDIO_DOWNLOADS为准。

## v2.0发布时的许可核查记录

用户要求优先使用对应作品原声；缺少可用原声时明确列出缺口与暂用版本并继续开发。本次通过官方作品页、官方使用条款及公开音频库查找，**未找到能确认允许嵌入本游戏并随公开构建包再分发的七类作品原声**。因此未从动画、游戏或影视成片中抽取录音，未将声板站的“可下载”视作许可。所有原声槽保留可替换结构，当前试听的自制声音必须标明“原创暂用”，不能标成原版。

## 逐项核查

| 游戏用途 | 目标作品、角色与具体片段 | 已核实来源 | 许可核查与缺口 | 暂用版本与替换槽建议 |
| --- | --- | --- | --- | --- |
| 中波：蓄力喊招、推出波 | 《Street Fighter II》隆（Ryu），经典日语“Ha do ken!”；红头带、白色武道服，避免混用其他角色或后续招式 | [Capcom Video Policy](https://www.capcomusa.com/video-policy/)；[Street Fighter官方网站](https://www.streetfighter.com/) | 官方视频政策允许特定游戏实况与评论内容，但明确不允许将visual/vocal/in-game elements拆出单独分发；FAQ直接以“do not extract ... sound effects/SFX separately and post as-is”为例。该政策还声明不是创作mods或derivative works的授权。未取得本游戏可再分发的隆原声文件，原声片段与时间码未选定。 | 自制蓄气上扬与推掌爆发，特写有“HA DO KEN!”视觉字样。槽：`wave2-cutin`、`wave2`。获授权后将喊招发力点对齐特写末段与同步发射点。 |
| 大波：起射、持续、命中 | 1966年初代《ウルトラマン》，斯派修姆光线（Spacium Beam），使用对应初代光线声，不用迪迦哉佩利敖或新奥特曼替代 | [圆谷官方初代角色页](https://tsuburaya-prod.com/heroes/ultraman)；[ご利用上の注意](https://m-78.jp/attention/)；[官方FAQ](https://m-78.jp/faq/) | 初代页明确说明能量分配到竖直右手与水平左手，交叉后发射白光。使用条款将音乐/音声列为受保护内容，除明确许可与法律允许范围外，不允许复制、分发、公开等用途。FAQ未提供个人游戏素材的下载许可。缺少可再分发的初代光线干声。 | 自制闪光起射、宽频光束与冲击尾音。槽：`wave3-cutin`、`wave3`、`hit`。持续声只跟随表现，不重复结算。 |
| 中防：AT力场展开、受击、破裂 | 《新世紀エヴァンゲリオン》初号机，AT力场；橙色八角屏障，与紫绿机体造型对应 | [EVA官方页](https://www.evangelion.jp/)；[Khara fan-creation guideline](https://www.khara.co.jp/guideline/) | guideline第5条写明“動画・音楽・音声については基本的にご利用いただけません”。该创作指引不能作为拆出动画原声并用于游戏的许可。未找到授权AT力场原声包。 | 自制八层上扬脉冲、边缘震荡与玻璃状破裂声。槽：`guard2`、`at-hit`、`break`。 |
| 大防：精神感应、浮游盾、力场接触 | 《機動戦士ガンダムUC》独角兽觉醒形态，绿色精神感应框架、三盾与精神感应场；不混用EVA力场音色 | [Gundam官方入口](https://en.gundam-official.com/)；[独角兽系列页](https://gundam-official.com/series/unicorn)（旧gundam-unicorn.net已重定向）；[Bandai Namco条款](https://www.bandainamco.co.jp/en/terms/index.html) | 官方素材条款将music/audio等列入受保护素材，网站下载仅限个人家庭单机用途，未提供游戏公开包再分发许可；未找到针对UC原声的单独许可。网上OST和声效抽取不是可采用的素材授权。 | 自制机械展开、三盾定位、低频共振与细碎光点衰减。槽：`guard3`、`psycho-hit`。 |
| 小反弹：发动、吸入、返射 | 《遊☆戯☆王デュエルモンスターズ》魔法筒（Magic Cylinder / 魔法の筒），目标是动画发动喊声与筒吸入、返射，不把卡牌文字的规则授权当音频许可 | [KONAMI官方卡片详情](https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=5124&request_locale=en)；[KONAMI联系页](https://www.konami.com/games/us/en/pages/contact_us/) | 官方卡库确认Magic Cylinder身份和反击原攻击者的卡片效果，但没有提供动画喊声或音效的游戏再分发授权。动画具体播出集数、配音语言与时间码尚未落实到已授权文件。 | 自制双筒启动、降调吸入与反向升调返射。槽：`reflect1`、`cylinder-in`、`cylinder-out`、`break`。 |
| 中反弹：喊招、扇接波、返还 | 《NARUTO -ナルト- 疾風伝》宇智波团扇“宇智波返し / Uchiha Gaeshi”，应选与团扇角色及姿势一致的日语喊招 | [NARUTO官方作品介绍](https://naruto-official.com/en/about)；[VIZ版权说明](https://www.viz.com/copyrights)；[招式索引（辅助定位，非授权）](https://naruto.fandom.com/wiki/Uchiha_Return) | 官方作品介绍和版权页没有给出拆取喊招用于新游戏的许可。VIZ站点条款明确其audio clips等未经书面许可不得复制或再分发，但不能将VIZ条款扩大理解为它独占所有地区音频权利。最终仍需对应录音权利方许可。未锁定可用原声时间码。 | 自制重心下沉、扇面接波与宽气浪返送。槽：`reflect2`、`reflect2`、`fan-return`、`break`。 |
| 终局：亮相、JOJO姿势定格 | JOJO风格胜利演出；用户未指定具体角色和原作声段。拟采用短亮相/定格声，不擅自把Giorno主题、承太郎台词或完整OP当作通用JOJO素材 | [JOJO官方门户](https://jojo-portal.com/en/) | 官方站列有作品版权归属，没有给出上述录音可下载再分发的许可。具体角色/音轨与时间码也未形成已授权文件。没有把第三方“no copyright”标注当授权。 | 自制短铜管/低音亮相、定格重拍。槽：`win`、`win`；平局另用轻短声。 |

## 找到但未采用的候选

[Freesound: Syna-Max — hadouken.wav, sound 67674](https://freesound.org/people/Syna-Max/sounds/67674/)：作者明确写的是“Me yelling ‘Hadouken’, like Ryu or Ken in Street Fighter”，是粉丝自录，并非隆原配音。页面标注 **Attribution NonCommercial 4.0**，0.717秒、44.1kHz、16-bit stereo；原文件下载要求登录。页面预览可播放也不能把它改称“原版Ha do ken”。本项目没有将该CC BY-NC素材混入MIT自制音频包，也没有为此要求用户注册账号。若将来决定用这个粉丝录音，应单独保留作者、链接、CC BY-NC 4.0许可证、修改记录，并确认项目使用符合非商业条件。

## 后续替换所需的最少资料

每个原声替换只需提供：本地录音文件；作品、角色、语言及版本；原片起止时间或音轨标识；来源链接；可用于网页游戏公开播放、裁切混音和随ZIP再分发的授权证明或明确许可条款。素材仅能试听或私人使用，不足以替换公开构建中的音轨。

拿到可用文件后：离线裁切 → 去除多余对白/底噪 → 5–15ms淡入淡出 → 对齐喊招或接触发力点 → 匹配响度与峰值 → 更新本地音频槽、许可及片段清单 → 核验双人叠放、主动暂停/后台恢复、录屏实录声音。保留双人声像位置与背景音乐闪避，避免特写喊招压住下一回合拍手。

本次原声缺口不阻塞玩法、原创暂用音效、动画或公开试玩的其余交付。作品出处、片段身份与授权状态在此明确，不能把暂用声音当作已完成的原声接入。

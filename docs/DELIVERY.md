# 《拍拍波》v2.1 交付

公开试玩（无需登录）：https://paipai-wave-playground.zhipijun1996.chatgpt.site

已将对应作品录音合入13个本地音轨槽，并恢复“拍拍后选招”：0/900ms两次拍手及收掌期间不接受输入；标准[1350,2250)ms亮框，围绕1800ms第三拍选择，窗口结束双方才同时亮招。标准900ms、慢速1350ms、快档630ms；保留独立特写、默认充气/禁充防御、统一结算。拍手中的鼠标、触摸和数字键都不会提前排队选招。

## 下载

固定交付分支`deliveries/v2.1.0`，保留以前版本不覆盖：

- [网页/Toy构建ZIP](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.1.0/paipai-wave-toy-v2.1.0.zip)
- [完整源码（含原录音重建输入）](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.1.0/paipai-wave-source-v2.1.0.zip)
- [约41秒实际游戏声音录屏](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.1.0/paipai-wave-showcase.mp4)
- [截图、日志与验证证据](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.1.0/paipai-wave-evidence-v2.1.0.zip)
- [完整交付包](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.1.0/paipai-wave-delivery-v2.1.0.zip)
- [SHA256、文件大小与源码提交](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.1.0/delivery-manifest.json)

## 实施与验证

- 21项单元测试含1007个TS/Python共享规则用例；拍拍前/窗口左界/第三拍/右界、三档20回合时序、暂停与一次结算均覆盖。
- 12组实际UI检查验证鼠标、触摸、数字键门控、四种模式共用窗口、五视口；45项十招/特写/结果场景、11组连战解锁、13组完整模式流程通过。
- 37个本地WAV成功加载，其中13槽含原作录音；源/成品SHA、PCM格式、非静音、响度峰值和快档尾音预算检查通过。双人特写左右声像、暂停同位置续播、后台暂停、快档魔法筒收势阶段续播已实际验证。
- 三档各20回合实际时间录屏/日志通过；桌面Chromium帧间隔中位数约16.7ms，P95约16.8ms，不冒充手机真机测量。
- 原声实际播放与录屏使用同一WebAudio输出。录像九个合法初态场景覆盖全部十招核心、两力场、两反弹、快充断电、双特写、异级对波及JOJO胜利；13个原声音轨均有运行播放记录，未后配替换声音。
- Toy ZIP 55文件、入口723字节，压缩约1.53MB、解压约2.04MB；doctor预检无findings，包含原声清单与归属NOTICE。技能费用/伤害/AI策略未改，因此沿用已有平衡报告与原始数据。

## 实际采用音频及余项

实际清单见[data/audio-manifest.json](../data/audio-manifest.json)，来源及核查见[AUDIO_RESEARCH.md](AUDIO_RESEARCH.md)和[ASSETS.md](ASSETS.md)。包括波动拳、初代光线、AT力场、官方UC结局精神场、魔法筒、斑日语游戏喊招候选/动画气浪和承太郎短台词；13槽中含纯录音裁切及与本项目原创层混合的音轨，不能把所有文件都称为纯原声。

独角兽等场景声仍含原配乐；斑#104保留最终人工核听待办；部分集数/版本与独立干声仍待核实。第三方录音再分发许可未确认，不属于项目MIT授权，实际包保留来源/归属/未确认状态。物理手机/人工手感与Toy账号实际容器审核仍为既有外部条件。

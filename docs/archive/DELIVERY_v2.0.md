# 《拍拍波》v2.0 交付

公开试玩（无需登录）：https://paipai-wave-playground.zhipijun1996.chatgpt.site

源码仓库：https://github.com/zhipijun1996/wave-game

版本索引：https://github.com/zhipijun1996/wave-game/releases/tag/v2.0.0-rc.2

## 下载

固定交付分支`deliveries/v2.0.0-rc.2`，每个链接直接取固定版本文件：

- [完整交付包](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.0.0-rc.2/paipai-wave-delivery-v2.0.0.zip)：包含构建、源码、证据、带声展示和三档时序/触摸模拟录像。
- [可运行网页/Toy上传ZIP](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.0.0-rc.2/paipai-wave-toy-v2.0.0.zip)：解压后通过静态HTTP服务打开index.html；根入口与相对路径适配Toy。
- [完整源码ZIP](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.0.0-rc.2/paipai-wave-source-v2.0.0.zip)
- [约38秒带游戏实际声音的展示MP4](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.0.0-rc.2/paipai-wave-showcase.mp4)
- [验收证据与报告ZIP](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.0.0-rc.2/paipai-wave-evidence-v2.0.0.zip)
- [SHA256、大小及源码提交清单](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v2.0.0-rc.2/delivery-manifest.json)

GitHub上传附件接口的既有401限制仍在，采用版本分支托管二进制和Release索引；不把失败的附件上传说成成功。

## 本次内容

统一规格v0.8、两次拍手选招/第三拍锁定、默认普通充气/禁充普通防御、独立暂停特写/双人分屏、共享交战一次结算，整回合不固定。十招完整手绘表现、作品道具/机体虚影、两种力场、双筒吸返、团扇回浪、快充断电过热、低频笑点和JOJO完整胜利姿势已接入实际游戏。保留八关、皮肤、连战、进阶解锁和旧存档。

录像直接来自生产构建：九个合法初态验收场景，真实按钮操作，音频从最终WebAudio输出采集；固定对手选择仅供展示，正常AI仍独立暗选。未用外部影片替代游戏画面，也未后配假装游戏已接入的音轨。

## 音频状态与验证

实际打包37个本地WAV；目前作品相关喊招/光线/力场/反弹/胜利均为原创暂用音，合成喊招非原配音。七类对应原声没有确认可随公开游戏与ZIP再分发的素材，因此没有接入。具体目标作品、片段、来源和许可核查见[AUDIO_RESEARCH.md](AUDIO_RESEARCH.md)，逐文件实际采用清单见[data/audio-manifest.json](../data/audio-manifest.json)。后续需提供有明确使用许可的片段和来源即可替换。

21项测试（1007共享用例）、45项镜头/五视口检查、11组连战/解锁、13组完整流程、三档各20回合时序、真实双音轨暂停续播及子路径资源加载均已完成。具体证据与范围见[ACCEPTANCE.md](ACCEPTANCE.md)。物理手机、人类手感/辨识度试玩以及Toy授权账号实际容器/审核仍是既有外部待验条件，未将桌面模拟冒称真机或Toy上线。

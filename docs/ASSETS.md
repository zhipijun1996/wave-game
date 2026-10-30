# 资源来源与许可（v2.1）

- 人物/镜头：本项目绘制的火柴人骨架、手掌和手指，`data/motions.json`为姿势源数据，`src/renderer.ts`负责全身插值；`src/spectacle.ts`为手绘道具、机体虚影、力场、投射物、双人特写和JOJO风格胜利的矢量源代码。固定线形，不逐帧随机抖动。
- 作品参考明确对应：中波街霸隆的波动拳；大波1966初代奥特曼斯派修姆；中防EVA初号机；大防独角兽觉醒形态；小反弹魔法筒；中反弹宇智波团扇；胜利采用JOJO风格漫画姿势。全部视觉在本项目手绘实现，未嵌入动画截帧或官方下载图片；作品角色/名称等权利归原权利方，仓库MIT许可不授予这些IP的权利。
- 十技能图标：64×64手绘SVG源文件与运行资源，统一线宽、结构和强调色。`python3 scripts/make_icons_v2.py`可复现；已在64/33/25px检查。旧`make_assets.py`会生成历史图标，完整重建最后需跑新图标脚本。
- **实际音频共37个本地WAV**（22.05kHz单声道），其中13个槽含实际作品录音，24个槽保留本项目原创音效与背景循环。逐文件来源、版本、时码、源SHA、实际哈希、响度及身份/许可未确认项见[`data/audio-manifest.json`](../data/audio-manifest.json)。
- **已接入**：经典Ha do ken喊招、初代斯派修姆光线、EVA AT Field Impact、UC官方结局精神场、暗游戏Tag Force Special日语魔法筒、斑Jump Force日语#104候选、两种反弹的动画效果参考、承太郎やれやれだぜ。独角兽片段含原配乐，斑日语候选仍保留最终人工核听待办；详情见[AUDIO_RESEARCH.md](AUDIO_RESEARCH.md)。游戏配音不标成动画直录，带原背景声的音频不标成独立干声。
- 原录音重建输入在`source-assets/audio/`。运行`python3 scripts/integrate_original_audio.py`重建13槽；若重新运行历史原创音效生成器，最后必须再运行此接入脚本。原声不变调，12ms淡入/25ms淡出，RMS目标−19dBFS、峰值不高于−4dBFS，保留双人声像与压乐。魔法筒只省去前段“トラップ発動”，保留完整“マジックシリンダー”；短技能尾音在快档下一拍前结束。波动拳喊招置于特写0.9秒；光线原声对齐特写末段及战场起射；胜利台词与原创定格声混合。
- 第三方作品录音不归入MIT许可；来源站/官方公开视频的可下载状态不是再分发授权，再分发许可未确认的状态逐项保留在清单。源文件及变换后文件均保留归属，不声称拥有原作录音的权利。
- 录屏从同一WebAudio最终输出采集，未后配替换声音。当前仍缺部分独立干声、部分集数/修订版本核对和最终人工听审，未将这些状态写成已通过。
- 字体：LXGW WenKai v1.530 Regular，https://github.com/lxgw/LxgwWenKai/releases/tag/v1.530 ，SIL Open Font License1.1；完整许可在`public/assets/fonts/OFL.txt`。按保留字体名条款重命名为Playground WenKai。本次重新包含新增中文、日文拟声字符。`python3 scripts/subset_font.py /path/to/LXGWWenKai-Regular.ttf`可复现，需要fonttools/brotli；运行不依赖字体服务。
- 项目原创代码、几何绘制与程序合成音按MIT提供；字体遵守OFL；作品参考权利不在MIT授权范围。
- Toy上游清单和预检脚本来自https://github.com/bilibili/toy（2026-10-30），MIT许可证见`docs/licenses/toy-MIT.txt`；仓库预检副本未改动。

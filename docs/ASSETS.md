# 资源来源与许可（v2.0）

- 人物/镜头：本项目绘制的火柴人骨架、手掌和手指，`data/motions.json`为姿势源数据，`src/renderer.ts`负责全身插值；`src/spectacle.ts`为手绘道具、机体虚影、力场、投射物、双人特写和JOJO风格胜利的矢量源代码。固定线形，不逐帧随机抖动。
- 作品参考明确对应：中波街霸隆的波动拳；大波1966初代奥特曼斯派修姆；中防EVA初号机；大防独角兽觉醒形态；小反弹魔法筒；中反弹宇智波团扇；胜利采用JOJO风格漫画姿势。全部视觉在本项目手绘实现，未嵌入动画截帧或官方下载图片；作品角色/名称等权利归原权利方，仓库MIT许可不授予这些IP的权利。
- 十技能图标：64×64手绘SVG源文件与运行资源，统一线宽、结构和强调色。`python3 scripts/make_icons_v2.py`可复现；已在64/33/25px检查。旧`make_assets.py`会生成历史图标，完整重建最后需跑新图标脚本。
- **实际音频共37个本地WAV**（22.05kHz单声道），包括八秒原创背景循环。逐文件作品参考、用途、来源、许可、长度和响度见[`data/audio-manifest.json`](../data/audio-manifest.json)。基础声源在`scripts/make_assets.py`，本次27个制作/替换槽在`scripts/make_cinematic_audio.py`（含2个小波变体）。使用固定随机数、原始波形、噪声和自行实现的共振峰合成，不依赖在线语音服务。
- **目前采用原创暂用音，未采用任何原作录音**。Ha do ken、A.T. Field、魔法筒短喊及Uchiha gaeshi是机械合成音节，非原配音、非真人克隆。斯派修姆、AT、精神场、魔法筒、团扇及胜利声音同样是自制暂用版。七类原声缺口及12项出处核查见[`AUDIO_RESEARCH.md`](AUDIO_RESEARCH.md)。无明确公开游戏/ZIP再分发许可的录音没有打入包中。
- 暂用音离线淡入淡出、峰值与RMS匹配，最终混音有动态压缩、左右声像、喊招/命中时压低音乐。录屏从同一WebAudio最终输出采集，未后配替换音。音效文件、特写时长及混音槽可在获取可用原声后替换，必须同步重测暂停续播与双特写。
- 字体：LXGW WenKai v1.530 Regular，https://github.com/lxgw/LxgwWenKai/releases/tag/v1.530 ，SIL Open Font License1.1；完整许可在`public/assets/fonts/OFL.txt`。按保留字体名条款重命名为Playground WenKai。本次重新包含新增中文、日文拟声字符。`python3 scripts/subset_font.py /path/to/LXGWWenKai-Regular.ttf`可复现，需要fonttools/brotli；运行不依赖字体服务。
- 项目原创代码、几何绘制与程序合成音按MIT提供；字体遵守OFL；作品参考权利不在MIT授权范围。
- Toy上游清单和预检脚本来自https://github.com/bilibili/toy（2026-10-30），MIT许可证见`docs/licenses/toy-MIT.txt`；仓库预检副本未改动。

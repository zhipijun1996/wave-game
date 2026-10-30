# 资源来源与许可

- 角色：本项目原创，`data/motions.json` 的22坐标二维骨架与关键姿势，`src/renderer.ts` 的插值、手掌、简化手指、装饰与特效。稳定线形，无逐帧随机抖动。
- 十技能图标：本项目原创，`public/assets/icons/*.svg` 同时作为源文件与运行时资产。64×64，统一线宽与圆角。可用 `python3 scripts/make_assets.py` 重建。
- 音乐与音效：本项目原创程序合成，无外部音频样本。`scripts/make_assets.py` 为源代码，固定随机种子；20个22.05kHz单声道 WAV，包括八秒轻音乐循环。
- 字体：LXGW WenKai v1.530 Regular，https://github.com/lxgw/LxgwWenKai/releases/tag/v1.530 ，SIL Open Font License 1.1；完整许可在 `public/assets/fonts/OFL.txt`。覆盖游戏全部实际中文、拉丁字符和符号的子集已按保留字体名规定改名为 Playground WenKai。用 `python3 scripts/subset_font.py /path/to/LXGWWenKai-Regular.ttf` 重建；需要 fonttools 与 brotli。运行时不请求字体服务。
- 游戏原创代码、美术与合成音频按仓库 MIT 许可提供；字体单独遵守 OFL。

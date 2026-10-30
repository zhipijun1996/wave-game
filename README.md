# 拍拍波

拍拍手，攒一口气。暖纸与墨线风格的本地单机手势对战游戏。

试玩（所有者私有）：https://paipai-wave-playground.zhipijun1996.chatgpt.site

完整下载与待验收项：[交付索引](docs/DELIVERY.md)、[逐条验收](docs/ACCEPTANCE.md)、[平衡报告](docs/BALANCE_REPORT.md)。当前为可玩候选；物理手机、人类手感与Toy账号容器仍待验。

- 故事模式：放学后的八位同学、七招逐关解锁与毕业战。
- 开始游戏：充气 / 小波 / 防御；1或3血，三档AI。
- 进阶游戏：十招齐开，双方5血。
- 四款纯外观皮肤、可跳过实操教学、本地自动存档、音量/震动/减弱动效与慢速/标准/快档设置。

## 运行

Node.js 22+，Python 3.10+（仅离线模拟）。

```sh
npm ci
npm run dev
```

## 验证与构建

```sh
npm test
npm run build
python3 scripts/simulate.py --search-seeds 5 --seeds 40
npm run usage
python3 scripts/usage_report.py
python3 -m http.server 4173 --directory dist
# 另一个终端，安装系统Chromium后：
npm run qa
# 视频录制另需：npx playwright install ffmpeg
```

`npm run qa` 默认使用 `/usr/bin/chromium`，可设置 `CHROMIUM_PATH`。测试直接加载生产 `dist/`，不依赖开发服务器。构建资源为相对路径，支持Toy子目录。

```sh
npm run package
```

生成 `artifacts/paipai-wave-toy-v1.1.0.zip`；根目录为 `index.html`。解压后用任意HTTP静态服务器启动。直接双击 `file://` 不受支持。

## 操作与规则

等第二拍拍手后按钮区亮框才点；窗口内可改选，第三拍同时亮招。标准600ms、慢速900ms、快档420ms。没有窗口内合法点击则空过：不充气、不防御、不攻击。桌面可用数字1–0选招、空格暂停。切后台暂停，返回后手动继续。

完整权威规格在 [docs/GAME_SPEC.md](docs/GAME_SPEC.md)。进度与验收证据在 [docs/PROGRESS.md](docs/PROGRESS.md)。

## 代码与资源

| 位置 | 内容 |
| --- | --- |
| `data/skills.json` | TS/Python共享版本化数值 |
| `src/rules.ts` / `scripts/rules.py` | 两套独立确定性规则实现 |
| `src/clock.ts` | 固定节拍、截止、单次提交与暂停恢复 |
| `src/ai.ts` | 公共状态/已揭晓历史/独立PRNG，第一拍前封存 |
| `data/motions.json` / `src/renderer.ts` | 原创骨架关键姿势、手掌手指、全身动作与特效 |
| `src/content.ts` / `src/main.ts` | 八关、解锁、界面、教程、衣橱 |
| `src/platform.ts` | 可注入的Toy接口隔离层；无SDK时完全离线可玩 |
| `public/assets` / `scripts/make_assets.py` | 原创SVG/WAV与生成源代码 |
| `tests/rule-cases.json` | 1007个共享输入/期望结果 |
| `artifacts` | 离线原始数据、验收日志与打包输出 |

资源许可见 [docs/ASSETS.md](docs/ASSETS.md)。代码/原创资源为MIT；文楷字体子集为OFL。

浏览器仅在 `localhost` / `127.0.0.1` 暴露 `window.__PAIPAI_TEST__` 供自动验收、固定动作场景和录屏使用。正式站点无调试界面与这项全局接口。普通游戏不依赖网络、Python或外部模型。

Toy云存档与安全区适配可通过 `Platform.connect(adapter)` 挂接已获授权的官方SDK。当前不猜测未公开接口，也不声称Toy容器或正式上线已经验证。


## 固定种子回放

运行 `npx tsx scripts/seeded-replay.ts` 生成真实AI完整回放JSON（seed=173）。本地网页调用 `__PAIPAI_TEST__.start('advanced', {seed:173, difficulty:'hard'})`，按回放的玩家动作逐回合点击即可重现封存AI序列。`__PAIPAI_TEST__.exportReplay()` 导出当前对局的初态、种子与已揭晓动作。验收录像另使用固定合法动作场景，和正常独立暗选AI对战明确区分。

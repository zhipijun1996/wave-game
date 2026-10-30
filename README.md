# 拍拍波

两个小学生，把课间气功打出了热血动漫最终决战的气势。暖纸、墨线、漫画特写与道具反差的本地单机手势对战。

公开试玩（无需登录）：https://paipai-wave-playground.zhipijun1996.chatgpt.site

完整下载与待验收项：[交付索引](docs/DELIVERY.md)、[逐条验收](docs/ACCEPTANCE.md)、[平衡报告](docs/BALANCE_REPORT.md)。当前为可玩候选；物理手机、人类手感与Toy账号容器仍待验。

- 故事模式：放学后的八位同学、七招逐关解锁与毕业战。
- 开始游戏：充气 / 小波 / 防御；1或3血，三档AI。
- 进阶游戏：故事8关通关后解锁十招，双方5血。普通/进阶均可选连战，胜后满血，分别保存最高连胜。
- 十招动漫手绘演出、暂停特写与双人分屏、两力场/双反弹、快充断电与JOJO胜利。37个本地声音，其中13个槽已接入作品录音或与原创音效混合（见[实际清单](data/audio-manifest.json)及[来源与缺口](docs/AUDIO_RESEARCH.md)）。
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
npx tsx scripts/cinematic-qa.ts
npx tsx scripts/audio-qa.ts
# 视频录制另需：npx playwright install ffmpeg
```

`npm run qa` 默认使用 `/usr/bin/chromium`，可设置 `CHROMIUM_PATH`。测试直接加载生产 `dist/`，不依赖开发服务器。构建资源为相对路径，支持Toy子目录。

```sh
npm run package
```

生成 `artifacts/paipai-wave-toy-v2.1.0.zip`；根目录为 `index.html`。解压后用任意HTTP静态服务器启动。直接双击 `file://` 不受支持。

## 操作与规则

先拍两下，收掌后亮框再选招；标准[1.35,2.25)秒围绕1.8秒第三拍点击，窗口900ms（慢速1350ms、快档630ms），截止后双方同时锁定；拍拍中点击无效且不排队。未选默认普通充气，过热禁充时默认普通防御。中波/大波进入独立特写（双触发分屏），战场冻结，特写后同步出招并在统一结果点结算一次。总时长随特写变化，快档/慢档不改变特写音轨语速。桌面数字1–0选招，空格暂停；切后台暂停，返回手动继续。

完整权威规格在 [docs/GAME_SPEC.md](docs/GAME_SPEC.md)。进度与验收证据在 [docs/PROGRESS.md](docs/PROGRESS.md)。

## 代码与资源

| 位置 | 内容 |
| --- | --- |
| `data/skills.json` | TS/Python共享版本化数值 |
| `src/rules.ts` / `scripts/rules.py` | 两套独立确定性规则实现 |
| `src/clock.ts` | 拍拍后开窗选招、暂停特写、同步交战、单次提交与终局演出 |
| `src/ai.ts` | 公共状态/已揭晓历史/独立PRNG，第一拍前封存 |
| `data/motions.json` / `src/renderer.ts` / `src/spectacle.ts` | 原创骨架关键姿势、手掌手指、全身动作与特效 |
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

连战开局选择“对战形式→连战”。每胜后点击“满血继续”，双方回满本模式血量、气归0、禁充清空；败或平结束本轮。最高纪录按普通/进阶分别保存，单局不累计；退出/刷新只结束当前连战，纪录保留。v1存档自动迁移到v2，已通关旧存档立即解锁进阶。

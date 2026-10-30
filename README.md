# 《拍拍波》交付索引 · v1.0.0 可玩候选

试玩：https://paipai-wave-playground.zhipijun1996.chatgpt.site （已由Sites返回发布成功，所有者私有）

源码：https://github.com/zhipijun1996/wave-game

下载中心：https://github.com/zhipijun1996/wave-game/releases/tag/v1.0.0-rc.1

| 文件 | 用途与可访问地址 |
| --- | --- |
| Toy网页ZIP（根目录index.html） | [paipai-wave-toy-v1.0.0.zip](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/paipai-wave-toy-v1.0.0.zip) |
| 全部源码、锁文件、资源、模拟代码 | [paipai-wave-source-v1.0.0.zip](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/paipai-wave-source-v1.0.0.zip) |
| 约39秒真实构建展示，含实际游戏音频 | [paipai-wave-showcase.mp4](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/paipai-wave-showcase.mp4) |
| 所有截图、报告、规则/回放/时间日志与原始数据 | [paipai-wave-evidence-v1.0.0.zip](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/paipai-wave-evidence-v1.0.0.zip) |
| 一次下载全部，另含标准/慢速20回合完整录像、横竖触控模拟录像 | [paipai-wave-delivery-v1.0.0.zip](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/paipai-wave-delivery-v1.0.0.zip) |
| 构建每文件SHA256与包大小 | [package-manifest.json](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/package-manifest.json) |
| 交付归档SHA256 | [delivery-manifest.json](https://raw.githubusercontent.com/zhipijun1996/wave-game/refs/heads/deliveries/v1.0.0-rc.1/delivery-manifest.json) |

## 内容

三个模式、基础1/3血、进阶5血10招、八关完整故事、4皮肤、四步可跳过教学、版本化本地存档、音量/震动/减弱动效/标准慢速设置。全部骨架、关键姿势、10 SVG与20 WAV生成源、字体OFL许可随源码提供。

`dist/` 是本地可运行网页构建目录。ZIP解压后即得到相同目录内容；资源全部相对路径，已验证嵌套子目录加载。HTTP静态服务器运行方法见README。

## 验证依据

- [权威规格](GAME_SPEC.md)、[阶段记录](PROGRESS.md)、[逐条验收](ACCEPTANCE.md)、[平衡报告](BALANCE_REPORT.md)、[资源来源](ASSETS.md)。
- 986共享TS/Python用例；10项规则/时钟单元测试；13组主浏览器流程与补充的子路径/旋转/固定种子检查；真实十技能完整回合检查。
- Python：1,815候选搜索+37,700最终模拟；正式TS AI另4,800场校准。原始CSV/JSON与重现命令齐全。
- 五视口实际截图；标准/慢速各20回合实时时间日志与完整录像，逻辑拍点/截止/提交无漂移且单次结算。
- 浏览器：Linux Chromium 154.0.8037.57。rAF采样最近600帧，标准/慢速约60.18/60.17 fps、P95帧间隔16.7ms；拍点实际派发最大误差约9.3/18.4ms。不是手机60帧实测结论。

## 录像与截图说明

展示录像来自实际生产构建的固定合法动作验收场景：毕业战从3血0气开始，先前进度设为已过7关；对手动作在玩家输入前按场景封存。包含同级波抵消、普通充气、快充、防御、破防、大波对小波的2点差值、成功反弹、毕业奖励；随后一场基础1血展示失败。它不是声称随机AI恰好打出的对局。真实AI固定seed=173的27回合重放数据另见 `seeded-ai-replay.json`。

视频与音频来自同一次实际录制。浏览器录制器的固定25帧编码可能量化时间；起止同步标记用于把视频时间基准校准到实际WebAudio时钟，移除了录制准备标记与尾部编码填充。没有重绘角色、生成替代战斗画面或用离线动画冒充运行效果。生成步骤为 `npx tsx scripts/capture.ts showcase` 与 `python3 scripts/mux_capture.py`。

截图含五视口、四个实际对战手势、十技能图集、毕业/失败，以及衣橱预览。横竖屏操作录像来自桌面触控模拟，**不是物理手机录制**。原始标准/慢速完整录像保留于全部交付包，准确时间以对应JSON的逻辑时间和真实派发时间为准。

## 仍需的外部条件

1. **物理手机与人类试玩**：规格要求的手机真实帧率、后台/旋转、手势辨识、标准与慢速漏选率、十按钮识别时间尚未实测。需在真实手机打开试玩或解压包，按验收清单完成；第三关技能差距需要新手试玩确认是否进一步调整AI权重。
2. **Toy开发者发布会话与实际容器**：当前未连接具备发布权限的Toy账号，未取得官方SDK授权接口。需在 [Toy发布入口](https://www.bilibili.com/toy/intro) 登录有发布权限账号，上传Toy ZIP，配置标题“拍拍波”和独立PNG封面/图标，确认预览、容器安全区与资源白名单后提交审核。`toy-poster.png` 和 `toy-icon.png` 已提供；云存档为可选增强，不影响本地玩。

试玩站点已发布不等于Toy正式上线。上述外部验收完成前，不将本候选标记为规格全部验收完成；所有不依赖这些条件的工程、资源、模拟、发布包与下载交付已完成。

下载文件通过固定版本分支 `deliveries/v1.0.0-rc.1` 提供。GitHub Release附件上传接口在本会话返回401；已通过普通Git推送托管这些文件，Release页面作为索引。请按delivery-manifest核对SHA256。

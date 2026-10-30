# 发布配置

目标仓库：https://github.com/zhipijun1996/wave-game

Sites project identity 固定保存在 `.openai/hosting.json`。静态资源目录为 `dist`；新Site默认仅所有者访问；仅在用户明确要求改变受众时修改访问范围。

本次环境中 Sites 源码/打包辅助脚本 `site-workflow.mjs` 未安装，云技能资源也不包含该文件，因此使用等价步骤：本地验证构建、将同一提交推入返回的专用源码仓库、将 `.openai/hosting.json` 与 `dist/` 打成 tar.gz、用原生 Sites 保存/发布工具提交该 SHA 与归档。短期凭据只经隐藏stdin进入内存，不写入仓库、文件或日志。

试玩站点的发布成功与Toy正式上线分开记录。Toy需有权限的开发者账号上传ZIP并审核；未接入未知的SDK接口，云存档是增强项。

首次成功发布：2026-10-30T05:02:35Z，原生工具返回 `succeeded`，URL：
https://paipai-wave-playground.zhipijun1996.chatgpt.site

首次发布时站点为所有者私有。2026-10-30，按用户“部署一个不需要登陆的网站试玩”的明确要求，将同一站点访问模式改为 `public`（访问策略revision 2），保留当前v1.2游戏版本与网址。任何持有链接的访客均可匿名试玩，无需ChatGPT账号。

匿名验证：全新Chromium浏览器上下文，不提供Cookie、认证或绕过请求头；首页HTTP 200，正常进入基础对战并显示3个技能，无脚本或HTTP错误。证据：`artifacts/public-access-qa.json`、`artifacts/public-anonymous-game.png`。此操作只改变托管访问权限，无需重新构建或发布游戏源码。

## v2.0公开更新

保留用户已明确设置的public受众和同一project_id，不创建新站。公开站按原生save_site_version（匹配的完整提交SHA与构建归档）→deploy_site_version发布；不使用owner-private部署接口。部署结果及匿名构建检查记录在交付证据的sites-deployment-v2.json、public-access-v2.json。源码与构建不含账号或原声素材授权依赖，所有运行声音为包内37个文件。

## v2.1原声与拍拍后选招

复用同一project_id/public受众/免登录URL。13个原声槽用带版本的`*-v2.1.wav`路径，避免旧WAV缓存；37音轨和NOTICE/manifest均本地打包。标准1350–2250ms输入窗口在第二拍收掌后开放，窗口截止才亮招。发布归档仅含本提交构建的dist与hosting配置，源码同步到站点专用远端；部署与匿名验证结果以artifacts/sites-deployment-v2.1.json、public-access-v2.1.json为准。

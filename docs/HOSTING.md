# 发布配置

目标仓库：https://github.com/zhipijun1996/wave-game

Sites project identity 固定保存在 `.openai/hosting.json`。静态资源目录为 `dist`；新Site默认仅所有者访问。不得为发布更改访问范围。

本次环境中 Sites 源码/打包辅助脚本 `site-workflow.mjs` 未安装，云技能资源也不包含该文件，因此使用等价步骤：本地验证构建、将同一提交推入返回的专用源码仓库、将 `.openai/hosting.json` 与 `dist/` 打成 tar.gz、用原生 Sites 保存/发布工具提交该 SHA 与归档。短期凭据只经隐藏stdin进入内存，不写入仓库、文件或日志。

试玩站点的发布成功与Toy正式上线分开记录。Toy需有权限的开发者账号上传ZIP并审核；未接入未知的SDK接口，云存档是增强项。

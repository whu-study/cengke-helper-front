# Worker 5 — 布局、路由、构建与运维/DevOps 支持

职责概述
- 负责应用的整体布局与路由配置（PC / Mobile 路由分流）、公共布局组件、以及构建脚本与部署辅助脚本（如 `vite.config.ts`、`upload.sh`）。
- 负责工程质量保证相关内容：启动脚本、项目配置（`tsconfig.json`、`pnpm-lock.yaml` 等）、以及在合并后协助定位和修复模板/样式冲突。

主要实现/修改（文件示例）
- `src/layout/pc/BasicLayout.vue`
  - 项目顶部/侧边栏整体布局，右侧统计卡位置与展示。
- `src/router/pc.ts`、`src/router/mobile.ts`、`src/router/index.ts`
  - 路由拆分与按需加载；确保 PC 与 Mobile 视图的入口正确。
- `vite.config.ts`、`upload.sh`
  - 本地运行与部署脚本，调整打包配置与环境变量写法。
- 协助修复合并引发的模板标签不匹配与样式空规则（示例：修复 `HomePage.vue` 的 `el-col` 闭合、修复 mobile CSS 空规则）。

关键设计决策
- 路由与布局分离，便于多人并行开发不同页面模块并保证入口清晰。
- 把可复用的布局/全局组件放在 `src/layout`，减少页面层重复代码。

演示要点
- 展示主布局（BasicLayout）如何渲染头部/侧边栏/主体，并切换不同路由查看 PC/Mobile 页面。
- 演示如何使用 `pnpm run dev` 启动项目与 `upload.sh` 的基本部署流程（或替代说明）。

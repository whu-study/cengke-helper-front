# Worker 3 — 帖子 / 社区统计 / 讨论页负责人

职责概述
- 负责讨论区（Discuss）相关前端逻辑、帖子 CRUD、活跃用户模块与社区统计数据的接入与展示。
- 负责与后端约定的社区统计/概览接口对接（`/posts/active-users`, `/community/stats`, `/community/overview`）。

主要实现/修改（文件示例）
- `src/api/postService.ts`
  - 新增 `apiGetActiveUsers()`、`apiGetCommunityStats()`、`apiGetCommunityOverview()` 等接口封装。
- `src/view/pc/DiscussPage.vue`、`src/view/pc/HomePage.vue`、`src/layout/pc/BasicLayout.vue`
  - 讨论页侧边栏、首页右侧统计卡与布局中引用社区概览数据，替换原有 mock 数据显示。
- `src/components/post/CreatePostForm.vue`、`src/components/post/PostItem.vue`
  - 发帖/帖子列表/帖子详情在 UI 中的动作与样式（包含活跃用户模块的展示）。

关键设计决策
- 使用后端提供的概览数据替代前端 mock，保证数据一致性并简化统计逻辑。
- 将 API 封装集中化在 `postService.ts`，页面组件仅调用封装方法获取数据。

演示要点
- 展示 DiscussPage 侧边栏的社区统计与活跃用户块如何实时反映后端数据。
- 演示发帖、列表刷新和社区概览卡片的联动效果。

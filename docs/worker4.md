# Worker 4 — 用户、认证与资料同步负责人

职责概述
- 负责用户认证、用户资料接口与前端展示（Profile、Publish 页面、登录/注册流程）的实现与维护。
- 负责把后端 ExtendedUserProfileVO 的字段接入到前端（postsCount、commentsCount、likesReceived 等），并统一 profile API 的实现位置。

主要实现/修改（文件示例）
- `src/api/profile.ts`
  - 将用户资料的 GET/PUT 实现集中到 `profile.ts`（`webGetProfile` / `webUpdateProfile`）。
- `src/api/authService.ts`
  - 保留认证函数（login/register/logout），并从 `profile.ts` 重新导出 `apiFetchUserProfile` / `apiUpdateUserProfile` 以兼容旧引用。
- `src/store/modules/userStore.ts`
  - `fetchUserProfile()` / `updateUserProfile()` 的调用与状态管理。
- `src/view/pc/ProfilePage.vue`、`src/view/pc/PublishPage.vue`
  - 将页面中显示的用户统计改为使用后端字段（postsCount、commentsCount、likesReceived）。

关键设计决策
- 将 profile API 迁移到专用模块，`authService.ts` 只保留 auth 相关逻辑并做兼容性 re-export，减少重复实现。
- 页面层直接从 `userStore` 读取 profile 字段，避免页面单独重复请求。

演示要点
- 登录后在 `ProfilePage` 与 `PublishPage` 展示后端真实的用户统计数据，演示更新资料后界面刷新效果。

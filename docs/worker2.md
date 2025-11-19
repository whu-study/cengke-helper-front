# Worker 2 — 课程视图与交互负责人（Helper / Card / Filter）

职责概述
- 负责课程展示相关组件与交互（PC / Mobile 两端的 Helper 视图、CourseCard、课程筛选页面与交互）。
- 负责把 store 中规范化后的课程数据渲染到 UI，并负责楼层/教室/教室列表的展示逻辑。

主要实现/修改（文件示例）
- `src/view/helper/PcHelperView.vue`、`src/view/helper/MobileHelperView.vue`
  - 四级结构呈现（学部 → 教学楼 → 楼层 → 教室/课程），楼层解析、空楼层提示。
- `src/view/helper/CourseCard.vue`、`src/view/helper/CourseFilterRoot.vue`
  - 课程卡片的展示（教师、教室、时间、课程类型）、在房间多时显示 `rooms.join(' / ')`。
- `src/view/helper/HelperCollapse.vue`
  - 负责“全局空状态/加载/错误”三态的展示逻辑（引用 store 进行条件判断）。

关键设计决策
- 保持 PC 与移动端展示逻辑一致，但在样式与交互上作差异化（例如移动端简化视图、PC 采用抽屉/侧栏细节）。
- 避免在视图层进行复杂数据转换，把转换逻辑放在 store 层完成以便复用。

演示要点
- 展示Helper 的四级导航，展开某楼层并查看该楼层课程。
- 展示课程筛选页对课程名称/学院/教室的筛选效果。

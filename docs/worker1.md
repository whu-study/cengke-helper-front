# Worker 1 — 前端课程与时间模块负责人

职责概述
- 负责课程时间相关的前端功能：当前时间显示、时间选择器（周次/星期/节次）、下一节逻辑和回到当前时间的流程。
- 负责课程数据在前端的接收与预处理（在课程 store 层做数据规范化、去重、rooms 数组维护）。
- 处理与课程展示强相关的错误防护（例如：后端返回空 buildings 时避免无限请求）。

主要实现/修改（文件示例）
- `src/components/CurrentTimeDisplay.vue`
  - 实现当前时间 Badge、时间选择下拉（支持 1–13 节）、移动端底部抽屉样式、下一节/回到当前交互。
- `src/store/modules/coursesStore.ts`
  - `fetchCurrentTime()`, `fetchCourseData()` 的实现与防护（`hasAttemptedFetch`）、`resetToCurrentTime()`（先刷新 currentTimeInfo 再拉课程），`fetchNextLessonCourses()`（13 节溢出逻辑）。
  - 数据转换与扁平化：`populateAllCoursesFlatList()`、`formatTimeSlots()`、去重并把 `rooms[]` 作为数组保存。
- `src/types/courseNew.ts`、`src/types/course.ts`（与课程时间/节次字段相关的类型声明）。

关键设计决策
- 把“时间信息”与“课程数据”分离：先刷新 `currentTimeInfo`（用于顶部显示），再刷新课程数据，避免 UI 不一致。
- 在 store 层做数据规范化，前端组件只消费结构化数据（例如 `rooms[]` 而不是逗号拼接字符串）。

演示要点
- 演示时间选择器（切到自定义时间，再回到“当前时间”），观察 badge（周次/星期/节次）与课程列表同步更新。
- 展示当后端返回空数据时，页面不会进入无限拉取循环。

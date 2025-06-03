// HomePage.txt
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { isGlobalDrawOpen } from "@/store/custom/globalData.ts";
import { useCourseStore } from "@/store/modules/coursesStore.ts";
import { usePostsStore } from '@/store/modules/postsStore.ts';
import { useUserStore } from '@/store/modules/userStore.ts';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import {  onMounted } from 'vue';
// 引入筛选器组件
// 假设这是您的课程卡片组件
import { ElDrawer } from 'element-plus';
import HelperRoot from "@/view/helper/HelperRoot.vue";
import CourseReviewForm from '@/components/course/CourseReviewForm.vue';
import CourseReviewItem from '@/components/course/CourseReviewItem.vue'; // 导入课程评价项组件
import PostItem from '@/components/post/PostItem.vue';
import CreatePostForm from '@/components/post/CreatePostForm.vue';

import { ElMessage, ElDialog, ElButton, ElDivider, ElSkeleton, ElAlert, ElEmpty, ElText } from 'element-plus';
import { ChatDotSquare, Plus } from '@element-plus/icons-vue';
import type { Post } from '@/types/discuss';
import type { CreatePostBody } from '@/api/postService';
import type { FormSubmitPayload } from '@/components/post/CreatePostForm.vue';
import CourseFilterRoot from "@/view/helper/CourseFilterRoot.vue"; // 假设这里导出
const coursesStore = useCourseStore();
const postsStore = usePostsStore();
const userStore = useUserStore();
const router = useRouter();

// --- 从 Store 中解构状态 ---
const {
  currentCourseInfo,
  currentCourseDetail, // 课程详细信息 (包含描述、学分、平均评分等)
  currentCourseReviews, // 课程评价列表
  isDetailLoading,    // 课程详情加载状态
  reviewsLoading,     // 评价列表加载状态
  error: courseError  // coursesStore 中的错误状态
} = storeToRefs(coursesStore);

// --- 本地状态 ---
const showReviewForm = ref(false);
const showCreatePostForm = ref(false);

const relatedPosts = ref<Post[]>([]);
const isLoadingPosts = ref(false);
const postsError = ref<string | null>(null);
const postsCurrentPage = ref(1);
const postsPageSize = ref(5); // 每页加载5个帖子
const totalRelatedPosts = ref(0);
const allPostsLoaded = ref(false);
const prefillTagsForCreatePost = ref<string[]>([]);

onMounted(() => {
  // 初始加载所有课程数据（如果尚未加载）
  if (coursesStore.allCoursesFlatList.length === 0 && !coursesStore.isLoading) {
    coursesStore.fetchCourseData();
  }
});


// --- 计算属性 ---
const currentCourseName = computed(() => currentCourseInfo.value?.courseName || '');
const currentCourseId = computed(() => currentCourseInfo.value?.id || null); // CourseInfo.id 是 number

// --- 方法：获取相关帖子 ---
async function fetchRelatedPosts(courseNameTag: string, page = 1, limit = postsPageSize.value) {
  if (!courseNameTag) {
    relatedPosts.value = [];
    totalRelatedPosts.value = 0;
    allPostsLoaded.value = true; // 没有标签，视为已加载完毕（空）
    return;
  }
  isLoadingPosts.value = true;
  postsError.value = null;
  try {
    await postsStore.fetchPosts({ // 假设 postsStore.fetchPosts 返回或更新 posts 和 pagination
      tag: courseNameTag,
      page: page,
      limit: limit,
    });
    if (page === 1) {
      relatedPosts.value = postsStore.posts;
    } else {
      relatedPosts.value = [...relatedPosts.value, ...postsStore.posts];
    }
    totalRelatedPosts.value = postsStore.pagination.totalPosts;
    postsCurrentPage.value = page;
    allPostsLoaded.value = relatedPosts.value.length >= totalRelatedPosts.value;
  } catch (error: any) {
    console.error('获取相关帖子失败:', error);
    postsError.value = error.message || '加载相关帖子失败';
  } finally {
    isLoadingPosts.value = false;
  }
}

// --- “加载更多”帖子的方法 ---
const loadMorePosts = () => {
  if (currentCourseName.value && !allPostsLoaded.value && !isLoadingPosts.value) {
    fetchRelatedPosts(currentCourseName.value, postsCurrentPage.value + 1, postsPageSize.value);
  }
};

// --- 监控课程变化 ---
watch(currentCourseInfo, (newCourseInfo) => {
  // 重置相关状态
  relatedPosts.value = [];
  totalRelatedPosts.value = 0;
  postsCurrentPage.value = 1;
  allPostsLoaded.value = false;
  showReviewForm.value = false;
  showCreatePostForm.value = false;

  if (newCourseInfo?.courseName) {
    fetchRelatedPosts(newCourseInfo.courseName, 1, postsPageSize.value);
  }
  // coursesStore 内部的 setCurrentCourseInfo 应该已经触发了 fetchCourseDetailById 和 fetchCourseReviews
}, { deep: true });

// --- 评价表单相关方法 ---
const handleReviewSubmitted = () => {
  showReviewForm.value = false;
  ElMessage.success('感谢您的评价！');
  // coursesStore.fetchCourseReviews 应该在 submitCourseReview action 成功后被调用
  coursesStore.fetchCourseReviews(currentCourseId.value!);
};
const handleReviewCancel = () => {
  showReviewForm.value = false;
};
// 新增：中间处理函数
const handlePostFormSubmit = (payload: FormSubmitPayload) => {
  // 简单校验，确保 title/body 不为 undefined
  if (!payload.title || !payload.content) {
    ElMessage.error('标题和内容不能为空');
    return;
  }
  // 类型断言为 CreatePostBody
  handlePostCreated(payload as CreatePostBody);
};

// 新增：取消方法
const handleCreatePostCancel = () => {
  showCreatePostForm.value = false;
};
// --- 发帖表单相关方法 ---
const openCreatePostForm = () => {
  if (!userStore.ifLogin) {
    ElMessage.warning('请先登录后再发帖！');
    router.push('/login');
    return;
  }
  prefillTagsForCreatePost.value = currentCourseName.value ? [currentCourseName.value] : [];
  showCreatePostForm.value = true;
};
const handlePostCreated = async (payload: CreatePostBody) => { // [修改点] 接收来自子组件的 payload
  // ElMessage.success('帖子发布成功！'); // 可以在 store action 成功后再提示
  // showCreatePostForm.value = false; // 也可以在 store action 成功后再关闭
  isLoadingPosts.value = true; // 可以设置一个通用的加载状态，或者 postsStore 内部有自己的

  try {
    const success = await postsStore.createPost(payload); // [修改点] 调用 store action 创建帖子

    if (success) {
      ElMessage.success('帖子发布成功！');
      showCreatePostForm.value = false; // 关闭表单
      if (currentCourseName.value) { // 重新加载与当前课程相关的帖子列表
        await fetchRelatedPosts(currentCourseName.value, 1, postsPageSize.value);
      }
      // 如果需要，还可以刷新全局的帖子列表等
    } else {
      ElMessage.error(postsStore.error || '帖子发布失败，请稍后重试。');
    }
  } catch (error: any) { // 以防 store action 抛出未捕获的错误
    console.error('处理创建帖子时发生错误:', error);
    ElMessage.error(error.message || '帖子发布时遇到未知错误。');
  } finally {
    isLoadingPosts.value = false;
  }
};

</script>

<template>
   
  <el-drawer
    v-model="isGlobalDrawOpen"
    direction="btt"
    size="90%"
    :title="currentCourseName ? `课程详情: ${currentCourseName}` : '课程详情'"
    class="course-detail-drawer"
    :destroy-on-close="true"
  >
    <template #default>
      <div class="drawer-content-wrapper">
        <div v-if="currentCourseInfo" class="course-details-content">
          <h3 class="course-name-title">{{ currentCourseInfo.courseName }}</h3>
          <div class="course-info-grid">
            <p><span class="info-label">教师:</span> {{ currentCourseInfo.teacherName }} {{ currentCourseInfo.teacherTitle }}</p>
            <p><span class="info-label">教室:</span> {{ currentCourseInfo.room }}</p>
            <p><span class="info-label">时间:</span> {{ currentCourseInfo.courseTime }}</p>
            <p><span class="info-label">学部/学院:</span> {{ currentCourseInfo.faculty }}</p>
            <p><span class="info-label">类型:</span> {{ currentCourseInfo.courseType }}</p>
          </div>

          <div v-if="isDetailLoading" class="loading-indicator text-center section-block">
             <el-skeleton :rows="2" animated />
             <p>正在加载课程详情...</p>
          </div>
          <div v-else-if="currentCourseDetail" class="course-extended-details section-block">
            <p v-if="currentCourseDetail.description"><span class="info-label">课程描述:</span> {{ currentCourseDetail.description }}</p>
            <p v-if="currentCourseDetail.credits"><span class="info-label">学分:</span> {{ currentCourseDetail.credits }}</p>
            <p v-if="currentCourseDetail.rating !== undefined && currentCourseDetail.rating !== null">
              <span class="info-label">平均评分:</span>
              <el-rate :model-value="currentCourseDetail.rating" disabled show-score score-template="{value} / 5" size="small" style="display: inline-flex; margin-left: 5px;"/>
              ({{ currentCourseDetail.reviewCount || 0 }}条评价)
            </p>
          </div>
          <div v-else-if="courseError && !isDetailLoading && !currentCourseDetail" class="error-message text-center section-block">
            <el-alert :title="`加载课程详情失败: ${courseError}`" type="warning" show-icon :closable="false" />
          </div>


          <el-divider content-position="left">课程评价</el-divider>
          <div class="review-section section-block">
            <div v-if="!showReviewForm" class="text-center action-prompt">
              <el-button
                v-if="userStore.ifLogin"
                type="primary"
                round
                size="large"
                @click="showReviewForm = true"
                class="action-button review-toggle-button"
                :icon="ChatDotSquare"
              >
                评价这门课程
              </el-button>
              <el-button
                v-else
                type="warning"
                round
                size="large"
                @click="router.push('/profile')"
                class="action-button review-toggle-button"
                :icon="ChatDotSquare"
              >
                登录后评价
              </el-button>
            </div>

            <CourseReviewForm
              v-if="showReviewForm "
              :course-id="currentCourseId"
              @review-submitted="handleReviewSubmitted"
              @cancel="handleReviewCancel"
              class="embedded-review-form"
            />

            <div class="course-reviews-list-wrapper" v-if="!showReviewForm">
              <h4 v-if="!reviewsLoading && currentCourseReviews && currentCourseReviews.length > 0" class="reviews-list-title">
                大家怎么说 ({{ currentCourseReviews.length }}条评价)
              </h4>
              <div v-if="reviewsLoading" class="loading-indicator text-center">
                <el-skeleton :rows="3" animated />
                <p>正在加载评价...</p>
              </div>
              <div v-else-if="courseError && !reviewsLoading && (!currentCourseReviews || currentCourseReviews.length === 0)" class="error-message text-center">
                 <el-alert :title="`加载评价失败: ${courseError}`" type="error" show-icon :closable="false" />
              </div>
              <div v-else-if="currentCourseReviews && currentCourseReviews.length > 0" class="reviews-list">
                <CourseReviewItem
                  v-for="review in currentCourseReviews"
                  :key="review.id"
                  :review="review"
                />
              </div>
              <div v-else-if="!reviewsLoading && (!currentCourseReviews || currentCourseReviews.length === 0)" class="no-reviews text-center">
                <el-empty description="暂无评价，快来参与第一个评价吧！" :image-size="70"></el-empty>
              </div>
            </div>
          </div>

          <el-divider content-position="left">相关帖子讨论</el-divider>
          <div class="related-posts-section section-block">
            <div class="related-posts-header">
              <h4>与 "{{ currentCourseName }}" 相关的讨论</h4>
              <el-button
                v-if="userStore.ifLogin"
                type="success"
                round
                :icon="Plus"
                @click="openCreatePostForm"
                class="action-button"
              >
                参与讨论 (发新帖)
              </el-button>
              <el-button
                v-else
                type="warning"
                round
                :icon="Plus"
                @click="router.push('/profile')"
                class="action-button"
              >
                登录后参与讨论
              </el-button>
            </div>

            <div v-if="isLoadingPosts && postsCurrentPage === 1" class="loading-indicator text-center">
              <el-skeleton :rows="3" animated />
              <p>正在加载相关讨论...</p>
            </div>
            <div v-else-if="postsError && relatedPosts.length === 0" class="error-message text-center">
              <el-alert :title="postsError" type="error" show-icon :closable="false" />
            </div>
            <div v-else-if="relatedPosts.length > 0" class="post-list-items-wrapper">
              <PostItem
                v-for="post in relatedPosts"
                :key="post.id"
                :post="post"
                class="related-post-item"
              />
            </div>
            <div v-else-if="!isLoadingPosts && relatedPosts.length === 0" class="no-posts-found text-center">
              <el-empty :description="`还没有关于 '${currentCourseName}' 的讨论，快来发起第一个吧！`" :image-size="80">
                 <el-button
                    v-if="userStore.ifLogin"
                    type="primary"
                    round
                    :icon="Plus"
                    @click="openCreatePostForm"
                    class="action-button"
                  >
                    我来发一帖
                  </el-button>
              </el-empty>
            </div>

            <div v-if="!allPostsLoaded && relatedPosts.length > 0 && relatedPosts.length < totalRelatedPosts" class="load-more-container text-center">
              <el-button
                @click="loadMorePosts"
                :loading="isLoadingPosts"
                type="primary"
                plain
                round
                class="action-button"
              >
                加载更多相关讨论
              </el-button>
            </div>
            <div v-if="allPostsLoaded && relatedPosts.length > 0 && relatedPosts.length >= totalRelatedPosts && totalRelatedPosts > postsPageSize" class="text-center no-more-posts">
              <el-text type="info">没有更多相关讨论了</el-text>
            </div>
          </div>
        </div>
        <div v-else class="no-course-selected">
          <el-empty description="请先选择一门课程以查看详情、评价和相关讨论。" :image-size="100"></el-empty>
        </div>
      </div>
    </template>

    <template #footer>
      <div style="flex: auto; text-align: right; padding: 10px 20px;">
        <el-button @click="isGlobalDrawOpen = false" round>关闭</el-button>
      </div>
    </template>
  </el-drawer>

  <el-dialog
    v-model="showCreatePostForm"
    title="创建新帖子讨论"
    width="clamp(320px, 90vw, 800px)"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    top="5vh"
    class="create-post-dialog"
  >
  <CreatePostForm
  v-if="showCreatePostForm"
  :initial-tags="prefillTagsForCreatePost"
  @submit-form="handlePostFormSubmit"
  @cancel-edit="handleCreatePostCancel"
/>
  </el-dialog>
  <n-h3 style="text-align: center">
    蹭课小助手 Pro
  </n-h3>
  <n-divider />
  <n-tabs type="segment" animated>
      <n-tab-pane name="page1" tab="小助手首页">
        <HelperRoot/>

      </n-tab-pane>
      <n-tab-pane name="page2" tab="课程筛选">
        <CourseFilterRoot/>
      </n-tab-pane>
    </n-tabs>
</template>

<style scoped lang="scss">
.course-detail-drawer {
  :deep(.el-drawer__header) {
    padding: 16px 20px;
    margin-bottom: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    font-size: 18px;
    color: var(--el-text-color-primary);
    font-weight: 600;
  }

  :deep(.el-drawer__body) {
    padding: 0;
  }
}

.drawer-content-wrapper {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: var(--el-bg-color-page); // 使用 Element Plus 页面背景色变量
}

.course-details-content {
  .course-name-title {
    font-size: 24px; // 稍大一些
    font-weight: 700; // 更粗
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .course-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px 20px;
    margin-bottom: 25px;
    padding: 15px;
    background-color: var(--el-bg-color-overlay); // 卡片背景色
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);

    p {
      margin: 0;
      padding: 6px 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      &:last-child {
        border-bottom: none;
      }
    }

    .info-label {
      font-weight: 500;
      color: var(--el-text-color-secondary);
      width: 80px; // 标签宽度统一
      flex-shrink: 0;
      margin-right: 8px;
    }
  }
  .course-extended-details {
    padding: 15px;
    background-color: var(--el-bg-color-overlay);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    font-size: 14px;
     p {
      margin: 0 0 8px 0;
      color: var(--el-text-color-regular);
      display: flex;
      align-items: flex-start; // 对于多行描述，标签顶部对齐
      &:last-child {
        margin-bottom: 0;
      }
    }
    .info-label {
      font-weight: 500;
      color: var(--el-text-color-secondary);
      width: 80px;
      flex-shrink: 0;
      margin-right: 8px;
    }
  }
}

.el-divider {
  margin: 30px 0;
  font-size: 18px; // 标题分隔符稍大
  :deep(.el-divider__text) { // 确保能选中
    font-weight: 600;
    color: var(--el-text-color-primary);
    background-color: var(--el-bg-color-page); // 使文字背景与页面背景一致
    padding: 0 15px;
  }
}

.section-block {
  margin-bottom: 30px;
  padding: 20px; // 给每个区块统一内边距
  background-color: var(--el-fill-color-blank); // 使用 Element Plus 的空白填充色
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-lighter);
}

.action-prompt {
  margin-bottom: 20px;
}

.text-center {
  text-align: center;
}

.action-button { // 统一主要行动按钮样式
  padding: 10px 20px;
  font-size: 15px;
}

.review-toggle-button {
  // 特殊样式可在此添加
}

.embedded-review-form {
  margin-left: auto;
  margin-right: auto;
  max-width: 600px;
  margin-bottom: 25px;
}

.course-reviews-list-wrapper {
  margin-top: 20px;
}

.reviews-list-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 18px;
  padding-left: 5px;
}

.reviews-list {
  // max-height: 450px; // 可选：如果评价很多，限制高度并滚动
  // overflow-y: auto;
}

.loading-indicator,
.error-message,
.no-reviews,
.no-posts-found {
  padding: 25px 0;
  text-align: center;
  p {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 10px;
  }
  .el-alert {
    margin: 0 auto;
    max-width: 90%;
  }
}

.related-posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.post-list-items-wrapper {
  margin-bottom: 20px;
  .related-post-item {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
    // background-color: #fff; // 给 PostItem 一个独立背景色，如果需要
    // border-radius: 6px;
    // box-shadow: var(--el-box-shadow-lighter);
    // padding: 10px; // 如果 PostItem 本身没有足够的内边距
  }
}

.load-more-container, .no-more-posts {
  margin-top: 25px;
  padding: 10px 0;
}
.no-more-posts .el-text {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.no-course-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px; // 确保有足够空间显示 Empty 状态
  padding: 20px;
  .el-empty {
    // 可以自定义 Empty 组件的样式
  }
}

.create-post-dialog {
  .el-dialog__header {
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  .el-dialog__body {
    padding: 20px 25px;
  }
}
</style>
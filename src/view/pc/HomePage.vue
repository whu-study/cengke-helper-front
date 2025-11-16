<template>
  <div class="pc-home-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">蹭课小助手</h1>
          <p class="page-subtitle">发现优质课程，分享学习心得</p>
        </div>
        <div class="header-right">
          <CurrentTimeDisplay />
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="content-left">
        <!-- 课程助手区域 -->
        <el-card class="helper-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h2>课程助手</h2>
              <el-tag type="success" size="small">智能推荐</el-tag>
            </div>
          </template>

          <!-- 标签页切换 -->
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="小助手首页" name="helper">
              <div class="helper-root-wrapper">
                <HelperRoot @switch-to-filter="switchToFilterPage" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="课程筛选" name="filter">
              <div class="filter-root-wrapper">
                <CourseFilterRoot/>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

          <el-card class="recent-discussions" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>最新讨论</h3>
                <el-button type="primary" link @click="goToDiscuss">
                  查看更多 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>

            <div v-if="recentPostsLoading" class="loading-wrapper">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="recentPosts.length > 0" class="posts-preview">
              <div
                v-for="post in recentPosts"
                :key="post.id"
                class="post-preview-item"
                @click="goToPostDetail(Number(post.id))"
              >
                <div class="post-info">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <div class="post-meta">
                    <el-tag size="small" v-for="tag in post.tags?.slice(0, 2)" :key="tag">
                      {{ tag }}
                    </el-tag>
                    <span class="post-author">by {{ post.author?.username }}</span>
                    <span class="post-time">{{ getTimeGap(new Date(), new Date(post.createdAt)) }}</span>
                  </div>
                </div>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><ChatDotSquare /></el-icon> {{ post.commentsCount || 0 }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-posts">
              <el-empty description="暂无讨论，快去发布第一个帖子吧！" :image-size="60">
                <el-button type="primary" @click="goToPublish">发布帖子</el-button>
              </el-empty>
            </div>
          </el-card>
        </div>
      </el-col>

      <el-col :xs="24" :sm="24" :md="9" :lg="8" :xl="8">
        <div class="content-right">
          <el-card class="user-status-card" shadow="hover" v-if="userStore.ifLogin">
            <template #header>
              <h3>个人中心</h3>
            </template>
            <div class="user-profile">
              <el-avatar :size="60" :src="userStore.userInfo?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-info">
                <h4>{{ userStore.userInfo?.username || '用户' }}</h4>
                <p class="user-role">{{ userStore.userInfo?.role || '普通用户' }}</p>
              </div>
            </div>
            <el-divider />
            <div class="user-actions">
              <el-button type="primary" plain @click="goToProfile" block>
                <el-icon><User /></el-icon> 个人中心
              </el-button>
              <el-button type="success" plain @click="goToMyPosts" block>
                <el-icon><Document /></el-icon> 我的帖子
              </el-button>
            </div>
          </el-card>

          <el-card class="login-prompt-card" shadow="hover" v-else>
            <template #header>
              <h3>欢迎使用</h3>
            </template>
            <div class="login-prompt">
              <el-icon class="welcome-icon"><UserFilled /></el-icon>
              <h4>登录享受更多功能</h4>
              <p>登录后可以发布帖子、参与讨论、收藏课程</p>
              <el-button type="primary" @click="goToLogin" block>
                立即登录
              </el-button>
            </div>
          </el-card>

          <el-card class="hot-tags-card" shadow="hover">
            <template #header>
              <h3>热门标签</h3>
            </template>
            <div class="hot-tags">
              <el-tag
                v-for="tag in hotTags"
                :key="tag.name"
                class="tag-item"
                @click="searchByTag(tag.name)"
                :type="getTagType(tag.count)"
              >
                {{ tag.name }} ({{ tag.count }})
              </el-tag>
            </div>
          </el-card>

        <!-- 统计信息（课程与帖子概览） -->
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <h3>课程概览</h3>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <el-icon class="stat-icon"><Document /></el-icon>
              <div class="stat-content">
                <div class="stat-number">{{ communityOverview.currentPeriodCourses }}</div>
                <div class="stat-label">当前时段课程总数</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon"><Star /></el-icon>
              <div class="stat-content">
                <div class="stat-number">{{ communityOverview.todayCourses }}</div>
                <div class="stat-label">今日课程总数</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon"><ChatDotSquare /></el-icon>
              <div class="stat-content">
                <div class="stat-number">{{ communityOverview.todayPosts }}</div>
                <div class="stat-label">今日帖子总数</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 课程详情抽屉 (保持与移动端一致的功能) -->
    <el-drawer
      v-model="isGlobalDrawOpen"
      direction="rtl"
      size="50%"
      :title="currentCourseName ? `课程详情: ${currentCourseName}` : '课程详情'"
      class="course-detail-drawer-pc"
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
                  @click="goToLogin"
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
                  @click="goToLogin"
                  class="action-button"
                >
                  登录后参与讨论
                </el-button>
              </div>

              <div v-if="isLoadingPosts && postsCurrentPage === 1" class="loading-indicator text-center">
                <el-skeleton :rows="3" animated />
                <p>正在加载相关讨论...</p>
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
            </div>
          </div>
          <div v-else class="no-course-selected">
            <el-empty description="请先选择一门课程以查看详情、评价和相关讨论。" :image-size="100"></el-empty>
          </div>
        </div>
      </template>
    </el-drawer>

    <el-dialog
      v-model="showCreatePostForm"
      title="创建新帖子讨论"
      width="800px"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { apiGetCommunityOverview } from '@/api/postService';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCourseStore } from "@/store/modules/coursesStore";
import { usePostsStore } from '@/store/modules/postsStore';
import { useUserStore } from '@/store/modules/userStore';
import { isGlobalDrawOpen } from "@/store/custom/globalData";
import { getTimeGap } from '@/utils/globalFunc';
import type { Post } from '@/types/discuss';
import type { CreatePostBody } from '@/api/postService';
import type { FormSubmitPayload } from '@/components/post/CreatePostForm.vue';

// 组件导入
import HelperRoot from "@/view/helper/HelperRoot.vue";
import CourseFilterRoot from "@/view/helper/CourseFilterRoot.vue";
import CourseReviewForm from '@/components/course/CourseReviewForm.vue';
import CourseReviewItem from '@/components/course/CourseReviewItem.vue';
import PostItem from '@/components/post/PostItem.vue';
import CreatePostForm from '@/components/post/CreatePostForm.vue';
import CurrentTimeDisplay from '@/components/CurrentTimeDisplay.vue';

// --- (已删除) AgentChat 的导入 ---

// 图标导入
import {
  ArrowRight,
  View,
  ChatDotSquare,
  User,
  UserFilled,
  Document,
  Star,
  Plus
} from '@element-plus/icons-vue';

// Store
const coursesStore = useCourseStore();
const postsStore = usePostsStore();
const userStore = useUserStore();
const router = useRouter();

// 从Store解构状态
const {
  currentCourseInfo,
  currentCourseDetail,
  currentCourseReviews,
  isDetailLoading,
  reviewsLoading
} = storeToRefs(coursesStore);

// 本地状态
const activeTab = ref('helper');
const recentPosts = ref<Post[]>([]);
const recentPostsLoading = ref(false);
const showReviewForm = ref(false);
const showCreatePostForm = ref(false);
const relatedPosts = ref<Post[]>([]);
const isLoadingPosts = ref(false);
const postsCurrentPage = ref(1);
const totalRelatedPosts = ref(0);
const allPostsLoaded = ref(false);
const prefillTagsForCreatePost = ref<string[]>([]);

// 计算属性
const currentCourseName = computed(() => currentCourseInfo.value?.courseName || '');
const currentCourseId = computed(() => currentCourseInfo.value?.id || null);

// totalComments 已移除，使用后端概览替代页面右侧统计

const hotTags = ref([
  { name: '数学', count: 156 },
  { name: '编程', count: 89 },
  { name: '英语', count: 67 },
  { name: '物理', count: 45 },
  { name: '化学', count: 34 },
  { name: '文学', count: 23 }
]);

// 方法
const handleTabClick = (tab: any) => {
  console.log('Tab clicked:', tab.paneName);
};

// 切换到课程筛选页面
const switchToFilterPage = () => {
  activeTab.value = 'filter';
};

const goToDiscuss = () => {
  router.push('/discuss');
};

const goToPublish = () => {
  router.push('/publish');
};

const goToProfile = () => {
  router.push('/profile');
};

const goToLogin = () => {
  router.push('/profile');
};

const goToMyPosts = () => {
  if (userStore.userInfo?.id) {
    router.push(`/user/${userStore.userInfo.id}/posts`);
  }
};

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

const searchByTag = (tagName: string) => {
  router.push({ path: '/discuss', query: { tag: tagName } });
};

const getTagType = (count: number) => {
  if (count > 100) return 'danger';
  if (count > 50) return 'warning';
  return 'info';
};

const fetchRecentPosts = async () => {
  recentPostsLoading.value = true;
  try {
    await postsStore.fetchPosts({ page: 1, limit: 5, sortBy: 'createdAt_desc' });
    recentPosts.value = postsStore.posts.slice(0, 5);
  } catch (error) {
    console.error('获取最新帖子失败:', error);
  } finally {
    recentPostsLoading.value = false;
  }
};

// 社区课程概览（用于右侧统计卡）
const communityOverview = ref<{ currentPeriodCourses: number; todayCourses: number; todayPosts: number }>({
  currentPeriodCourses: 0,
  todayCourses: 0,
  todayPosts: 0,
});

const fetchCommunityOverview = async () => {
  try {
    const res = await apiGetCommunityOverview();
    if (res.code === 0 && res.data) {
      communityOverview.value.currentPeriodCourses = Number(res.data.currentPeriodCourses || 0);
      communityOverview.value.todayCourses = Number(res.data.todayCourses || 0);
      communityOverview.value.todayPosts = Number(res.data.todayPosts || 0);
    } else {
      console.warn('获取社区概览信息失败', res.msg);
    }
  } catch (err) {
    console.error('fetchCommunityOverview error', err);
  }
};

// 课程相关方法（与移动端保持一致）
async function fetchRelatedPosts(courseNameTag: string, page = 1, limit = 5) {
  if (!courseNameTag) {
    relatedPosts.value = [];
    totalRelatedPosts.value = 0;
    allPostsLoaded.value = true;
    return;
  }
  isLoadingPosts.value = true;
  try {
    await postsStore.fetchPosts({
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
  } finally {
    isLoadingPosts.value = false;
  }
}

const loadMorePosts = () => {
  if (currentCourseName.value && !allPostsLoaded.value && !isLoadingPosts.value) {
    fetchRelatedPosts(currentCourseName.value, postsCurrentPage.value + 1, 5);
  }
};

const handleReviewSubmitted = () => {
  showReviewForm.value = false;
  coursesStore.fetchCourseReviews(currentCourseId.value!);
};

const handleReviewCancel = () => {
  showReviewForm.value = false;
};

const openCreatePostForm = () => {
  if (!userStore.ifLogin) {
    router.push('/profile');
    return;
  }
  prefillTagsForCreatePost.value = currentCourseName.value ? [currentCourseName.value] : [];
  showCreatePostForm.value = true;
};

const handlePostFormSubmit = (payload: FormSubmitPayload) => {
  if (!payload.title || !payload.content) {
    return;
  }
  handlePostCreated(payload as CreatePostBody);
};

const handleCreatePostCancel = () => {
  showCreatePostForm.value = false;
};

const handlePostCreated = async (payload: CreatePostBody) => {
  isLoadingPosts.value = true;
  try {
    const success = await postsStore.createPost(payload);
    if (success) {
      showCreatePostForm.value = false;
      if (currentCourseName.value) {
        await fetchRelatedPosts(currentCourseName.value, 1, 5);
      }
    }
  } catch (error: any) {
    console.error('处理创建帖子时发生错误:', error);
  } finally {
    isLoadingPosts.value = false;
  }
};

// 监听器
watch(currentCourseInfo, (newCourseInfo) => {
  relatedPosts.value = [];
  totalRelatedPosts.value = 0;
  postsCurrentPage.value = 1;
  allPostsLoaded.value = false;
  showReviewForm.value = false;
  showCreatePostForm.value = false;

  if (newCourseInfo?.courseName) {
    fetchRelatedPosts(newCourseInfo.courseName, 1, 5);
  }
}, { deep: true });

// 生命周期
onMounted(() => {
  // 初始加载数据
  fetchRecentPosts();
  fetchCommunityOverview();

  // 主页统一负责加载课程数据
  if (coursesStore.allCoursesFlatList.length === 0 && 
      !coursesStore.isLoading && 
      !coursesStore.hasAttemptedFetch) {
    console.log('PC HomePage: 主动加载课程数据');
    coursesStore.fetchCourseData();
  } else {
    console.log('PC HomePage: 课程数据已存在、正在加载或已尝试获取');
  }
});
</script>

<style scoped lang="scss">
.pc-home-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
  border-radius: 12px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    
    .header-left {
      text-align: left;
      
      .page-title {
        font-size: 36px;
        font-weight: 700;
        margin: 0 0 10px 0;
      }

      .page-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
    }
  }
}

.main-content {
  align-items: flex-start;
}

/* (已删除 AI 助手的上边距样式) */

.content-left {
  flex: 1;
  min-width: 0;

  .helper-card {
    margin-bottom: 30px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #303133;
      }
    }

    .helper-root-wrapper,
    .filter-root-wrapper {
      min-height: 400px;
    }
  }

  .recent-discussions {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
    }

    .loading-wrapper {
      padding: 20px 0;
    }

    .posts-preview {
      .post-preview-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #f8f9fa;
          margin: 0 -15px;
          padding: 15px;
          border-radius: 8px;
        }

        &:last-child {
          border-bottom: none;
        }

        .post-info {
          flex: 1;

          .post-title {
            font-size: 16px;
            font-weight: 500;
            color: #303133;
            margin: 0 0 8px 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .post-meta {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            color: #909399;

            .el-tag {
              font-size: 11px;
              height: 20px;
              line-height: 18px;
            }

            .post-author,
            .post-time {
              color: #909399;
            }
          }
        }

        .post-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          font-size: 12px;
          color: #909399;

          span {
            display: flex;
            align-items: center;
            gap: 3px;

            .el-icon {
              font-size: 12px;
            }
          }
        }
      }
    }

    .no-posts {
      padding: 40px 0;
    }
  }
}

.content-right {
  flex-shrink: 0;

  .el-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #303133;
        font-weight: 600;
      }
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .user-status-card {
    .user-profile {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .user-info {
        margin-left: 15px;

        h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #303133;
        }

        .user-role {
          margin: 0;
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .user-actions {
      .el-button {
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-icon {
          margin-right: 5px;
        }
      }
    }
  }

  .login-prompt-card {
    .login-prompt {
      text-align: center;

      .welcome-icon {
        font-size: 40px;
        color: #409eff;
        margin-bottom: 15px;
      }

      h4 {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #303133;
      }

      p {
        margin: 0 0 20px 0;
        font-size: 14px;
        color: #606266;
        line-height: 1.5;
      }
    }
  }

  .hot-tags-card {
    .hot-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag-item {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .stats-card {
    .stats-grid {
      .stat-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        .stat-icon {
          font-size: 24px;
          color: #409eff;
          margin-right: 15px;
        }

        .stat-content {
          .stat-number {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
            line-height: 1;
            margin-top: 2px;
          }
        }
      }
    }
  }
}

/* ===== (已删除 AI 助手栏样式) ===== */

/* 课程详情抽屉样式 (保持不变) */
.course-detail-drawer-pc {
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

  .drawer-content-wrapper {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
    background-color: var(--el-bg-color-page);
  }

  // ... (其他抽屉内部样式保持不变)
  .course-details-content {
    .course-name-title {
      font-size: 24px;
      font-weight: 700;
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
      background-color: var(--el-bg-color-overlay);
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
        width: 80px;
        flex-shrink: 0;
        margin-right: 8px;
      }
    }
  }

  .section-block {
    margin-bottom: 30px;
    padding: 20px;
    background-color: var(--el-fill-color-blank);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-lighter);
  }

  // ... (其他抽屉内部样式保持不变)
}

/* 响应式设计 (el-col 会自动处理) */
@media (max-width: 1200px) {
  /* ... */
}

@media (max-width: 992px) {
  .content-right {
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 30px 0;
    margin-bottom: 20px;

    .header-content {
      .page-title {
        font-size: 28px;
      }
      .page-subtitle {
        font-size: 16px;
      }
    }
  }

  .content-right {
    margin-top: 0;
  }
}
</style>
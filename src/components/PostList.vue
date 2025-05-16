<template>
  <div class="post-list-container">
    <h2 v-if="pageTitle" class="list-title">{{ pageTitle }}</h2>

    <div v-if="showControls" class="controls-container el-card is-always-shadow">
      <el-form inline :model="localFilterSortState" label-width="auto" label-position="left">
        <el-form-item label="排序方式" class="control-item">
          <el-select
            v-model="localFilterSortState.sortBy"
            placeholder="选择排序"
            @change="onSortChange"
            class="control-select"
          >
            <el-option label="最新发布" value="createdAt_desc"></el-option>
            <el-option label="最早发布" value="createdAt_asc"></el-option>
            <el-option label="最多点赞" value="likesCount_desc"></el-option>
            <el-option label="最多评论" value="commentsCount_desc"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="筛选帖子" class="control-item">
          <el-input
            v-model="localFilterSortState.filterText"
            placeholder="输入帖子标题关键字"
            clearable
            @input="onFilterTextChangeDebounced"
            @clear="onFilterTextChange"
            class="control-input"
          >
            <template #prepend>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="loading" class="loading-container">
      <el-row :gutter="responsiveGutter">
        <el-col :xs="24" :sm="12" :md="8" v-for="n in pageSize" :key="`skeleton-${n}`" class="list-item-col">
          <el-card shadow="hover">
            <el-skeleton :rows="5" animated />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty
      v-else-if="!loading && postsToDisplay.length === 0"
      :description="emptyDescription"
      :image-size="100"
    >
      <el-button v-if="hasActiveFilters && showControls" type="primary" @click="clearAllFilters">清空筛选和排序</el-button>
      <el-button v-else-if="!hasActiveFilters && showCreateButton" type="primary" @click="goToCreatePost">去发布第一篇帖子</el-button>
    </el-empty>

    <el-row :gutter="responsiveGutter" v-else>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="post in postsToDisplay"
        :key="post.id"
        class="list-item-col"
      >
        <PostItem :post="post" />
      </el-col>
    </el-row>

    <div v-if="showPagination && totalPosts > 0 && totalPosts > pageSize" class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="totalPosts"
        :page-sizes="[6, 9, 12, 15, 30]"
        v-model:page-size="internalPageSize"
        v-model:current-page="internalCurrentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import type { PropType } from 'vue';
import PostItem from './PostItem.vue'; // 确保 PostItem.vue 在同一目录或正确路径
import type { Post } from '@/types/discuss'; // 确保类型路径正确
import { Search } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';
import { useRouter } from 'vue-router';

// --- Props 定义 ---
const props = defineProps({
  // 如果父组件直接管理帖子数据列表 (例如从 store 获取后传递)
  posts: {
    type: Array as PropType<Post[]>,
    default: () => [], // 如果 PostList 自己获取数据，这个 prop 可以设为可选或移除
  },
  // 如果 PostList 自己获取数据，以下 prop 是必须的
  loading: {
    type: Boolean,
    default: false,
  },
  total: { // 总帖子数，用于分页
    type: Number,
    default: 0,
  },
  currentPage: { // 当前页码
    type: Number,
    default: 1,
  },
  pageSize: { // 每页数量
    type: Number,
    default: 9,
  },
  // 控制UI元素
  showPagination: {
    type: Boolean,
    default: true,
  },
  showControls: { // 是否显示排序和筛选控件
    type: Boolean,
    default: true,
  },
  pageTitle: { // 页面/列表的标题
    type: String,
    default: '',
  },
  showCreateButton: { // 在空状态时是否显示“去发布”按钮
    type: Boolean,
    default: false, // 通常在通用列表页为 true，在“我的帖子”页可能为 true
  },
  // 筛选和排序相关的 props
  authorId: { // 核心：用于筛选特定作者的帖子
    type: [String, Number],
    default: null,
  },
  currentSortBy: { // 父组件管理的当前排序方式
    type: String,
    default: 'createdAt_desc',
  },
  currentFilterText: { // 父组件管理的当前筛选文本
    type: String,
    default: '',
  },
});

// --- Emits 定义 ---
const emit = defineEmits<{
  (e: 'page-change', payload: { page: number; limit: number }): void;
  (e: 'filter-change', filters: { sortBy?: string; filterText?: string; authorId?: string | number | null }): void;
}>();

const router = useRouter();

// --- 本地响应式状态 ---
const localFilterSortState = ref({
  sortBy: props.currentSortBy,
  filterText: props.currentFilterText,
});
const internalCurrentPage = ref(props.currentPage);
const internalPageSize = ref(props.pageSize);

// --- 计算属性 ---
const postsToDisplay = computed(() => props.posts); // 直接使用父组件传入的 posts
const totalPosts = computed(() => props.total); // 使用父组件传入的 total

const hasActiveFilters = computed(() => {
  // 如果 authorId 存在，也认为是一种“激活的筛选”状态，影响空状态提示
  return localFilterSortState.value.filterText !== '' ||
         localFilterSortState.value.sortBy !== 'createdAt_desc' ||
         !!props.authorId; // 如果 authorId 存在
});

const emptyDescription = computed(() => {
  if (props.loading) return '正在加载帖子...';
  if (props.authorId && postsToDisplay.value.length === 0) return '您还没有发布过任何帖子。';
  if (hasActiveFilters.value && postsToDisplay.value.length === 0) return '没有匹配的帖子，尝试调整筛选条件。';
  return '暂无任何帖子';
});

const responsiveGutter = computed(() => window.innerWidth < 768 ? 16 : 20);


// --- 侦听器 ---
watch(() => props.currentPage, (newPage) => internalCurrentPage.value = newPage);
watch(() => props.pageSize, (newSize) => internalPageSize.value = newSize);
watch(() => props.currentSortBy, (newSort) => localFilterSortState.value.sortBy = newSort);
watch(() => props.currentFilterText, (newText) => localFilterSortState.value.filterText = newText);

// 当 authorId, sortBy, 或 filterText 任何一个变化时，都应该通知父组件重新获取数据
// 这是一个集中的侦听器，而不是单独侦听每个筛选条件
watch(
  () => ({
    authorId: props.authorId,
    sortBy: localFilterSortState.value.sortBy, // 监听本地状态，因为控件绑定的是本地状态
    filterText: localFilterSortState.value.filterText, // 同上
  }),
  (newFilters, oldFilters) => {
    // 只有当实际的筛选条件变化时才触发，避免不必要的请求
    // 这里可以加入更精细的判断，比如 immediate: true 时的首次触发处理
    // 或者判断 newFilters 和 oldFilters 是否真的不同
    if (JSON.stringify(newFilters) !== JSON.stringify(oldFilters) || !oldFilters) { // 简单比较
        emit('filter-change', {
            sortBy: newFilters.sortBy,
            filterText: newFilters.filterText,
            authorId: newFilters.authorId, // 将 authorId 包含在 filter-change 事件中
        });
    }
  },
  { deep: true, immediate: true } // immediate 确保挂载时根据初始props触发一次
);


// --- 事件处理函数 ---
const handleCurrentPageChange = (page: number) => {
  internalCurrentPage.value = page;
  emit('page-change', { page, limit: internalPageSize.value });
};

const handleSizeChange = (size: number) => {
  internalPageSize.value = size;
  internalCurrentPage.value = 1; // 通常改变每页数量时回到第一页
  emit('page-change', { page: 1, limit: size });
};

const onSortChange = () => {
  // localFilterSortState.value.sortBy 已通过 v-model 更新
  // 筛选条件变化由集中的 watch 处理
};

const onFilterTextChange = () => {
  // localFilterSortState.value.filterText 已通过 v-model 更新
  // 筛选条件变化由集中的 watch 处理
};

const onFilterTextChangeDebounced = debounce(onFilterTextChange, 600);

const clearAllFilters = () => {
  localFilterSortState.value.sortBy = 'createdAt_desc';
  localFilterSortState.value.filterText = '';
  // 清空筛选时不应改变 authorId，因为它定义了列表的上下文
  // 筛选条件变化由集中的 watch 处理，它会使用当前的 props.authorId
};

const goToCreatePost = () => {
  router.push({ name: 'CreatePost' }); // 假设发布页路由名为 CreatePost
};

// --- 生命周期钩子 ---
onMounted(() => {
  // 同步本地分页状态，以防父组件的初始值与 ref 的默认值不同
  internalCurrentPage.value = props.currentPage;
  internalPageSize.value = props.pageSize;
  localFilterSortState.value.sortBy = props.currentSortBy;
  localFilterSortState.value.filterText = props.currentFilterText;

  // 移除此处单独的 emit('filter-change')，因为上面的 watch(..., {immediate: true}) 会在挂载时处理
});

</script>

<style scoped>
.post-list-container {
  padding: clamp(16px, 3vw, 24px);
  background-color: var(--el-bg-color-page, #f0f2f5); /* 使用 Element Plus 变量或默认值 */
  border-radius: 8px;
}

.list-title {
  font-size: clamp(20px, 2.5vw, 28px);
  color: var(--el-text-color-primary, #303133);
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

.controls-container {
  border-radius: 8px;
  background-color: var(--el-bg-color-overlay, #ffffff);
  margin-bottom: 20px;
  padding: 16px;
  box-shadow: var(--el-box-shadow-light);
}

.controls-container .el-form {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 16px;
}

.controls-container .el-form-item {
  margin-bottom: 0; /* el-form 的 gap 会处理间距 */
  flex-grow: 1; /* 允许表单项伸展 */
}

.control-select,
.control-input {
  width: 100%; /* 在 flex item 中占满 */
  min-width: 180px; /* 防止过窄 */
}


.loading-container {
  margin-top: 20px;
}

.list-item-col {
  margin-bottom: clamp(16px, 3vw, 20px); /* 统一列表项间距 */
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  padding-bottom: 10px;
}

.pagination-container .el-pagination {
  flex-wrap: wrap;
  justify-content: center;
}

.el-empty {
  padding: 40px 0;
}

.el-empty__description {
  font-size: 16px;
  margin-top: 12px;
}

/* 响应式调整 */
@media (max-width: 767px) { /* 典型的移动端断点 */
  .controls-container .el-form {
    flex-direction: column;
  }
  .control-select,
  .control-input {
    min-width: unset; /* 移动端允许更窄 */
  }
  .list-title {
    font-size: clamp(18px, 5vw, 24px);
    margin-bottom: 16px;
  }
}
</style>
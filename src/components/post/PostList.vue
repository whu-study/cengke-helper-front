<template>
  <div class="post-list-container">
    <div v-if="showControls" class="controls-container el-card is-always-shadow" :style="{ marginBottom: '2vw', padding: '1.5vw' }">
      <el-form inline :model="localFilterSortState" label-width="auto" label-position="left">
        <el-form-item label="排序方式" class="control-item">
          <el-select
            v-model="localFilterSortState.sortBy"
            placeholder="选择排序"
            @change="onSortChange"
            :style="{ width: '15vw' }"
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
            :style="{ width: '25vw' }"
          >
            <template #prepend>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="loading" class="loading-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="n in pageSize" :key="`skeleton-${n}`" :style="{ marginBottom: '2vw' }">
          <el-card shadow="hover">
            <el-skeleton :rows="5" animated />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty
      v-else-if="!loading && posts.length === 0"
      :description="hasActiveFilters ? '没有匹配的帖子，尝试调整筛选条件' : '暂无任何帖子'"
      :image-size="100"
    >
      <el-button v-if="hasActiveFilters" type="primary" @click="clearAllFilters">清空筛选和排序</el-button>
    </el-empty>

    <el-row :gutter="20" v-else>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="post in posts"
        :key="post.id"
        :style="{ marginBottom: '2vw' }"
      >
        <PostItem :post="post" />
      </el-col>
    </el-row>

    <div v-if="showPagination && total > 0 && total > pageSize" class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="total"
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
import PostItem from './PostItem.vue';
import type { Post } from '@/types/discuss.ts';
import { Search } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es'; // 引入 debounce

// --- Props 定义 ---
const props = defineProps({
  posts: {
    type: Array as PropType<Post[]>,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  initialPageSize: { // 这个 prop 可以考虑移除，让 pageSize 直接由父组件或 store 控制
    type: Number,
    default: 9,
  },
  showControls: {
    type: Boolean,
    default: true,
  },
  // 从父组件接收分页和筛选排序状态，最终它们应该来自 store
  total: { // 总帖子数
    type: Number,
    required: true,
  },
  currentPage: { // 当前页码
    type: Number,
    required: true,
  },
  pageSize: { // 每页数量
    type: Number,
    required: true,
  },
  // 父组件维护的筛选和排序状态，可以双向绑定或通过事件更新
  // 这里我们假设父组件会传递这些初始值，并且 PostList 通过事件通知父组件更改
  currentSortBy: {
    type: String,
    default: 'createdAt_desc',
  },
  currentFilterText: {
    type: String,
    default: '',
  },
});

// --- Emits 定义 ---
const emit = defineEmits<{
  (e: 'page-change', page: number, limit: number): void; // 页码或每页数量变化
  (e: 'filter-change', filters: { sortBy?: string; filterText?: string }): void; // 筛选或排序条件变化
}>();

// --- 本地响应式状态 ---
// 用于控件双向绑定，其变化会触发 emit 事件
const localFilterSortState = ref({
  sortBy: props.currentSortBy,
  filterText: props.currentFilterText,
});

// 用于分页组件双向绑定，其变化会触发 emit 事件
const internalCurrentPage = ref(props.currentPage);
const internalPageSize = ref(props.pageSize);

// --- 计算属性 ---
// 判断是否有激活的筛选或非默认排序
const hasActiveFilters = computed(() => {
  return localFilterSortState.value.filterText !== '' || localFilterSortState.value.sortBy !== 'createdAt_desc';
});

// --- 侦听器 ---
// 侦听来自父组件的 props 变化，同步本地分页状态
watch(() => props.currentPage, (newPage) => {
  internalCurrentPage.value = newPage;
});
watch(() => props.pageSize, (newSize) => {
  internalPageSize.value = newSize;
});
// 侦听父组件传递的筛选排序状态，同步本地控件状态
watch(() => props.currentSortBy, (newSortBy) => {
  localFilterSortState.value.sortBy = newSortBy;
});
watch(() => props.currentFilterText, (newFilterText) => {
  localFilterSortState.value.filterText = newFilterText;
});


// --- 事件处理函数 ---

// 页码变化时触发
const handleCurrentPageChange = (page: number) => {
  internalCurrentPage.value = page; // 更新本地状态（如果 pagination 是 v-model，会自动更新）
  emit('page-change', page, internalPageSize.value);
};

// 每页数量变化时触发
const handleSizeChange = (size: number) => {
  internalPageSize.value = size; // 更新本地状态
  // 当每页数量变化时，通常将页码重置到第一页，并发出事件
  internalCurrentPage.value = 1;
  emit('page-change', 1, size);
};

// 排序方式变化时触发
const onSortChange = () => {
  // localFilterSortState.value.sortBy 已经通过 v-model 更新
  emit('filter-change', { sortBy: localFilterSortState.value.sortBy, filterText: localFilterSortState.value.filterText });
};

// 筛选文本变化时触发 (无防抖)
const onFilterTextChange = () => {
  emit('filter-change', { sortBy: localFilterSortState.value.sortBy, filterText: localFilterSortState.value.filterText });
};

// 防抖处理筛选文本输入
const onFilterTextChangeDebounced = debounce(() => {
  onFilterTextChange();
}, 500); // 500毫秒防抖

// 清空所有筛选和排序，并通知父组件
const clearAllFilters = () => {
  localFilterSortState.value.sortBy = 'createdAt_desc'; // 重置为默认排序
  localFilterSortState.value.filterText = '';
  emit('filter-change', { sortBy: localFilterSortState.value.sortBy, filterText: localFilterSortState.value.filterText });
};


// --- 生命周期钩子 ---
onMounted(() => {
  // 初始化时，如果 pageSize 与 initialPageSize 不同，可以考虑同步一次
  // 但更推荐由父组件通过 prop (pageSize) 直接控制
  if (props.pageSize !== props.initialPageSize && props.initialPageSize) {
      // internalPageSize.value = props.initialPageSize;
      // emit('page-change', internalCurrentPage.value, props.initialPageSize);
      // 或者，如果 initialPageSize 只是一个建议，则以父组件的 pageSize 为准
  }
  internalCurrentPage.value = props.currentPage;
  internalPageSize.value = props.pageSize;
  localFilterSortState.value.sortBy = props.currentSortBy;
  localFilterSortState.value.filterText = props.currentFilterText;
});

</script>

<style scoped>
/* 组件根元素样式 */
.post-list-container {
  padding: 4vw 3vw; /* 增大内边距，便于移动端操作 */
  background-color: #f9fafb;
  border-radius: 3vw; /* 增大圆角 */
}

/* 加载状态容器样式 */
.loading-container {
  margin-top: 4vw;
}

/* 分页控件容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 5vw; /* 增大间距 */
  padding-bottom: 3vw;
}

/* 分页组件自定义样式 */
.pagination-container .el-pagination {
  flex-wrap: wrap; /* 允许分页组件换行 */
  justify-content: center;
}

/* 排序和筛选控件容器样式 */
.controls-container {
  border-radius: 3vw;
  background-color: #fff;
  margin-bottom: 4vw !important; /* 覆盖内联样式 */
  padding: 3vw !important; /* 覆盖内联样式 */
}

/* 表单控件样式 */
.controls-container .el-form {
  display: flex;
  flex-direction: column; /* 移动端改为垂直布局 */
  gap: 3vw; /* 使用 gap 替代 margin */
}

/* 表单项样式 */
.controls-container .el-form-item {
  margin-bottom: 0;
  width: 100%; /* 宽度占满 */
}

/* 输入框和选择器样式 */
.controls-container .el-input,
.controls-container .el-select {
  width: 100% !important; /* 宽度占满 */
}

/* 选择器下拉菜单样式 */
.controls-container .el-select-dropdown {
  max-width: 80vw; /* 限制最大宽度 */
}

/* 优化 el-empty 空状态组件的样式 */
.el-empty {
  padding: 10vw 0; /* 增大内边距 */
}

.el-empty__description {
  font-size: 4vw; /* 增大字体 */
  margin-top: 3vw;
}

/* 卡片项间距调整 */
.el-col {
  margin-bottom: 4vw !important; /* 增大卡片间距 */
}

/* 响应式调整：小屏幕优化 */
@media (max-width: 420px) {
  /* 进一步增大字体和间距 */
  .post-list-container {
    padding: 5vw 4vw;
  }

  .controls-container {
    border-radius: 4vw;
  }

  .el-empty__description {
    font-size: 4.5vw;
  }

  /* 分页组件在小屏幕上简化 */
  .pagination-container .el-pagination__total,
  .pagination-container .el-pagination__jump {
    display: none; /* 隐藏总条数和跳转 */
  }

  .pagination-container .el-pagination__sizes {
    width: 100%; /* 每页条数选择器占满一行 */
    margin-top: 3vw;
  }
}

/* 响应式调整：超小屏幕优化 */
@media (max-width: 320px) {
  .post-list-container {
    padding: 6vw 4vw;
  }

  .controls-container {
    padding: 4vw !important;
  }

  /* 进一步简化分页 */
  .pagination-container .el-pagination__sizes {
    display: none;
  }
}
</style>
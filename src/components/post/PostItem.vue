<template>
  <el-card class="post-item-card" shadow="hover" :body-style="{ padding: '0px' }">
    <template #header>
      <div class="card-header">
        <router-link :to="postDetailLink" class="post-title-link">
          <h3 class="post-title">{{ post.title }}</h3>
        </router-link>
        <div class="post-tags" v-if="post.tags && post.tags.length > 0">
          <el-tag
              v-for="tag in post.tags.slice(0, 2)"
              :key="tag"
              type="info"
              size="small"
              effect="light"
              style="margin-right: 0.5vw;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </template>

    <div class="card-body" @click="navigateToPostDetail" role="link" tabindex="0" @keydown.enter="navigateToPostDetail">
      <p class="post-excerpt">{{ truncatedContent }}</p>

      <div class="post-meta">
        <div class="author-info">
          <el-avatar :size="24" :src="post.author.avatar" class="author-avatar">
            {{ post.author.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="author-name">{{ post.author.username }}</span>
        </div>
        <span class="publish-time">发布于: {{ formattedPublishTime }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="post-stats">
        <span class="stat-item">
          <el-icon :size="16" style="vertical-align: middle;"><Star /></el-icon>
          {{ post.likesCount || 0 }} 点赞
        </span>
        <span class="stat-item">
          <el-icon :size="16" style="vertical-align: middle;"><ChatDotRound /></el-icon>
          {{ post.commentsCount || 0 }} 评论
        </span>
        <span class="stat-item" v-if="post.viewCount !== undefined">
           <el-icon :size="16" style="vertical-align: middle;"><ViewIcon /></el-icon>
          {{ post.viewCount }} 浏览
        </span>
      </div>
      <router-link :to="postDetailLink" class="details-link">
        <el-button type="primary" plain size="small" round>查看详情</el-button>
      </router-link>
    </div>
  </el-card>
</template>

<script setup lang="ts">
// 从 Vue 引入所需的 API
import { computed } from 'vue';
import type { PropType } from 'vue';
// 引入 Post 类型定义 (根据用户提供的 PostItem.txt，路径为 @/types/discuss.ts)
import type { Post } from '@/types/discuss';
// 引入 vue-router 的 useRouter (如果需要编程式导航，但这里主要用 router-link)
import { useRouter } from 'vue-router';
// 引入 Element Plus 图标
import { Star, ChatDotRound, View as ViewIcon } from '@element-plus/icons-vue';

// --- Props 定义 ---
// 使用 defineProps 宏定义组件接收的外部属性 (props)
const props = defineProps({
  /**
   * 帖子数据对象
   * 类型为 Post，此 prop 是必需的
   */
  post: {
    type: Object as PropType<Post>, // 使用 PropType 来为复杂类型提供更佳的类型推断
    required: true, // 标记此 prop 为必需
  },
});

// 获取 Vue Router 实例，用于编程式导航
const router = useRouter();

// --- 计算属性 ---

/**
 * 计算属性：生成帖子详情页的链接
 * 假设帖子详情页的路由名称为 'PostDetail'，并且需要一个 id 参数
 */
const postDetailLink = computed(() => {
  return { name: 'PostDetail', params: { id: props.post.id } };
  // 如果你的路由是 /post/:id 这样的路径，也可以用：
  // return `/post/${props.post.id}`;
});

/**
 * 计算属性：格式化帖子的发布时间
 * 将 createdAt (可能是 Date 对象或 ISO 字符串) 格式化为更易读的日期字符串
 */
const formattedPublishTime = computed(() => {
  if (!props.post.createdAt) return '未知时间';
  const date = new Date(props.post.createdAt);
  // 你可以使用更复杂的日期格式化库 (如 date-fns 或 dayjs)
  // 这里是一个简单的格式化示例
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
  });
});

/**
 * 计算属性：生成帖子内容的截断摘要
 * 从帖子内容中截取一部分作为摘要显示
 */
const truncatedContent = computed(() => {
  const content = props.post.content || '';
  // 移除 HTML 标签 (简单实现，对于复杂 HTML 可能不够健壮)
  const plainText = content.replace(/<[^>]+>/g, '');
  const maxLength = 80; // 摘要最大长度
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength) + '...';
});


// --- 方法 ---

/**
 * 方法：导航到帖子详情页
 * 当卡片主体被点击时调用
 */
const navigateToPostDetail = () => {
  router.push(postDetailLink.value);
};

</script>

<style scoped>
/* PostItem 卡片整体样式 */
.post-item-card {
  border-radius: clamp(8px, 0.8vw, 12px); /* 使用 clamp 优化圆角 */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}

.post-item-card:hover {
  transform: translateY(clamp(-5px, -0.3vw, -2px)); /* 优化悬浮效果 */
  box-shadow: 0 clamp(4px, 0.8vw, 10px) clamp(8px, 1.5vw, 20px) rgba(0, 0, 0, 0.1);
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 1vw, 15px) clamp(12px, 1.5vw, 20px); /* 使用 clamp 优化内边距 */
  border-bottom: 1px solid #ebeef5;
}

/* 帖子标题链接样式 */
.post-title-link {
  text-decoration: none;
  color: #303133;
  font-weight: 600;
  transition: color 0.2s;
  flex-grow: 1;
  margin-right: clamp(8px, 1vw, 12px);
}

.post-title-link:hover {
  color: #409EFF;
}

/* 帖子标题样式 */
.post-title {
  margin: 0;
  font-size: clamp(14px, 1.5vw, 20px); /* 使用 clamp 优化字体大小 */
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  /* min-height: calc(clamp(14px, 1.5vw, 20px) * 1.4 * 2); */ /* min-height 可能需要更复杂的计算或固定值 */
  min-height: 2.8em; /* 使用 em 单位确保基于当前字体大小的高度 */
}

/* 帖子标签区域 */
.post-tags {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30%;
  flex-shrink: 0;
}
.post-tags .el-tag {
  font-size: clamp(10px, 0.8vw, 12px); /* 优化标签字体 */
}


/* 卡片主体内容区样式 */
.card-body {
  padding: clamp(10px, 1vw, 18px) clamp(12px, 1.5vw, 20px); /* 使用 clamp */
  font-size: clamp(13px, 1.2vw, 16px); /* 使用 clamp */
  color: #606266;
  line-height: 1.6;
  flex-grow: 1;
  cursor: pointer;
}

/* 帖子摘要样式 */
.post-excerpt {
  margin-top: 0;
  margin-bottom: clamp(8px, 1vw, 15px); /* 使用 clamp */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  /* min-height: calc(clamp(13px, 1.2vw, 16px) * 1.6 * 3); */
  min-height: 3.2em; /* 使用 em 单位 */
}

/* 帖子元数据区域 (作者、时间) */
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(11px, 1vw, 14px); /* 使用 clamp */
  color: #909399;
  margin-top: auto;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  margin-right: clamp(4px, 0.5vw, 8px); /* 使用 clamp */
  flex-shrink: 0;
}

.author-name {
  font-weight: 500;
  color: #555;
}

.publish-time {
  white-space: nowrap;
}

/* 卡片底部样式 */
.card-footer {
  padding: clamp(8px, 1vw, 12px) clamp(12px, 1.5vw, 20px); /* 使用 clamp */
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fcfcfc;
  flex-wrap: wrap;
}

/* 帖子统计信息区域 */
.post-stats {
  display: flex;
  align-items: center;
  font-size: clamp(11px, 1vw, 14px); /* 使用 clamp */
  color: #606266;
  margin-bottom: clamp(5px, 1vw, 10px); /* 适配 flex-wrap */
}

.stat-item {
  display: inline-flex;
  align-items: center;
  margin-right: clamp(10px, 1.5vw, 15px); /* 使用 clamp */
}
.stat-item:last-child {
  margin-right: 0;
}

.stat-item .el-icon {
  margin-right: clamp(3px, 0.3vw, 5px); /* 使用 clamp */
  color: #909399;
}
.stat-item .el-icon svg { /* 确保图标大小也响应 */
  width: clamp(12px, 1.2vw, 16px);
  height: clamp(12px, 1.2vw, 16px);
}


.details-link .el-button {
  transition: background-color 0.2s, color 0.2s;
  font-size: clamp(12px, 1.1vw, 14px); /* 优化按钮字体 */
  padding: clamp(6px, 0.8vw, 10px) clamp(10px, 1.2vw, 15px); /* 优化按钮内边距 */
}

/* 响应式调整 */
@media (max-width: 420px) {
  .post-item-card {
    border-radius: clamp(10px, 2.5vw, 15px); /* 对应 PostItem.txt */
    /* margin-bottom: 2vw; */ /* 由 PostList 控制 */
  }
  .card-header, .card-body {
    padding: clamp(10px, 2vw, 15px) clamp(12px, 3vw, 18px); /* 对应 PostItem.txt */
  }
  .card-footer {
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 3vw, 18px); /* 对应 PostItem.txt */
    flex-direction: column;
    align-items: flex-start;
  }
  .post-title {
    font-size: clamp(16px, 4.5vw, 22px); /* 对应 PostItem.txt */
    -webkit-line-clamp: 2;
    min-height: 2.8em;
  }
  .post-tags {
    display: none;
  }
  .card-body {
    font-size: clamp(14px, 3.5vw, 18px); /* 对应 PostItem.txt */
  }
  .post-excerpt {
    font-size: clamp(15px, 4vw, 19px); /* 对应 PostItem.txt */
    -webkit-line-clamp: 2;
    min-height: 2.4em;
  }
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    font-size: clamp(13px, 3.5vw, 16px); /* 对应 PostItem.txt */
  }
  .publish-time {
    margin-top: clamp(4px, 1vw, 6px); /* 对应 PostItem.txt */
  }
  .post-stats {
    width: 100%;
    justify-content: space-between;
    margin-bottom: clamp(8px, 2vw, 12px); /* 对应 PostItem.txt */
    font-size: clamp(12px, 3vw, 15px); /* 对应 PostItem.txt */
  }
  .stat-item {
    margin-right: 0;
    flex: 1;
    justify-content: center;
  }
  .details-link {
    width: 100%;
    margin-top: clamp(4px, 1vw, 8px); /* 对应 PostItem.txt */
  }
  .details-link .el-button {
    width: 100%;
    padding: clamp(8px, 1.5vw, 12px) 0; /* 对应 PostItem.txt */
    font-size: clamp(13px, 3.5vw, 16px);
  }
}

/* 移除了原有的 @media (min-width: 768px) 查询，因为 clamp 已经处理了较大屏幕的适应性。
   如果需要针对非常大的桌面屏幕进行特定调整，可以重新添加。
*/
</style>
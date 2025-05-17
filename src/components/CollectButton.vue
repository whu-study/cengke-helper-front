// src/components/CollectButton.vue
<template>
  <el-button
    :type="isCollectedState ? 'warning' : 'default'"
    :plain="!isCollectedState"
    :icon="isCollectedState ? CollectionTagFilled : CollectionTag"
    @click="handleToggleCollect"
    :loading="isLoading"
    :size="size"
    round
    class="collect-button"
    aria-live="polite"
    :aria-pressed="isCollectedState"
    :aria-label="isCollectedState ? '取消收藏' : '收藏'"
  >
    <span v-if="showText" class="collect-text">{{ isCollectedState ? '已收藏' : '收藏' }}</span>
    <span class="collect-count">{{ currentCollects }}</span>
  </el-button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
// 使用 Element Plus 的 FolderAdded (已收藏) 和 Folder (未收藏) 图标，或者其他你选择的收藏图标
// 这里我用 CollectionTag 和 CollectionTagFilled (假设这些图标存在或你用自定义的)
// 如果没有 CollectionTagFilled，可以用 StarFilled 替代，或自定义 SVG
import { CollectionTag, FolderOpened as CollectionTagFilled } from '@element-plus/icons-vue'; // 假设 FolderOpened 作为已收藏图标
import { ElMessage } from 'element-plus';
import { usePostsStore } from '@/store/modules/postsStore';
import type { ToggleCollectResponseData } from '@/api/postService';

const props = defineProps({
  itemId: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },
  initialCollects: { // 收藏数
    type: Number,
    default: 0,
  },
  isInitiallyCollected: { // 是否已收藏
    type: Boolean,
    default: false,
  },
  itemType: { // 目前只支持 'post'
    type: String as PropType<'post'>,
    required: true,
    validator: (value: string) => ['post'].includes(value),
  },
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default',
  },
  showText: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits<{
  (e: 'collect-toggled', payload: { itemId: string | number; itemType: 'post'; isCollected: boolean; newCollectsCount: number }): void;
}>();

const postsStore = usePostsStore();

const isCollectedState = ref(props.isInitiallyCollected);
const currentCollects = ref(props.initialCollects);
const isLoading = ref(false);

watch(() => props.isInitiallyCollected, (newValue) => {
  isCollectedState.value = newValue;
});
watch(() => props.initialCollects, (newValue) => {
  currentCollects.value = newValue;
});

const handleToggleCollect = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  const previousCollectedState = isCollectedState.value;
  const previousCollectsCount = currentCollects.value;

  try {
    let responseData: ToggleCollectResponseData | null = null;

    if (props.itemType === 'post') {
        postsStore.toggleCollectPost(props.itemId).then(
        (res: ToggleCollectResponseData | null) => {
          responseData = res;
          if (responseData) {
      isCollectedState.value = responseData.isCollected;
      currentCollects.value = responseData.collectCount;
      emit('collect-toggled', {
        itemId: props.itemId,
        itemType: props.itemType,
        isCollected: isCollectedState.value,
        newCollectsCount: currentCollects.value,
      });
      // ElMessage.success(isCollectedState.value ? '收藏成功!' : '已取消收藏');
    } else {
      isCollectedState.value = previousCollectedState;
      currentCollects.value = previousCollectsCount;
      // Store action 应该已经提示了 ElMessage
    }
        }
      );
    }
    // 未来如果支持其他类型收藏，可以在这里添加 else if

    
  } catch (error: any) {
    console.error(`处理收藏/取消收藏失败 for ${props.itemType} ID ${props.itemId}:`, error);
    isCollectedState.value = previousCollectedState;
    currentCollects.value = previousCollectsCount;
    ElMessage.error(error.message || '操作失败，请稍后再试');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.collect-button {
  transition: all 0.2s ease-in-out;
  min-width: 15vw; /* 调整以适应 "收藏" 或图标 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.5vw 2.5vw;
  font-size: 3.5vw;
}
.collect-button .el-icon {
  font-size: 4vw;
  margin-right: 0.8vw;
}
.collect-count {
  font-weight: 500;
  min-width: 3vw;
  text-align: left;
}
.collect-text {
  margin-left: 0.8vw;
}
/* ... (可以复用 LikeButton 的尺寸和媒体查询样式，只需将 .like-button 替换为 .collect-button) ... */
@media (min-width: 768px) {
  .collect-button {
    min-width: 80px; /* 或根据 "收藏" 文本调整 */
    padding: 8px 15px;
    font-size: 14px;
  }
  .collect-button .el-icon {
    font-size: 16px;
    margin-right: 5px;
  }
  .collect-count {
    min-width: 15px;
  }
}
</style>
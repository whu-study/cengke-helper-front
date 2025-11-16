<template>
  <div class="messages-list" ref="messageListRef">
    <div v-for="msg in messages" :key="msg.id" :class="`message-row ${msg.role}`">
      <el-avatar v-if="msg.role === 'assistant'" :icon="User" class="avatar" />
      
      <div class="message-content">
        <div v-html="msg.content.replace(/\n/g, '<br>')"></div>
      </div>

      <el-avatar v-if="msg.role === 'user'" :src="userAvatar" class="avatar">
         <el-icon><User /></el-icon>
      </el-avatar>
    </div>
    <div v-if="isLoading" class="message-row assistant">
      <el-avatar :icon="User" class="avatar" />
      <div class="message-content">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>思考中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import type { ChatMessage } from '@/types/agent'; // 确保您已创建此类型
import { useUserStore } from '@/store/modules/userStore';
import { User, Loading } from '@element-plus/icons-vue';

const props = defineProps<{
  messages: ChatMessage[];
  isLoading: boolean;
}>();

const userStore = useUserStore();
const messageListRef = ref<HTMLElement | null>(null);

const userAvatar = computed(() => userStore.userInfo?.avatar);

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  const el = messageListRef.value;
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
};

watch(() => props.messages, scrollToBottom, { deep: true, immediate: true });
watch(() => props.isLoading, scrollToBottom, { immediate: true });
</script>

<style scoped lang="scss">
.messages-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--el-bg-color-page, #f0f2f5); // 匹配 PC 布局背景色
}

.message-row {
  display: flex;
  margin-bottom: 18px;
  gap: 10px;

  &.user {
    justify-content: flex-end;
    .message-content {
      background-color: var(--el-color-primary);
      color: white;
      border-radius: 10px 10px 0 10px;
    }
  }

  &.assistant {
    justify-content: flex-start;
    .message-content {
      background-color: #ffffff;
      color: var(--el-text-color-primary);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 10px 10px 10px 0;
    }
  }
}

.message-content {
  padding: 10px 15px;
  max-width: 75%;
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
  box-shadow: var(--el-box-shadow-lighter);

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }
}

.avatar {
  flex-shrink: 0;
}
</style>
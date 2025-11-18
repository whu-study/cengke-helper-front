<template>
  <div class="chat-input-area">
    <el-input
      v-model="query"
      @keydown.enter="send"
      placeholder="向 AI 助手提问..."
      :disabled="loading"
      size="large"
    >
      <template #append>
        <el-button @click="send" :loading="loading" :icon="Promotion" type="primary" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Promotion } from '@element-plus/icons-vue';
// 假设您在 PC 端使用 Element-Plus

const props = defineProps<{ loading: boolean }>();
const emit = defineEmits(['send']);
const query = ref('');

const send = () => {
  if (!props.loading && query.value.trim()) {
    emit('send', query.value);
    query.value = '';
  }
};
</script>

<style scoped lang="scss">
.chat-input-area {
  padding: 15px;
  background-color: #ffffff;
  border-top: 1px solid var(--el-border-color-lighter);
}
:deep(.el-input-group__append) {
  background-color: var(--el-color-primary);
  color: white;
  &:hover {
    background-color: var(--el-color-primary-light-3);
  }
}
</style>
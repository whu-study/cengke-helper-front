<template>
  <div class="agent-page-container">
    <el-card class="agent-chat-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3><el-icon><ChatDotSquare /></el-icon> AI 助手</h3>
          <el-tag type="warning" size="small" effect="light">Beta</el-tag>
        </div>
      </template>
      <AgentChat />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import AgentChat from '@/components/agent/AgentChat.vue';
import { ChatDotSquare } from '@element-plus/icons-vue';
</script>

<style scoped lang="scss">
.agent-page-container {
  max-width: 1000px; // 限制聊天页面的最大宽度
  margin: 0 auto; // 居中
  height: calc(100vh - 100px); // 占满 BasicLayout 的主区域高度 (60px header + 20px*2 padding)
}

.agent-chat-card {
  height: 100%;
  border: none;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #303133;
      font-weight: 600;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 6px;
        font-size: 18px;
        color: #409eff;
      }
    }
  }

  :deep(.el-card__body) {
    padding: 0; // 让 AgentChat 占满
    flex-grow: 1;
    display: flex;
    overflow: hidden;
  }
}
</style>
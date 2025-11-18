<template>
  <div class="agent-chat-wrapper">
    <ChatWindow :messages="agentStore.messages" :is-loading="agentStore.isLoading" />
    <ChatInput @send="handleSend" :loading="agentStore.isLoading" />
  </div>
</template>

<script setup lang="ts">
import { useAgentStore } from '@/store/modules/agent'; // 确保您已创建此 store
import ChatWindow from '@/components/agent/ChatWindow.vue';
import ChatInput from '@/components/agent/ChatInput.vue';

const agentStore = useAgentStore();

const handleSend = (query: string) => {
  if (query.trim()) {
    agentStore.sendMessage(query);
  }
};
</script>

<style scoped lang="scss">
.agent-chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%; // 占满父容器的高度
  width: 100%;
  background-color: #ffffff;
}
</style>
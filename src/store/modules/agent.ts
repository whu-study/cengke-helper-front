// src/store/modules/agent.ts
import { defineStore } from 'pinia';
import type { AgentState, ChatMessage } from '@/types/agent';
import { fetchAgentStream } from '@/api/agent';
import { v4 as uuidv4 } from 'uuid'; // (需要 npm install uuid @types/uuid)

export const useAgentStore = defineStore('agent', {
  state: (): AgentState => ({
    messages: [],
    isLoading: false,
  }),
  actions: {
    async sendMessage(query: string) {
      // 1. 添加用户消息
      this.messages.push({
        id: uuidv4(),
        role: 'user',
        content: query,
      });

      // 2. 准备 Agent 回复
      this.isLoading = true;
      const assistantMessageId = uuidv4();
      this.messages.push({
        id: assistantMessageId,
        role: 'assistant',
        content: '', // 初始为空
      });
      
      // 找到刚刚添加的 assistant 消息
      const currentMessage = this.messages.find(m => m.id === assistantMessageId);
      if (!currentMessage) return;

      // 3. 调用流式 API
      await fetchAgentStream(
        query,
        (chunk) => {
          // 4. (核心) 将数据块追加到消息内容
          currentMessage.content += chunk;
        },
        () => {
          // 5. 流结束
          this.isLoading = false;
        },
        (error) => {
          // 6. 处理错误
          currentMessage.content = `发生错误: ${error.message}`;
          this.isLoading = false;
        }
      );
    },
  },
});
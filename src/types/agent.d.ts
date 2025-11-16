// src/types/agent.d.ts
export interface ChatMessage {
  id: string; // 唯一 ID
  role: 'user' | 'assistant'; // 角色
  content: string; // 消息内容
}

// (可选) Pinia store 的状态
export interface AgentState {
  messages: ChatMessage[];
  isLoading: boolean;
}
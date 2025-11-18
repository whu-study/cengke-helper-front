// src/api/agent.ts

// 从环境变量获取基础 URL，这比硬编码更好
// 您的 .env.development 文件应包含：
// VITE_AGENT_API_URL=http://127.0.0.1:4523/m1/6131655-5823385-default
// 或者直接指向您的 Go 后端
// VITE_AGENT_API_URL=http://localhost:8033/api/v1
const AGENT_BASE_URL = "http://localhost:8000";

/**
 * Agent 聊天流式接口
 * * @param query 用户的问题
 * @param onChunk 接收到数据块的回调
 * @param onDone 流结束时的回调
 * @param onError 发生错误的回调
 */
export async function fetchAgentStream(
  query: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
) {
  try {
    const response = await fetch(`${AGENT_BASE_URL}/agent/chat_stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 如果您的 Go 后端需要认证，请在这里附加 Token
        // 'Authorization': `Bearer ${your_token_here}`
      },
      body: JSON.stringify({ query: query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // 1. 获取响应体 (ReadableStream)
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get stream reader');
    }

    // 2. 使用 TextDecoder 来解码 UTF-8 数据块
    const decoder = new TextDecoder();

    // 3. 循环读取流
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // 流结束
        onDone();
        break;
      }

      // 解码数据块并调用回调
      const chunkText = decoder.decode(value);
      onChunk(chunkText);
    }

  } catch (err) {
    onError(err as Error);
  }
}
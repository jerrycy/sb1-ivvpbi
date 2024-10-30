import { ApiResponse } from './types';

const API_URL = `/bots/${process.env.NEXT_PUBLIC_BOT_NO}/${process.env.NEXT_PUBLIC_SKILL_NO}/execute`;
const API_HEADERS = {
  'Content-Type': 'application/json',
  'access-key': `${process.env.NEXT_PUBLIC_ACCESS_KEY}`,
  'access-channel': `${process.env.NEXT_PUBLIC_ACCESS_CHANNEL}`,
};

export async function fetchChatResponse(
  message: string,
  historyMessages: string,
  onChunk?: (chunk: string) => void
): Promise<ApiResponse> {
  const isStreaming = process.env.NEXT_PUBLIC_ENABLE_STREAMING === 'true';

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      ...(isStreaming && { stream: 'true' }),
    },
    body: JSON.stringify({
      msg: message,
      historyMessages,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  if (isStreaming && onChunk) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedData = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedData += chunk;
      onChunk(chunk);
    }

    // Return a mock API response for streaming mode
    return {
      data: accumulatedData,
      code: '200',
      success: true,
      message: 'Success',
      serverTime: Date.now(),
      sessionId: `stream-${Date.now()}`,
      requestId: `req-${Date.now()}`,
      additions: {
        botNo: 'streaming-bot',
        tokenUsages: [
          {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            pictureNum: 0,
            modelType: 'streaming-gpt',
          },
        ],
        skillNo: 'streaming-skill',
      },
      traceId: `trace-${Date.now()}`,
    };
  }

  return await response.json();
}

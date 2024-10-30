import { ApiResponse } from './types';

const API_URL = `/bot1/bots/${process.env.NEXT_PUBLIC_BOT1_BOT_NO}/${process.env.NEXT_PUBLIC_BOT1_SKILL_NO}/execute`;
const API_HEADERS = {
  'Content-Type': 'application/json',
  'access-key': `${process.env.NEXT_PUBLIC_BOT1_ACCESS_KEY}`,
  'access-channel': `${process.env.NEXT_PUBLIC_BOT1_ACCESS_CHANNEL}`,
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

    const lines = accumulatedData.split('data:');
    console.log('lines', lines);
    const line = lines[lines.length - 1];
    const lineJson = JSON.parse(line);
    return {
      data: lineJson.data,
      code: lineJson.code,
      success: lineJson.success,
      message: lineJson.message,
      serverTime: new Date(lineJson.serverTime).getTime(),
      sessionId: lineJson.sessionId,
      requestId: lineJson.requestId,
      additions: lineJson.additions,
      traceId: lineJson.traceId,
    };
  }

  return await response.json();
}

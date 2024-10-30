import { mockResponses, defaultResponse } from './mock-data';
import { ApiResponse } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockApiCall(message: string): Promise<ApiResponse> {
  // Simulate network delay
  await delay(1000);

  const lowercaseMessage = message.toLowerCase();
  
  // Find matching response based on keywords
  const matchingResponse = mockResponses.find(item =>
    item.keywords.some(keyword => lowercaseMessage.includes(keyword))
  );

  return {
    data: matchingResponse?.response || defaultResponse,
    code: "200",
    success: true,
    message: "Success",
    serverTime: Date.now(),
    sessionId: `mock-${Date.now()}`,
    requestId: `req-${Date.now()}`,
    additions: {
      botNo: "mock-bot",
      tokenUsages: [{
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
        pictureNum: 0,
        modelType: "mock-gpt"
      }],
      skillNo: "mock-skill"
    },
    traceId: `trace-${Date.now()}`
  };
}
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  pictureNum: number;
  modelType: string;
}

export interface ApiResponse {
  data: string;
  code: string;
  success: boolean;
  message: string;
  serverTime: number;
  sessionId: string;
  requestId: string;
  additions: {
    botNo: string;
    tokenUsages: TokenUsage[];
    skillNo: string;
  };
  traceId: string;
}
"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "@/components/chat/message-item";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { Message, ChatSession } from "@/lib/types";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { fetchChatResponse } from "@/lib/api";
import { mockApiCall } from "@/lib/mock-api";
import { toast } from "sonner";

const STORAGE_KEY = "chat-sessions";
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  const scrollRef = useChatScroll(messages, isLoading);

  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    } else {
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleSessionChange = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setInput("");
    setStreamingContent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    };

    setInput("");
    setStreamingContent("");
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ));
    setIsLoading(true);

    try {
      if (USE_MOCK_API) {
        const response = await mockApiCall(userMessage.content);
        handleApiResponse(response);
      } else {
        const historyMessages = messages
          .map((msg) => `${msg.role === "user" ? "宠物主人" : "医生"}：${msg.content}`)
          .join("\n");

        const response = await fetchChatResponse(
          userMessage.content,
          historyMessages,
          (chunk) => {
            setStreamingContent(prev => prev + chunk);
          }
        );
        handleApiResponse(response);
      }
    } catch (error) {
      console.error("Error:", error);
      handleError();
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const handleApiResponse = (response: { success: boolean; data: string }) => {
    if (response.success && response.data) {
      const assistantMessage: Message = {
        role: "assistant",
        content: response.data,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(session => 
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, assistantMessage] }
          : session
      ));
    } else {
      handleError();
    }
  };

  const handleError = () => {
    const errorMessage: Message = {
      role: "assistant",
      content: "Sorry, there was an error processing your request.",
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(session => 
      session.id === currentSessionId
        ? { ...session, messages: [...session.messages, errorMessage] }
        : session
    ));
    toast.error("Failed to send message");
  };

  const handleRetry = (content: string) => {
    setInput(content);
    toast.success("Message loaded for retry");
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 space-y-4">
      <ChatHeader 
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionChange={handleSessionChange}
      />

      <ScrollArea className="flex-1 p-4 rounded-lg border bg-muted/50">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message, index) => (
            <MessageItem
              key={message.timestamp}
              message={message}
              onRetry={message.role === "user" ? handleRetry : undefined}
              isLatestUserMessage={
                message.role === "user" &&
                index === messages.length - (messages[messages.length - 1]?.role === "assistant" ? 2 : 1)
              }
            />
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-pulse text-muted-foreground">
                {streamingContent || "Doctor is typing..."}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        input={input}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onInputChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
}
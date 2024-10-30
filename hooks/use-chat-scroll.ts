"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";

export function useChatScroll(messages: Message[], loading: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const lastMessage = scrollContainer.lastElementChild;
      lastMessage?.scrollIntoView({
        behavior,
        block: 'end',
      });
    }
  };

  // Scroll on new messages or loading state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial scroll without animation
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return scrollRef;
}
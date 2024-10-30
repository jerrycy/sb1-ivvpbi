"use client";

import { useState } from "react";
import { Copy, RotateCw, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/types";
import { toast } from "sonner";

interface MessageItemProps {
  message: Message;
  onRetry?: (content: string) => void;
  isLatestUserMessage?: boolean;
}

export function MessageItem({ message, onRetry, isLatestUserMessage }: MessageItemProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(message.content);
      toast.success("Message copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy message");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-4",
        message.role === "user" ? "bg-primary/10" : "bg-secondary/50"
      )}
    >
      {message.role === "user" ? (
        <User className="h-6 w-6 mt-1" />
      ) : (
        <Stethoscope className="h-6 w-6 mt-1" />
      )}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium">
            {message.role === "user" ? "You" : "Doctor"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              disabled={isCopying}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {message.role === "user" && isLatestUserMessage && onRetry && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRetry(message.content)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
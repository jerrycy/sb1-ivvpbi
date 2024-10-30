import { Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatHeaderProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionChange: (sessionId: string) => void;
}

export function ChatHeader({ 
  onNewChat, 
  sessions, 
  currentSessionId, 
  onSessionChange 
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center space-x-2">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Pet Assistant</h1>
      </div>
      <div className="flex items-center gap-2">
        <Select value={currentSessionId} onValueChange={onSessionChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chat" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                Chat {sessions.findIndex(s => s.id === session.id) + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={onNewChat}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
    </div>
  );
}
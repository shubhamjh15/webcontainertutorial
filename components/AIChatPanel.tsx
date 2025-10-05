// components/AIChatPanel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello! I can help you build a website. What would you like to create?",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    // Simulated AI reply (replace with real API call)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "ai",
        content:
          "That's a great idea! I'm now generating the code for you. You can see the changes in the preview and code tabs on the right.",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] p-4">
        <h2 className="text-lg font-semibold text-[#e5e5e5]">AI Chat Assistant</h2>
      </div>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full px-4 py-4 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-[#0a0a0a]"
        >
          <div className="space-y-4 pb-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm",
                    message.role === "user"
                      ? "bg-[#2a2a2a] text-[#e5e5e5]"
                      : "bg-[#1a1a1a] text-[#b5b5b5] border border-[#2a2a2a]"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Describe the component you want to build..."
            className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#6a6a6a] focus:border-[#3a3a3a] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#e5e5e5]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

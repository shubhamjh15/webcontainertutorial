"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendIcon } from 'lucide-react';

// --- Import the WebContainer IDE component you created ---
import WebContainerIDE from '@/components/WebContainerIDE'; // Adjust this path if needed

// --- Type definitions for our chat state ---
type Message = {
  role: 'user' | 'ai';
  content: string;
};

// --- A new component for the AI Chat Panel ---
function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I can help you build a website. What would you like to create?' }
  ]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector('div');
      if (scrollableView) {
        scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add the user's message to the chat
    const newUserMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    // --- AI Response Simulation ---
    // In a real app, you would make an API call here.
    // For now, we'll just provide a canned response after a short delay.
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'ai',
        content: "That's a great idea! I'm now generating the code for you. You can see the changes in the preview and code tabs on the right."
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-end gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-xs rounded-lg px-4 py-2 text-sm md:max-w-md',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe the component you want to build..."
          />
          <Button onClick={handleSendMessage}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- The Main Page Layout ---
export default function Home() {
  return (
    <main className="flex h-screen w-full bg-background">
      {/* Left Panel: AI Chat */}
      <div className="w-1/3 border-r">
        <ChatPanel />
      </div>

      {/* Right Panel: WebContainer IDE and Preview */}
      <div className="w-2/3">
        <WebContainerIDE />
      </div>
    </main>
  );
}
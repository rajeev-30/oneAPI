"use client";

import { useAppSelector } from "@/store/hooks";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { ChatMessage } from "./chat-message";
import Image from "next/image";
import icon from '../../app/icon.png';

export function ChatMessages() {
  const { messages, isStreaming, streamingContent } = useAppSelector((s) => s.chat);
  const { containerRef, handleScroll } = useAutoScroll([messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Image
            src={icon}
            alt="Company Logo - oneAPI"
            width={50}
            height={50}
            priority
            className="mb-5"
          />
        <h2 className="text-lg font-semibold text-text-primary mb-1">Chat Playground</h2>
        <p className="text-text-muted text-sm max-w-sm">Test any model with streaming responses. Select a model below and start chatting.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto divide-y divide-border-secondary">
        {messages.map((msg, i) => <ChatMessage key={`${msg.role}-${i}`} message={msg} />)}
        {isStreaming && streamingContent && <ChatMessage message={{ role: "assistant", content: streamingContent }} isStreaming />}
        {isStreaming && !streamingContent && (
          <div className="flex gap-4 px-4 py-5 bg-surface-secondary/50 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
              <div className="flex gap-1"><span className="w-1 h-1 bg-accent-emerald rounded-full animate-bounce [animation-delay:0ms]" /><span className="w-1 h-1 bg-accent-emerald rounded-full animate-bounce [animation-delay:150ms]" /><span className="w-1 h-1 bg-accent-emerald rounded-full animate-bounce [animation-delay:300ms]" /></div>
            </div>
            <div><div className="text-xs font-medium text-text-muted mb-1">Assistant</div><div className="text-sm text-text-muted">Thinking...</div></div>
          </div>
        )}
      </div>
    </div>
  );
}

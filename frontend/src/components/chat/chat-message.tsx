"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils/cn";
import { Bot, User } from "lucide-react";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group flex gap-4 px-4 py-5 animate-fade-in",
        isUser ? "bg-transparent" : "bg-surface-secondary/50"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
          isUser
            ? "bg-brand-500/20 text-brand-400"
            : "bg-accent-emerald/10 text-accent-emerald"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-xs font-medium text-text-muted">
          {isUser ? "You" : "Assistant"}
        </div>

        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-text-primary">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom code block renderer
                code({ className, children, ...rest }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  // Block code (with language)
                  if (match) {
                    return (
                      <CodeBlock
                        code={codeString}
                        language={match[1]}
                      />
                    );
                  }

                  // Inline code
                  return (
                    <code
                      className="bg-surface-elevated px-1.5 py-0.5 rounded text-[0.85em] text-accent-blue font-mono"
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
                // Style other elements
                pre({ children }) {
                  return <>{children}</>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border border-border-primary rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary bg-surface-primary border-b border-border-primary">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="px-3 py-2 text-sm border-b border-border-secondary">
                      {children}
                    </td>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent-blue rounded-sm animate-pulse-soft ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
});

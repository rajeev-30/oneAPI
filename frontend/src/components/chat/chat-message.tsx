"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils/cn";
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
        "group w-full px-4 py-6 transition-colors duration-150",
        isUser ? "bg-transparent" : "bg-transparent"
      )}
    >
      <div className="max-w-3xl mx-auto">
        {isUser ? (
          /* ── User bubble ─────────────────────────────────── */
          <div className="flex justify-end">
            <div
              className={cn(
                "relative max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm",
                "bg-[#2F2F2F] text-[#ECECEC]",
                "text-[15px] leading-[1.65] font-normal tracking-[0.01em]",
                "shadow-sm"
              )}
            >
              <p className="whitespace-pre-wrap m-0">{message.content}</p>
            </div>
          </div>
        ) : (
          /* ── Assistant message ───────────────────────────── */
          <div className="flex gap-3 items-start">
            {/* Avatar */}
            {/* <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-gradient-to-br from-[#cc785c] to-[#a85c3d] flex items-center justify-center shadow-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="currentColor"
                  opacity="0"
                />
                <path
                  d="M9 3.5C9 2.67 9.67 2 10.5 2h3C14.33 2 15 2.67 15 3.5v1c0 .28-.22.5-.5.5h-5c-.28 0-.5-.22-.5-.5v-1zM5 6h14a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z"
                  fill="none"
                />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="white"
                  fontFamily="serif"
                >
                  A
                </text>
              </svg>
            </div> */}

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div
                className={cn(
                  "prose prose-invert max-w-none",
                  "text-[15px] leading-[1.75] text-[#ECECEC] font-normal tracking-[0.01em]",
                  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",

                  // Headings
                  "[&_h1]:text-[1.3em] [&_h1]:font-semibold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:tracking-tight",
                  "[&_h2]:text-[1.15em] [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:tracking-tight",
                  "[&_h3]:text-[1em] [&_h3]:font-semibold [&_h3]:text-[#d4d4d4] [&_h3]:mt-4 [&_h3]:mb-1.5",

                  // Paragraphs
                  "[&_p]:my-3 [&_p]:text-[#ECECEC]",

                  // Lists
                  "[&_ul]:my-3 [&_ul]:pl-5 [&_ul]:space-y-1.5",
                  "[&_ol]:my-3 [&_ol]:pl-5 [&_ol]:space-y-1.5",
                  "[&_li]:text-[#ECECEC] [&_li]:leading-relaxed",
                  "[&_li_p]:my-0",
                  // Custom list markers
                  "[&_ul>li]:relative [&_ul>li]:list-none [&_ul>li]:pl-4",
                  "[&_ul>li]:before:content-['•'] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:text-[#8b8b8b] [&_ul>li]:before:font-bold",
                  "[&_ol>li]:list-decimal [&_ol>li]:marker:text-[#8b8b8b] [&_ol>li]:marker:text-sm",

                  // Blockquote
                  "[&_blockquote]:border-l-2 [&_blockquote]:border-[#4a4a4a] [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-[#aaa] [&_blockquote]:italic",

                  // Strong / Em
                  "[&_strong]:text-white [&_strong]:font-semibold",
                  "[&_em]:text-[#d4d4d4]",

                  // HR
                  "[&_hr]:border-[#3a3a3a] [&_hr]:my-5",

                  // Links
                  "[&_a]:text-[#c084fc] [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-[#c084fc]/40 [&_a:hover]:decoration-[#c084fc]",
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...rest }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");

                      if (match) {
                        return <CodeBlock code={codeString} language={match[1]} />;
                      }

                      return (
                        <code
                          className="bg-[#2a2a2a] border border-[#3d3d3d] px-[5px] py-[2px] rounded-[5px] text-[0.83em] text-[#79c0ff] font-mono font-normal"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre({ children }) {
                      return <>{children}</>;
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#c084fc] underline underline-offset-2 decoration-[#c084fc]/40 hover:decoration-[#c084fc] transition-colors"
                        >
                          {children}
                        </a>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-xl border border-[#333] shadow-lg">
                          <table className="min-w-full border-collapse">{children}</table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return (
                        <thead className="bg-[#242424]">{children}</thead>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#999] uppercase tracking-wider border-b border-[#333]">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="px-4 py-2.5 text-sm text-[#ccc] border-b border-[#2a2a2a] last:border-0">
                          {children}
                        </td>
                      );
                    },
                    tr({ children }) {
                      return (
                        <tr className="hover:bg-[#1e1e1e] transition-colors duration-100">
                          {children}
                        </tr>
                      );
                    },
                    // Number styled ordered list items
                    ol({ children }) {
                      return (
                        <ol className="my-3 pl-0 space-y-1.5 counter-reset-[item] list-none">
                          {children}
                        </ol>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Streaming cursor */}
                {isStreaming && (
                  <span className="inline-block w-[3px] h-[1.1em] bg-[#ECECEC]/70 rounded-full animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { sendMessage } from "@/store/slices/chatSlice";
import { Paperclip, ArrowUp, ChevronDown, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ModelSelector } from "@/components/chat/model-selector";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = useAppSelector((s) => s.chat.isStreaming);

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const canSend = value.trim().length > 0 && !isStreaming;

  const handleSend = useCallback(() => {
    if (!canSend || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming)
        handleSend();
    }
  }

  return (
    <div className="w-full px-4 pb-4 pt-2">
      <div
        className={cn(
          "relative w-full max-w-3xl mx-auto",
          "bg-surface-secondary  rounded-2xl",
          "border border-[#2e2e2e] hover:border-[#3a3a3a]",
          "shadow-lg transition-colors duration-150",
          "focus-within:border-[#3a3a3a]"
        )}
      >
        {/* ── Textarea ─────────────────────────────────────── */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message oneAPI…"
          rows={1}
          disabled={isStreaming}
          className={cn(
            "w-full resize-none bg-transparent outline-none",
            "text-[15px] text-[#e0e0e0] placeholder:text-[#404040]",
            "px-4 pt-4 pb-2",
            "leading-relaxed",
            "disabled:opacity-50"
          )}
          style={{ minHeight: "52px", maxHeight: "200px" }}
        />

        {/* ── Bottom bar ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left: attach */}
          <button
            disabled={true}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer cursor-not-allowed",
              "text-[#555] hover:text-[#aaa] hover:bg-[#2a2a2a]",
              "transition-all duration-150"
            )}
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>

          {/* Right: model selector + send */}
          <div className="flex items-center gap-2">
            {/* Model selector trigger — the popup opens upward */}
            <ModelSelector />

            {/* Send button */}
            {isStreaming ? (
            <button onClick={onStop} className="flex-shrink-0 p-2 rounded-lg bg-text-primary text-surface-primary hover:bg-text-secondary transition-colors cursor-pointer"><Square size={16} fill="currentColor" /></button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                "transition-all duration-150",
                canSend
                  // ? "bg-[#cc785c] hover:bg-[#b8664a] text-white shadow-md hover:shadow-[#cc785c]/30"
                  ? "bg-text-primary text-surface-primary hover:bg-text-secondary cursor-pointer"
                  : "bg-[#2a2a2a] text-[#444] cursor-not-allowed"
              )}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Hint */}
      {/* <p className="text-center text-[11px] text-[#333] mt-2">
        oneAPI may produce errors. Verify important information.
      </p> */}
    </div>
  );
}
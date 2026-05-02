"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { ArrowUp, Square, Paperclip } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = useAppSelector((s) => s.chat.isStreaming);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!isStreaming) handleSubmit(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="border-t border-border-secondary bg-surface-primary">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className={cn("flex items-end gap-2 rounded-xl border border-border-primary bg-surface-secondary p-2 transition-all duration-200", "focus-within:border-border-active focus-within:ring-1 focus-within:ring-accent-blue/20")}>
          <textarea ref={textareaRef} value={value} onChange={handleInput} onKeyDown={handleKeyDown} placeholder="Message oneAPI..." disabled={disabled} rows={1} className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none min-h-[24px] max-h-[200px] py-1.5 disabled:opacity-50" />
          {isStreaming ? (
            <button onClick={onStop} className="flex-shrink-0 p-2 rounded-lg bg-text-primary text-surface-primary hover:bg-text-secondary transition-colors cursor-pointer"><Square size={16} fill="currentColor" /></button>
          ) : (
            <button onClick={handleSubmit} disabled={!value.trim() || disabled} className={cn("flex-shrink-0 p-2 rounded-lg transition-all duration-200 cursor-pointer", value.trim() && !disabled ? "bg-text-primary text-surface-primary hover:bg-text-secondary" : "bg-white/[0.06] text-text-muted cursor-not-allowed")}><ArrowUp size={16} /></button>
          )}
        </div>
        <p className="text-[11px] text-text-muted text-center mt-2">
          <kbd className="px-1 py-0.5 rounded bg-surface-elevated text-text-tertiary text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-surface-elevated text-text-tertiary text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

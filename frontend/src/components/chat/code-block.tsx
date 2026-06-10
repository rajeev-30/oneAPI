"use client";

import { memo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock = memo(function CodeBlock({
  code,
  language = "text",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg overflow-hidden border border-border-primary my-3",
        "md:w-full w-100 mx-auto max-w-full", // prevent overflow on mobile
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-surface-primary border-b border-border-primary">
        <span className="text-[11px] sm:text-xs text-text-muted font-mono truncate mr-2">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer flex-shrink-0"
        >
          {copied ? (
            <>
              <Check size={12} className="text-accent-emerald" />
              <span className="text-accent-emerald">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              {/* Always visible on mobile (no hover), hover-only on desktop */}
              <span className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                Copy
              </span>
            </>
          )}
        </button>
      </div>

      {/* Code — horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "0.75rem",       // tighter on all screens
            background: "var(--color-surface-secondary)",
            fontSize: "0.75rem",      // slightly smaller base; up to 0.8125rem on sm via wrapper
            lineHeight: "1.6",
            minWidth: "100%",         // ensures scroll works correctly
          }}
          codeTagProps={{
            style: {
              fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});
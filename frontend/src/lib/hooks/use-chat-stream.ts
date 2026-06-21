"use client";

import { useCallback, useRef, useState } from "react";
import { streamChatCompletion } from "@/lib/api/chat";
import { useAppDispatch } from "@/store/hooks";
import {
  setStreaming,
  appendStreamContent,
  finalizeStream,
  addMessage,
} from "@/store/slices/chatSlice";
import type { ChatCompletionRequest, ChatCompletionUsage } from "@/types";

export function useChatStream() {
  const abortRef = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const send = useCallback(
    async (apiKey: string, request: ChatCompletionRequest) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setError(null);
      dispatch(setStreaming(true));

      const userMsg = request.messages[request.messages.length - 1];
      if (userMsg) {
        dispatch(addMessage({ role: "user", content: userMsg.content }));
      }

      await streamChatCompletion(
        apiKey,
        request,
        (text: string) => dispatch(appendStreamContent(text)),
        (usage?: ChatCompletionUsage) => dispatch(finalizeStream(usage)),
        (err: Error) => {
          setError(err.message);
          dispatch(setStreaming(false));
        },
        abortRef.current.signal,
      );
    },
    [dispatch],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    dispatch(finalizeStream(undefined));
  }, [dispatch]);

  return { send, abort, error, clearError: () => setError(null) };
}

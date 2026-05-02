import { API_BASE_URL } from "@/lib/utils/constants";
import type { ChatCompletionRequest, StreamChunk } from "@/types";

/**
 * Stream a chat completion via SSE.
 * Uses native fetch (not Axios) to handle streaming ReadableStream.
 */
export async function streamChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest,
  onChunk: (text: string) => void,
  onDone: (usage: StreamChunk["data"]["usage"]) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...request, stream: true }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as Record<string, string>)?.message ||
          `Chat request failed (${response.status})`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (split by double newline)
      const events = buffer.split("\n\n");
      buffer = events.pop() || ""; // Keep incomplete event in buffer

      for (const event of events) {
        const lines = event.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();

          // End of stream signal
          if (data === "[DONE]") {
            return;
          }

          try {
            const parsed: StreamChunk = JSON.parse(data);
            if (parsed.data?.done) {
              onDone(parsed.data.usage);
            } else {
              const content = parsed.data?.choices?.[0]?.message?.content;
              if (content) {
                onChunk(content);
              }
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return; // User cancelled — not an error
    }
    onError(error instanceof Error ? error : new Error("Stream failed"));
  }
}

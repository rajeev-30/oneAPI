import { useState } from "react";

export const useChat = () => {
    const [response, setResponse] = useState("");
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState<string | null>(null);

    const sendMessage = async (messages: { role: string; content: string }[]) => {
        setLoading(true);
        setResponse("");
        setError(null);

        let finalText = "";

        try {
            const res = await fetch("http://localhost:8000/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("apiKey")}` // your sk-oneapi-xxx
                },
                body: JSON.stringify({
                    model:    "google/gemini-1.5-flash",
                    messages,
                    stream:   true,
                    temperature: 0.7
                })
            });

            if (!res.ok) throw new Error("Request failed");
            if (!res.body) throw new Error("No response body");

            // ✅ Read the stream
            const reader  = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                // ✅ Parse SSE format: "data: {...}\n\n"
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;

                    const data = line.replace("data: ", "").trim();

                    if (data === "[DONE]") break;

                    try {
                        const parsed = JSON.parse(data);

                        if (parsed.text) {
                            // ✅ append each chunk to response
                            finalText += parsed.text;
                            setResponse(prev => prev + parsed.text);
                        }

                        if (parsed.done && parsed.usage) {
                            console.log("Usage:", parsed.usage);
                        }
                    } catch {
                        // skip malformed chunks
                    }
                }
            }

            return finalText;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            return "";
        } finally {
            setLoading(false);
        }
    };

    return { response, loading, error, sendMessage };
};
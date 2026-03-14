import OpenAI from "openai";
import { ChatChunk } from "../types/types";


export async function* grokChat({ model, messages, temperature, max_tokens }: any): AsyncGenerator<ChatChunk> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("GROK_API_KEY is not set in .env");
    
    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.x.ai/v1", // xAI base URL
    });
    
    const modelName = model.slug;
    
    //  separate system messages
    const systemMessage = messages.find((msg: any) => msg.role === "system")?.content;
    const chatMessages  = messages.map((msg: any) => ({
        role:    msg.role as "user" | "assistant" | "system",
        content: msg.content
    }));
    
    // stream the response
    console.log(apiKey);
    const stream = await client.chat.completions.create({
        model:      modelName,
        messages:   systemMessage
        ? [{ role: "system", content: systemMessage }, ...chatMessages.filter((m: any) => m.role !== "system")]
        : chatMessages,
        temperature,
        max_tokens: max_tokens ?? 1024,
        stream:     true,                //  enable streaming
    });

    let promptTokens     = 0;
    let completionTokens = 0;

    //  yield each chunk
    for await (const chunk of stream) {
        const text         = chunk.choices[0]?.delta?.content ?? "";
        const finishReason = chunk.choices[0]?.finish_reason;

        if (text) {
            yield { text, done: false };
        }

        // capture usage from last chunk
        if (finishReason === "stop" && chunk.usage) {
            promptTokens     = chunk.usage.prompt_tokens;
            completionTokens = chunk.usage.completion_tokens;
        }
    }

    yield {
        done:  true,
        usage: {
            prompt_tokens:     promptTokens,
            completion_tokens: completionTokens,
            total_tokens:      promptTokens + completionTokens
        }
    };
}
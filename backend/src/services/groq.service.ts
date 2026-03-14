import Groq from "groq-sdk";
import { ChatChunk } from "../types/types";
import { costCalculator } from "@utils/costCalculator";


export async function* groqChat({ model, messages, temperature, max_tokens }: any): AsyncGenerator<ChatChunk> {

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set in .env");

    const client = new Groq({ apiKey });

    const modelName = model.slug; // "llama-3.3-70b-versatile"

    //  Groq supports system messages natively
    const chatMessages = messages.map((msg: any) => ({
        role:    msg.role as "user" | "assistant" | "system",
        content: msg.content
    }));

    // stream the response
    const stream = await client.chat.completions.create({
        model:      modelName,
        messages:   chatMessages,
        temperature,
        max_tokens: max_tokens ?? 1024,
        stream:     true,               // enable streaming
    });

    let promptTokens     = 0;
    let completionTokens = 0;

    // yield each chunk
    for await (const chunk of stream) {
        const text         = chunk.choices[0]?.delta?.content ?? "";
        const finishReason = chunk.choices[0]?.finish_reason;

        if (text) {
            yield { text, done: false };
        }

        // capture usage from last chunk
        if (finishReason === "stop" && chunk.x_groq?.usage) {
            promptTokens     = chunk.x_groq.usage.prompt_tokens;
            completionTokens = chunk.x_groq.usage.completion_tokens;
        }
    }

    const totalCost = costCalculator(promptTokens, completionTokens, model);
    

    yield {
        done:  true,
        usage: {
            prompt_tokens:     promptTokens,
            completion_tokens: completionTokens,
            total_tokens:      promptTokens + completionTokens,
            totalCost
        }
    };
}
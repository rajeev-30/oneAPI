import { OpenRouter } from '@openrouter/sdk';
import { ChatChunk } from "../types/types";
import { costCalculator } from "@utils/costCalculator";
import { AppError } from "../types/errors";


export async function* openrouterChat({ model, messages, temperature, max_tokens }: any): AsyncGenerator<ChatChunk> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new AppError("OPENROUTER_API_KEY is not found", 400, "NOT_FOUND", "OPENROUTER_API_KEY is not set in .env");

    const client = new OpenRouter({
        apiKey,
    });
    
    const modelName = model.slug;
    
    const chatMessages  = messages.map((msg: any) => ({
        role:    msg.role as "user" | "assistant" | "system",
        content: msg.content
    }));
    
    const stream = (await client.chat.send({
        chatRequest: {
            model: modelName,
            messages: chatMessages,
            stream: true,
        },
    })) as AsyncIterable<any>;

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
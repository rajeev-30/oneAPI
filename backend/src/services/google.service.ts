import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatChunk } from "../types/types";


export async function* googleChat({ model, messages, temperature, max_tokens }: any): AsyncGenerator<ChatChunk> {
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = model.slug; 
    const genModel  = genAI.getGenerativeModel({ model: modelName });

    const contents = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
            role:  msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

    const result = await genModel.generateContentStream({ contents });

    let promptTokens     = 0;
    let completionTokens = 0;

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
            yield { text, done: false }; 
        }
    }

    const finalResponse  = await result.response;
    promptTokens         = finalResponse.usageMetadata?.promptTokenCount     ?? 0;
    completionTokens     = finalResponse.usageMetadata?.candidatesTokenCount ?? 0;

    yield {
        done:  true,
        usage: {
            prompt_tokens:     promptTokens,
            completion_tokens: completionTokens,
            total_tokens:      promptTokens + completionTokens
        }
    };
}
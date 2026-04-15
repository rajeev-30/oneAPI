import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatChunk } from "../types/types";
import { costCalculator } from "@utils/costCalculator";
import { AppError } from "../types/errors";


export async function* googleChat({ model, messages, temperature, max_tokens }: any): AsyncGenerator<ChatChunk> {
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new AppError("GEMINI_API_KEY is not found", 400, "NOT_FOUND", "GEMINI_API_KEY is not set in .env");

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = model.slug; 
    const genModel  = genAI.getGenerativeModel({ model: modelName });


    const contents = messages.map((msg: any) => ({
        role: msg.role === "assistant" || msg.role === "system" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));

    const result = await genModel.generateContentStream({ 
        contents
    });

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
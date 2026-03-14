import Anthropic from "@anthropic-ai/sdk";
import { ChatChunk } from "../types/types";
import { costCalculator } from "@utils/costCalculator";



export async function* anthropicChat({ model, messages, temperature, max_tokens }: any): AsyncGenerator<ChatChunk> {

    const apiKey = process.env.CLAUDE_API_KEY;
    console.log("Using CLAUDE_API_KEY:", apiKey);
    if (!apiKey) throw new Error("CLAUDE_API_KEY is not set in .env");

    const client = new Anthropic({ apiKey });

    const modelName = model.slug; 

    // ✅ separate system message from user/assistant messages
    const systemMessage = messages.find((msg: any) => msg.role === "system")?.content;
    const chatMessages  = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
            role:    msg.role as "user" | "assistant",
            content: msg.content
        }));

    // ✅ stream the response
    const stream = client.messages.stream({
        model:      modelName,
        max_tokens: max_tokens ?? 1024,
        temperature,
        system:     systemMessage,   // ✅ system message goes here separately
        messages:   chatMessages
    });

    // ✅ yield each text chunk
    for await (const chunk of stream) {
        if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
        ) {
            yield { text: chunk.delta.text, done: false };
        }
    }

    // ✅ get final usage after stream ends
    const finalMessage   = await stream.finalMessage();
    const promptTokens     = finalMessage.usage.input_tokens;
    const completionTokens = finalMessage.usage.output_tokens;

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
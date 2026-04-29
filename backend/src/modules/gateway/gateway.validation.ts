import {z} from "zod"

export const messageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]).default("user"),
    content: z.string("Please enter a message.").min(1).max(10000, "Content must not be more than 10000 characters.")
});

export const chatCompletionSchema = z.object({
    model: z.string("Model is required"),
    messages: z.array(messageSchema),
    stream: z.boolean().optional().default(true),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    max_tokens: z.number().optional(),
});
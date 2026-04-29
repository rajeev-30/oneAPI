// import {z} from "zod"

// export const messageSchema = z.object({
//     role: z.enum(["user", "assistant", "system"]).default("user"),
//     content: z.string("Please enter a message.").min(1).max(4096, "Content must not be more than 4096 characters.")
// });

// export const chatSchema = z.object({
//     model: z.string("Model is required"),
//     messages: z.array(messageSchema),
//     stream: z.boolean().optional().default(true),
//     temperature: z.number().min(0).max(2).optional().default(0.7),
//     max_tokens: z.number().optional(),
// });
import z from "zod"

const messageSchema = z.object({
    role: z.enum(["user", "assistant"], {message: "Role must be either 'user' or 'assistant'"}),
    content: z.string().min(1),
});

export const conversationSchema = z.object({
    title: z.string().min(1),
    messages: z.array(messageSchema),
});

import z from "zod";

export const providerSchema = z.object({
    name: z.string({ message: "Provider name is required and must be a string" }),
    slug: z.string({ message: "Provider slug is required and must be a string" }),
});
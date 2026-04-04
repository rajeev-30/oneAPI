import z from "zod";

export const providerSchema = z.object({
    name: z.string({ message: "Provider name is required" }),
    slug: z.string({ message: "Provider slug is required" }),
});
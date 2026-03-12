import z from "zod";

export const ProviderInput = z.object({
    name: z.string({ message: "Provider name is required" }),
    slug: z.string({ message: "Provider slug is required" }),
});
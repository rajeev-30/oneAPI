import { z } from "zod";

export const billingSchema = z.object({
    name: z.string({ message: "Name is required and must be a string" }),
    inputCostPer1KTokens: z
        .number({ message: "Input cost must be a number" })
        .min(0, { message: "Input cost must be a positive number" }),
    outputCostPer1KTokens: z
        .number({ message: "Output cost must be a number" })
        .min(0, { message: "Output cost must be a positive number" }),
    currency: z.enum(["INR", "USD"], {
        message: "Currency must be either INR or USD",
    }),
});




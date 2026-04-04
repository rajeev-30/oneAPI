import { z } from "zod";

export const billingSchema = z.object({
    name: z.string({ message: "Name is required" }),
    inputCostPer1KTokens: z
        .number({ message: "Input cost must be a number" })
        .positive("Input cost must be a positive number"),
    outputCostPer1KTokens: z
        .number({ message: "Output cost must be a number" })
        .positive("Output cost must be a positive number"),
    currency: z.enum(["INR", "USD"], {
        message: "Currency must be either INR or USD",
    }),
});




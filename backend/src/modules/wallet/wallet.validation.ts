import {z} from "zod";

export const walletSchema = z.object({
    balance: z.number("Balance is required").min(2, "Balance must be more than INR 5"),
});
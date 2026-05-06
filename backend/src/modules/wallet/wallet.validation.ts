import {z} from "zod";

export const walletSchema = z.object({
    balance: z.number("Balance is required").min(5, "Balance must be more than INR 5").max(100, "Balance must be less than INR 100"),
});
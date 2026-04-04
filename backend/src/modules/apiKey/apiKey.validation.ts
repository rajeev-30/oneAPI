import {z} from "zod";

export const apiKeySchema = z.object({
    name: z.string()
    .min(2, "Name must be atleast 2 characters")
    .max(20, "Name must be no more that 20 characters")
})
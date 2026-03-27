import {z} from "zod"

const limitValidation = z.object({
    requestsPerDay: z.number().min(0).optional(),
    tokensPerDay: z.number().min(0).optional(),
    requestsPerMinute: z.number().min(0).optional(),
    tokensPerMinute: z.number().min(0).optional()
})

export const planSchema = z.object({
    name: z.string("Name is required").min(2).max(100),
    price: z.number("Price is required").min(0),
    limits: limitValidation,
    features: z.array(z.string()).min(1).optional()
})
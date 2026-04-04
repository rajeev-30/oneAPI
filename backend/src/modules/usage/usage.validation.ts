import {z} from "zod"

export const usageSchema = z.object({
    month: z.string("Month is required").regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"),
})
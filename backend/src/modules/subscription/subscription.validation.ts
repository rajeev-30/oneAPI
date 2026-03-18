import {z} from "zod";

const subscriptionSchema = z.object({
    plan: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(["active", "expired", "cancelled"]),
});

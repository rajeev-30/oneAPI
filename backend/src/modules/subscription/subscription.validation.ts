import {z} from "zod";

export const subscriptionSchema = z.object({
    plan: z.string("Plan ID is required"),
    startDate: z.coerce.date().default(() => new Date()),
    endDate: z.coerce.date().default(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
    }),
});

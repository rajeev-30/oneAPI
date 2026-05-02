import { z } from "zod";

export const toggleUserStatusSchema = z.object({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
});

export const logsQuerySchema = z.object({
    page: z.preprocess(
        (val) => {
            if (val === undefined) return 1;
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number().min(1)
    ),
    page_size: z.preprocess(
        (val) => {
            if (val === undefined) return 20;
            if (val === "all") return "all";
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.union([z.number().min(1), z.literal("all")])
    ),
    status: z.enum(["success", "error"]).optional(),
    userId: z.string().optional(),
    modelId: z.string().optional(),
});

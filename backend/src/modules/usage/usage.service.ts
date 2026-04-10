import { usageSchema } from "./usage.validation";
import Usage from "./usage.model";
import { getRedisClient } from "@config/redis";
import { AppError } from "../../types/errors";

const getUsageChacheKey = (userId: string, usageId: string) => `usage:${usageId}:${userId}`;

export const getMonthlyUsageService = async(userId: string, body: unknown) => {
    const redis = getRedisClient();
    const cacheKey = getUsageChacheKey(userId, "month");

    const result = usageSchema.safeParse(body);
    if(!result.success){
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { month } = result.data;

    const usage = await Usage.findOne({ user: userId, month });
    if(!usage) {
        throw new AppError("No usage data found for the specified month", 404, "NOT_FOUND", { month })
    }

    await redis.set(cacheKey, JSON.stringify(usage));
    return usage;
}

export const firstYearOfUsageService = async(userId: string) => {
    const redis = getRedisClient();
    const cacheKey = getUsageChacheKey(userId, "year");
    
    const firstUsage = await Usage.findOne({ user: userId })
        .sort({ month: 1 })
        .select("month");

    if(!firstUsage){
        throw new AppError("No usage data found", 404, "NOT_FOUND", "You haven't used our services");
    }

    await redis.set(cacheKey, JSON.stringify(firstUsage));
    return firstUsage;
}
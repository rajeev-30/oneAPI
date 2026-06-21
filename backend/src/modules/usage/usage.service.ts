import { usageSchema } from "./usage.validation";
import Usage from "./usage.model";
import { getRedisClient } from "@config/redis";
import { AppError } from "../../types/errors";
import { Types } from "mongoose";

const getUsageChacheKey = (userId: string, month: string) => `usage:${month}:${userId}`;

export const getMonthlyUsageService = async(userId: string, body: unknown) => {
    const redis = getRedisClient();

    const result = usageSchema.safeParse(body);
    if(!result.success){
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { month } = result.data;

    const cacheKey = getUsageChacheKey(userId, month);
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const usage = await Usage.findOne({ user: userId, month })
        .populate({
            path: "modelBreakdown.model",
            select: "name",
            populate: {
                path: "provider",
                select: "name", 
            },
        });
    if(!usage) {
        throw new AppError("No usage data found for the specified month", 404, "NOT_FOUND", { month })
    }

    await redis.set(cacheKey, JSON.stringify(usage));
    return usage;
}

export const firstYearOfUsageService = async(userId: string) => {
    const redis = getRedisClient();
    const cacheKey = getUsageChacheKey(userId, "year");

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    
    const firstUsage = await Usage.findOne({ user: userId })
        .sort({ month: 1 })
        .select("month");

    if(!firstUsage){
        throw new AppError("No usage data found", 404, "NOT_FOUND", "You haven't used our services");
    }

    await redis.set(cacheKey, JSON.stringify(firstUsage));
    return firstUsage;
}


export const updateUsage = async (
    userId: string,
    modelId: Types.ObjectId,
    totalTokens: number,
    cost: number,
) => {
    const month = new Date().toISOString().slice(0, 7); // "2026-03"
    console.log(`Updating usage for user ${userId}, model ${modelId}, tokens ${totalTokens}, cost ${cost}`);

    // Step 1: Try updating existing model
    const result = await Usage.updateOne(
        { user: userId, month, "modelBreakdown.model": modelId },
        {
            $inc: {
                totalRequests: 1,
                totalTokens: totalTokens,
                totalCost: cost,
                "modelBreakdown.$.tokens": totalTokens,
                "modelBreakdown.$.cost": cost,
                "modelBreakdown.$.requests": 1,
            },
        },
    );

    // Step 2: If model not found → push new entry
    if (result.matchedCount === 0) {
        await Usage.updateOne(
            { user: userId, month },
            {
                $inc: {
                    totalRequests: 1,
                    totalTokens,
                    totalCost: cost,
                },
                $push: {
                    modelBreakdown: {
                        model: modelId,
                        tokens: totalTokens,
                        cost,
                        requests: 1,
                    },
                },
            },
            { upsert: true },
        );
    }

    const redis = getRedisClient();
    await redis.del(getUsageChacheKey(userId, month));
};
import { subscriptionSchema } from "./subscription.validation";
import Subscription from "./subscription.model";
import Plan from "@modules/plan/plan.model";
import { AppError } from "../../types/errors";
import { getRedisClient } from "@config/redis";

const getSubscriptionCacheKey = (userId: string): string => `subscription:${userId}`;


//Create post function for subscription and usage in service and call it whereever you need;

export const createSubscriptionService = async (userId: string, body: unknown) => {
    const redis = getRedisClient();
    const cacheKey = getSubscriptionCacheKey(userId);

    const result = subscriptionSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { plan, startDate, endDate } = result.data;

    const existingPlan = await Plan.findById(plan);
    if (!existingPlan) {
        throw new AppError("Plan not found", 404, "NOT_FOUND", "Please provide a valid plan ID.");
    }

    const subscription = await Subscription.findOneAndUpdate(
        { user: userId },
        {
            $set: {
                plan,
                startDate,
                endDate,
                status: "active",
            }
        },
        { upsert: true, setDefaultsOnInsert: true, returnDocument: "after" }
    );

    await redis.set(cacheKey, JSON.stringify(subscription));
    return subscription;
}

export const getSubscriptionService = async (userId: string) => {
    const redis = getRedisClient();
    const cacheKey = getSubscriptionCacheKey(userId);

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const subscription = await Subscription.findOne({ user: userId }).populate("plan").populate("wallet");
    if (!subscription) {
        throw new AppError("Subscription not found", 404, "NOT_FOUND", "Please provide a valid subscription ID.");
    }

    await redis.set(cacheKey, JSON.stringify(subscription));
    return subscription;
}
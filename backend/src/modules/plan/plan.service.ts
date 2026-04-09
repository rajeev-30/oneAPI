import { planSchema } from "./plan.validation"
import Plan from "./plan.model";
import { getRedisClient } from "@config/redis";
import { AppError } from "../../types/errors";

const getPlanCacheKey = (planId: string): string => `plan:${planId}`;
const getPlansCacheKey = (): string => `plans:all`;

export const createPlanService = async(body: any) => {
    const redis = getRedisClient();

    const result = planSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { name, price } = result.data;

    const existingPlan = await Plan.findOne({ name, price });
    if (existingPlan) {
        throw new AppError("Plan with this name and price already exists", 400, "ALREADY_EXISTS", existingPlan);
    }

    const plan = new Plan(result.data);
    await plan.save();

    await redis.del(getPlansCacheKey());
    const cacheKey = getPlanCacheKey(plan._id.toString());
    await redis.set(cacheKey, JSON.stringify(plan));

    return plan;
}

export const getPlansService = async () => {
    const redis = getRedisClient();
    const cacheKey = getPlansCacheKey();

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const plans = await Plan.find();
    if (!plans || plans.length === 0) {
        throw new AppError("No plans found", 404, "NOT_FOUND", "Please provide a valid user ID");
    }

    await redis.set(cacheKey, JSON.stringify(plans));

    return plans;
};

export const getPlanService = async (planId: string) => {
    const redis = getRedisClient();
    const cacheKey = getPlanCacheKey(planId);

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
        throw new AppError("Plan not found", 404, "NOT_FOUND", "Please provide a valid plan ID");
    }

    await redis.set(cacheKey, JSON.stringify(plan));

    return plan;
};

export const updatePlanService = async (planId: string, body: any) => {
    const redis = getRedisClient();
    const cacheKey = getPlanCacheKey(planId);

    const result = planSchema.partial().safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const updatedPlan = await Plan.findByIdAndUpdate(planId, { $set: result.data }, { returnDocument: "after" });
    if (!updatedPlan) {
        throw new AppError("Plan not found", 404, "NOT_FOUND", "Please provide a valid plan ID");
    }

    await redis.del(getPlansCacheKey());
    await redis.set(cacheKey, JSON.stringify(updatedPlan));

    return updatedPlan;
};

export const deletePlanService = async (planId: string) => {
    const redis = getRedisClient();

    const plan = await Plan.findByIdAndDelete(planId);
    if (!plan) {
        throw new AppError("Plan not found", 404, "NOT_FOUND", "Please provide a valid plan ID");
    }

    await redis.del(getPlansCacheKey());
    await redis.del(getPlanCacheKey(planId));

    return plan;
};

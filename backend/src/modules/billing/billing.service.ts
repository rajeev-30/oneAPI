
import { getRedisClient } from "@config/redis";
import { billingSchema } from "./billing.validation";
import { AppError } from "../../types/errors";
import Billing from "./billing.model";

const getBillingCacheKey = (userId: string, billingId: string): string => `billing:${billingId}:${userId}`;
const getBillingsCacheKey = (userId: string): string => `billings:${userId}`;

const adminCacheKey = process.env.ADMIN_CACHE_KEY || "admin";

export const createBillingService = async (userId: string, body: unknown) => {
  const redis = getRedisClient();

  const result = billingSchema.safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  const billing = new Billing(result.data);
  await billing.save();

  await redis.del(getBillingsCacheKey(userId));
  const cacheKey = getBillingCacheKey(userId, billing._id.toString());
  await redis.set(cacheKey, JSON.stringify(billing));

  return billing;
};

export const getBillingsService = async () => {
  const redis = getRedisClient();
  const cacheKey = getBillingsCacheKey(adminCacheKey);

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const billings = await Billing.find();
  await redis.set(cacheKey, JSON.stringify(billings));

  return billings;
};

export const getBillingService = async (billingId: string) => {
  const redis = getRedisClient();
  const cacheKey = getBillingCacheKey(adminCacheKey, billingId);

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const billing = await Billing.findById(billingId);
  await redis.set(cacheKey, JSON.stringify(billing));

  return billing;
};

export const deleteBillingService = async (billingId: string) => {
  const redis = getRedisClient();

  const billing = await Billing.findByIdAndDelete(billingId);
  if (!billing) {
    return false;
  }

  await redis.del(getBillingCacheKey(adminCacheKey, billingId));
  await redis.del(getBillingsCacheKey(adminCacheKey));

  return true;
};

export const updateBillingService = async (billingId: string, body: unknown) => {
  const redis = getRedisClient();

  const result = billingSchema.partial().safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  const billing = await Billing.findByIdAndUpdate(billingId, { $set: result.data }, { returnDocument: "after" });
  if (!billing) {
    return null;
  }

  const cacheKey = getBillingCacheKey(adminCacheKey, billingId);
  await redis.set(cacheKey, JSON.stringify(billing));
  await redis.del(getBillingsCacheKey(adminCacheKey));

  return billing;
};


import { getRedisClient } from "@config/redis";
import { billingSchema } from "./billing.validation";
import { AppError } from "../../types/errors";
import Billing from "./billing.model";

const getBillingCacheKey = (billingId: string): string => `billing:${billingId}`;
const getBillingsCacheKey = (): string => `billings:all`;

export const createBillingService = async (body: unknown) => {
  const redis = getRedisClient();

  const result = billingSchema.safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  const { name } = result.data;
  
  const existingBilling = await Billing.findOne({ name });
  if (existingBilling) {
    throw new AppError("Billing record with this name already exists", 400, "ALREADY_EXISTS", existingBilling);
  }

  const billing = new Billing(result.data);
  await billing.save();

  await redis.del(getBillingsCacheKey());
  const cacheKey = getBillingCacheKey(billing._id.toString());
  await redis.set(cacheKey, JSON.stringify(billing));

  return billing;
};

export const getBillingsService = async () => {
  const redis = getRedisClient();
  const cacheKey = getBillingsCacheKey();

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const billings = await Billing.find();
  if (!billings || billings.length === 0) {
    throw new AppError("No billing records found", 404, "NOT_FOUND", "Please add some billing records");
  }

  await redis.set(cacheKey, JSON.stringify(billings));

  return billings;
};

export const getBillingService = async (billingId: string) => {
  const redis = getRedisClient();
  const cacheKey = getBillingCacheKey(billingId);

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const billing = await Billing.findById(billingId);
  if (!billing) {
    throw new AppError("Billing record not found", 404, "NOT_FOUND", "Please provide a valid billing ID");
  }
  await redis.set(cacheKey, JSON.stringify(billing));

  return billing;
};

export const deleteBillingService = async (billingId: string) => {
  const redis = getRedisClient();

  const billing = await Billing.findByIdAndDelete(billingId);
  if (!billing) {
    throw new AppError("Billing record not found", 404, "NOT_FOUND", "Please provide a valid billing ID");
  }

  await redis.del(getBillingCacheKey(billingId));
  await redis.del(getBillingsCacheKey());

  return billing;
};

export const updateBillingService = async (billingId: string, body: unknown) => {
  const redis = getRedisClient();

  const result = billingSchema.partial().safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  const billing = await Billing.findByIdAndUpdate(billingId, { $set: result.data }, { returnDocument: "after" });
  if (!billing) {
    throw new AppError("Billing record not found", 404, "NOT_FOUND", "Please provide a valid billing ID");
  }

  const cacheKey = getBillingCacheKey(billingId);
  await redis.set(cacheKey, JSON.stringify(billing));
  await redis.del(getBillingsCacheKey());

  return billing;
};

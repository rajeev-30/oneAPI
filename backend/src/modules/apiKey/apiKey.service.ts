import crypto from "crypto";
import ApiKey from "./apiKey.model";
import { apiKeySchema } from "@modules/apiKey/apiKey.validation";
import { getRedisClient } from "@config/redis";
import { AppError } from "../../types/errors";

const getApiKeyCacheKey = (userId: string, apiKeyId: string): string => `apiKey:${apiKeyId}:${userId}`;
const getApiKeysCacheKey = (userId: string): string => `apiKeys:${userId}`;

// generate
export const generateApiKeyService = async (userId: string, body: unknown) => {
  const redis = getRedisClient();
  const key = "sk-oneapi-" + crypto.randomBytes(24).toString("hex");

  const result = apiKeySchema.safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  const { name } = result.data;

  const apiKey = new ApiKey({ name, user: userId, key });
  await apiKey.save();

  await redis.del(getApiKeysCacheKey(userId));
  const cacheKey = getApiKeyCacheKey(userId, apiKey._id.toString());
  await redis.set(cacheKey, JSON.stringify(apiKey));

  return apiKey;
};

// get all
export const getApiKeysService = async (userId: string) => {
  const redis = getRedisClient();
  const cacheKey = getApiKeysCacheKey(userId);

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const apiKeys = await ApiKey.find({ user: userId });
  await redis.set(cacheKey, JSON.stringify(apiKeys));

  return apiKeys;
};

// get one
export const getApiKeyService = async (userId: string, id: string) => {
  const redis = getRedisClient();
  const cacheKey = getApiKeyCacheKey(userId, id);

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const apiKey = await ApiKey.findOne({ _id: id, user: userId });
  if (!apiKey) {
    return null;
  }

  await redis.set(cacheKey, JSON.stringify(apiKey));
  return apiKey;
};

// update name
export const updateApiKeyNameService = async (userId: string, id: string, body: unknown) => {
  const redis = getRedisClient();

  const result = apiKeySchema.safeParse(body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
  }

  const apiKey = await ApiKey.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: result.data },
    { returnDocument: "after" }
  );

  if (!apiKey) {
    return null;
  }

  const cacheKey = getApiKeyCacheKey(userId, id);
  await redis.set(cacheKey, JSON.stringify(apiKey));
  await redis.del(getApiKeysCacheKey(userId));

  return apiKey;
};

// delete
export const deleteApiKeyService = async (userId: string, id: string) => {
  const redis = getRedisClient();

  const apiKey = await ApiKey.findOneAndDelete({ _id: id, user: userId });
  if (!apiKey) {
    return false;
  }

  await redis.del(getApiKeyCacheKey(userId, id));
  await redis.del(getApiKeysCacheKey(userId));

  return true;
};

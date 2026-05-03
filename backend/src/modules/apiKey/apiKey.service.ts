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

  const existingApiKey = await ApiKey.findOne({ name, user: userId });
  if (existingApiKey) {
    throw new AppError("API key with this name already exists", 400, "ALREADY_EXISTS", existingApiKey);
  }

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

  const apiKeys = await ApiKey.find({ user: userId }).sort({ createdAt: -1 });
  if (!apiKeys || apiKeys.length === 0) {
    throw new AppError("No API keys found", 404, "NOT_FOUND", "Please generate an API key");
  }

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
    throw new AppError("API key not found", 404, "NOT_FOUND", "Please provide a valid API key ID");
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
    throw new AppError("API key not found", 404, "NOT_FOUND", "Please provide a valid API key ID");
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
    throw new AppError("API key not found", 404, "API_KEY_NOT_FOUND", "Please provide a valid API key ID");
  }

  await redis.del(getApiKeyCacheKey(userId, id));
  await redis.del(getApiKeysCacheKey(userId));

  return apiKey;
};


export const updateApiKeyUsage = async (
    apiKeyId: string,
    apiKey: string,
    userId: string,
    totalTokensUsed: number,
    totalSpent: number
) => {
    await ApiKey.findOneAndUpdate(
        { _id: apiKeyId, user: userId, key: apiKey },
        {
            $inc: {
                totalRequests: 1,
                totalTokensUsed,
                totalSpent
            },
            $set: {
                lastUsedAt: new Date()
            }
        },
    );

    const redis = getRedisClient();
    await redis.del(getApiKeyCacheKey(userId, apiKeyId));
    await redis.del(getApiKeysCacheKey(userId));
};
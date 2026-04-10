import { providerSchema } from "./provider.validation";
import Provider from "./provider.model";
import { AppError } from "../../types/errors";
import { getRedisClient } from "@config/redis";

const getProviderCacheKey = (providerId: string): string => `provider:${providerId}`;
const getProvidersCacheKey = (): string => `providers:all`;

export const createProviderService = async (body: unknown) => {
    const redis = getRedisClient();
    const result = providerSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { name, slug } = result.data;
    
    const existingProvider = await Provider.findOne({ slug });
    if (existingProvider) {
        throw new AppError("Provider with this slug already exists", 400, "ALREADY_EXISTS", existingProvider);
    }

    const provider = new Provider({name, slug});
    await provider.save();

    await redis.del(getProvidersCacheKey());
    await redis.set(getProviderCacheKey(provider.id), JSON.stringify(provider));

    return provider;
};

export const getProviderService = async (providerId: string) => {
    const redis = getRedisClient();
    const cacheKey = getProviderCacheKey(providerId);
    
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const provider = await Provider.findById(providerId);
    if (!provider) {
        throw new AppError("Provider not found", 404, "NOT_FOUND", "Please provide a valid provider ID");
    }

    await redis.set(cacheKey, JSON.stringify(provider));
    return provider;
};

export const getProvidersService = async () => {
    const redis = getRedisClient();
    const cacheKey = getProvidersCacheKey();

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const providers = await Provider.find();
    if(!providers || providers.length === 0) {
        throw new AppError("No providers found", 404, "NOT_FOUND", "Please provide a valid provider ID");
    }

    await redis.set(cacheKey, JSON.stringify(providers));
    return providers;
};

export const updateProviderService = async (providerId: string, body: unknown) => {
    const redis = getRedisClient();
    
    const result = providerSchema.partial().safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const provider = await Provider.findByIdAndUpdate(providerId, { $set: result.data }, { returnDocument: "after" });
    if (!provider) {
        throw new AppError("Provider not found", 404, "NOT_FOUND", "Please provide a valid provider ID");
    }

    await redis.del(getProvidersCacheKey());
    await redis.set(getProviderCacheKey(provider.id), JSON.stringify(provider));

    return provider;
};

export const deleteProviderService = async (providerId: string) => {
    const redis = getRedisClient();

    const provider = await Provider.findByIdAndDelete(providerId);
    if (!provider) {
        throw new AppError("Provider not found", 404, "NOT_FOUND", "Please provide a valid provider ID");
    }

    await redis.del(getProvidersCacheKey());
    await redis.del(getProviderCacheKey(provider.id));

    return provider;
};

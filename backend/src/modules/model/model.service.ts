import  Model  from "./model.model";
import Provider from "@modules/provider/provider.model";
import Billing from "@modules/billing/billing.model";
import { AppError } from "../../types/errors";
import { getRedisClient } from "@config/redis";
import { modelSchema } from "./model.validation";
import { paginateQuery, paginationSchema } from "@utils/pagination";

const getModelCacheKey = (modelId: string): string => `model:${modelId}`;
const getModelsCacheKey = (page: number, page_size: number | 'all'): string => `models:${page}:${page_size}`;
const modelKeys: string = `model_keys`;

export const createModelService = async (body: unknown) => {
    const redis = getRedisClient();

    const result = modelSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { slug, billing, provider } = result.data;

    const existingModel = await Model.findOne({ slug });
    
    if(existingModel){
        throw new AppError("Model with this slug already exists", 400, "ALREADY_EXISTS", "Please choose a different slug");
    }

    const existingProvider = await Provider.findById(provider);
    if (!existingProvider) {
        throw new AppError("Invalid provider", 400, "INVALID", "Please provide a valid provider");
    }

    const existingBilling = await Billing.findById(billing);
    if (!existingBilling) {
        throw new AppError("Invalid billing", 400, "INVALID", "Please provide a valid billing");
    }

    const model = new Model(result.data);
    await model.save();

    const keys = await redis.smembers(modelKeys);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
    await redis.del(getModelCacheKey(model._id.toString()));

    return model;
};

export const getModelsService = async (params: any) => {
    const redis = getRedisClient();

    const result = paginationSchema.safeParse(params);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }
    const { page, page_size } = result.data;
    const cacheKey = getModelsCacheKey(page, page_size);

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const query = Model.find()
        .populate("provider")
        .populate("billing");

    const res = await paginateQuery(query, page, page_size);

    if (!res.data || res.data.length === 0) {
        throw new AppError("No models found", 404, "NOT_FOUND", "Please add some models");
    }

    await redis.set(cacheKey, JSON.stringify(res));
    await redis.sadd(modelKeys, cacheKey);
    return res;
};

export const getModelService = async (modelId: string) => {
    const redis = getRedisClient();
    const cacheKey = getModelCacheKey(modelId);

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const model = await Model.findById(modelId)
        .populate("provider")
        .populate("billing");

    if (!model) {
        throw new AppError("Model not found", 404, "NOT_FOUND", "Please provide a valid model ID");
    }

    await redis.set(cacheKey, JSON.stringify(model));

    return model;
};


export const updateModelService = async (modelId: string, body: unknown) => {
    const redis = getRedisClient();
    const cacheKey = getModelCacheKey(modelId);

    const result = modelSchema.partial().safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const model = await Model.findByIdAndUpdate(modelId, { $set: result.data }, { returnDocument: "after" })
        .populate("provider")
        .populate("billing");

    if (!model) {
        throw new AppError("Model not found", 404, "NOT_FOUND", "Please provide a valid model ID");
    }

    const keys = await redis.smembers(modelKeys);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
    await redis.set(cacheKey, JSON.stringify(model));

    return model;
};

export const deleteModelService = async (modelId: string) => {
    const redis = getRedisClient();

    const model = await Model.findByIdAndDelete(modelId);

    if (!model) {
        throw new AppError("Model not found", 404, "NOT_FOUND", "Please provide a valid model ID");
    }

    const keys = await redis.smembers(modelKeys);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
    await redis.del(getModelCacheKey(modelId));

    return model;
};

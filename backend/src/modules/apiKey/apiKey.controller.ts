import {Request, Response} from "express"
import crypto from "crypto";
import ApiKey from "./apiKey.model";
import { apiKeySchema } from "@modules/apiKey/apiKey.validation";
import { sendResponse } from "@utils/response";
import { getRedisClient } from "@config/redis";
import { getApiKeyCacheKey, getApiKeysCacheKey } from "./apiKey.service";


export const generateApiKey = async(req: Request, res:Response) =>{
    try{
        const redis = getRedisClient();
        const key = "sk-oneapi-" + crypto.randomBytes(24).toString("hex");
        const result = apiKeySchema.safeParse(req.body);
        if(!result.success){
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false
            });
        }

        const { name } = result.data;
        const userId = req.userId;

        // Save the API key to the database
        const apiKey = new ApiKey({ name, user: userId, key });
        await apiKey.save();

        await redis.del(getApiKeysCacheKey(userId as string));
        const cacheKey = getApiKeyCacheKey(userId as string, apiKey._id.toString());
        await redis.set(cacheKey, JSON.stringify(apiKey));

        return sendResponse(res, 201, {
            message: "API key generated successfully",
            success: true,
            data: apiKey
        });
    }catch(error){
        return sendResponse(res, 500, {
            message: "Error generating API key",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}


export const getApiKeys = async(req:Request, res:Response) => {
    try{
        const redis = getRedisClient();
        const userId = req.userId;

        const cacheKey = getApiKeysCacheKey(userId as string);

        const cached = await redis.get(cacheKey);
        if (cached) {
            return sendResponse(res, 200, {
                message: "API keys fetched successfully",
                success: true,
                data: JSON.parse(cached),
            });
        }

        const apiKeys = await ApiKey.find({ user: userId });
        if(!apiKeys || apiKeys.length === 0){
            return sendResponse(res, 404, {
                message: "No API keys found",
                success: false
            });
        }

        await redis.set(cacheKey, JSON.stringify(apiKeys));

        return sendResponse(res, 200, {
            message: "API keys found successfully",
            success: true,
            data: apiKeys
        });
    }catch(error){
        return sendResponse(res, 500, {
            message: "Error retrieving API key",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getApiKey = async(req:Request, res:Response) => {
    try{
        const redis = getRedisClient();
        const { id } = req.params;
        const userId = req.userId;

        const cacheKey = getApiKeyCacheKey(userId as string, id as string);

        const cached = await redis.get(cacheKey);
        if (cached) {
            return sendResponse(res, 200, {
                message: "API key fetched successfully",
                success: true,
                data: JSON.parse(cached),
            });
        }

        const apiKey = await ApiKey.findOne({ _id: id, user: userId });
        if(!apiKey){
            return sendResponse(res, 404, {
                message: "API key not found",
                success: false
            });
        }

        await redis.set(cacheKey, JSON.stringify(apiKey));

        return sendResponse(res, 200, {
            message: "API key found successfully",
            success: true,
            data: apiKey
        });
    }catch(error){
        return sendResponse(res, 500, {
            message: "Error retrieving API key",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const updateApiKeyName = async(req:Request, res:Response) => {
    try{
        const redis = getRedisClient();
        const { id } = req.params;
        const userId = req.userId;

        const result = apiKeySchema.safeParse(req.body);
        if(!result.success){
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false
            });
        }

        const apiKey = await ApiKey.findOneAndUpdate({ _id: id, user: userId }, { $set: result.data }, { returnDocument: "after" });
        if(!apiKey){
            return sendResponse(res, 404, {
                message: "API key not found",
                success: false
            });
        }

        const cacheKey = getApiKeyCacheKey(userId as string, id as string);
        await redis.set(cacheKey, JSON.stringify(apiKey));
        await redis.del(getApiKeysCacheKey(userId as string));

        return sendResponse(res, 200, {
            message: "API key updated successfully",
            success: true,
            data: apiKey
        });
    }catch(error){
        return sendResponse(res, 500, {
            message: "Error updating API key",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}


export const deleteApiKey = async (req: Request, res: Response) => {
    try {
        const redis = getRedisClient();
        const { id } = req.params;
        const userId = req.userId;

        // Find the API key by ID and ensure it belongs to the user
        const apiKey = await ApiKey.findOneAndDelete({ _id: id, user: userId });
        if (!apiKey) {
            return sendResponse(res, 404, {
                message: "API key not found",
                success: false
            });
        }

        await redis.del(getApiKeyCacheKey(userId as string, id as string));
        await redis.del(getApiKeysCacheKey(userId as string));

        return sendResponse(res, 200, {
            message: "API key deleted successfully",
            success: true
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error deleting API key",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};



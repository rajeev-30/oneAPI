import { Request, Response } from "express";
import { modelSchema } from "./model.validation";
import  Model  from "./model.model";
import Provider from "@modules/provider/provider.model";
import Billing from "@modules/billing/billing.model";
import { sendResponse } from "@utils/response";
import { getRedisClient } from "@config/redis";


export const createModel = async (req: Request, res: Response) => {
    try{
        const result = modelSchema.safeParse(req.body);
        if(!result.success){
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }
        const { slug, billing, provider } = result.data;
        const existingModel = await Model.findOne({ slug });

        if(existingModel){
            return sendResponse(res, 400, {
                message: "Model with this slug already exists",
                success: false
            });
        }

        const existingProvider = await Provider.findById(provider);
        if (!existingProvider) {
            return sendResponse(res, 400, {
                message: "Invalid provider",
                success: false
            });
        }

        const existingBilling = await Billing.findById(billing);
        if (!existingBilling) {
            return sendResponse(res, 400, {
                message: "Invalid billing",
                success: false
            });
        }

        const model = new Model(result.data);
        await model.save();
        
        const redis = getRedisClient();
        await redis.del("models:all");

        return sendResponse(res, 201, {
            message: "Model created successfully",
            success: true,
            data: model
        });
    }catch(error){
        return sendResponse(res, 500, {
            message: "Error creating model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getModels = async (req: Request, res: Response) => {
    try {
        const redis = getRedisClient();
        const cacheKey = "models:all";

        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            return sendResponse(res, 200, {
                message: "Models fetched successfully (from cache)",
                success: true,
                data: JSON.parse(cached),
            });
        }

        // Fetch from DB
        const models = await Model.find()
            .populate("provider")
            .populate("billing");

        if (!models || models.length === 0) {
            return sendResponse(res, 404, {
                message: "Models not found",
                success: false,
            });
        }

        // Cache the result
        await redis.set(cacheKey, JSON.stringify(models));

        return sendResponse(res, 200, {
            message: "Models fetched successfully",
            success: true,
            data: models,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const deleteModel = async(req:Request, res:Response) => {
    try{
        const { id } = req.params;
        const model = await Model.findByIdAndDelete(id);

        if(!model){
            return sendResponse(res, 404, {
                message: "Model not found",
                success: false,
            });
        }
        
        const redis = getRedisClient();
        await redis.del("models:all");

        return sendResponse(res, 200, {
            message: "Model deleted successfully",
            success: true,
        });
    }catch(error){
        console.log(error)
        return sendResponse(res, 500, {
            message: "Error deleting model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
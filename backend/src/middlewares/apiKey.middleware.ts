import ApiKey from "@modules/apiKey/apiKey.model";
import { sendResponse } from "@utils/response";
import {Request, Response, NextFunction} from "express"
import { send } from "node:process";

export const apiKeyMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendResponse(res, 401, {
                message: "API key missing.",
                success: false
            });
        }
        const key = authHeader.split(" ")[1];
        if (!key.startsWith("sk-oneapi-")) {
            return sendResponse(res, 401, {
                message: "Invalid API key format",
                success: false
            });
        }

        // Find key in DB
        const apiKey = await ApiKey.findOne({ 
            key,
            isActive: true,
            isDeleted: false
        });

        if (!apiKey) {
            return sendResponse(res, 401, {
                message: "Invalid or revoked API key",
                success: false
            });
        }

        req.apiKey = apiKey.key;
        req.apiKeyId = apiKey._id.toString();

        next();
    }catch(error){
        return sendResponse(res, 500, {
            message: "API key validation failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
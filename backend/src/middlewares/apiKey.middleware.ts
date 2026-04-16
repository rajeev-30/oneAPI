import ApiKey from "@modules/apiKey/apiKey.model";
import { sendErrorResponse } from "@utils/errorResponse";
import {Request, Response, NextFunction} from "express"

export const apiKeyMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendErrorResponse(res, new Error("Please provide a valid API key"), 401, "API key missing");
        }
        const key = authHeader.split(" ")[1];
        if (!key.startsWith("sk-oneapi-")) {
            return sendErrorResponse(res, new Error("Please provide a valid API key"), 401, "Invalid API key format");
        }

        // Find key in DB
        const apiKey = await ApiKey.findOne({ 
            key,
            isActive: true,
            isDeleted: false
        });

        if (!apiKey) {
            return sendErrorResponse(res, new Error("Please check your API key"), 401, "Invalid or revoked API key");
        }

        req.apiKey = apiKey.key;
        req.apiKeyId = apiKey._id.toString();

        next();
    }catch(error){
        return sendErrorResponse(res, error, 500, "API key validation failed");
    }
};
import ApiKey from "@modules/apiKey/apiKey.model";
import {Request, Response, NextFunction} from "express"

export const apiKeyMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "API key missing.",
                success: false
            });
        }
        const key = authHeader.split(" ")[1];
        if (!key.startsWith("sk-oneapi-")) {
            return res.status(401).json({
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
            return res.status(401).json({
                message: "Invalid or revoked API key",
                success: false
            });
        }

        req.apiKey = apiKey.key;
        req.apiKeyId = apiKey._id.toString();

        next();
    }catch(error){
        return res.status(500).json({
            message: "API key validation failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
import ApiKey from "@modules/apiKey/apiKey.model";
import {Request, Response, NextFunction} from "express"

export const apiKeyMiddleware = async (req:Request, res:Response, next:NextFunction) => {
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

    // Update lastUsedAt (non-blocking)
    ApiKey.findByIdAndUpdate(apiKey._id, { 
        lastUsedAt: new Date() 
    }).catch(() => {});

    next();
};
import ApiKey from "@modules/apiKey/apiKey.model";
import { sendErrorResponse } from "@utils/errorResponse";
import {Request, Response, NextFunction} from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedTokenPayload extends JwtPayload {
    userId: string;
}

export const authMiddleware = async(req: Request, res: Response, next: NextFunction) =>{
    const token = req.cookies?.token;
    if(!token){
        return res.status(401).json({
            message: "Authentication required: Auth Token missing",
            success: false,
            isLoginRequired: true,
            error: {
                code: "NOT_FOUND",
                details: "Authentication token is required"
            }
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedTokenPayload;
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
            isLoginRequired: true,
            error: error instanceof Error ? {
                code: error.name,
                details: error.message
            } : {
                code: "INTERNAL_SERVER_ERROR",
                details: "An unexpected error occurred"
            }
        });
    }
}


export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const adminUserId = process.env.ADMIN_USER_ID as string || "";

    if (userId === adminUserId) {
        next();
    } else {
        return sendErrorResponse(res, new Error(), 403, "Forbidden: Admin access required");
    }
}

export const getUserIdByApiKeyMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    const apiKeyId = req.apiKeyId;

    if (!apiKeyId) {
        return sendErrorResponse(res, new Error("Please provide an API key"), 401, "Unauthorized: API key missing");
    }

    const apiKey = await ApiKey.findById({ _id: apiKeyId });

    if (!apiKey) {
        return sendErrorResponse(res, new Error("Please provide a valid API key"), 401, "Unauthorized: Invalid API key");
    }

    req.userId = apiKey.user.toString();
    next();
}

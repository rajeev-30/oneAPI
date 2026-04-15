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
            error: error instanceof Error ? error.message : "Unknown error"
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

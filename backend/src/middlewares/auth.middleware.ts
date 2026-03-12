import {Request, Response, NextFunction} from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from "mongoose"; 

interface DecodedTokenPayload extends JwtPayload {
    userId: Types.ObjectId;
}

export const authMiddleware = async(req: Request, res: Response, next: NextFunction) =>{
    const token = req.cookies?.token;
    if(!token){
        return res.status(401).json({
            message: "Authentication required: Token missing",
            success: false,
            isLoginRequired: true,
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedTokenPayload;
        (req as any).userId = decoded.userId;
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

    if (userId === process.env.ADMIN_USER_ID) {
        next();
    } else {
        return res.status(403).json({
            message: "Forbidden: Admin access required",
            success: false,
        });
    }
}

import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { firstYearOfUsageService, getMonthlyUsageService } from "./usage.service";
import { sendErrorResponse } from "@utils/errorResponse";


export const getMonthlyUsage = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const usage = await getMonthlyUsageService(userId, req.params)

        return sendResponse(res, 200, {
            message: "Usage data retrieved successfully",
            success: true,
            data: usage,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error retrieving usage data");
    }
}

export const firstYearOfUsage = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const firstUsage = await firstYearOfUsageService(userId);

        return sendResponse(res, 200, {
            message: "First usage year and month retrieved successfully",
            success: true,
            data: firstUsage.month
            
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error retrieving usage data");
    }
}
import { Request, Response } from "express";
import { usageSchema } from "./usage.validation";
import Usage from "./usage.model";
import { sendResponse } from "@utils/response";


export const getMonthlyUsage = async (req: Request, res: Response) => {
    try {
        const result = usageSchema.safeParse(req.params);
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }
        const { month } = result.data;
        
        const usage = await Usage.findOne({ user: req.userId, month });

        if (!usage) {
            return sendResponse(res, 404, {
                message: "No usage data found for the specified month",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Usage data retrieved successfully",
            success: true,
            data: usage,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error retrieving usage data",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

export const firstUsageOfYear = async (req: Request, res: Response) => {
    try {
        const firstUsage = await Usage.findOne({ user: req.userId })
        .sort({ month: 1 })
        .select("month");

        if (!firstUsage) {
            return sendResponse(res, 404, {
                message: "No usage data found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "First usage month retrieved successfully",
            success: true,
            data: firstUsage.month
            
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error retrieving usage data",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
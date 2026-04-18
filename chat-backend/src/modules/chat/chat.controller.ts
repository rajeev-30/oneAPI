
import { sendErrorResponse } from "@utils/errorResponse";
import { sendResponse } from "@utils/response";
import { Request, Response } from "express";

export const generateChat = async (req: Request, res: Response) => {
    try {
        const chatData = req.body;
        // Simulate chat generation logic
        const generatedResponse = " ";
        return sendResponse(res, 201, {
            message: "Chat generated successfully",
            success: true,
            data: generatedResponse,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 400, "Error generating chat");
    }
};
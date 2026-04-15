import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { addBalanceService, getWalletService } from "./wallet.service";
import { sendErrorResponse } from "@utils/errorResponse";


export const addBalance = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const wallet = await addBalanceService(userId, req.body);

        return sendResponse(res, 200, {
            message: "Balance added successfully",
            success: true,
            data: wallet,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error adding balance");
    }
}

export const getWallet = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const wallet = await getWalletService(userId);

        return sendResponse(res, 200, {
            message: "Wallet retrieved successfully",
            success: true,
            data: wallet
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error retrieving balance");
    }
}
import Subscription from "@modules/subscription/subscription.model";
import Wallet from "./wallet.model";
import { walletSchema } from "./wallet.validation";
import { Request, Response } from "express";
import { sendResponse } from "@utils/response";


export const addBalance = async (req: Request, res: Response) => {
    try {
        const result = walletSchema.safeParse(req.body);
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const { balance } = result.data;
        const userId = req.userId;

        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = new Wallet({ user: userId, balance});
            //add wallet to subscription (if done not exists create one)
            await Subscription.findOneAndUpdate(
                { user: userId },
                { wallet: wallet._id },
                { upsert: true, setDefaultsOnInsert: true }
            );
        } else {
            wallet.balance += balance;
            //update subscription status to active if balance is added
            await Subscription.findOneAndUpdate(
                { user: userId, status: "expired" },
                { status: "active" }
            );
        }
        await wallet.save();

        return sendResponse(res, 200, {
            message: "Balance added successfully",
            success: true,
            data: wallet,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error adding balance",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getWallet = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const wallet = await Wallet.findOne({ user: userId });

        if (!wallet) {
            return sendResponse(res, 404, {
                message: "Wallet not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Wallet retrieved successfully",
            success: true,
            data: wallet
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error retrieving balance",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
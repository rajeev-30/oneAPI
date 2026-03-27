import Subscription from "@modules/subscription/subscription.model";
import Wallet from "./wallet.model";
import { walletSchema } from "./wallet.validation";
import { Request, Response } from "express";


export const addBalance = async (req: Request, res: Response) => {
    try {
        const result = walletSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
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

        res.status(200).json({
            message: "Balance added successfully",
            success: true,
            wallet
        });
    } catch (error) {
        res.status(500).json({
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
            return res.status(404).json({
                message: "Wallet not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Wallet retrieved successfully",
            success: true,
            wallet
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving balance",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
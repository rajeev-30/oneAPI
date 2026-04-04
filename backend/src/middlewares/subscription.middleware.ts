import { Request, Response, NextFunction } from "express";
import Subscription from "@modules/subscription/subscription.model";
import { sendResponse } from "@utils/response";

type BillingSource = "plan" | "wallet";

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.userId,
            status: "active",
        }).populate("plan").populate("wallet");

        if (!subscription) {
            return sendResponse(res, 403, {
                message: "Your credit balance is too low to access the oneAPI. Upgrade your plan or purchase credits.",
                success: false,
            });
        }

        const plan = subscription.plan as any;
        const wallet = subscription.wallet as any;
        const now = new Date();

        const hasActivePlan = !!plan && !!subscription.endDate && new Date(subscription.endDate) > now;
        const hasWalletBalance = !!wallet && wallet.balance > 0;

        if (!hasActivePlan && !hasWalletBalance) {
            await Subscription.findByIdAndUpdate(subscription._id, { $set: { status: "expired" } });
            return sendResponse(res, 403, {
                message: "Your credit balance is too low to access the oneAPI. Upgrade your plan or purchase credits.",
                success: false,
            });
        }

        const billingSource: BillingSource = hasActivePlan ? "plan" : "wallet";

        req.subscription = subscription;
        req.billingSource = billingSource;
        next();
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Subscription check failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
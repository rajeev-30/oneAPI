import { Request, Response, NextFunction } from "express";
import Subscription from "@modules/subscription/subscription.model";
import { sendResponse } from "@utils/response";
import { sendErrorResponse } from "@utils/errorResponse";

type BillingSource = "plan" | "wallet";

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.userId,
            status: "active",
        }).populate("plan").populate("wallet");

        if (!subscription) {
            return sendErrorResponse(res, new Error("Please upgrade your plan or purchase credits, To access the oneAPI."), 403, "Your credit balance is too low to access the oneAPI. Upgrade your plan or purchase credits.");
        }

        const plan = subscription.plan as any;
        const wallet = subscription.wallet as any;
        const now = new Date();

        const hasActivePlan = !!plan && !!subscription.endDate && new Date(subscription.endDate) > now;
        const hasWalletBalance = !!wallet && wallet.balance > 0;

        if (!hasActivePlan && !hasWalletBalance) {
            await Subscription.findByIdAndUpdate(subscription._id, { $set: { status: "expired" } });
            return sendErrorResponse(res, new Error("Please upgrade your plan or purchase credits, To access the oneAPI."), 403, "Your credit balance is too low to access the oneAPI. Upgrade your plan or purchase credits.");
        }

        const billingSource: BillingSource = hasActivePlan ? "plan" : "wallet";

        req.subscription = subscription;
        req.billingSource = billingSource;
        next();
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Subscription check failed");
    }
};
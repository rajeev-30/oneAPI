import { Request, Response, NextFunction } from "express";
import Subscription from "@modules/subscription/subscription.model";

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = await Subscription.findOne({
            user:   req.userId,
            status: "active"
        }).populate("plan");

        if (!subscription) {
            return res.status(403).json({
                message: "No active subscription found. Please subscribe to a plan.",
                success: false
            });
        }

        // ✅ check if subscription expired
        if (subscription.endDate < new Date()) {
            await Subscription.findByIdAndUpdate(subscription._id, { status: "expired" });
            return res.status(403).json({
                message: "Subscription expired. Please renew your plan.",
                success: false
            });
        }

        const plan = subscription.plan as any;

        // ✅ check monthly request limit
        if (subscription.usage.requestsUsed >= plan.limits.requestsPerMonth) {
            return res.status(429).json({
                message: `Monthly request limit of ${plan.limits.requestsPerMonth} reached.`,
                success: false
            });
        }

        // ✅ check monthly token limit
        if (subscription.usage.tokensUsed >= plan.limits.tokensPerMonth) {
            return res.status(429).json({
                message: `Monthly token limit of ${plan.limits.tokensPerMonth} reached.`,
                success: false
            });
        }

        // ✅ attach subscription to request
        req.subscription = subscription;
        next();

    } catch (error) {
        return res.status(500).json({
            message: "Subscription check failed",
            success: false
        });
    }
}
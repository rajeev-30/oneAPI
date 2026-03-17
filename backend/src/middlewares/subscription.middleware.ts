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

        // check if subscription expired
        if (subscription.endDate < new Date()) {
            await Subscription.findByIdAndUpdate(subscription._id, { status: "expired" });
            return res.status(403).json({
                message: "Subscription expired. Please renew your plan.",
                success: false
            });
        }

        const plan = subscription.plan as any;

        if ((subscription.plan as any).type === "payg") {
            const cost = 10; // Assume a cost for the request, this should be defined based on your pricing model

            if (subscription.balance < cost) {
                return res.status(402).json({
                    message: "Insufficient balance. Please top up.",
                    success: false
                });
            }

            // Deduct cost after successful request
            subscription.balance -= cost;
            subscription.totalSpent += cost;
            await subscription.save();
        }

        // check daily request limit
        if (subscription.usage.requestsUsed >= plan.limits.requestsPerDay) {
            return res.status(429).json({
                message: `Daily request limit of ${plan.limits.requestsPerDay} reached.`,
                success: false
            });
        }

        // ✅ check daily token limit
        if (subscription.usage.tokensUsed >= plan.limits.tokensPerDay) {
            return res.status(429).json({
                message: `Daily token limit of ${plan.limits.tokensPerDay} reached.`,
                success: false
            });
        }

        // ✅ check pay-as-you-go balance if applicable
        

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
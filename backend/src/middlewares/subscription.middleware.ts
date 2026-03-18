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

        const plan = subscription.plan as any;

        if (subscription.type === "payg") {
            if (subscription.balance <= 0) {
                await Subscription.findByIdAndUpdate(subscription._id, { status: "expired" });
                return res.status(402).json({
                    message: "Insufficient balance. Please top up.",
                    success: false
                });
            }
        }else{
            // check daily request limit for fixed plans
            if (subscription.usage.requestsUsed >= plan.limits.requestsPerDay) {
                return res.status(429).json({
                    message: `Daily request limit of ${plan.limits.requestsPerDay} reached.`,
                    success: false
                });
            }

            // check daily token limit
            if (subscription.usage.tokensUsed >= plan.limits.tokensPerDay) {
                return res.status(429).json({
                    message: `Daily token limit of ${plan.limits.tokensPerDay} reached.`,
                    success: false
                });
            }
        }

        
        // no need to check if subscription expired, cron job will handle it
        if (subscription.endDate < new Date()) {
            await Subscription.findByIdAndUpdate(subscription._id, { status: "expired" });
            return res.status(403).json({
                message: "Subscription expired. Please renew your plan.",
                success: false
            });
        }

        // attach subscription to request
        req.subscription = subscription;
        next();

    } catch (error) {
        return res.status(500).json({
            message: "Subscription check failed",
            success: false
        });
    }
}
import { Request, Response, NextFunction } from "express";
import { checkPlanLimits } from "@services/redisRateLimiter.service";

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = req.subscription as any;
        if (!subscription) {
            return res.status(500).json({
                message: "Subscription context missing.",
                success: false,
            });
        }
        if (req.billingSource === "wallet") {
            return next();
        }

        const plan = subscription.plan as any;

        const limits = {
            requestsPerMinute: 2,
            tokensPerMinute: plan?.limits?.tokensPerMinute ?? 10000,
            requestsPerDay: plan?.limits?.requestsPerDay ?? 1000,
            tokensPerDay: plan?.limits?.tokensPerDay ?? 100000,
        };

        // const estimatedTokens = Math.ceil(
        //     (Array.isArray(req.body?.messages)
        //         ? req.body.messages.reduce((n: number, m: any) => 
        //             n + String(m?.content || "").length, 0)
        //         : 0) / 4 * 1.1
        // );

        //User should have at least 100 tokens left to make a request, otherwise they will hit the rate limit. This is a simple way to prevent abuse while we don't have actual token counting implemented.
        const estimatedTokens = 100

        const result = await checkPlanLimits({
            userId: req.userId as string,
            estimatedTokens,
            limits,
        });

        if (!result.allowed) {
            const wallet = (req.subscription as any)?.wallet;
            if (wallet && wallet.balance > 0) {
                req.billingSource = "wallet";
                return next();
            }

            return res.status(429).json({ 
                success: false, 
                message: result.reason + " Please upgrade your plan or purchase credits to continue." 
            });
        }

        return next();
    } catch (error) {
        return res.status(500).json({
            message: "Rate limit check failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
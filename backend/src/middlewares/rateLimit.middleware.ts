import { Request, Response, NextFunction } from "express";
import { checkPlanLimits } from "@services/redisRateLimiter.service";
import { sendErrorResponse } from "@utils/errorResponse";

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = req.subscription as any;
        if (!subscription) {
            return sendErrorResponse(res, new Error("please provide subscription context"), 500, "Subscription context missing.");
        }
        if (req.billingSource === "wallet") {
            return next();
        }

        const plan = subscription.plan as any;

        const limits = {
            requestsPerMinute: 1,
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

            return sendErrorResponse(res, new Error("Please upgrade your plan or purchase credits to continue."), 429, result.reason + " Please upgrade your plan or purchase credits to continue.");
        }

        return next();
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Rate limit check failed");
    }
};
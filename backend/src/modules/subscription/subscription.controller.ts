import { sendResponse } from "@utils/response";
import { Request, Response } from "express";
import Subscription from "./subscription.model";
import { createSubscriptionService, getSubscriptionService } from "./subscription.services";
import { sendErrorResponse } from "@utils/errorResponse";


export const createSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const subscription = await createSubscriptionService(userId, req.params);

        return sendResponse(res, 201, {
            message: "Subscription created/updated successfully",
            success: true,
            data: subscription,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 400, "Error creating/updating subscription");
    }
}

export const getSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const subscription = await getSubscriptionService(userId);

        return sendResponse(res, 200, {
            message: "Subscription fetched successfully",
            success: true,
            data: subscription
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching subscription");
    }
}

//Will implement this route later.
//it should not expire if the wallet balance is greater than 0 or plan is active. It should only expire if both are not valid
export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const subscription = await Subscription.findOneAndUpdate(
            { user: userId, status: "active" },
            { $set: { status: "expired" } },
            {  returnDocument: "after" }
        );

        if (!subscription) {
            return sendResponse(res, 404, {
                message: "Active subscription not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Subscription cancelled successfully",
            success: true,
            data: subscription
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error cancelling subscription",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
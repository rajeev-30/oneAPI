import { sendResponse } from "@utils/response";
import { Request, Response } from "express";
import { subscriptionSchema } from "./subscription.validation";
import Subscription from "./subscription.model";
import Plan from "@modules/plan/plan.model";


export const createSubscription = async (req: Request, res: Response) => {
    try {
        const result = subscriptionSchema.safeParse(req.params);
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const { plan, startDate, endDate } = result.data;
        const userId = req.userId;

        const existingPlan = await Plan.findById(plan);
        if (!existingPlan) {
            return sendResponse(res, 400, {
                message: "Invalid plan ID",
                success: false,
            });
        }

        const subscription = await Subscription.findOneAndUpdate(
            { user: userId },
            {
                plan,
                startDate,
                endDate,
                status: "active",
            },
            { upsert: true, setDefaultsOnInsert: true, returnDocument: "after" }
        );

        return sendResponse(res, 201, {
            message: "Subscription created/updated successfully",
            success: true,
            data: subscription,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error creating/updating subscription",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const subscription = await Subscription.findOne({ user: userId }).populate("plan").populate("wallet");

        if (!subscription) {
            return sendResponse(res, 404, {
                message: "Subscription not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Subscription fetched successfully",
            success: true,
            data: subscription
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching subscription",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

//it should not expire if the wallet balance is greater than 0 or plan is active. It should only expire if both are not valid
export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const subscription = await Subscription.findOneAndUpdate(
            { user: userId, status: "active" },
            { status: "expired" },
            { new: true }
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
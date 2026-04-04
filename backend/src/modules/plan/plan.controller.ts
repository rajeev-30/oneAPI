import { planSchema } from "./plan.validation"
import Plan from "./plan.model";
import { Request, Response } from "express";
import { sendResponse } from "@utils/response";


export const createPlan = async (req: Request, res: Response) => {
    try {
        const result = planSchema.safeParse(req.body)
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const { name, price, limits, features } = result.data;

        const existingPlan = await Plan.findOne({ price });
        if (existingPlan) {
            return sendResponse(res, 400, {
                message: "Plan with this price already exists",
                success: false,
            });
        }

        const plan  = new Plan({
            name,
            price,
            limits,
            features
        });
        await plan.save();

        return sendResponse(res, 201, {
            message: "Plan created successfully",
            success: true,
            data: plan
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error creating plan",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getPlans = async (_: Request, res: Response) => {
    try {
        const plans = await Plan.find();

        if (!plans || plans.length === 0) {
            return sendResponse(res, 404, {
                message: "No plans found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Plans retrieved successfully",
            success: true,
            data: plans
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching plans",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const plan = await Plan.findByIdAndDelete(id);
        if (!plan) {
            return sendResponse(res, 404, {
                message: "Plan not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Plan deleted successfully",
            success: true,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error deleting plan",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

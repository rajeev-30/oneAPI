import { planSchema } from "./plan.validation"
import Plan from "./plan.model";
import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { getRedisClient } from "@config/redis";
import { create } from "domain";
import { createPlanService, deletePlanService, getPlanService, getPlansService, updatePlanService } from "./plan.service";
import { sendErrorResponse } from "@utils/errorResponse";


export const createPlan = async (req: Request, res: Response) => {
    try {
        const plan = await createPlanService(req.body);

        return sendResponse(res, 201, {
            message: "Plan created successfully",
            success: true,
            data: plan
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error creating plan");
    }
}

export const getPlans = async (_: Request, res: Response) => {
    try {
        const plans = await getPlansService();

        return sendResponse(res, 200, {
            message: "Plans retrieved successfully",
            success: true,
            data: plans
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching plans");
    }
};

export const getPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as {id: string};
        const plan = await getPlanService(id);

        return sendResponse(res, 200, {
            message: "Plan retrieved successfully",
            success: true,
            data: plan
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching plan");
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as {id: string};
        const updatedPlan = await updatePlanService(id, req.body);

        return sendResponse(res, 200, {
            message: "Plan updated successfully",
            success: true,
            data: updatedPlan
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error updating plan");
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        await deletePlanService(id);
       
        return sendResponse(res, 200, {
            message: "Plan deleted successfully",
            success: true,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error deleting plan");
    }
};

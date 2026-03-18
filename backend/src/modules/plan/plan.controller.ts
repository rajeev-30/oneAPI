import { planSchema } from "./plan.validation"
import Plan from "./plan.model";
import { Request, Response } from "express";
import { _array } from "zod/v4/core";


export const createPlan = async (req: Request, res: Response) => {
    try {
        const result = planSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const { name, price, type, limits, features } = result.data;

        const existingPlan = await Plan.findOne({ price });
        if (existingPlan) {
            return res.status(400).json({
                message: "Plan with this price already exists",
                success: false,
            });
        }

        const plan  = new Plan({
            name,
            price,
            type,
            limits,
            features
        });
        await plan.save();

        return res.status(201).json({
            message: "Plan created successfully",
            success: true,
            plan
        });
    } catch (error) {
        res.status(500).json({
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
            return res.status(404).json({
                message: "No plans found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Plans retrieved successfully",
            success: true,
            plans
        });
    } catch (error) {
        return res.status(500).json({
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
            return res.status(404).json({
                message: "Plan not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Plan deleted successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting plan",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

import { Request, Response } from "express";
import { billingSchema, updateBillingSchema } from "./billing.validation";
import Billing from "./billing.model";
import { sendResponse } from "@utils/response";

export const createBilling = async (req: Request, res: Response) => {
    try {
        const result = billingSchema.safeParse(req.body);
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const billing = new Billing(result.data);
        await billing.save();

        return sendResponse(res, 201, {
            message: "Billing record created successfully",
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error creating billing record",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};


export const getBillings = async (req: Request, res: Response) => {
    try {
        const billings = await Billing.find();

        if (!billings || billings.length === 0) {
            return sendResponse(res, 404, {
                message: "No billing records found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Billing records fetched successfully",
            success: true,
            data: billings,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching billing records",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const getBilling = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const billing = await Billing.findById(id);

        if (!billing) {
            return sendResponse(res, 404, {
                message: "Billing record not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Billing record fetched successfully",
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching billing record",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const deleteBilling = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const billing = await Billing.findByIdAndDelete(id);

        if (!billing) {
            return sendResponse(res, 404, {
                message: "Billing record not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Billing record deleted successfully",
            success: true,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error deleting billing record",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const updateBilling = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = updateBillingSchema.safeParse(req.body);
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const billing = await Billing.findByIdAndUpdate(id, { $set: result.data }, { returnDocument: 'after' });

        if (!billing) {
            return sendResponse(res, 404, {
                message: "Billing record not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Billing record updated successfully",
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error updating billing record",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

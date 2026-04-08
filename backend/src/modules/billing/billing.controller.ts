import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { createBillingService, deleteBillingService, getBillingService, getBillingsService, updateBillingService } from "./billing.service";
import { sendErrorResponse } from "@utils/errorResponse";

export const createBilling = async (req: Request, res: Response) => {
    try {
        const billing = await createBillingService(req.body);

        return sendResponse(res, 201, {
            message: "Billing record created successfully",
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error creating billing record");
    }
};


export const getBillings = async (req: Request, res: Response) => {
    try {
        const billings = await getBillingsService();

        return sendResponse(res, 200, {
            message: "Billing records fetched successfully",
            success: true,
            data: billings,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching billing records");
    }
};

export const getBilling = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const billing = await getBillingService(id);

        return sendResponse(res, 200, {
            message: "Billing record fetched successfully",
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching billing record");
    }
};

export const deleteBilling = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        await deleteBillingService(id);

        return sendResponse(res, 200, {
            message: "Billing record deleted successfully",
            success: true,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error deleting billing record");
    }
};

export const updateBilling = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const billing = await updateBillingService(id, req.body);

        return sendResponse(res, 200, {
            message: "Billing record updated successfully",
            success: true,
            data: billing,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error updating billing record");
    }
};

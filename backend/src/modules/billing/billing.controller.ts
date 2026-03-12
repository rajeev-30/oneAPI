import { Request, Response } from "express";
import { createBillingInput } from "./billing.validation";
import Billing from "./billing.model";

export const createBilling = async (req: Request, res: Response) => {
    try {
        const result = createBillingInput.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const billing = new Billing(result.data);
        await billing.save();

        res.status(201).json({
            message: "Billing record created successfully",
            success: true,
            billing,
        });
    } catch (error) {
        res.status(500).json({
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
            return res.status(404).json({
                message: "No billing records found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Billing records fetched successfully",
            success: true,
            billings,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching billing records",
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
            return res.status(404).json({
                message: "Billing record not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Billing record deleted successfully",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting billing record",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

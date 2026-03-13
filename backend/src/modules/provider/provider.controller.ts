import { Request, Response } from "express";
import { ProviderInput } from "./provider.validation";
import Provider from "./provider.model";


export const createProvider = async (req: Request, res: Response) => {
    try {
        const result = ProviderInput.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message:  result.error.issues[0].message,
                success: false,
            });
        }
        
        const { name, slug } = result.data;

        const existingProvider = await Provider.findOne({ slug });
        if (existingProvider) {
            return res.status(400).json({
                message: "Provider with this slug already exists",
                success: false
            });
        }

        const provider = new Provider({ name, slug });
        await provider.save();

        res.status(201).json({
            message: "Provider created successfully",
            success: true,
            provider
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating provider",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getProviders = async (req: Request, res: Response) => {
    try {
        const providers = await Provider.find();

        if (!providers || providers.length === 0) {
            return res.status(404).json({
                message: "No providers found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Providers fetched successfully",
            success: true,
            providers
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching providers",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const deleteProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const provider = await Provider.findByIdAndDelete(id);
        if (!provider) {
            return res.status(404).json({
                message: "Provider not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Provider deleted successfully",
            success: true,
            provider
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting provider",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
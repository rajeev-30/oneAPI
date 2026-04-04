import { Request, Response } from "express";
import { providerSchema } from "./provider.validation";
import Provider from "./provider.model";
import { sendResponse } from "@utils/response";


export const createProvider = async (req: Request, res: Response) => {
    try {
        const result = providerSchema.safeParse(req.body);
        if (!result.success) {
            return sendResponse(res, 400, {
                message:  result.error.issues[0].message,
                success: false,
            });
        }
        
        const { name, slug } = result.data;

        const existingProvider = await Provider.findOne({ slug });
        if (existingProvider) {
            return sendResponse(res, 400, {
                message: "Provider with this slug already exists",
                success: false
            });
        }

        const provider = new Provider({ name, slug });
        await provider.save();

        return sendResponse(res, 201, {
            message: "Provider created successfully",
            success: true,
            data: provider
        });
    } catch (error) {
        return sendResponse(res, 500, {
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
            return sendResponse(res, 404, {
                message: "No providers found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Providers fetched successfully",
            success: true,
            data: providers
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching providers",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const provider = await Provider.findById(id);

        if (!provider) {
            return sendResponse(res, 404, {
                message: "Provider not found",
                success: false,
            });
        }

        return sendResponse(res, 200, {
            message: "Provider fetched successfully",
            success: true,
            data: provider
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error fetching provider",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const updateProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = providerSchema.partial().safeParse(req.body);
        if (!result.success) {
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const updatedProvider = await Provider.findByIdAndUpdate(id, { $set: result.data }, { returnDocument: "after" });
        if (!updatedProvider) {
            return sendResponse(res, 404, {
                message: "Provider not found",
                success: false
            });
        }

        return sendResponse(res, 200, {
            message: "Provider updated successfully",
            success: true,
            data: updatedProvider
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error updating provider",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const deleteProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const provider = await Provider.findByIdAndDelete(id);
        if (!provider) {
            return sendResponse(res, 404, {
                message: "Provider not found",
                success: false
            });
        }
        return sendResponse(res, 200, {
            message: "Provider deleted successfully",
            success: true,
            data: provider
        });
    } catch (error) {
        return sendResponse(res, 500, {
            message: "Error deleting provider",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
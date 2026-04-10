import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { createProviderService, deleteProviderService, getProviderService, getProvidersService, updateProviderService } from "./provider.service";
import { sendErrorResponse } from "@utils/errorResponse";


export const createProvider = async (req: Request, res: Response) => {
    try {
        const provider = await createProviderService(req.body);

        return sendResponse(res, 201, {
            message: "Provider created successfully",
            success: true,
            data: provider
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error creating provider");
    }
}

export const getProviders = async (req: Request, res: Response) => {
    try {
        const providers = await getProvidersService();

        return sendResponse(res, 200, {
            message: "Providers fetched successfully",
            success: true,
            data: providers
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching providers");
    }
}

export const getProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as {id: string};
        const provider = await getProviderService(id);

        return sendResponse(res, 200, {
            message: "Provider fetched successfully",
            success: true,
            data: provider
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching provider");
    }
};

export const updateProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const updatedProvider = await updateProviderService(id, req.body);

        return sendResponse(res, 200, {
            message: "Provider updated successfully",
            success: true,
            data: updatedProvider
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error updating provider");
    }
};

export const deleteProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const provider = await deleteProviderService(id);

        return sendResponse(res, 200, {
            message: "Provider deleted successfully",
            success: true,
            data: provider
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error deleting provider");
    }
}
import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { createModelService, deleteModelService, getModelService, getModelsService, updateModelService } from "./model.service";
import { sendErrorResponse } from "@utils/errorResponse";


export const createModel = async (req: Request, res: Response) => {
    try{
        const model = await createModelService(req.body);

        return sendResponse(res, 201, {
            message: "Model created successfully",
            success: true,
            data: model
        });
    }catch(error){
        return sendErrorResponse(res, error, 500, "Error creating model");
    }
}

export const getModels = async (req: Request, res: Response) => {
    try {
        const {data, pagination} = await getModelsService(req.query);
        return sendResponse(res, 200, {
            message: "Models fetched successfully",
            success: true,
            data,
            pagination
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching models");
    }
};


export const getModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const model = await getModelService(id);

        return sendResponse(res, 200, {
            message: "Model fetched successfully",
            success: true,
            data: model,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching model");
    }
};

export const updateModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as {id: string};
        const model = await updateModelService(id, req.body);

        return sendResponse(res, 200, {
            message: "Model updated successfully",
            success: true,
            data: model,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error updating model");
    }
};

export const deleteModel = async(req:Request, res:Response) => {
    try{
        const { id } = req.params as {id: string};
        await deleteModelService(id);

        return sendResponse(res, 200, {
            message: "Model deleted successfully",
            success: true,
        });
    }catch(error){
        return sendErrorResponse(res, error, 500, "Error deleting model");
    }
}

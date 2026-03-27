import { Request, Response } from "express";
import { modelSchema } from "./model.validation";
import  Model  from "./model.model";
import Provider from "@modules/provider/provider.model";
import Billing from "@modules/billing/billing.model";
import { Types } from "mongoose";


export const createModel = async (req: Request, res: Response) => {
    try{
        const result = modelSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message: result.error.issues[0].message,
                success: false,
            });
        }
        const { slug, billing, provider } = result.data;
        const existingModel = await Model.findOne({ slug });

        if(existingModel){
            return res.status(400).json({
                message: "Model with this slug already exists",
                success: false
            });
        }

        const existingProvider = await Provider.findById(provider);
        if (!existingProvider) {
            return res.status(400).json({
                message: "Invalid provider",
                success: false
            });
        }

        const existingBilling = await Billing.findById(billing);
        if (!existingBilling) {
            return res.status(400).json({
                message: "Invalid billing",
                success: false
            });
        }

        const model  = new Model(result.data);
        await model.save();

        return res.status(201).json({
            message: "Model created successfully",
            success: true,
            data: model
        });
    }catch(error){
        return res.status(500).json({
            message: "Error creating model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getModels = async(req:Request, res:Response) => {
    try{
        const models = await Model.find().populate("provider").populate("billing");
        if(!models || models.length === 0) {
            return res.status(404).json({
                message: "Models not found",
                success: false,
            });   
        }
                
        res.status(200).json({
            message: "Models fetched successfully",
            success: true,
            models
        });
    }catch(error){
        return res.status(500).json({
            message: "Error fetching model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const deleteModel = async(req:Request, res:Response) => {
    try{
        const { id } = req.params;
        const model = await Model.findByIdAndDelete(id);

        if(!model){
            return res.status(404).json({
                message: "Model not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Model deleted successfully",
            success: true,
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({
            message: "Error deleting model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
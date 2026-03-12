import {Request, Response} from "express"
import crypto from "crypto";
import ApiKey from "./apiKey.model";
import { nameValidation } from "@modules/apiKey/apiKey.validation";


export const generateApiKey = async(req: Request, res:Response) =>{
    try{
        const key = "sk-or-v1-" + crypto.randomBytes(24).toString("hex");
        const result = nameValidation.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message: result.error.issues[0].message,
                success: false
            });
        }

        const { name } = result.data;
        const userId = req.userId;

        // Save the API key to the database
        const apiKey = new ApiKey({ name, user: userId, key });
        await apiKey.save();

        res.status(201).json({
            message: "API key generated successfully",
            success: true,
            apiKey
        });
    }catch(error){
        res.status(500).json({
            message: "Error generating API key",
            success: false,
            error: error instanceof Error ? error : "Unknown error"
        });
    }
}


export const getApiKeys = async(req:Request, res:Response) => {
    try{
        const userId = req.userId;
        const apiKeys = await ApiKey.find({ user: userId });
        if(!apiKeys || apiKeys.length === 0){
            return res.status(404).json({
                message: "No API keys found",
                success: false
            });
        }
        res.status(200).json({
            message: "API keys found successfully",
            success: true,
            apiKeys
        });
    }catch(error){
        res.status(500).json({
            message: "Error retrieving API key",
            success: false,
            error: error instanceof Error ? error : "Unknown error"
        });
    }
}


export const deleteApiKey = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Find the API key by ID and ensure it belongs to the user
        const apiKey = await ApiKey.findOneAndDelete({ _id: id, user: userId });
        if (!apiKey) {
            return res.status(404).json({
                message: "API key not found",
                success: false
            });
        }

        res.status(200).json({
            message: "API key deleted successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting API key",
            success: false,
            error: error instanceof Error ? error : "Unknown error"
        });
    }
};

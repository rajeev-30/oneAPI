import {Request, Response} from "express"
import { sendErrorResponse } from "@utils/errorResponse";
import { sendResponse } from "@utils/response";
import { createConversationService, deleteConversationService, getConversationService, getConversationsTitlesService, updateConversationService } from "./conversation.service";


export const createConversation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const conversation = await createConversationService(userId, req.body);

        return sendResponse(res, 201, {
            message: "Conversation created successfully",
            success: true,
            data: conversation,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error creating conversation");
    }
};

export const getConversation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const { id } = req.params as { id: string };

        const conversation = await getConversationService(userId, id);

        return sendResponse(res, 200, {
            message: "Conversation retrieved successfully",
            success: true,
            data: conversation,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error retrieving conversation");
    }
};

export const getConversationsTitles = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const {data, pagination} = await getConversationsTitlesService(userId, req.query);

        return sendResponse(res, 200, {
            message: "Conversations retrieved successfully",
            success: true,
            data,
            pagination,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error retrieving conversations");
    }
};

export const updateConversation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const { id } = req.params as { id: string };
        const updatedConversation = await updateConversationService(userId, id, req.body);

        return sendResponse(res, 200, {
            message: "Conversation updated successfully",
            success: true,
            data: updatedConversation,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error updating conversation");
    }
};

export const deleteConversation = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string;
        const { id } = req.params as { id: string };
        await deleteConversationService(userId, id);

        return sendResponse(res, 200, {
            message: "Conversation deleted successfully",
            success: true,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error deleting conversation");
    }
};

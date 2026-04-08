import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { sendErrorResponse } from "@utils/errorResponse";
import { generateApiKeyService, getApiKeysService, getApiKeyService, updateApiKeyNameService, deleteApiKeyService } from "./apiKey.service";

export const generateApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const apiKey = await generateApiKeyService(userId, req.body);

    return sendResponse(res, 201, {
      message: "API key generated successfully",
      success: true,
      data: apiKey,
    });
  } catch (error) {
    return sendErrorResponse(res, error, 400, "Error generating API key");
  }
};

export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const apiKeys = await getApiKeysService(userId);

    return sendResponse(res, 200, {
      message: "API keys fetched successfully",
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    return sendErrorResponse(res, error, 500, "Error retrieving API keys");
  }
};

export const getApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { id } = req.params as { id: string };

    const apiKey = await getApiKeyService(userId, id);

    return sendResponse(res, 200, {
      message: "API key fetched successfully",
      success: true,
      data: apiKey,
    });
  } catch (error) {
    return sendErrorResponse(res, error, 500, "Error retrieving API keys");
  }
};

export const updateApiKeyName = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { id } = req.params as { id: string };

    const apiKey = await updateApiKeyNameService(userId, id, req.body);

    return sendResponse(res, 200, {
      message: "API key updated successfully",
      success: true,
      data: apiKey,
    });
  } catch (error) {
    return sendErrorResponse(res, error, 400, "Error updating API key");
  }
};

export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { id } = req.params as { id: string };

    await deleteApiKeyService(userId, id);

    return sendResponse(res, 200, {
      message: "API key deleted successfully",
      success: true,
    });
  } catch (error) {
    return sendErrorResponse(res, error, 500, "Error deleting API key");
  }
};



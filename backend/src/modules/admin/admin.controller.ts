import { Request, Response } from "express";
import { sendResponse } from "@utils/response";
import { sendErrorResponse } from "@utils/errorResponse";
import {
    getAllUsersService,
    getUserByIdService,
    toggleUserStatusService,
    getAllApiKeysService,
    getRequestLogsService,
    getRequestLogByIdService,
    getAnalyticsOverviewService,
} from "./admin.service";


// ─── User Management ────────────────────────────────────────

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { data, pagination } = await getAllUsersService(req.query);

        return sendResponse(res, 200, {
            message: "Users fetched successfully",
            success: true,
            data,
            pagination,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching users");
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const result = await getUserByIdService(id);

        return sendResponse(res, 200, {
            message: "User details fetched successfully",
            success: true,
            data: result,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching user details");
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const user = await toggleUserStatusService(id, req.body);

        return sendResponse(res, 200, {
            message: "User status updated successfully",
            success: true,
            data: user,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error updating user status");
    }
};

// ─── API Keys (cross-user) ──────────────────────────────────

export const getAllApiKeys = async (req: Request, res: Response) => {
    try {
        const { data, pagination } = await getAllApiKeysService(req.query);

        return sendResponse(res, 200, {
            message: "API keys fetched successfully",
            success: true,
            data,
            pagination,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching API keys");
    }
};

// ─── Request Logs ───────────────────────────────────────────

export const getRequestLogs = async (req: Request, res: Response) => {
    try {
        const { data, pagination } = await getRequestLogsService(req.query);

        return sendResponse(res, 200, {
            message: "Request logs fetched successfully",
            success: true,
            data,
            pagination,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching request logs");
    }
};

export const getRequestLogById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const log = await getRequestLogByIdService(id);

        return sendResponse(res, 200, {
            message: "Request log fetched successfully",
            success: true,
            data: log,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching request log");
    }
};

// ─── Analytics ──────────────────────────────────────────────

export const getAnalyticsOverview = async (_req: Request, res: Response) => {
    try {
        const analytics = await getAnalyticsOverviewService();

        return sendResponse(res, 200, {
            message: "Analytics fetched successfully",
            success: true,
            data: analytics,
        });
    } catch (error) {
        return sendErrorResponse(res, error, 500, "Error fetching analytics");
    }
};

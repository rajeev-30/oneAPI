import { Router } from "express";
import { authMiddleware, adminMiddleware } from "@middlewares/auth.middleware";
import {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    getAllApiKeys,
    getRequestLogs,
    getRequestLogById,
    getAnalyticsOverview,
} from "./admin.controller";

const router = Router();

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// User management
router.route("/users").get(getAllUsers);
router.route("/users/:id").get(getUserById);
router.route("/users/:id/status").patch(toggleUserStatus);

// API keys (cross-user)
router.route("/keys").get(getAllApiKeys);

// Request logs
router.route("/logs").get(getRequestLogs);
router.route("/logs/:id").get(getRequestLogById);

// Analytics
router.route("/analytics").get(getAnalyticsOverview);

export default router;

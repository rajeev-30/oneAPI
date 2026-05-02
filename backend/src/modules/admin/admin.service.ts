import User from "@modules/user/user.model";
import ApiKey from "@modules/apiKey/apiKey.model";
import { RequestLog } from "@modules/requestLogs/request.model";
import Usage from "@modules/usage/usage.model";
import Wallet from "@modules/wallet/wallet.model";
import Subscription from "@modules/subscription/subscription.model";
import Model from "@modules/model/model.model";
import Provider from "@modules/provider/provider.model";
import Plan from "@modules/plan/plan.model";
import { AppError } from "../../types/errors";
import { getRedisClient } from "@config/redis";
import { paginateQuery, paginationSchema } from "@utils/pagination";
import { toggleUserStatusSchema, logsQuerySchema } from "./admin.validation";

// ─── User Management ────────────────────────────────────────

export const getAllUsersService = async (params: any) => {
    const result = paginationSchema.safeParse(params);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { page, page_size } = result.data;
    const query = User.find().select("-password");
    const res = await paginateQuery(query, page, page_size);

    return res;
};

export const getUserByIdService = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError("User not found", 404, "NOT_FOUND", "Please provide a valid user ID");
    }

    // Fetch associated data
    const [wallet, subscription, apiKeys, usage] = await Promise.all([
        Wallet.findOne({ user: userId }),
        Subscription.findOne({ user: userId }).populate("plan").populate("wallet"),
        ApiKey.find({ user: userId }),
        Usage.find({ user: userId }).sort({ month: -1 }).limit(6)
            .populate({
                path: "modelBreakdown.model",
                select: "name",
                populate: { path: "provider", select: "name" },
            }),
    ]);

    return {
        user,
        wallet,
        subscription,
        apiKeys,
        recentUsage: usage,
    };
};

export const toggleUserStatusService = async (userId: string, body: unknown) => {
    const result = toggleUserStatusSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: result.data },
        { returnDocument: "after" }
    ).select("-password");

    if (!user) {
        throw new AppError("User not found", 404, "NOT_FOUND", "Please provide a valid user ID");
    }

    // Clear user cache
    const redis = getRedisClient();
    await redis.del(`user:${userId}`);

    return user;
};

// ─── All API Keys (cross-user) ──────────────────────────────

export const getAllApiKeysService = async (params: any) => {
    const result = paginationSchema.safeParse(params);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { page, page_size } = result.data;
    const query = ApiKey.find().populate("user", "name email");
    const res = await paginateQuery(query, page, page_size);

    return res;
};

// ─── Request Logs ───────────────────────────────────────────

export const getRequestLogsService = async (params: any) => {
    const result = logsQuerySchema.safeParse(params);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { page, page_size, status, userId, modelId } = result.data;

    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    if (modelId) filter.model = modelId;

    const query = RequestLog.find(filter)
        .populate("user", "name email")
        .populate("model", "name slug")
        .populate("provider", "name slug")
        .populate("apiKey", "name");

    const res = await paginateQuery(query, page, page_size);

    return res;
};

export const getRequestLogByIdService = async (logId: string) => {
    const log = await RequestLog.findById(logId)
        .populate("user", "name email")
        .populate("model", "name slug")
        .populate("provider", "name slug")
        .populate("apiKey", "name key");

    if (!log) {
        throw new AppError("Request log not found", 404, "NOT_FOUND", "Please provide a valid log ID");
    }

    return log;
};

// ─── Analytics Overview ─────────────────────────────────────

export const getAnalyticsOverviewService = async () => {
    const [
        totalUsers,
        totalModels,
        totalProviders,
        totalPlans,
        totalRequestLogs,
        revenueAgg,
        activeSubscriptions,
        recentLogs,
        monthlyUsageAgg,
    ] = await Promise.all([
        User.countDocuments(),
        Model.countDocuments(),
        Provider.countDocuments(),
        Plan.countDocuments(),
        RequestLog.countDocuments(),
        // Total revenue from all wallets
        Wallet.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalSpent" }, totalBalance: { $sum: "$balance" } } },
        ]),
        Subscription.countDocuments({ status: "active" }),
        // Recent 10 request logs
        RequestLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email")
            .populate("model", "name slug")
            .populate("provider", "name"),
        // Usage aggregated by month (last 6 months)
        Usage.aggregate([
            { $sort: { month: -1 } },
            {
                $group: {
                    _id: "$month",
                    totalRequests: { $sum: "$totalRequests" },
                    totalTokens: { $sum: "$totalTokens" },
                    totalCost: { $sum: "$totalCost" },
                    uniqueUsers: { $addToSet: "$user" },
                },
            },
            { $sort: { _id: -1 } },
            { $limit: 6 },
            {
                $project: {
                    month: "$_id",
                    totalRequests: 1,
                    totalTokens: 1,
                    totalCost: 1,
                    activeUsers: { $size: "$uniqueUsers" },
                    _id: 0,
                },
            },
        ]),
    ]);

    const revenue = revenueAgg[0] || { totalRevenue: 0, totalBalance: 0 };

    return {
        counts: {
            totalUsers,
            totalModels,
            totalProviders,
            totalPlans,
            totalRequestLogs,
            activeSubscriptions,
        },
        revenue: {
            totalRevenue: revenue.totalRevenue,
            totalBalance: revenue.totalBalance,
        },
        recentLogs,
        monthlyUsage: monthlyUsageAgg,
    };
};

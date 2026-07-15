import apiClient, { extractData, extractPaginated } from "./client";
import type {
    Provider,
    Model,
    Billing,
    Plan,
    PaginationInfo,
    User,
    ApiKey,
    RequestLog,
    AnalyticsOverview,
    UserDetail,
} from "@/types";

// ─── Providers ──────────────────────────────────────────────
export const getProviders = async () =>
    extractData<Provider[]>(await apiClient.get("/provider"));
export const getProvider = async (id: string) =>
    extractData<Provider>(await apiClient.get(`/provider/${id}`));
export const createProvider = async (data: { name: string; slug: string }) =>
    extractData<Provider>(await apiClient.post("/provider", data));
export const updateProvider = async (
    id: string,
    data: Partial<{ name: string; slug: string }>,
) => extractData<Provider>(await apiClient.patch(`/provider/${id}`, data));
export const deleteProvider = async (id: string) => {
    await apiClient.delete(`/provider/${id}`);
};

// ─── Billing ────────────────────────────────────────────────
export const getBillings = async () =>
    extractData<Billing[]>(await apiClient.get("/billing"));
export const getBilling = async (id: string) =>
    extractData<Billing>(await apiClient.get(`/billing/${id}`));
export const createBilling = async (data: {
    name: string;
    inputCostPer1KTokens: number;
    outputCostPer1KTokens: number;
    currency: "INR" | "USD";
}) => extractData<Billing>(await apiClient.post("/billing", data));
export const updateBilling = async (
    id: string,
    data: Partial<{
        name: string;
        inputCostPer1KTokens: number;
        outputCostPer1KTokens: number;
        currency: "INR" | "USD";
    }>,
) => extractData<Billing>(await apiClient.patch(`/billing/${id}`, data));
export const deleteBilling = async (id: string) => {
    await apiClient.delete(`/billing/${id}`);
};

// ─── Models ─────────────────────────────────────────────────
export const getModels = async (page = 1, pageSize: number | "all" = "all") =>
    extractPaginated<Model[]>(
        await apiClient.get("/model", { params: { page, page_size: pageSize } }),
    );
export const getModel = async (id: string) =>
    extractData<Model>(await apiClient.get(`/model/${id}`));
export const createModel = async (data: {
    name: string;
    slug: string;
    provider: string;
    billing: string;
}) => extractData<Model>(await apiClient.post("/model", data));
export const updateModel = async (
    id: string,
    data: Partial<{
        name: string;
        slug: string;
        provider: string;
        billing: string;
    }>,
) => extractData<Model>(await apiClient.patch(`/model/${id}`, data));
export const deleteModel = async (id: string) => {
    await apiClient.delete(`/model/${id}`);
};

// ─── Plans ──────────────────────────────────────────────────
export const getPlans = async () =>
    extractData<Plan[]>(await apiClient.get("/plan"));
export const getPlan = async (id: string) =>
    extractData<Plan>(await apiClient.get(`/plan/${id}`));
export const createPlan = async (data: any) =>
    extractData<Plan>(await apiClient.post("/plan", data));
export const updatePlan = async (id: string, data: any) =>
    extractData<Plan>(await apiClient.patch(`/plan/${id}`, data));
export const deletePlan = async (id: string) => {
    await apiClient.delete(`/plan/${id}`);
};

// ─── Admin: Users ───────────────────────────────────────────
export const getUsers = async (page = 1, pageSize: number | "all" = 20) =>
    extractPaginated<User[]>(
        await apiClient.get("/admin/users", {
            params: { page, page_size: pageSize },
        }),
    );
export const getUserDetail = async (id: string) =>
    extractData<UserDetail>(await apiClient.get(`/admin/users/${id}`));
export const toggleUserStatus = async (
    id: string,
    data: { isActive?: boolean; isDeleted?: boolean },
) =>
    extractData<User>(await apiClient.patch(`/admin/users/${id}/status`, data));

// ─── Admin: API Keys ────────────────────────────────────────
export const getAllApiKeys = async (page = 1, pageSize: number | "all" = 20) =>
    extractPaginated<ApiKey[]>(
        await apiClient.get("/admin/keys", {
            params: { page, page_size: pageSize },
        }),
    );

// ─── Admin: Request Logs ────────────────────────────────────
export const getRequestLogs = async (
    page = 1,
    pageSize = 20,
    filters?: { status?: string; userId?: string; modelId?: string },
) =>
    extractPaginated<RequestLog[]>(
        await apiClient.get("/admin/logs", {
            params: { page, page_size: pageSize, ...filters },
        }),
    );
export const getRequestLog = async (id: string) =>
    extractData<RequestLog>(await apiClient.get(`/admin/logs/${id}`));

// ─── Admin: Analytics ───────────────────────────────────────
export const getAnalytics = async () =>
    extractData<AnalyticsOverview>(await apiClient.get("/admin/analytics"));

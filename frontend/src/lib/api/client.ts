import axios from "axios";
import { API_BASE_URL } from "@/lib/utils/constants";
import type { ApiResponse } from "@/types";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Response interceptor — unwrap and handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const data = error.response.data as ApiResponse & { isLoginRequired?: boolean };
      // If server indicates login is required, redirect
      if (data?.isLoginRequired) {
        // Only redirect if we're in the browser and not already on auth pages
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Helper to extract data from API response
 */
export function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message || "Request failed");
  }
  return response.data.data as T;
}

/**
 * Helper to extract paginated data from API response
 */
export function extractPaginatedData<T>(
  response: { data: ApiResponse<T[]> }
): { data: T[]; pagination: ApiResponse<T[]>["pagination"] } {
  if (!response.data.success) {
    throw new Error(response.data.message || "Request failed");
  }
  return {
    data: response.data.data as T[],
    pagination: response.data.pagination,
  };
}

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
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if we received a response from the server
    if (error.response) {
      // const status = error.response.status;
      const data = error.response.data as { message?: string; isLoginRequired?: boolean };

      // // Optional: handle 401 and redirect to login if required
      // if (status === 401 && data?.isLoginRequired) {
      //   if (typeof window !== "undefined") {
      //     const path = window.location.pathname;
      //     if (!path.startsWith("/login") && !path.startsWith("/signup")) {
      //       window.location.href = "/login";
      //     }
      //   }
      // }

      // Reject with server-provided message or a fallback
      return Promise.reject(new Error(data?.message || "Something went wrong. Please try again later."));
    }

    // Handle network errors (no response received)
    if (error.request) {
      return Promise.reject(new Error("Network error: Please check your internet connection."));
    }

    // Other Axios errors (e.g., config/setup issues)
    return Promise.reject(new Error(error.message || "An unknown error occurred."));
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

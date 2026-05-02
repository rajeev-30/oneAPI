import axios from "axios";
import type { ApiResponse } from "@/types";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const msg = error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data as T;
}

export function extractPaginated<T>(response: { data: ApiResponse<T> }) {
  if (!response.data.success) throw new Error(response.data.message);
  return { data: response.data.data as T, pagination: response.data.pagination! };
}

export default apiClient;

import apiClient, { extractData } from "./client";
import type { MonthlyUsage } from "@/types";

export async function getMonthlyUsage(month: string): Promise<MonthlyUsage> {
  return extractData<MonthlyUsage>(await apiClient.get(`/usage/${month}`));
}

export async function getFirstYearOfUsage(): Promise<string> {
  return extractData<string>(await apiClient.get("/usage/first-year"));
}

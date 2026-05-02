import apiClient, { extractData } from "./client";
import type { Plan } from "@/types";

export async function getPlans(): Promise<Plan[]> {
  return extractData<Plan[]>(await apiClient.get("/plan"));
}

export async function getPlan(id: string): Promise<Plan> {
  return extractData<Plan>(await apiClient.get(`/plan/${id}`));
}

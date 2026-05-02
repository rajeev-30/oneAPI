import apiClient, { extractData } from "./client";
import type { Subscription } from "@/types";

export async function getSubscription(): Promise<Subscription> {
  return extractData<Subscription>(await apiClient.get("/subscription"));
}

export async function createSubscription(
  planId: string
): Promise<Subscription> {
  return extractData<Subscription>(
    await apiClient.post(`/subscription/${planId}`)
  );
}

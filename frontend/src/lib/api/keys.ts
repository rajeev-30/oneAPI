import apiClient, { extractData } from "./client";
import type { ApiKey } from "@/types";

export async function generateApiKey(name: string): Promise<ApiKey> {
  return extractData<ApiKey>(await apiClient.post("/key", { name }));
}

export async function getApiKeys(): Promise<ApiKey[]> {
  return extractData<ApiKey[]>(await apiClient.get("/key"));
}

export async function getApiKey(id: string): Promise<ApiKey> {
  return extractData<ApiKey>(await apiClient.get(`/key/${id}`));
}

export async function updateApiKeyName(
  id: string,
  name: string
): Promise<ApiKey> {
  return extractData<ApiKey>(await apiClient.patch(`/key/${id}`, { name }));
}

export async function deleteApiKey(id: string): Promise<void> {
  await apiClient.delete(`/key/${id}`);
}

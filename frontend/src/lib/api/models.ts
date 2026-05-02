import apiClient, { extractData, extractPaginatedData } from "./client";
import type { Model, PaginationInfo } from "@/types";

export async function getModels(
  page = 1,
  pageSize: number | "all" = "all"
): Promise<{ data: Model[]; pagination?: PaginationInfo }> {
  return extractPaginatedData<Model>(
    await apiClient.get("/model", {
      params: { page, page_size: pageSize },
    })
  );
}

export async function getModel(id: string): Promise<Model> {
  return extractData<Model>(await apiClient.get(`/model/${id}`));
}

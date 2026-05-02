import apiClient, { extractData, extractPaginatedData } from "./client";
import type {
  Conversation,
  ConversationTitle,
  CreateConversationPayload,
  UpdateConversationPayload,
  PaginationInfo,
} from "@/types";

export async function createConversation(
  payload: CreateConversationPayload
): Promise<Conversation> {
  return extractData<Conversation>(
    await apiClient.post("/conversation", payload)
  );
}

export async function getConversation(id: string): Promise<Conversation> {
  return extractData<Conversation>(await apiClient.get(`/conversation/${id}`));
}

export async function getConversationTitles(
  page = 1,
  pageSize: number | "all" = "all"
): Promise<{ data: ConversationTitle[]; pagination?: PaginationInfo }> {
  return extractPaginatedData<ConversationTitle>(
    await apiClient.get("/conversation/titles", {
      params: { page, page_size: pageSize },
    })
  );
}

export async function updateConversation(
  id: string,
  payload: UpdateConversationPayload
): Promise<Conversation> {
  return extractData<Conversation>(
    await apiClient.patch(`/conversation/${id}`, payload)
  );
}

export async function deleteConversation(id: string): Promise<void> {
  await apiClient.delete(`/conversation/${id}`);
}

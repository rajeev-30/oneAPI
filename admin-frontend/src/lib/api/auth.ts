import apiClient, { extractData, extractPaginated } from "./client";
import type { User } from "@/types";

export async function login(data: {
  email: string;
  password: string;
}): Promise<User> {
  const res = await apiClient.post("/user/login", data);
  return extractData<User>(res);
}

export async function getUser(): Promise<User> {
  return extractData<User>(await apiClient.get("/user"));
}

export async function logout() {
  await apiClient.post("/user/logout");
}

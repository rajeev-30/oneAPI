import apiClient, { extractData } from "./client";
import type { User, LoginPayload, SignupPayload } from "@/types";

export async function login(payload: LoginPayload): Promise<User> {
  return extractData<User>(await apiClient.post("/user/login", payload));
}

export async function signup(payload: SignupPayload): Promise<User> {
  return extractData<User>(await apiClient.post("/user/signup", payload));
}

export async function logout(): Promise<void> {
  await apiClient.post("/user/logout");
}

export async function getUser(): Promise<User> {
  return extractData<User>(await apiClient.get("/user"));
}

export async function updateUser(
  data: Partial<Pick<User, "name" | "email">>,
): Promise<User> {
  return extractData<User>(await apiClient.patch("/user", data));
}

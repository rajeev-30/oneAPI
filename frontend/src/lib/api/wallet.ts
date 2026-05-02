import apiClient, { extractData } from "./client";
import type { Wallet } from "@/types";

export async function getWallet(): Promise<Wallet> {
  return extractData<Wallet>(await apiClient.get("/wallet"));
}

export async function addBalance(amount: number): Promise<Wallet> {
  return extractData<Wallet>(
    await apiClient.post("/wallet/add", { balance: amount })
  );
}

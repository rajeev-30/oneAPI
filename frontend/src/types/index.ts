// ─── API Envelope ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  pagination?: PaginationInfo;
  data?: T | null;
  error?: ApiError;
}

export interface ApiError {
  code?: string;
  details?: unknown;
  name?: string;
  message?: string;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_items: number;
  last_page: number;
}

// ─── User ─────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

// ─── Provider ─────────────────────────────────────────
export interface Provider {
  _id: string;
  name: string;
  slug: string;
}

// ─── Billing ──────────────────────────────────────────
export interface Billing {
  _id: string;
  name: string;
  inputCostPer1KTokens: number;
  outputCostPer1KTokens: number;
  currency: "INR" | "USD";
}

// ─── Model ────────────────────────────────────────────
export interface Model {
  _id: string;
  name: string;
  slug: string;
  provider: Provider;
  billing: Billing;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Conversation ─────────────────────────────────────
export interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  _id: string;
  user: string;
  title: string;
  messages: Message[];
}

export interface ConversationTitle {
  _id: string;
  title: string;
}

export interface CreateConversationPayload {
  title: string;
  messages: Message[];
}

export interface UpdateConversationPayload {
  messages?: Message[];
  title?: string;
}

// ─── API Key ──────────────────────────────────────────
export interface ApiKey {
  _id: string;
  name: string;
  key: string;
  user: string;
  totalSpent: number;
  totalRequests: number;
  totalTokensUsed: number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  lastUsedAt: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Wallet ───────────────────────────────────────────
export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  totalSpent: number;
}

// ─── Plan ─────────────────────────────────────────────
export interface Plan {
  _id: string;
  name: string;
  price: number;
  limits: {
    requestsPerDay: number;
    tokensPerDay: number;
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  features: string[];
}

// ─── Subscription ─────────────────────────────────────
export interface Subscription {
  _id: string;
  user: string;
  plan: Plan | null;
  wallet: Wallet | null;
  status: "active" | "expired";
  startDate: string | null;
  endDate: string | null;
}

// ─── Usage ────────────────────────────────────────────
export interface UsageModelBreakdown {
  model: {
    _id: string;
    name: string;
    provider: { name: string };
  };
  tokens: number;
  requests: number;
  cost: number;
}

export interface MonthlyUsage {
  _id: string;
  user: string;
  month: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  modelBreakdown: UsageModelBreakdown[];
}

// ─── Chat Completion ──────────────────────────────────
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  totalCost?: number;
}

export interface StreamChunkData {
  choices: [{ message: { role: "assistant"; content: string | null } }];
  usage?: ChatCompletionUsage;
  model?: string;
  done?: boolean;
}

export interface StreamChunk {
  success: boolean;
  message: string;
  data: StreamChunkData;
}

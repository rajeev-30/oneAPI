// ─── Common ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  pagination?: PaginationInfo;
  error?: unknown;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_items: number;
  last_page: number;
}

// ─── Provider ───────────────────────────────────────────────

export interface Provider {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Billing (Model Pricing) ────────────────────────────────

export interface Billing {
  _id: string;
  name: string;
  inputCostPer1KTokens: number;
  outputCostPer1KTokens: number;
  currency: "INR" | "USD";
  createdAt: string;
  updatedAt: string;
}

// ─── Model ──────────────────────────────────────────────────

export interface Model {
  _id: string;
  name: string;
  slug: string;
  provider: Provider | string;
  billing: Billing | string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Plan ───────────────────────────────────────────────────

export interface PlanLimits {
  requestsPerDay: number;
  tokensPerDay: number;
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  limits: PlanLimits;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── User ───────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Key ────────────────────────────────────────────────

export interface ApiKey {
  _id: string;
  name: string;
  user: User | string;
  key: string;
  totalSpent: number;
  totalRequests: number;
  totalTokensUsed: number;
  rateLimit: { requestsPerMinute: number; tokensPerMinute: number };
  lastUsedAt: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Wallet ─────────────────────────────────────────────────

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription ───────────────────────────────────────────

export interface Subscription {
  _id: string;
  user: string;
  plan: Plan | null;
  wallet: Wallet | null;
  status: "active" | "expired";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Usage ──────────────────────────────────────────────────

export interface Usage {
  _id: string;
  user: string;
  month: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  modelBreakdown: Array<{
    model: { _id: string; name: string; provider?: { name: string } } | string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

// ─── Request Log ────────────────────────────────────────────

export interface RequestLog {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  apiKey: { _id: string; name: string } | string;
  model: { _id: string; name: string; slug: string } | string;
  provider: { _id: string; name: string; slug: string } | string;
  requestId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  status: "success" | "error";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ──────────────────────────────────────────────

export interface AnalyticsOverview {
  counts: {
    totalUsers: number;
    totalModels: number;
    totalProviders: number;
    totalPlans: number;
    totalRequestLogs: number;
    activeSubscriptions: number;
  };
  revenue: {
    totalRevenue: number;
    totalBalance: number;
  };
  recentLogs: RequestLog[];
  monthlyUsage: Array<{
    month: string;
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    activeUsers: number;
  }>;
}

// ─── User Detail ────────────────────────────────────────────

export interface UserDetail {
  user: User;
  wallet: Wallet | null;
  subscription: Subscription | null;
  apiKeys: ApiKey[];
  recentUsage: Usage[];
}

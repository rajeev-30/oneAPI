export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://oneapi-backend.onrender.com/api/v1" || "http://localhost:8000/api/v1";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "oneAPI";

export const DEFAULT_MODEL = "gemini-1.5-flash";

export const DEFAULT_TEMPERATURE = 0.7;

export const MAX_MESSAGE_LENGTH = 10000;

export const RECORDS_PER_PAGE = 20;

export const MINIMUM_TOPUP_AMOUNT = 5;

import { Response } from "express";
import { ApiResponse } from "../types/types";
import { AppError } from "../types/errors"; 

export const sendErrorResponse = (
  res: Response,
  error: unknown,
  fallbackStatus = 500,
  fallbackMessage = "Something went wrong"
) => {
  if (error instanceof AppError) {
    const payload: ApiResponse = {
      success: false,
      message: error.message,
      error: { code: error.code, details: error.details },
    };
    return res.status(error.statusCode).json(payload);
  }

  const payload: ApiResponse = {
    success: false,
    message: fallbackMessage,
    error,
  };
  return res.status(fallbackStatus).json(payload);
};
import { Router } from "express";
import { chatCompletion } from "./gateway.controller";
import { authMiddleware, getUserIdByApiKeyMiddleware } from "@middlewares/auth.middleware";
import { apiKeyMiddleware } from "@middlewares/apiKey.middleware";
import { subscriptionMiddleware } from "@middlewares/subscription.middleware";
import { rateLimitMiddleware } from "@middlewares/rateLimit.middleware";


const router = Router();

router.route("/completions").post(apiKeyMiddleware, getUserIdByApiKeyMiddleware, subscriptionMiddleware, rateLimitMiddleware, chatCompletion);

export default router;
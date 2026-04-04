import { Router } from "express";
import { chatCompletion } from "./gateway.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { apiKeyMiddleware } from "@middlewares/apiKey.middleware";
import { subscriptionMiddleware } from "@middlewares/subscription.middleware";
import { rateLimitMiddleware } from "@middlewares/rateLimit.middleware";


const router = Router();

router.route("/completions").post(authMiddleware, apiKeyMiddleware, subscriptionMiddleware, rateLimitMiddleware, chatCompletion);

export default router;
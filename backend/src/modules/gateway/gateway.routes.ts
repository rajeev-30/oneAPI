import { Router } from "express";
import { chatCompletion } from "./gateway.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { apiKeyMiddleware } from "@middlewares/apiKey.middleware";
import { subscriptionMiddleware } from "@middlewares/subscription.middleware";


const router = Router();

router.route("/completions").post(authMiddleware, subscriptionMiddleware, apiKeyMiddleware, chatCompletion);

export default router;
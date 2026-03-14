import { Router } from "express";
import { chatCompletion } from "./gateway.controller";
import { authMiddleware } from "@middlewares/auth.middleware";
import { apiKeyMiddleware } from "@middlewares/apiKey.middleware";
import { subscriptionMiddleware } from "@middlewares/subscription.middleware";


const router = Router();
// subscriptionMiddleware will be added once we have the subscription logic in place

router.route("/completions").post(authMiddleware, apiKeyMiddleware, chatCompletion);

export default router;
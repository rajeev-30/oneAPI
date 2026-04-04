import { Router } from "express";
import { createSubscription, getSubscription } from "./subscription.controller";
import { authMiddleware } from "@middlewares/auth.middleware";

const router = Router();

router.route("/").get(authMiddleware, getSubscription);
router.route("/:plan").post(authMiddleware, createSubscription);

export default router;
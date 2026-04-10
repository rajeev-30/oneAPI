import { Router } from "express";
import { createSubscription, getSubscription } from "./subscription.controller";
import { authMiddleware } from "@middlewares/auth.middleware";

const router = Router();

router.route("/:plan").post(authMiddleware, createSubscription);
router.route("/").get(authMiddleware, getSubscription);

export default router;
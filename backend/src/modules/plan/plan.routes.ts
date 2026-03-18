import { Router } from "express";
import { createPlan, deletePlan, getPlans } from "./plan.controller";
import { adminMiddleware, authMiddleware } from "@middlewares/auth.middleware";

const router = Router();

router.route("/").post(authMiddleware, adminMiddleware, createPlan);
router.route("/").get(authMiddleware, adminMiddleware, getPlans);
router.route("/:id").delete(authMiddleware, adminMiddleware, deletePlan);

export default router;
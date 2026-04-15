import { Router } from "express";
import { createPlan, deletePlan, getPlan, getPlans, updatePlan } from "./plan.controller";
import { adminMiddleware, authMiddleware } from "@middlewares/auth.middleware";

const router = Router();

router.route("/").get(getPlans);
router.route("/:id").get(getPlan);
router.route("/").post(authMiddleware, adminMiddleware, createPlan);
router.route("/:id").patch(authMiddleware, adminMiddleware, updatePlan);
router.route("/:id").delete(authMiddleware, adminMiddleware, deletePlan);

export default router;
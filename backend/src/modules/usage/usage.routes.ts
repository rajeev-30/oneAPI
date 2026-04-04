import { Router } from "express";

const router = Router();

import { getMonthlyUsage, firstYearOfUsage } from "./usage.controller";
import { authMiddleware } from "@middlewares/auth.middleware";

router.get("/first-year", authMiddleware, firstYearOfUsage);
router.get("/:month", authMiddleware, getMonthlyUsage);

export default router;
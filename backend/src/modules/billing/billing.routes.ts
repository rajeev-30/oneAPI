import { Router } from "express";
import { adminMiddleware, authMiddleware } from "../../middlewares/auth.middleware";
import {
    createBilling,
    getBillings,
    deleteBilling,
} from "./billing.controller";

const router = Router();

router.route("/").get(authMiddleware, adminMiddleware, getBillings);
router.route("/").post(authMiddleware, adminMiddleware, createBilling);
router.route("/:id").delete(authMiddleware, adminMiddleware, deleteBilling);

export default router;

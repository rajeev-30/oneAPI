import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createBilling,
    getBillings,
    deleteBilling,
} from "./billing.controller";

const router = Router();

router.route("/").get(authMiddleware, getBillings);
router.route("/").post(authMiddleware, createBilling);
router.route("/:id").delete(authMiddleware, deleteBilling);

export default router;

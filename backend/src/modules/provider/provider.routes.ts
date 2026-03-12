import { Router } from "express";
import { createProvider, deleteProvider, getProviders } from "./provider.controller";
import { adminMiddleware, authMiddleware } from "@middlewares/auth.middleware";


const router = Router();

router.route("/").post(authMiddleware, adminMiddleware, createProvider);
router.route("/").get(authMiddleware, adminMiddleware, getProviders);
router.route("/:id").delete(authMiddleware, adminMiddleware, deleteProvider);

export default router;
import { Router } from "express";
import { createProvider, deleteProvider, getProvider, getProviders, updateProvider } from "./provider.controller";
import { adminMiddleware, authMiddleware } from "@middlewares/auth.middleware";


const router = Router();

router.route("/").get(getProviders);
router.route("/:id").get(getProvider);
router.route("/").post(authMiddleware, adminMiddleware, createProvider);
router.route("/:id").patch(authMiddleware, adminMiddleware, updateProvider);
router.route("/:id").delete(authMiddleware, adminMiddleware, deleteProvider);

export default router;
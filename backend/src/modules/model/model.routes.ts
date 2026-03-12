import { adminMiddleware, authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";
import { createModel, deleteModel, getModels } from "./model.controller";


const router = Router();

router.route("/").post(authMiddleware, adminMiddleware, createModel);
router.route("/").get(authMiddleware, adminMiddleware, getModels);
router.route("/:id").delete(authMiddleware, adminMiddleware, deleteModel);

export default router;
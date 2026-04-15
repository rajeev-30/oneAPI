import { adminMiddleware, authMiddleware } from "@middlewares/auth.middleware";
import { Router } from "express";
import { createModel, deleteModel, getModel, getModels, updateModel } from "./model.controller";


const router = Router();

router.route("/").get(getModels);
router.route("/:id").get(getModel);
router.route("/").post(authMiddleware, adminMiddleware, createModel);
router.route("/:id").patch(authMiddleware, adminMiddleware, updateModel);
router.route("/:id").delete(authMiddleware, adminMiddleware, deleteModel);

export default router;
import Router from "express";
import {authMiddleware} from "../../middlewares/auth.middleware"
import {generateApiKey, getApiKeys, deleteApiKey} from "./apiKey.controller"

const router  = Router();

router.route("/").get(authMiddleware, getApiKeys);
router.route("/:id").delete(authMiddleware, deleteApiKey);
router.route("/").post(authMiddleware, generateApiKey);

export default router;
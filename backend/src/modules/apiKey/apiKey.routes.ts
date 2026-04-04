import Router from "express";
import {authMiddleware} from "../../middlewares/auth.middleware"
import {generateApiKey, getApiKeys, deleteApiKey, getApiKey, updateApiKeyName} from "./apiKey.controller"

const router  = Router();

router.route("/").get(authMiddleware, getApiKeys);
router.route("/:id").get(authMiddleware, getApiKey);
router.route("/").post(authMiddleware, generateApiKey);
router.route("/:id").patch(authMiddleware, updateApiKeyName);
router.route("/:id").delete(authMiddleware, deleteApiKey);

export default router;
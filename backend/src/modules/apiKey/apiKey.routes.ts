import Router from "express";
import {authMiddleware} from "../../middlewares/auth.middleware"
import {generateApiKey, getApiKeys} from "./apiKey.controller"

const router  = Router();

router.route("/").get(authMiddleware, getApiKeys);
router.route("/generate").post(authMiddleware, generateApiKey);

export default router;
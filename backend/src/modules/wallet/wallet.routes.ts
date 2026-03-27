import {Router} from "express";
import { addBalance, getWallet } from "./wallet.controller";
import { authMiddleware } from "@middlewares/auth.middleware";

const router = Router();

router.route("/add").post(authMiddleware, addBalance);
router.route("/").get(authMiddleware, getWallet);

export default router;
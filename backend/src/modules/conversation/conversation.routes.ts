import { Router } from "express";
import { createConversation, deleteConversation, getConversation, getConversationsTitles, updateConversation } from "./conversation.controller";
import { authMiddleware } from "@middlewares/auth.middleware";

const router = Router();

router.route("/").post(authMiddleware, createConversation);
router.route("/titles").get(authMiddleware, getConversationsTitles);
router.route("/:id").get(authMiddleware, getConversation);
router.route("/:id").patch(authMiddleware, updateConversation);
router.route("/:id").delete(authMiddleware, deleteConversation);

export default router;
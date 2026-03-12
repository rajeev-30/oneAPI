import {Router} from 'express';
import { Login, SignUp, Logout, getUser } from './user.controller';
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.route("/").get(authMiddleware, getUser);
router.route("/login").post(Login);
router.route("/signup").post(SignUp);
router.route("/logout").post(authMiddleware, Logout);

export default router;
import {Router} from 'express';
import { Login, SignUp, Logout } from './user.controller';
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.route("/login").post(Login);
router.route("/signup").post(SignUp);
router.route("/logout").post(authMiddleware, Logout);

export default router;
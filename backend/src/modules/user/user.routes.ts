import {Router} from 'express';
import { Login, SignUp } from './user.controller';

const router = Router();

router.route("/login").post(Login);
router.route("/signup").post(SignUp);

export default router;
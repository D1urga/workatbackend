import { Router } from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify").post(verifyOtp);
router.route("/login").post(loginUser);

export default router;

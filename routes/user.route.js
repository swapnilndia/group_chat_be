import { Router } from "express";
import {
  accessTokenValidation,
  refreshTokenValidation,
  signinFormValidation,
  signupFormValidation,
} from "../middlewares/validation.middleware.js";
import {
  refreshMiddleware,
  signinMiddleware,
  signupMiddleware,
} from "../middlewares/user.middleware.js";
import {
  getUserInfo_controller,
  refresh_controller,
  signin_controller,
  signout_controller,
  signup_controller,
} from "../controllers/user.controller.js";
const router = Router();

router.post(
  "/signup",
  signupFormValidation,
  signupMiddleware,
  signup_controller
);
router.post(
  "/signin",
  signinFormValidation,
  signinMiddleware,
  signin_controller
);
router.get("/userinfo", accessTokenValidation, getUserInfo_controller);

router.post("/signout", accessTokenValidation, signout_controller);

router.get(
  "/refresh",
  refreshTokenValidation,
  refreshMiddleware,
  refresh_controller
);

export default router;

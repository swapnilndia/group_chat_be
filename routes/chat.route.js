import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
import {
  chatList_controller,
  newChat_controller,
} from "../controllers/chat.controller.js";

const router = Router();

router.post("/new-message", accessTokenValidation, newChat_controller);
router.get("/get-chatlist", accessTokenValidation, chatList_controller);

export default router;

import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
import {
  messageList_controller,
  newMessage_controller,
} from "../controllers/message.controller.js";

const router = Router();

router.post("/new-message", accessTokenValidation, newMessage_controller);
router.get("/get-messagelist", accessTokenValidation, messageList_controller);

export default router;

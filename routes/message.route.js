import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
import {
  getGroupTextMessage_controller,
  getPersonalTextMessages_controller,
  groupTextMessage_controller,
  personalTextMessage_controller,
} from "../controllers/message.controller.js";

const router = Router();

//Send Message
router.post("/personal", accessTokenValidation, personalTextMessage_controller);
router.post("/group", accessTokenValidation, groupTextMessage_controller);

// Get Message History
router.get(
  "/personal/history/:contactId",
  accessTokenValidation,
  getPersonalTextMessages_controller
);
router.get(
  "/group/history/:groupId",
  accessTokenValidation,
  getGroupTextMessage_controller
);

// Send Image
router.post("/personal/image", accessTokenValidation);
router.post("/group/image", accessTokenValidation);

// Send Video
router.post("/personal/video", accessTokenValidation);
router.post("/group/video", accessTokenValidation);

// Send Video
router.post("/personal/document", accessTokenValidation);
router.post("/group/document", accessTokenValidation);

// Download media
router.post("/media/:mediaId", accessTokenValidation);

export default router;

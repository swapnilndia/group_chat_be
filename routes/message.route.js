import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
import {
  deleteSignedUrl_controller,
  getGroupTextMessage_controller,
  getPersonalTextMessages_controller,
  getSignedUrl_controller,
  putSignedUrl_controller,
  saveMediaMetadata_controller,
} from "../controllers/message.controller.js";

const router = Router();

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

router.post("/upload-url", putSignedUrl_controller);
router.post("/save-media", saveMediaMetadata_controller);
router.post("/delete-media", deleteSignedUrl_controller);
router.post("/download-url", getSignedUrl_controller);
export default router;

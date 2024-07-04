import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
import {
  addUserToContacts_controller,
  getListOfContacts_controller,
  removeUserFromContacts_controller,
} from "../controllers/contact.controller.js";

const router = Router();

router.post(
  "/add-contact",
  accessTokenValidation,
  addUserToContacts_controller
);
router.get(
  "/contact-list",
  accessTokenValidation,
  getListOfContacts_controller
);
router.delete(
  "/remove-contact",
  accessTokenValidation,
  removeUserFromContacts_controller
);
export default router;

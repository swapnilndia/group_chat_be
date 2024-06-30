import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
import {
  addUsersToGroup_controller,
  changeGroupName_controller,
  createGroup_controller,
  deleteGroup_controller,
  getGroupList_controller,
  getUserForGroup_controller,
  makeGroupAdmin_controller,
  removeGroupAdmin_controller,
  removeUsersFromGroup_controller,
} from "../controllers/group.controller.js";
const router = Router();

router.post("/create", accessTokenValidation, createGroup_controller);

router.get("/grouplist", accessTokenValidation, getGroupList_controller);

router.put(
  "/change-name/:group_id",
  accessTokenValidation,
  changeGroupName_controller
);

router.delete(
  "/delete/:group_id",
  accessTokenValidation,
  deleteGroup_controller
);

router.put(
  "/add-user/:group_id",
  accessTokenValidation,
  addUsersToGroup_controller
);

router.put(
  "/remove-user/:group_id",
  accessTokenValidation,
  removeUsersFromGroup_controller
);

router.put(
  "/make-admin/:group_id",
  accessTokenValidation,
  makeGroupAdmin_controller
);
router.put(
  "/remove-admin/:group_id",
  accessTokenValidation,
  removeGroupAdmin_controller
);

router.get(
  "/users/:group_id",
  accessTokenValidation,
  getUserForGroup_controller
);

export default router;

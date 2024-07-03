import { Router } from "express";
import {
  accessTokenValidation,
  authorizeAdminAccess,
  checkGroupAuthorizationLevel,
} from "../middlewares/validation.middleware.js";
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
  searchUserForGroup_controller,
} from "../controllers/group.controller.js";
const router = Router();

router.post("/create", accessTokenValidation, createGroup_controller);

router.get("/grouplist", accessTokenValidation, getGroupList_controller);

router.put(
  "/change-name/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  changeGroupName_controller
);

router.delete(
  "/delete/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  deleteGroup_controller
);

router.put(
  "/add-user/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  addUsersToGroup_controller
);

router.post(
  "/search/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  searchUserForGroup_controller
);

router.put(
  "/remove-user/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  removeUsersFromGroup_controller
);

router.put(
  "/make-admin/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  makeGroupAdmin_controller
);
router.put(
  "/remove-admin/:group_id",
  accessTokenValidation,
  authorizeAdminAccess,
  removeGroupAdmin_controller
);

router.get(
  "/info/:group_id",
  accessTokenValidation,
  checkGroupAuthorizationLevel,
  getUserForGroup_controller
);

export default router;

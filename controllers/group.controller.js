import { Op, Sequelize } from "sequelize";
import sequelize from "../configs/db.config.js"; // Assuming this exports your Sequelize instance
import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const createGroup = async (groupName, userId, transaction) => {
  const group = await Group.create(
    {
      group_name: groupName,
      created_by: userId,
    },
    { transaction }
  );
  return group;
};

const addGroupMember = async (userId, groupId, isAdmin, transaction) => {
  const groupMember = await GroupMember.create(
    {
      user_id: userId,
      group_id: groupId,
      is_admin: isAdmin,
    },
    { transaction }
  );
  return groupMember;
};
const listOfGroup = async (userId) => {
  const groupList = await GroupMember.findAll({
    where: {
      user_id: userId,
    },
    include: {
      model: Group,
      attributes: ["group_name"],
      where: {
        group_name: {
          [Op.ne]: null,
        },
      },
    },
    raw: true,
    nest: false,
  });
  return groupList;
};

export const createGroup_controller = async (req, res) => {
  const { groupName } = req.body;
  const { user_id } = req.user;

  const transaction = await sequelize.transaction();

  try {
    // Create the group
    const newGroup = await createGroup(groupName, user_id, transaction);

    // Add the user as an admin member of the group
    const newGroupMember = await addGroupMember(
      user_id,
      newGroup.group_id,
      true,
      transaction
    );

    // Commit the transaction
    if (newGroup && newGroupMember) {
      await transaction.commit();

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "New group created successfully",
            newGroup
          ).toJSON()
        );
    }
    return res.status(400).json(
      new ApiError(500, "Unable to create Group", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();

    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const getGroupList_controller = async (req, res) => {
  const { user_id } = req.user;
  try {
    const groupList = await listOfGroup(user_id);
    if (groupList) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Group fetched successfully", groupList).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to fetch Groups").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const changeGroupName_controller = async (req, res) => {
  const { newGroupName } = req.body;
  const { group_id } = req.params;
  try {
    const updatedGroup = await Group.update(
      { group_name: newGroupName },
      {
        where: {
          group_id: group_id,
        },
      }
    );
    if (updatedGroup[0] > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Group renamed successfully").toJSON());
    }
    return res
      .status(404)
      .json(new ApiError(404, "Group to be rename is not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};

export const deleteGroup_controller = async (req, res) => {
  const { group_id } = req.params;
  console.log(group_id);
  try {
    const deletedGroup = await Group.destroy({
      where: {
        group_id: group_id,
      },
      cascade: true,
    });
    console.log(deletedGroup);
    if (deletedGroup > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Group deleted successfully").toJSON());
    }
    return res
      .status(404)
      .json(new ApiError(404, "Group to be deleted was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const addUsersToGroup_controller = async (req, res) => {
  const { group_id } = req.params;
  const { user_id } = req.body;

  try {
    const addUserToGroup = await GroupMember.create({
      group_id,
      user_id,
    });

    if (addUserToGroup) {
      return res
        .status(201)
        .json(
          new ApiResponse(201, "User added to group successfully").toJSON()
        );
    }
    return res
      .status(404)
      .json(new ApiError(404, "Group  was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const searchUserForGroup_controller = async (req, res) => {
  const { email, phone } = req.body;
  console.log(req.user);
  const { user_id } = req.user;

  let whereClause;
  if (email && !phone) {
    whereClause = {
      email,
    };
  } else if (phone && !email) {
    whereClause = {
      phone,
    };
  } else {
    whereClause = {
      email,
      phone,
    };
  }
  console.log(whereClause);
  try {
    const searchedUser = await User.findOne({
      where: whereClause,
    });
    console.log(searchedUser);
    if (!searchedUser) {
      return res.status(404).json(new ApiError(404, "User not found").toJSON());
    }
    if (searchedUser.dataValues.user_id === user_id) {
      return res
        .status(401)
        .json(new ApiError(404, "Don't be oversmart").toJSON());
    }
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Searched user found successfully",
          searchedUser
        ).toJSON()
      );
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const removeUsersFromGroup_controller = async (req, res) => {
  const { group_id } = req.params;
  const { user_id } = req.body;
  try {
    const removeUser = await GroupMember.destroy({
      where: {
        group_id,
        user_id,
      },
    });
    console.log(removeUser);

    if (removeUser > 0) {
      return res
        .status(201)
        .json(
          new ApiResponse(201, "User removed from group successfully").toJSON()
        );
    }
    return res
      .status(404)
      .json(new ApiError(404, "Group  was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const makeGroupAdmin_controller = async (req, res) => {
  const { group_id } = req.params;
  const { user_id } = req.body;
  console.log(group_id, user_id);
  try {
    const updatedGroupMember = await GroupMember.update(
      { is_admin: true },
      {
        where: {
          group_id: +group_id,
          user_id,
        },
      }
    );

    if (updatedGroupMember[0] > 0) {
      return res
        .status(201)
        .json(new ApiResponse(201, "User is now an admin").toJSON());
    }

    return res
      .status(404)
      .json(new ApiError(404, "Group or user was not found").toJSON());
  } catch (error) {
    console.error("Error in makeGroupAdmin_controller:", error);
    return res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};
export const removeGroupAdmin_controller = async (req, res) => {
  const { group_id } = req.params;
  const { user_id } = req.body;

  try {
    const updatedGroupMember = await GroupMember.update(
      { is_admin: false },
      {
        where: {
          group_id: +group_id,
          user_id,
        },
      }
    );

    if (updatedGroupMember[0] > 0) {
      return res
        .status(201)
        .json(new ApiResponse(201, "User is no longer an admin").toJSON());
    }

    return res
      .status(404)
      .json(new ApiError(404, "Group or user was not found").toJSON());
  } catch (error) {
    console.error("Error in removeGroupAdmin_controller:", error);
    return res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};
export const getUserForGroup_controller = async (req, res) => {
  const { group_id } = req.params;
  const isUserGroupAdmin = req.isUserGroupAdmin;
  console.log("351 ", isUserGroupAdmin);
  try {
    const groupDetail = await Group.findByPk(group_id, {
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email", "phone"],
        },
      ],
      // raw: true,

      nest: false,
    });
    console.log(groupDetail);
    if (groupDetail) {
      const updatedGroupDetail = {
        ...groupDetail.dataValues,
        isUserGroupAdmin,
      };
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Group member fetched successfully",
            updatedGroupDetail
          ).toJSON()
        );
    }
    return res
      .status(404)
      .json(new ApiError(404, "Group  was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

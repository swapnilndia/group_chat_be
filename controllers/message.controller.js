import { Op, Sequelize } from "sequelize";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const personalTextMessage_controller = async (req, res) => {
  const { user_id } = req.user;
  const { receiver_id, content } = req.body;
  const PERSONAL_TEXT_DEFAULT = {
    sender_id: user_id,
    receiver_id,
    group_id: null,
    message_type: "TEXT",
    content,
    media_id: null,
  };
  console.log(PERSONAL_TEXT_DEFAULT);
  try {
    const newPersonalMessage = await Message.create(PERSONAL_TEXT_DEFAULT);
    if (newPersonalMessage) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "New message successfully sent",
            newPersonalMessage
          ).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to send message").toJSON());
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

export const groupTextMessage_controller = async (req, res) => {
  const { user_id } = req.user;
  const { group_id, content } = req.body;
  const GROUP_TEXT_DEFAULT = {
    sender_id: user_id,
    receiver_id: null,
    group_id,
    message_type: "TEXT",
    content,
    media_id: null,
  };
  try {
    const newGroupMessage = await Message.create(GROUP_TEXT_DEFAULT);
    if (newGroupMessage) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "New group message successfully sent",
            newGroupMessage
          ).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to send message").toJSON());
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
export const getPersonalTextMessages_controller = async (req, res) => {
  const { user_id } = req.user;
  const { contactId: receiver_id } = req.params;
  try {
    const newPersonalMessage = await Message.findAll({
      where: {
        [Op.or]: [
          {
            sender_id: user_id,
            receiver_id: receiver_id,
          },
          {
            sender_id: receiver_id,
            receiver_id: user_id,
          },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    if (newPersonalMessage) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Messages successfully fetched",
            newPersonalMessage
          ).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to send message").toJSON());
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

export const getGroupTextMessage_controller = async (req, res) => {
  const { groupId } = req.params;
  try {
    const getGroupMessages = await Message.findAll({
      where: {
        group_id: groupId,
      },
    });
    if (getGroupMessages) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Group message successfully received",
            getGroupMessages
          ).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to send message").toJSON());
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

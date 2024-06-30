import { Sequelize } from "sequelize";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const newMessage_controller = async (req, res) => {
  console.log("request received", req.body);
  const { user_id } = req.user;
  const { message } = req.body;

  console.log(user_id, message);
  try {
    const createNewMessage = await Message.create({ message, userId: user_id });
    if (!createNewMessage) {
      return res
        .status(400)
        .json(
          new ApiError(400, `Unable to send message at the moment`).toJSON()
        );
    }
    return res
      .status(201)
      .json(new ApiResponse(201, "New message successfully").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.log(error);
  }
};
export const messageList_controller = async (req, res) => {
  try {
    const messageList = await Message.findAll({
      attributes: [
        "user_id",
        "message",
        "createdAt",
        "updatedAt",
        "userId",
        [Sequelize.col("User.name"), "userName"], // Alias the User.name field as userName
      ],
      include: [
        {
          model: User,
          attributes: [], // Do not include other User attributes
        },
      ],
    });
    if (!messageList) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `Unable to fetch messagelist at the moment`
          ).toJSON()
        );
    }
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          "Messagelist fetched successfully",
          messageList
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
    console.log(error);
  }
};

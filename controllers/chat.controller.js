import { Sequelize } from "sequelize";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const newChat_controller = async (req, res) => {
  console.log("request received", req.body);
  const { id } = req.user;
  const { message } = req.body;

  console.log(id, message);
  try {
    const createNewMessage = await Chat.create({ message, userId: id });
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
export const chatList_controller = async (req, res) => {
  try {
    const chatList = await Chat.findAll({
      attributes: [
        "id",
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
    if (!chatList) {
      return res
        .status(400)
        .json(
          new ApiError(400, `Unable to fetch chatlist at the moment`).toJSON()
        );
    }
    return res
      .status(201)
      .json(
        new ApiResponse(200, "Chatlist fetched successfully", chatList).toJSON()
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

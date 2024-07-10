import { Op } from "sequelize";
import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getObjectURL, putObject } from "../utils/aws.js";
import Media from "../models/media.model.js";
import sequelize from "../configs/db.config.js";

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
      include: [
        {
          model: Media,
          attributes: [
            "media_id",
            "file_name",
            "file_type",
            "file_key",
            "file_size",
            "uploaded_by",
          ],
          required: false, // This makes the join a LEFT JOIN
        },
      ],
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
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: Media,
          attributes: [
            "media_id",
            "file_name",
            "file_key",
            "file_type",
            "file_size",
            "uploaded_by",
          ],
          required: false, // This makes the join a LEFT JOIN
        },
      ],
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
export const putSignedUrl_controller = async (req, res) => {
  const { filename, contentType, key } = req.body;

  try {
    const signedUrl = await putObject(filename, contentType, key);
    if (signedUrl) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Signed URL successfully received",
            signedUrl
          ).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to generate signed URL").toJSON());
  } catch (error) {
    console.error("Error getting signed URL:", error);
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};
export const saveMediaMetadata_controller = async (req, res) => {
  console.log(req.body);
  const { file_name, file_type, file_size, sender_id, receiver_id } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Step 1: Save media metadata in the Media table
    const media = await Media.create(
      {
        file_name,
        file_type,
        file_size,
        uploaded_by: sender_id,
      },
      { transaction }
    );

    // Step 2: Save message information in the Message table
    const message = await Message.create(
      {
        sender_id,
        receiver_id,
        group_id: null, // could be null if personal message
        message_type: file_type, // should be "IMAGE" or "VIDEO"
        content: null,
        media_id: media.media_id,
        status: "sent",
      },
      { transaction }
    );

    await transaction.commit();

    res.json({ success: true, message, media });
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving media metadata:", error);
    res.status(500).json({ error: "Error saving media metadata" });
  }
};

export const getSignedUrl_controller = async (req, res) => {
  const { key } = req.body;

  try {
    const signedUrl = await getObjectURL(key);
    if (signedUrl) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Signed URL successfully received",
            signedUrl
          ).toJSON()
        );
    }
    return res
      .status(400)
      .json(new ApiError(400, "Unable to generate signed URL").toJSON());
  } catch (error) {
    console.error("Error getting signed URL:", error);
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};

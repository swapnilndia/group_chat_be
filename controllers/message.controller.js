import { Op } from "sequelize";
import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteObject, getObjectURL, putObject } from "../utils/aws.js";
import Media from "../models/media.model.js";
import sequelize from "../configs/db.config.js";
import ArchivedMessage from "../models/archived.model.js";

export const getPersonalTextMessages_controller = async (req, res) => {
  const { user_id } = req.user;
  const { contactId: receiver_id } = req.params;

  try {
    // Fetch recent messages from the Message table
    const recentMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: user_id, receiver_id: receiver_id },
          { sender_id: receiver_id, receiver_id: user_id },
        ],
        createdAt: {
          [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
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
          required: false, // LEFT JOIN
        },
      ],
    });
    console.log(recentMessages);
    // Fetch archived messages from the ArchivedMessage table
    const archivedMessages = await ArchivedMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: user_id, receiver_id: receiver_id },
          { sender_id: receiver_id, receiver_id: user_id },
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
          required: false, // LEFT JOIN
        },
      ],
    });
    console.log(archivedMessages);
    // Combine both sets of messages
    const combinedMessages = [...recentMessages, ...archivedMessages];
    console.log(combinedMessages);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Messages successfully fetched",
          combinedMessages
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
  }
};
export const getGroupTextMessage_controller = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Fetch recent messages from the Message table for the specified group
    const recentGroupMessages = await Message.findAll({
      where: { group_id: groupId },
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
          required: false, // LEFT JOIN
        },
      ],
    });

    // Fetch archived messages from the ArchivedMessage table for the specified group
    const archivedGroupMessages = await ArchivedMessage.findAll({
      where: { group_id: groupId },
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
          required: false, // LEFT JOIN
        },
      ],
    });

    // Combine both sets of messages
    const combinedGroupMessages = [
      ...recentGroupMessages,
      ...archivedGroupMessages,
    ];

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Group messages successfully received",
          combinedGroupMessages
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

export const deleteSignedUrl_controller = async (req, res) => {
  const { key } = req.body;

  try {
    const signedUrl = await deleteObject(key);
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

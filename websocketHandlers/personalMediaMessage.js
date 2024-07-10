import { where } from "sequelize";
import sequelize from "../configs/db.config.js";
import Media from "../models/media.model.js";
import Message from "../models/message.model.js";

export default function personalMediaMessageHandler(socket, io) {
  socket.on("save media metadata", async (data) => {
    const {
      file_name,
      file_type,
      file_size,
      sender_id,
      sender_name,
      receiver_id,
      file_key,
    } = data;
    const transaction = await sequelize.transaction();

    try {
      const media = await Media.create(
        {
          file_name,
          file_type,
          file_size,
          uploaded_by: sender_id,
          file_key,
        },
        { transaction }
      );

      const message = await Message.create(
        {
          sender_id,
          sender_name,
          receiver_id,
          group_id: null,
          message_type: file_type,
          content: null,
          media_id: media.media_id,
          status: "sent",
        },
        { transaction }
      );
      const response = {
        ...message.dataValues,
        Medium: {
          ...media.dataValues,
        },
      };

      await transaction.commit();

      // Notify the sender and receiver clients about the new message via WebSocket
      const roomId = data.room_id;
      io.to(roomId).emit("personal message", response);
    } catch (error) {
      await transaction.rollback();
      console.error("Error saving media metadata:", error);
    }
  });
}

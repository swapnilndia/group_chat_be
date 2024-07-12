import { Op } from "sequelize";
import ArchivedMessage from "../models/archived.model.js";
import Message from "../models/message.model.js";

export const archiveOldMessages = async () => {
  try {
    // Fetch all messages
    const allMessages = await Message.findAll();

    // Insert all messages into the archived table
    const archivedMessages = allMessages.map((message) => ({
      message_id: message.message_id, // Map to the correct field names
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      receiver_id: message.receiver_id,
      group_id: message.group_id,
      message_type: message.message_type,
      content: message.content,
      media_id: message.media_id,
      status: message.status,
    }));

    if (archivedMessages.length > 0) {
      await ArchivedMessage.bulkCreate(archivedMessages);
      // Optionally delete all messages from the primary table
      await Message.destroy({
        where: {}, // Remove all records
      });

      console.log("All messages archived successfully.");
    } else {
      console.log("No messages to archive.");
    }
  } catch (error) {
    console.error("Error archiving messages:", error);
  }
};

import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
export default function groupMessageHandler(socket, io) {
  // Define constants outside the function scope
  const GROUP_TEXT_DEFAULT = {
    receiver_id: null,
    message_type: "TEXT",
    media_id: null,
  };

  socket.on("group message", async (message, callback) => {
    console.log(message);
    const { sender_id, sender_name, group_id, content, room_id } = message;

    // Validate message data
    if (!sender_id || !group_id || !content) {
      if (callback)
        callback(new ApiError(400, "Invalid message data").toJSON());
      return;
    }

    const newMessageData = {
      ...GROUP_TEXT_DEFAULT,
      sender_id,
      group_id,
      content,
      sender_name,
    };

    try {
      // Save the message to the database
      const newGroupMessage = await Message.create(newMessageData);
      console.log(newGroupMessage);
      // Check if the message was successfully created
      if (newGroupMessage) {
        console.log(newGroupMessage);
        // Emit WebSocket event to notify the recipient's room
        io.to(room_id).emit("group message", newGroupMessage);

        // Respond to the sender using the callback
        if (callback) {
          callback(
            new ApiResponse(
              201,
              "New message successfully sent",
              newGroupMessage
            ).toJSON()
          );
        }
      } else {
        // Handle failure scenario
        if (callback) {
          callback(new ApiError(400, "Unable to send message").toJSON());
        }
      }
    } catch (error) {
      console.error("Error saving group message:", error);
      // Handle different error scenarios
      let errorMessage = "Something went wrong";
      if (error.name === "SequelizeValidationError") {
        errorMessage = "Validation error";
      } else if (error.name === "SequelizeUniqueConstraintError") {
        errorMessage = "Duplicate entry error";
      }

      if (callback) {
        callback(
          new ApiError(500, errorMessage, {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }).toJSON()
        );
      }
    }
  });
}

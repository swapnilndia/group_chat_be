import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
export default function personalMessageHandler(socket, io) {
  // Define constants outside the function scope
  const PERSONAL_TEXT_DEFAULT = {
    group_id: null,
    message_type: "TEXT",
    media_id: null,
  };

  socket.on("personal message", async (message, callback) => {
    const { sender_id, receiver_id, content, room_id } = message;

    // Validate message data
    if (!sender_id || !receiver_id || !content) {
      if (callback)
        callback(new ApiError(400, "Invalid message data").toJSON());
      return;
    }

    const newMessageData = {
      ...PERSONAL_TEXT_DEFAULT,
      sender_id,
      receiver_id,
      content,
    };

    try {
      // Save the message to the database
      const newPersonalMessage = await Message.create(newMessageData);

      // Check if the message was successfully created
      if (newPersonalMessage) {
        console.log(newPersonalMessage);
        // Emit WebSocket event to notify the recipient's room
        io.to(room_id).emit("personal message", newPersonalMessage);

        // Respond to the sender using the callback
        if (callback) {
          callback(
            new ApiResponse(
              201,
              "New message successfully sent",
              newPersonalMessage
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
      console.error("Error saving personal message:", error);
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

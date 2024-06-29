import sequelize from "../configs/db.config.js";
import { DataTypes } from "sequelize";

const Message = sequelize.define(
  "message",
  {
    message_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "user_id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Groups",
        key: "group_id",
      },
    },
    message_type: {
      type: DataTypes.ENUM("TEXT", "IMAGE", "VIDEO"), // Define message_type as ENUM
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Media",
        key: "media_id",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "sent",
    },
  },
  {
    timestamps: falstruee,
  }
);

export default Message;

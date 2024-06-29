import sequelize from "../configs/db.config.js";
import { DataTypes } from "sequelize";

const Chat = sequelize.define(
  "chat",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

export default Chat;

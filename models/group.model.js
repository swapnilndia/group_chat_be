import sequelize from "../configs/db.config.js";
import { DataTypes } from "sequelize";

const Group = sequelize.define(
  "Group", // Use singular "Group" as the model name (Sequelize convention)
  {
    group_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    connectionKey: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // Add reference if it relates to a user
        model: "users",
        key: "user_id",
      },
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt timestamps
    paranoid: true, // Enables soft deletion (paranoid mode)
    tableName: "groups",
  }
);

export default Group;

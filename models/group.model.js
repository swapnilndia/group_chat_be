import sequelize from "../configs/db.config.js";
import { DataTypes } from "sequelize";

const Group = sequelize.define(
  "group", // Use singular "Group" as the model name (Sequelize convention)
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE, // Use DATE type for soft deletion timestamp
      allowNull: true, // Allow null to represent active groups
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt timestamps
    paranoid: true, // Enables soft deletion (paranoid mode)
  }
);

export default Group;

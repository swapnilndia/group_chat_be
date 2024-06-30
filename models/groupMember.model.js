import sequelize from "../configs/db.config.js";
import { DataTypes } from "sequelize";

const GroupMember = sequelize.define(
  "GroupMember",
  {
    group_member_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "groups",
        key: "group_id",
      },
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    tableName: "groupmembers",
  }
);

export default GroupMember;

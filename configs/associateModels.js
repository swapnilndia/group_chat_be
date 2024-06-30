// sequelizeAssociations.js
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import GroupMember from "../models/groupMember.model.js";
import Group from "../models/group.model.js";
import Media from "../models/media.model.js";

const associateModels = () => {
  User.hasMany(Message, { foreignKey: "sender_id", onDelete: "CASCADE" });
  Message.belongsTo(User, { foreignKey: "sender_id", onDelete: "CASCADE" });

  User.hasMany(Message, { foreignKey: "receiver_id", onDelete: "CASCADE" });
  Message.belongsTo(User, { foreignKey: "receiver_id", onDelete: "CASCADE" });

  User.belongsToMany(Group, { through: GroupMember, foreignKey: "user_id" });
  Group.belongsToMany(User, { through: GroupMember, foreignKey: "group_id" });

  GroupMember.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
  GroupMember.belongsTo(Group, { foreignKey: "group_id", onDelete: "CASCADE" });

  Group.hasMany(GroupMember, { foreignKey: "group_id", onDelete: "CASCADE" });
  User.hasMany(GroupMember, { foreignKey: "user_id", onDelete: "CASCADE" });

  Group.hasMany(Message, { foreignKey: "group_id", onDelete: "CASCADE" });
  Message.belongsTo(Group, { foreignKey: "group_id", onDelete: "CASCADE" });

  Message.hasMany(Media, { foreignKey: "media_id", onDelete: "CASCADE" });
  Media.belongsTo(Message, { foreignKey: "media_id", onDelete: "CASCADE" });
};

export default associateModels;

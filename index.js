// index.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import sequelize from "./configs/db.config.js";
import cookieParser from "cookie-parser";
import MessageRouter from "./routes/message.route.js";
import GroupRouter from "./routes/group.route.js";
import UserRouter from "./routes/user.route.js";
import ContactRouter from "./routes/contact.route.js";
import User from "./models/user.model.js";
import Message from "./models/message.model.js";
import Group from "./models/group.model.js";
import GroupMember from "./models/groupMember.model.js";
import Media from "./models/media.model.js";
import Contact from "./models/contact.model.js";

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3001;
console.log(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  process.env.DB_HOST,
  process.env.PORT
);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes setup
app.get("/", (req, res) => {
  res.status(200).send("<h1>Hello</h1>");
});

app.use("/api/v1/user/", UserRouter);
app.use("/api/v1/message/", MessageRouter);
app.use("/api/v1/group/", GroupRouter);
app.use("/api/v1/contact/", ContactRouter);

// Error handling middleware should be after routes
app.use((err, req, res, next) => {
  console.log("Schema error", req.body);
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ error: "Bad Request - Invalid JSON", requestBody: req.body });
  }
  next();
});
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

// Self-referencing association
User.belongsToMany(User, {
  through: Contact,
  as: "Contacts",
  foreignKey: "user_id",
  otherKey: "contact_user_id",
});

sequelize
  .sync({ force: true })
  // .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

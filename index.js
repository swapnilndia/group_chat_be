import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import sequelize from "./configs/db.config.js";
import cookieParser from "cookie-parser";
import MessageRouter from "./routes/message.route.js";
import GroupRouter from "./routes/group.route.js";
import UserRouter from "./routes/user.route.js";
import ContactRouter from "./routes/contact.route.js";
import User from "./models/user.model.js";
import Message from "./models/message.model.js";
import ArchivedMessage from "./models/archived.model.js";
import Group from "./models/group.model.js";
import GroupMember from "./models/groupMember.model.js";
import Media from "./models/media.model.js";
import Contact from "./models/contact.model.js";
import personalMessageHandler from "./websocketHandlers/personalMessageHandler.js";
import connectionHandler from "./websocketHandlers/connectionHandler.js";
import { instrument } from "@socket.io/admin-ui";
import groupMessageHandler from "./websocketHandlers/groupMessageHandler.js";
import personalMediaMessageHandler from "./websocketHandlers/personalMediaMessage.js";
import groupMediaMessage from "./websocketHandlers/groupMediaMessage.js";
import cron from "cron";
import { archiveOldMessages } from "./utils/archiveFunction.js";
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "https://main.d1xmkj62r2mwg1.amplifyapp.com", // Your React app's domain
  optionsSuccessStatus: 200,
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Authorization,Content-Type",
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight requests

const io = new Server(server, {
  cors: {
    origin: [
      "https://main.d1xmkj62r2mwg1.amplifyapp.com",
      "https://admin.socket.io",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
});
app.use(cookieParser());
const PORT = process.env.PORT || 3001;

const job = new cron.CronJob(
  "0 0 * * *",
  () => {
    archiveOldMessages();
  },
  null,
  true,
  "Asia/Kolkata"
);
job.start();
console.log("Cron job scheduled");

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight requests
// Routes setup
app.get("/", (req, res) => {
  res.status(200).send("<h1>Hello</h1>");
});

app.use("/api/v1/user/", UserRouter);
app.use("/api/v1/messages/", MessageRouter);
app.use("/api/v1/group/", GroupRouter);
app.use("/api/v1/contact/", ContactRouter);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle user joins and disconnects
  connectionHandler(socket, io);
  // Register personal message handler
  personalMessageHandler(socket, io);
  groupMessageHandler(socket, io);
  personalMediaMessageHandler(socket, io);
  groupMediaMessage(socket, io);
  // Example: Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

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
// User to Message
User.hasMany(Message, { foreignKey: "sender_id", onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: "sender_id", onDelete: "CASCADE" });
User.hasMany(Message, { foreignKey: "receiver_id", onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: "receiver_id", onDelete: "CASCADE" });

// User to Group (Many-to-Many)
User.belongsToMany(Group, { through: GroupMember, foreignKey: "user_id" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "group_id" });

// GroupMember associations
GroupMember.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
GroupMember.belongsTo(Group, { foreignKey: "group_id", onDelete: "CASCADE" });
Group.hasMany(GroupMember, { foreignKey: "group_id", onDelete: "CASCADE" });
User.hasMany(GroupMember, { foreignKey: "user_id", onDelete: "CASCADE" });

// Group to Message
Group.hasMany(Message, { foreignKey: "group_id", onDelete: "CASCADE" });
Message.belongsTo(Group, { foreignKey: "group_id", onDelete: "CASCADE" });

// Message to Media
Message.belongsTo(Media, { foreignKey: "media_id" });
ArchivedMessage.belongsTo(Media, { foreignKey: "media_id" });

// ArchivedMessage associations
ArchivedMessage.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
ArchivedMessage.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });
ArchivedMessage.belongsTo(Group, { foreignKey: "group_id" }); // if applicable

// Self-referencing association
User.belongsToMany(User, {
  through: Contact,
  as: "Contacts",
  foreignKey: "user_id",
  otherKey: "contact_user_id",
});

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
instrument(io, { auth: false });

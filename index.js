import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./configs/db.config.js";
import cookieParser from "cookie-parser";
import User from "./models/user.model.js"; // Assuming this is correct
import UserRouter from "./routes/user.route.js"; // Adjust path to your routes file

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(express.json()); // Use built-in middleware for JSON parsing
app.use(express.urlencoded({ extended: true })); // Use built-in middleware for URL-encoded data
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

// Error handling middleware should be after routes
app.use((err, req, res, next) => {
  console.log("Schema error");
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ error: "Bad Request - Invalid JSON", requestBody: req.body });
  }
  next();
});

// Database sync and server start
sequelize
  // .sync({ force: true }) // Avoid force: true in production
  .sync() // Avoid force: true in production

  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

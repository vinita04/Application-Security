require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimiter = require("./middlewares/rateLimiter");
const passport = require("passport");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
// Connect to db
connectDB();

require("./strategies/localStrategy");
require("./strategies/jwtStrategy");

const app = express();
app.use(express.json());
app.use(helmet()); // secure HTTP headers
app.use(cookieParser()); // parse cookies
app.use(rateLimiter); // limit repeated requests from same IP

// Quick health check
app.get("/api/auth/ping", (req, res) => {
  res.json({ status: "ok", message: "Passport Auth POC is live" });
});

// Mount the auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

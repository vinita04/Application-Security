const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");

const {
  COOKIE_NAME = "token",
  COOKIE_DOMAIN = "localhost",
  COOKIE_SECURE = "false",
  COOKIE_SAMESITE = "strict",
} = process.env;

const isCookieSecure = COOKIE_SECURE === "true";

// Register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic checks
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ email, password: hashedPass });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("[Register Error]", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Issue JWT in an HTTP-only cookie
exports.issueJwt = async (req, res) => {
  try {
    // Passport local strategy attaches 'user' to req.user if valid
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    // Set cookie: httpOnly prevents JS access; secure requires HTTPS
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isCookieSecure,
      domain: COOKIE_DOMAIN,
      sameSite: COOKIE_SAMESITE, // 'strict' | 'lax' | 'none'
      maxAge: 1000 * 60 * 60, // 1 hour in ms, or customize
    });

    return res.json({ message: "Logged in successfully" });
  } catch (err) {
    console.error("[JWT Issue Error]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Logout: Clear the cookie
exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    domain: COOKIE_DOMAIN,
    httpOnly: true,
    secure: isCookieSecure,
    sameSite: COOKIE_SAMESITE,
  });
  return res.json({ message: "Logged out successfully" });
};

// Protected route example
exports.getProfile = (req, res) => {
  // If JWT is valid, passport-jwt sets req.user
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  // Convert Mongoose doc to plain JS object
  const { password, ...rest } = user.toObject();
  return res.json({ user: rest });
};

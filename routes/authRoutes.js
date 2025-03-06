const express = require("express");
const passport = require("passport");
const { register, issueJwt, logout } = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Utility: custom cookie extractor
function extractTokenFromCookie(req) {
  const { token } = req.cookies; // "token" is default from process.env.COOKIE_NAME
  if (!token) return null;
  return token;
}

function jwtCookieAuth(req, res, next) {
  const token = extractTokenFromCookie(req);
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to req for the route
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT cookie verification failed:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Registration
router.post("/register", register);

// Login: use passport local, then issue JWT in cookie
router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        // If there was a general error (e.g., DB issue)
        console.error("Passport authentication error:", err);
        return res.status(500).json({ message: "Server error during login." });
      }
      if (!user) {
        // If authentication failed (invalid credentials),
        // info may contain a message from your localStrategy (e.g., "Invalid email or password")
        const errorMessage =
          info && info.message ? info.message : "Unauthorized.";
        return res.status(401).json({ message: errorMessage });
      }
      req.user = user;
      // If we get here, the user was successfully authenticated
      // (e.g., "req.user" will be set by Passport).
      // Typically you'd issue a JWT or set a cookie at this point.

      // Example response:
      return issueJwt(req, res, next);
    })(req, res, next);
  },
  issueJwt
);

// Logout: clear the httpOnly cookie
router.get("/logout", logout);

// Protected route: read JWT from cookie
router.get("/profile", jwtCookieAuth, async (req, res) => {
  try {
    const userDoc = await User.findById(req.user.userId).select("-password");
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: userDoc });
  } catch (err) {
    console.error("[Profile error]", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

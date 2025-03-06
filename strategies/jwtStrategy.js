const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user");
require("dotenv").config();

const opts = {
  /* We'll parse JWT from the cookie inside the route, not from the Authorization header
  so this can be omitted or replaced with a custom extractor */
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(opts, async (payload, done) => {
    try {
      // Lookup user by ID
      const user = await User.findById(payload.userId);
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

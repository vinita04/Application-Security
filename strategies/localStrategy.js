const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user");

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          // The third parameter sets "info.message"
          return done(null, false, { message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Wrong password" });
        }

        // If valid
        return done(null, user, { message: "Local login success" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

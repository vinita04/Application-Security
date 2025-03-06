const rateLimit = require("express-rate-limit");

// Basic rate limiter to mitigate brute-force attacks
module.exports = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per 1 minute from single IP
  message: "Too many requests from this IP, please try again later.",
});

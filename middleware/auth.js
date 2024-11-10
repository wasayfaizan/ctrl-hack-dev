const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "your-super-secret-key-here"; // Use the same secret as in your server.js

const isAuthenticated = async (req, res, next) => {
  try {
    // Check if JWT exists in cookies
    if (req.cookies.jwt) {
      // Verify the token
      const decoded = jwt.verify(req.cookies.jwt, JWT_SECRET);
      // Find the user
      const currentUser = await User.findById(decoded.id);

      if (currentUser) {
        // Add user to request object
        req.user = currentUser;
        res.locals.user = currentUser;
        return next();
      }
    }

    // If no token or invalid token, redirect to login
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Authentication error:", error);
    res.redirect("/auth/login");
  }
};

module.exports = { isAuthenticated };

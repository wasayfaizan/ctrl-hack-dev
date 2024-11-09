const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Use a hard-coded secret (in production, this should be in .env)
const JWT_SECRET = "your-super-secret-key-here";
const JWT_EXPIRES_IN = "90d";
const JWT_COOKIE_EXPIRES_IN = 90;

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("register", {
        error: "Passwords do not match",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        error: "Email already registered",
      });
    }

    // Create new user
    await User.create({
      name,
      email,
      password,
    });

    // Redirect to login with success message
    res.render("login", {
      success: "Registration successful! Please login.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.render("register", {
      error: "Error registering user",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("login", {
        error: "Incorrect email or password",
      });
    }

    // Generate token
    const token = signToken(user._id);

    // Set cookie
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });

    // For debugging
    console.log("Login successful:", {
      userId: user._id,
      name: user.name,
      token: token,
    });

    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      error: "Error logging in",
    });
  }
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.redirect("/");
};

exports.protect = async (req, res, next) => {
  try {
    // Get token
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.redirect("/auth/login");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect("/auth/login");
    }

    // Grant access
    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    res.redirect("/auth/login");
  }
};

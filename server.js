const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");
const Child = require("./models/Child"); // Import the Child model
const Donation = require("./models/Donation");
const BlogPost = require("./models/BlogPost");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./controllers/authController");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const donationController = require("./controllers/donationController");
const childController = require("./controllers/childController");
const session = require("express-session");
const donationRoutes = require("./routes/donationRoutes");
const MongoStore = require("connect-mongo");
const fs = require("fs-extra");

const app = express();

// JWT Secret (same as in authController)
const JWT_SECRET = "your-super-secret-key-here";

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/empower-kids",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Global middleware to check auth status
app.use(async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = jwt.verify(req.cookies.jwt, JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        res.locals.user = currentUser;
      } else {
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }
  } catch (err) {
    res.locals.user = null;
  }
  next();
});

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/form", (req, res) => {
  res.render("form");
});

app.get("/blog", async (req, res) => {
  try {
    const posts = await BlogPost.find().sort("-createdAt");
    res.render("blog", { posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.render("blog", { posts: [] });
  }
});

app.post("/api/blog", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = new BlogPost({
      title,
      content,
      author,
    });
    await newPost.save();
    res.redirect("/blog");
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).send("Error creating blog post");
  }
});

app.get("/donate", async (req, res) => {
  try {
    const children = await Child.find().sort("-createdAt");
    res.render("donate", { children });
  } catch (error) {
    console.error("Error fetching children:", error);
    res.render("donate", { children: [] });
  }
});

app.post("/api/donations", async (req, res) => {
  try {
    const { donor, amount, childId, message } = req.body;
    const newDonation = new Donation({
      donor,
      amount: parseFloat(amount),
      childId,
      message,
      status: "pending",
    });
    await newDonation.save();
    res.redirect("/thank-you-donation");
  } catch (error) {
    console.error("Error processing donation:", error);
    res.status(500).send("Error processing donation");
  }
});

app.get("/thank-you", (req, res) => {
  res.render("thank-you");
});

app.get("/thank-you-donation", (req, res) => {
  res.render("thank-you-donation");
});

app.get("/api/children", async (req, res) => {
  try {
    const children = await Child.find().sort("-createdAt");
    res.json({
      success: true,
      data: children,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching children",
      error: error.message,
    });
  }
});

app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("childId")
      .sort("-createdAt");
    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: error.message,
    });
  }
});

app.post("/api/form", upload.single("image"), async (req, res) => {
  try {
    console.log("Received form data:", req.body);

    // Parse the needs array from the JSON string
    let needs = [];
    try {
      needs = JSON.parse(req.body.needs || "[]");
    } catch (e) {
      console.error("Error parsing needs:", e);
    }

    // Create new child document using the Child model
    const newChild = new Child({
      name: req.body.name,
      age: parseInt(req.body.age),
      story: req.body.story,
      needs: needs, // Use the parsed array
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    console.log("Saving child:", newChild);

    // Save to database
    const savedChild = await newChild.save();
    console.log("Child saved successfully:", savedChild);

    // Instead of sending JSON, redirect to thank you page
    res.redirect("/thank-you");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Error registering child. Please try again.");
  }
});

// Add auth routes
app.use("/auth", authRoutes);

// Protect routes that require authentication
app.use("/form", protect);
app.use("/donate", protect);

// Add these routes
app.post("/donate/process", protect, donationController.processDonation);
app.get("/donate/thank-you", protect, donationController.showThankYou);

// Child registration routes
app.get("/register-child", protect, childController.showRegistrationForm);
app.post("/register-child", protect, childController.registerChild);
app.get("/register-success", protect, childController.showRegistrationSuccess);

// Mount the routes
app.use("/donate", donationRoutes);

// Database connection with debug logging
mongoose
  .connect("mongodb://127.0.0.1:27017/empower-kids", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB: empower-kids database");
    // Test database connection
    mongoose.connection.db.admin().ping(function (err, result) {
      if (err) {
        console.error("Database ping error:", err);
      } else {
        console.log("Database ping successful:", result);
      }
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Add this route to test user data
app.get("/test-auth", (req, res) => {
  res.json({
    user: res.locals.user,
    isAuthenticated: !!res.locals.user,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

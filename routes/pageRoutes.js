const express = require("express");
const router = express.Router();
const Child = require("../models/Child");

// Help page route
router.get("/help", (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth/login");
    }
    res.render("helpme", {
      user: req.user,
      title: "Help Center",
      currentPage: "help",
    });
  } catch (error) {
    console.error("Help page error:", error);
    res.status(500).send("Error loading help page");
  }
});

router.get("/helpme", async (req, res) => {
  try {
    console.log("Fetching children...");

    // Find all children and log the result
    const children = await Child.find({});
    console.log("Children found:", children);

    // Render the page with children data
    res.render("helpme", {
      children: children,
      currentPage: "helpme",
    });
  } catch (error) {
    console.error("Error fetching children:", error);
    res.render("helpme", {
      children: [],
      error: "Failed to fetch children",
    });
  }
});

// Test route to add a sample child
router.get("/add-test-child", async (req, res) => {
  try {
    const testChild = new Child({
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("2015-01-01"),
    });

    await testChild.save();
    res.send("Test child added successfully");
  } catch (error) {
    console.error("Error adding test child:", error);
    res.status(500).send("Error adding test child");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const Child = require("../models/Child");
const authController = require("../controllers/authController");

router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.get("/help-me", isAuthenticated, async (req, res) => {
  try {
    const children = await Child.find();
    console.log("Full children data:", JSON.stringify(children, null, 2));

    if (children.length > 0) {
      console.log("First child fields:", {
        _id: children[0]._id,
        childName: children[0].childName,
        name: children[0].name,
        firstName: children[0].firstName,
        yearOfBirth: children[0].yearOfBirth,
        birthYear: children[0].birthYear,
        dob: children[0].dob,
      });
    }

    res.render("helpme", {
      currentPage: "help-me",
      user: req.user,
      children: children || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/child/:id", isAuthenticated, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).send("Child not found");
    }

    res.render("childPhotoId", {
      currentPage: "help-me",
      user: req.user,
      child: child,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

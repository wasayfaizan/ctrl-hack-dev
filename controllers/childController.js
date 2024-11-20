const Child = require("../models/Child");

exports.registerChild = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      healthConditions,
      specialNeeds,
    } = req.body;

    // Create new child record for the display 
    const child = new Child({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      healthConditions,
      specialNeeds: specialNeeds === "on", // Convert checkbox value to boolean
      registeredBy: req.user._id, // Assuming you have user info from auth middleware
    });

    // If you're handling file uploads, add the file path
    if (req.file) {
      child.birthCertificate = req.file.path;
    }

    await child.save();

    // Redirect to success page or show success message on the display 
    res.redirect("/register-success");
  } catch (error) {
    console.error("Error registering child:", error);
    res.status(500).json({
      success: false,
      message: "Error registering child",
    });
  }
};

exports.showRegistrationForm = (req, res) => {
  res.render("form");
};

exports.showRegistrationSuccess = (req, res) => {
  res.render("register-success");
};

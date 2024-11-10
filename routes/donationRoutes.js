const express = require("express");
const router = express.Router();

// Get donation page
router.get("/", (req, res) => {
  res.render("donation");
});

// Process donation
router.post("/process", async (req, res) => {
  try {
    const { amount, donorName, email, message } = req.body;
    // For now, just redirect to success page
    res.redirect("/donation/success");
  } catch (error) {
    console.error("Donation error:", error);
    res.render("donation", { error: "Error processing donation" });
  }
});

// Success page
router.get("/success", (req, res) => {
  res.render("donation-success");
});

module.exports = router;

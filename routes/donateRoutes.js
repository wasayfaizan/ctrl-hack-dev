const express = require("express");
const router = express.Router();

// GET donate page
router.get("/", (req, res) => {
  res.render("donate", {
    currentPage: "donate",
    error: null,
    formData: null,
  });
});

// POST donation
router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, amount, paymentMethod, terms } = req.body;
    console.log("Received donation data:", req.body);

    // Basic validation
    if (!fullName || !email || !phone || !amount || !paymentMethod || !terms) {
      console.log("Missing required fields");
      return res.status(400).render("donate", {
        currentPage: "donate",
        error: "All required fields must be filled out",
        formData: req.body,
      });
    }

    // Process donation here (this is where you'd integrate with a payment processor)
    console.log("Processing donation...");

    // If successful, redirect to thank you page
    res.redirect("/thank-you-donate");
  } catch (error) {
    console.error("Donation processing error:", error);
    res.status(500).render("donate", {
      currentPage: "donate",
      error:
        "An error occurred while processing your donation. Please try again.",
      formData: req.body,
    });
  }
});

module.exports = router;

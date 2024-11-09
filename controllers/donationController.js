const Donation = require("../models/Donation");

exports.processDonation = async (req, res) => {
  try {
    const {
      amount,
      paymentMethod,
      cardholderName,
      cardNumber,
      expirationDate,
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount",
      });
    }

    // Create donation record
    const donation = new Donation({
      userId: req.user._id,
      amount: parseFloat(amount),
      paymentMethod,
      cardDetails:
        paymentMethod === "card"
          ? {
              cardholderName,
              lastFourDigits: cardNumber ? cardNumber.slice(-4) : null,
              expirationDate,
            }
          : undefined,
    });

    await donation.save();

    // Redirect to thank you page
    res.redirect("/donate/thank-you");
  } catch (error) {
    console.error("Donation processing error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing donation",
    });
  }
};

exports.showThankYou = (req, res) => {
  res.render("thank-you-donation");
};

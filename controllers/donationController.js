const Donation = require("../models/Donation");
const { validationResult } = require("express-validator");

exports.createDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newDonation = new Donation(req.body);
    await newDonation.save();

    res.status(201).json({
      success: true,
      data: newDonation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("childId")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

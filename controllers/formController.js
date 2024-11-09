const Child = require("../models/Child");
const { validationResult } = require("express-validator");

exports.submitChildForm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newChild = new Child(req.body);
    await newChild.save();

    res.status(201).json({
      success: true,
      data: newChild,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getChildren = async (req, res) => {
  try {
    const children = await Child.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: children,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

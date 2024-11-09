const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  healthConditions: {
    type: String,
    trim: true,
  },
  specialNeeds: {
    type: Boolean,
    default: false,
  },
  birthCertificate: {
    type: String, // This will store the file path
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Child", childSchema);

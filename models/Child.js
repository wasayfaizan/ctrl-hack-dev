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
  location: {
    type: String,
    trim: true,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  bloodType: {
    type: String,
    trim: true,
  },
  height: {
    type: Number,
    trim: true,
  },
  weight: {
    type: Number,
    trim: true,
  },
  medicalConditions: {
    type: String,
    trim: true,
  },
  allergies: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: "Active",
  },
});

module.exports = mongoose.model("Child", childSchema);

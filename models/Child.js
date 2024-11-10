const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  healthConditions: String,
  specialNeeds: {
    type: Boolean,
    default: false,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  status: {
    type: String,
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Child = mongoose.model("Child", childSchema);
module.exports = Child;

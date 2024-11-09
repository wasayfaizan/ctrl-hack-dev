const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [0, "Age cannot be negative"],
    max: [18, "Age cannot be more than 18"],
  },
  story: {
    type: String,
    required: [true, "Story is required"],
    trim: true,
  },
  needs: [
    {
      type: String,
      enum: ["education", "healthcare", "nutrition", "clothing"],
    },
  ],
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Child", childSchema);

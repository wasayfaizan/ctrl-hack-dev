const express = require("express");
const router = express.Router();
const {
  submitChildForm,
  getChildren,
} = require("../controllers/formController");
const { check } = require("express-validator");

router.post(
  "/",
  [
    check("name").notEmpty().trim(),
    check("age").isNumeric(),
    check("story").notEmpty(),
  ],
  submitChildForm
);

router.get("/", getChildren);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createDonation,
  getDonations,
} = require("../controllers/donationController");
const { check } = require("express-validator");

router.post(
  "/",
  [
    check("donor.name").notEmpty(),
    check("donor.email").isEmail(),
    check("amount").isNumeric(),
    check("childId").notEmpty(),
  ],
  createDonation
);

router.get("/", getDonations);

module.exports = router;

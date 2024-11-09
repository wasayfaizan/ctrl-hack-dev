const express = require("express");
const router = express.Router();
const { createPost, getPosts } = require("../controllers/blogController");
const { check } = require("express-validator");

router.post(
  "/",
  [
    check("title").notEmpty().trim(),
    check("content").notEmpty(),
    check("author").notEmpty(),
  ],
  createPost
);

router.get("/", getPosts);

module.exports = router;

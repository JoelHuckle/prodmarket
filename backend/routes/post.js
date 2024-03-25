const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");

router.post("/createPost", postController.createPost);

module.exports = router;

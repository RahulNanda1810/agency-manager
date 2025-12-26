const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

router.post("/", authMiddleware, commentController.addComment);
router.get("/", authMiddleware, commentController.getComments);

module.exports = router;

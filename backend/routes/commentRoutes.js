const express = require("express");
const router = express.Router();

const {
  addComment,
  getIssueComments,
} = require("../controllers/commentController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

// Add comment
router.post("/:issueId", addComment);

// Get issue comments
router.get("/:issueId", getIssueComments);

module.exports = router;
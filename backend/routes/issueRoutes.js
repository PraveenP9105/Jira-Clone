const express = require("express");
const router = express.Router();

const {
  createIssue,
  getProjectIssues,
  assignIssue,
  updateIssueStatus,
  addIssueToSprint,
  removeIssueFromSprint,
  uploadAttachment
} = require("../controllers/issueController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Create issue
router.post("/", createIssue);

// Get project issues
router.get("/project/:projectId", getProjectIssues);

// Assign issue (ADMIN, PM)
router.patch(
  "/:id/assign",
  roleMiddleware("ADMIN", "PM"),
  assignIssue
);

// Move status
router.patch("/:id/status", updateIssueStatus);

// Add to sprint
router.patch("/:id/add-to-sprint", addIssueToSprint);

// Remove from sprint
router.patch("/:id/remove-from-sprint", removeIssueFromSprint);




const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/:id/upload",
  upload.single("file"),
  uploadAttachment
);

module.exports = router;
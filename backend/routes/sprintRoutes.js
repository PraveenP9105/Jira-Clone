const express = require("express");
const router = express.Router();

const {
  createSprint,
  getProjectSprints,
  getSprintById,
  startSprint,
  completeSprint,
  deleteSprint,
} = require("../controllers/sprintController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Create Sprint (ADMIN, PM)
router.post("/", roleMiddleware("ADMIN", "PM"), createSprint);

// Get sprints by project
router.get("/project/:projectId", getProjectSprints);

// Get single sprint
router.get("/:id", getSprintById);

// Start sprint
router.patch("/:id/start", roleMiddleware("ADMIN", "PM"), startSprint);

// Complete sprint
router.patch("/:id/complete", roleMiddleware("ADMIN", "PM"), completeSprint);

// Delete sprint (ADMIN only)
router.delete("/:id", roleMiddleware("ADMIN"), deleteSprint);

module.exports = router;
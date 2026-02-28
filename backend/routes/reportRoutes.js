const express = require("express");
const router = express.Router();

const {
  getSprintBurndown,
  getProjectVelocity,
  getDeveloperProductivity,
} = require("../controllers/reportController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

// Sprint Burndown
router.get("/burndown/:sprintId", getSprintBurndown);

// Velocity
router.get("/velocity/:projectId", getProjectVelocity);

// Productivity
router.get("/productivity/:projectId", getDeveloperProductivity);

module.exports = router;
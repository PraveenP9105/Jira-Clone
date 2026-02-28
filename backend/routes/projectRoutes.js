const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Admin only
router.post("/", roleMiddleware("ADMIN"), createProject);

// All authenticated users
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Admin only
router.put("/:id", roleMiddleware("ADMIN"), updateProject);
router.delete("/:id", roleMiddleware("ADMIN"), deleteProject);

module.exports = router;
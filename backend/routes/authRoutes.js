const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const User = require("../models/User");

router.get("/users", authMiddleware, async (req, res) => {
  const users = await User.find().select("name email role");
  res.json(users);
});

router.post("/login", loginUser);

// Admin only register
router.post(
  "/register",
  authMiddleware,
  roleMiddleware("ADMIN"),
  registerUser
);

module.exports = router;
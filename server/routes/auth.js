const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  googleAuth,
  getCurrentUser,
  logout,
  refreshToken,
  testAuth, // ← Make sure this is here
} = require("../controllers/authController");

// Public routes
router.post("/google", googleAuth);
router.post("/test", testAuth); // ← Make sure this line exists

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);
router.post("/refresh", protect, refreshToken);

module.exports = router;

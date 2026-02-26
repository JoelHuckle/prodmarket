// routes/users.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const {
  getUserById,
  getUserByUsername,
  updateProfile,
  becomeSeller,
  updateSellerInfo,
  getUserStats,
} = require("../controllers/userController");

// Public routes
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);

// Protected routes
router.get("/:id/stats", protect, getUserStats);
router.post("/become-seller", protect, becomeSeller);

// Seller-only routes
router.put("/seller-info", protect, isSeller, updateSellerInfo);

module.exports = router;

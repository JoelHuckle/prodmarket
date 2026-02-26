// routes/services.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  searchServices,
} = require("../controllers/serviceController");

// Public routes
router.get("/", getServices);
router.get("/search", searchServices); // Must be before /:id
router.get("/:id", getServiceById);

// Protected routes (Seller only)
router.post("/", protect, isSeller, createService);
router.put("/:id", protect, updateService); // Ownership verified in controller
router.delete("/:id", protect, deleteService); // Ownership verified in controller

module.exports = router;

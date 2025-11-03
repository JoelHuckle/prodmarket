// routes/subscriptions.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const subscriptionController = require("../controllers/subscriptionController");

// All routes require authentication
router.use(protect);

// Create new subscription
router.post("/", subscriptionController.createSubscription);

// Get user's subscriptions
router.get("/my", subscriptionController.getMySubscriptions);

// Get subscription statistics
router.get("/stats", subscriptionController.getSubscriptionStats);

// Get subscription by ID
router.get("/:id", subscriptionController.getSubscription);

// Cancel subscription
router.delete("/:id", subscriptionController.cancelSubscription);

// Upload monthly pack (seller only)
router.post(
  "/:service_id/upload-pack",
  isSeller,
  subscriptionController.uploadSubscriptionPack
);

// Get packs for a service
router.get("/:service_id/packs", subscriptionController.getSubscriptionPacks);

module.exports = router;

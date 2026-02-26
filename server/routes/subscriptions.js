// routes/subscriptions.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const subscriptionController = require("../controllers/subscriptionController");

// All routes require authentication
router.use(protect);

// Subscription management
router.post("/", subscriptionController.createSubscription);
router.get("/my", subscriptionController.getMySubscriptions);
router.get("/subscribers", isSeller, subscriptionController.getSubscribers);
router.get("/:id", subscriptionController.getSubscriptionById);
router.delete("/:id", subscriptionController.cancelSubscription);

// Test route — development only
if (process.env.NODE_ENV === "development") {
  router.post("/test-create", subscriptionController.testCreateSubscription);
}

// Subscription packs
router.post(
  "/:serviceId/upload-pack",
  isSeller,
  subscriptionController.uploadSubscriptionPack
);
router.get("/:serviceId/packs", subscriptionController.getSubscriptionPacks);
router.get("/packs/:packId", subscriptionController.getSubscriptionPack);

module.exports = router;

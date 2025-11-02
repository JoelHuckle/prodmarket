// routes/payments.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const {
  createPaymentIntent,
  confirmPayment,
  releaseEscrow,
  getConnectOnboardingLink,
  getConnectStatus,
  testCreateOrder,
} = require("../controllers/paymentController");

// All routes require authentication
router.use(protect);

// Payment routes
router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);
router.post("/release-escrow", releaseEscrow); // TODO: Add admin middleware

// Stripe Connect routes (Seller only)
router.get("/connect-onboard", isSeller, getConnectOnboardingLink);
router.get("/connect-status", isSeller, getConnectStatus);

// Payment test route
router.post("/test-create-order", protect, testCreateOrder);

module.exports = router;

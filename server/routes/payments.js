// routes/payments.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const {
  createPaymentIntent,
  confirmPayment,
  releaseEscrow,
  getConnectOnboardingLink,
  getConnectStatus,
} = require("../controllers/paymentController");

// All routes require authentication
router.use(protect);

// Payment routes
router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);
router.post("/release-escrow", isAdmin, releaseEscrow);

// Stripe Connect routes (Seller only)
router.get("/connect-onboard", isSeller, getConnectOnboardingLink);
router.get("/connect-status", isSeller, getConnectStatus);

module.exports = router;

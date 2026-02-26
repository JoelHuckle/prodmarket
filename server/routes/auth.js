const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/auth");
const {
  googleAuth,
  getCurrentUser,
  logout,
  refreshToken,
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Rate limit for resend/forgot (prevent spam)
const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});

// Public routes
router.post("/google", googleAuth);
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", sensitiveAuthLimiter, resendVerification);
router.post("/forgot-password", sensitiveAuthLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);

module.exports = router;

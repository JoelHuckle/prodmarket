const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const adminController = require("../controllers/adminController");

// All routes require authentication AND admin privileges
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// User management
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserDetails);
router.put("/users/:id/verify", adminController.verifyUser);
router.put("/users/:id/unverify", adminController.unverifyUser);

// Dispute management
router.get("/disputes", adminController.getDisputes);
router.put("/disputes/:id/resolve", adminController.resolveDispute);

// Service moderation
router.delete("/services/:id", adminController.deleteService);

// Transactions
router.get("/transactions", adminController.getTransactions);

module.exports = router;

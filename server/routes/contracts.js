// routes/contracts.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const contractController = require("../controllers/contractController");

// All routes require authentication
router.use(protect);

// Generate contract for an order
router.post("/generate/:orderId", contractController.generateContract);

// Get all contracts for current user
router.get("/", contractController.getContracts);

// Get contract by ID
router.get("/:id", contractController.getContract);

// Get contract by order ID
router.get("/order/:orderId", contractController.getContractByOrderId);

// Download contract PDF
router.get("/:id/download", contractController.downloadContract);

module.exports = router;

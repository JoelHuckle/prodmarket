// routes/disputes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const disputeController = require("../controllers/disputeController");

// All routes require authentication
router.use(protect);

// Dispute management
router.post("/", disputeController.createDispute);
router.get("/", disputeController.getMyDisputes);
router.get("/stats", disputeController.getDisputeStats);
router.get("/:id", disputeController.getDisputeById);
router.put("/:id", disputeController.updateDispute);
router.post("/:id/respond", disputeController.respondToDispute);

module.exports = router;

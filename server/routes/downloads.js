const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const downloadController = require("../controllers/downloadController");

// All routes require authentication
router.use(protect);

// Download files
router.post("/order/:orderId", downloadController.downloadOrderFiles);
router.post("/pack/:packId", downloadController.downloadPackFiles);

// Download history
router.get("/my", downloadController.getMyDownloads);

// Seller statistics
router.get("/stats", isSeller, downloadController.getDownloadStats);

module.exports = router;

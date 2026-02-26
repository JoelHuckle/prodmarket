// routes/orders.js
const express = require("express");
const router = express.Router();
const { protect, isSeller } = require("../middleware/auth");
const orderController = require("../controllers/orderController");

// All routes require authentication
router.use(protect);

router.post("/", orderController.createOrder);

router.put("/:id/upload-files", orderController.uploadBuyerFiles);
router.put("/:id/deliver", isSeller, orderController.deliverOrder);
router.put("/:id/complete", orderController.completeOrder);

router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);

module.exports = router;

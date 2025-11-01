const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./users");
const serviceRoutes = require("./services");
const orderRoutes = require("./orders");
const paymentRoutes = require("./payments");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/services", serviceRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;

const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./users");
const serviceRoutes = require("./services");
const orderRoutes = require("./orders");
const paymentRoutes = require("./payments");
const fileRoutes = require("./files");
const contractRoutes = require("./contracts");
const subscriptionRoutes = require("./subscriptions");
const downloadRoutes = require("./downloads");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/services", serviceRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/files", fileRoutes);
router.use("/contracts", contractRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/downloads", downloadRoutes);

module.exports = router;

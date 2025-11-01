const express = require("express");
const router = express.Router();

router.post("/create-payment-intent", (req, res) => {
  res.json({ message: "Payments endpoint" });
});

module.exports = router;

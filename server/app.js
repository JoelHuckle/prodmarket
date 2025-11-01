const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Minimal middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api", routes);

module.exports = app;

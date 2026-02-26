require("dotenv").config();

// Validate required environment variables before anything else
const requiredEnvVars = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "STRIPE_SECRET_KEY",
];
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`✗ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

let server;

// Test database connection and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established");

    // Sync models (for development only)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false });
      console.log("✓ Database models synced");
    }

    server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("✗ Unable to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      try {
        await sequelize.close();
        console.log("✓ Database connections closed");
      } catch (err) {
        console.error("✗ Error closing database:", err);
      }
      process.exit(0);
    });
    // Force exit after 10s if graceful shutdown stalls
    setTimeout(() => {
      console.error("✗ Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();

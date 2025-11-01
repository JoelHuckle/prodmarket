require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

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

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("✗ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

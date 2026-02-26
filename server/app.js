const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// Request logging with skip filter for sensitive endpoints
// Skip logging for sensitive endpoints that may contain credentials
const skipSensitiveEndpoints = (req, res) => {
  const sensitivePaths = [
    /^\/api\/auth\/.*/,
    /^\/api\/auth$/,
    /^\/api\/payments\/.*/,
    /^\/health/,
  ];
  return sensitivePaths.some((pattern) => pattern.test(req.path));
};

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
      skip: skipSensitiveEndpoints,
    })
  );
}

// Rate limiting — global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
});
app.use(globalLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later",
  },
});

// CORS — restrict to known origins
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  }),
);

// Webhook handler BEFORE body parsing (needs raw body for signature verification)
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Store raw body for webhook verification
    req.rawBody = req.body;
    next();
  },
);

// Body parsers with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Health check — requires secret token or valid JWT
app.get("/health", (req, res) => {
  const token = req.headers["x-health-token"];
  const healthCheckToken = process.env.HEALTH_CHECK_TOKEN;

  // Allow health check if token matches environment variable
  if (healthCheckToken && token === healthCheckToken) {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  }

  // Deny access if no valid token provided
  res.status(401).json({
    success: false,
    error: "Unauthorized",
  });
});

// Apply stricter rate limit to auth routes
app.use("/api/auth", authLimiter);

// Routes
app.use("/api", routes);

// Error handler — must be last
app.use(errorHandler);

module.exports = app;
